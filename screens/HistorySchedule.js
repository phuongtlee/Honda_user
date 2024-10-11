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
import firestore from '@react-native-firebase/firestore';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

export default function HistorySchedule() {
  const [repairSchedules, setRepairSchedules] = useState([]);
  const [services, setServices] = useState({});
  const [staffs, setStaffs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) {
      setRepairSchedules([]); // Clear schedules when logging out
      setLoading(false);
      return; // Stop further execution
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
          setRepairSchedules(schedulesData);
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
          const staffData = doc.data();
          staffsData[doc.id] = staffData.fullname;
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

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => handlePressItem(item)} style={styles.item}>
      <View style={styles.infoContainer}>
        <Text style={styles.carInfo}>Tên xe: {item.carName}</Text>
        <Text style={styles.carInfo}>Loại xe: {item.carType}</Text>
        <Text style={styles.serviceInfo}>
          Dịch vụ: {item.service || 'Không tìm thấy dịch vụ'}
        </Text>
        <Text style={styles.staffInfo}>
          Nhân viên: {staffs[item.staff] || 'Không tìm thấy nhân viên'}
        </Text>
        <Text style={styles.dateInfo}>
          Ngày: {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.timeInfo}>
          Giờ:{' '}
          {new Date(item.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.statusInfo}>Trạng thái: {item.status}</Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteSchedule(item.id)}
        style={styles.deleteButton}>
        <FontAwesomeIcon icon={faTrash} size={20} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đặt lịch sửa xe</Text>
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
  serviceInfo: {
    fontSize: 16,
  },
  staffInfo: {
    fontSize: 16,
    fontStyle: 'italic',
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
    color: 'red',
  },
  deleteButton: {
    padding: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
