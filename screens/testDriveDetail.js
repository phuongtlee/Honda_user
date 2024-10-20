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
      <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
    );
  }

  // Chuyển đổi currentSchedule.date thành đối tượng Date
  const date =
    currentSchedule.date instanceof Timestamp
      ? currentSchedule.date.toDate()
      : typeof currentSchedule.date === 'string'
      ? new Date(currentSchedule.date)
      : currentSchedule.date;

  // Kiểm tra nếu date là một đối tượng Date hợp lệ
  const isValidDate = date instanceof Date && !isNaN(date);

  // Định dạng ngày và giờ
  const formattedDate = isValidDate
    ? date.toLocaleDateString('vi-VN')
    : 'Không xác định';
  const formattedTime = isValidDate
    ? date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    : 'Không xác định';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Thông tin chi tiết lịch lái thử</Text>
        <Text style={styles.info}>
          Tên sản phẩm: {currentSchedule.productName}
        </Text>

        <Text style={styles.info}>Khách hàng: {currentSchedule.userName}</Text>

        <Text style={styles.info}>Ngày: {formattedDate}</Text>
        <Text style={styles.info}>Giờ: {formattedTime}</Text>
        <Text style={styles.info}>Trạng thái: {currentSchedule.status}</Text>
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default TestDriveDetail;
