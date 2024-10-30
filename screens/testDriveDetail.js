import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {Timestamp} from '@react-native-firebase/firestore';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCar,
  faUser,
  faCalendarDay,
  faClock,
  faClipboardCheck,
} from '@fortawesome/free-solid-svg-icons';

const TestDriveDetail = ({route, navigation}) => {
  const {schedule} = route.params;
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(schedule);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      try {
        const staffDoc = await firestore()
          .collection('users')
          .doc(schedule.staff)
          .get();
        if (staffDoc.exists) {
          setStaffInfo(staffDoc.data());
        }
      } catch (error) {
        console.error('Error fetching staff info: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffInfo();
  }, [schedule.staff]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchUpdatedSchedule = async () => {
        try {
          const updatedDoc = await firestore()
            .collection('testDriveSchedules')
            .doc(currentSchedule.id)
            .get();
          if (updatedDoc.exists) {
            setCurrentSchedule({
              id: updatedDoc.id,
              ...updatedDoc.data(),
            });
          }
        } catch (error) {
          console.error('Error fetching updated schedule: ', error);
        }
      };

      fetchUpdatedSchedule();
    });

    return unsubscribe;
  }, [navigation, currentSchedule.id]);

  const handleUpdate = () => {
    console.log('Navigating with schedule:', currentSchedule);
    navigation.navigate('UpdateTestDriveSchedule', {
      schedule: currentSchedule,
      scheduleId: currentSchedule.id,
      setCurrentSchedule,
    });
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#1e90ff" style={styles.loading} />
    );
  }

  const date =
    currentSchedule.date instanceof Timestamp
      ? currentSchedule.date.toDate()
      : typeof currentSchedule.date === 'string'
      ? new Date(currentSchedule.date)
      : currentSchedule.date;

  const isValidDate = date instanceof Date && !isNaN(date);
  const formattedDate = isValidDate
    ? date.toLocaleDateString('vi-VN')
    : 'Không xác định';
  const formattedTime = isValidDate
    ? date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    : 'Không xác định';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>
            <FontAwesomeIcon icon={faCar} style={styles.icon} /> Tên sản phẩm:
          </Text>
          <Text style={styles.info}>{currentSchedule.productName}</Text>

          <Text style={styles.label}>
            <FontAwesomeIcon icon={faUser} style={styles.icon} /> Khách hàng:
          </Text>
          <Text style={styles.info}>{currentSchedule.userName}</Text>

          <Text style={styles.label}>
            <FontAwesomeIcon icon={faCalendarDay} style={styles.icon} /> Ngày:
          </Text>
          <Text style={styles.info}>{formattedDate}</Text>

          <Text style={styles.label}>
            <FontAwesomeIcon icon={faClock} style={styles.icon} /> Giờ:
          </Text>
          <Text style={styles.info}>{formattedTime}</Text>

          <Text style={styles.label}>
            <FontAwesomeIcon icon={faClipboardCheck} style={styles.icon} />{' '}
            Trạng thái:
          </Text>
          <Text style={styles.info}>{currentSchedule.status}</Text>
        </View>
      </ScrollView>
      <Button mode="contained" onPress={handleUpdate} style={styles.button}>
        Cập nhật thông tin
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  infoContainer: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e90ff',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333', // Darker text color for readability
  },
  icon: {
    marginRight: 10,
    color: '#1e90ff',
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e90ff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});

export default TestDriveDetail;
