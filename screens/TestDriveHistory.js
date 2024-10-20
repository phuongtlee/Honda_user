import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useMyContextProvider} from '../store/index';
import firestore from '@react-native-firebase/firestore';
import PushNotification from 'react-native-push-notification'; // Import PushNotification
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

export default function TestDriveHistory() {
  const [testDriveSchedules, setTestDriveSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) {
      setTestDriveSchedules([]);
      setLoading(false);
      return;
    }

    const unsubscribeSchedules = firestore()
      .collection('testDriveSchedules')
      .where('uid', '==', userLogin.uid)
      .onSnapshot(
        snapshot => {
          const schedulesData = snapshot.docs.map(doc => {
            const data = doc.data();

            // Kiểm tra định dạng của trường date
            let dateValue;

            if (data.date instanceof firestore.Timestamp) {
              dateValue = data.date.toDate();
            } else {
              dateValue = new Date(data.date);
            }

            return {
              id: doc.id,
              ...data,
              date: dateValue,
            };
          });

          schedulesData.forEach(item => {
            if (item.status === 'Đã xác nhận') {
              PushNotification.localNotification({
                channelId: 'default-channel-id',
                title: 'Thông báo Lịch Lái Thử',
                message: `Lịch lái thử "${item.productName}" đã được xác nhận!`,
              });
            }
          });

          setTestDriveSchedules(schedulesData);
          setLoading(false);
        },
        err => {
          setError(err.message);
          setLoading(false);
        },
      );

    return () => {
      unsubscribeSchedules();
    };
  }, [userLogin]);

  const handleDeleteSchedule = async id => {
    if (!userLogin) return;
    try {
      await firestore().collection('testDriveSchedules').doc(id).delete();
    } catch (error) {
      console.error('Error deleting schedule: ', error);
    }
  };

  const handlePressItem = item => {
    navigation.navigate('testDriveDetail', {schedule: item});
  };

  const renderItem = ({item}) => {
    const statusColor = item.status === 'Đã xác nhận' ? 'green' : 'red';

    // Chuyển đổi item.date thành Date object
    const date =
      typeof item.date === 'string' ? new Date(item.date) : item.date;

    // Kiểm tra nếu date là một đối tượng Date hợp lệ
    const isValidDate = date instanceof Date && !isNaN(date);

    return (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={styles.item}>
        <View style={styles.infoContainer}>
          <Text style={styles.carInfo}>Sản phẩm: {item.productName}</Text>
          <Text style={styles.userInfo}>Người dùng: {item.userName}</Text>
          <Text style={styles.dateInfo}>
            Ngày: {isValidDate ? date.toLocaleDateString() : 'Không xác định'}
          </Text>
          <Text style={styles.timeInfo}>
            Giờ:{' '}
            {isValidDate
              ? date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Không xác định'}
          </Text>
          <Text style={[styles.statusInfo, {color: statusColor}]}>
            Trạng thái: {item.status}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteSchedule(item.id)}
          style={styles.deleteButton}>
          <FontAwesomeIcon icon={faTrash} size={20} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử lái thử</Text>
      {testDriveSchedules.length === 0 ? (
        <Text>Không có lịch sử lái thử nào.</Text>
      ) : (
        <FlatList
          data={testDriveSchedules}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  carInfo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
  },
  dateInfo: {
    fontSize: 14,
  },
  timeInfo: {
    fontSize: 14,
  },
  statusInfo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
