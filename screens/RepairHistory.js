import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useMyContextProvider} from '../store/index';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';

export default function RepairHistory() {
  const [repairSchedules, setRepairSchedules] = useState([]);
  const [staffs, setStaffs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {userLogin} = useMyContextProvider()[0];
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) {
      setRepairSchedules([]);
      setLoading(false);
      return;
    }

    const unsubscribeSchedules = firestore()
      .collection('repairSchedules')
      .where('uid', '==', userLogin.uid)
      .onSnapshot(
        snapshot => {
          const schedulesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedSchedules = schedulesData.sort((a, b) => {
            if (
              a.status === 'Chưa hoàn thành' &&
              b.status === 'Đã hoàn thành'
            ) {
              return -1;
            }
            if (
              a.status === 'Đã hoàn thành' &&
              b.status === 'Chưa hoàn thành'
            ) {
              return 1;
            }
            return 0;
          });

          setRepairSchedules(sortedSchedules);

          sortedSchedules.forEach(schedule => {
            if (
              schedule.status === 'Đã hoàn thành' &&
              !schedule.isCompletedNotified
            ) {
              triggerCompletionNotification(
                schedule,
                `Lịch sửa chữa cho xe ${schedule.carName} đã hoàn thành. Mời bạn đánh giá mức độ hài lòng`,
                'isCompletedNotified',
              );
            }

            if (
              schedule.statusCheck === 'Đã xác nhận' &&
              !schedule.isConfirmedNotified
            ) {
              triggerCompletionNotification(
                schedule,
                `Lịch sửa chữa cho xe ${schedule.carName} đã được xác nhận.`,
                'isConfirmedNotified',
              );
            }
          });

          setLoading(false);
        },
        err => {
          setError(err.message);
          setLoading(false);
        },
      );

    const fetchStaffs = async () => {
      try {
        const staffDocs = await firestore().collection('users').get();
        const staffsData = {};
        staffDocs.forEach(doc => {
          staffsData[doc.id] = doc.data().fullname;
        });
        setStaffs(staffsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStaffs();

    return () => {
      unsubscribeSchedules();
    };
  }, [userLogin]);

  const triggerCompletionNotification = async (schedule, message, field) => {
    PushNotification.localNotification({
      channelId: 'default-channel-id',
      title: 'Thông báo lịch sửa chữa',
      message: message,
    });

    try {
      await firestore()
        .collection('repairSchedules')
        .doc(schedule.id)
        .update({[field]: true});
    } catch (error) {
      console.error('Error updating notification status: ', error);
    }
  };

  const handleDeleteSchedule = async id => {
    if (!userLogin) return;
    try {
      await firestore().collection('repairSchedules').doc(id).delete();
    } catch (error) {
      console.error('Error deleting schedule: ', error);
    }
  };

  const handlePressItem = item => {
    navigation.navigate('DetailHistory', {schedule: item});
  };

  const renderItem = ({item}) => {
    const statusColor = item.status === 'Đã hoàn thành' ? 'green' : 'red';
    const statusColor1 = item.statusCheck === 'Đã xác nhận' ? 'green' : 'red';

    return (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={styles.item}>
        <View style={styles.infoContainer}>
          <Text style={styles.carInfo}>Tên xe: {item.carName}</Text>
          <Text style={styles.carInfo}>Loại xe: {item.carType}</Text>
          <Text style={styles.serviceInfo}>
            Dịch vụ: {item.service || 'Không tìm thấy dịch vụ'}
          </Text>
          <Text style={styles.staffInfo}>
            Nhân viên: {staffs[item.staff] || 'Đợi quản lí chọn nhân viên'}
          </Text>
          <Text style={styles.dateInfo}>
            Ngày:{' '}
            {item.date instanceof Timestamp
              ? item.date.toDate().toLocaleDateString()
              : 'Không tìm thấy'}
          </Text>
          <Text style={styles.timeInfo}>
            Giờ:{' '}
            {item.date instanceof Timestamp
              ? item.date
                  .toDate()
                  .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
              : 'Không tìm thấy'}
          </Text>
          <Text style={[styles.statusInfo, {color: statusColor1}]}>
            Trạng thái xác nhận: {item.statusCheck}
          </Text>
          <Text style={[styles.statusInfo, {color: statusColor}]}>
            Trạng thái hoàn thành: {item.status}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteSchedule(item.id)}
          style={styles.deleteButton}>
          <FontAwesomeIcon icon={faTrash} size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1e90ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {repairSchedules.length === 0 ? (
        <Text>Không có lịch sử đặt lịch nào.</Text>
      ) : (
        <FlatList
          data={repairSchedules}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  item: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
  },
  carInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceInfo: {
    fontSize: 16,
    color: '#555',
  },
  staffInfo: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  dateInfo: {
    fontSize: 14,
    color: '#777',
  },
  timeInfo: {
    fontSize: 14,
    color: '#777',
  },
  statusInfo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
    padding: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
