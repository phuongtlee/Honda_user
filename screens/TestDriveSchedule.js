import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useMyContextProvider} from '../store/index';
import DatePicker from 'react-native-date-picker';
import firestore from '@react-native-firebase/firestore';
import {Timestamp} from '@react-native-firebase/firestore';

export default function TestDriveSchedule({route, navigation}) {
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;

  const {productId, productName} = route.params;
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScheduleTestDrive = async () => {
    setLoading(true);

    // Định dạng ngày giờ theo định dạng mong muốn
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh', // Múi giờ cho Việt Nam
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Sử dụng định dạng 12 giờ
    };

    // Chuyển đổi ngày giờ thành chuỗi

    // Tạo đối tượng Timestamp từ date
    const timestamp = Timestamp.fromDate(date);

    const testDriveData = {
      userName: userLogin.fullname,
      uid: userLogin.uid,
      productId,
      productName,
      date: timestamp, // Lưu timestamp
      status: 'Chờ xác nhận',
    };

    try {
      await firestore().collection('testDriveSchedules').add(testDriveData);
      Alert.alert('Thông báo', 'Đặt lịch lái thử thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ThankYou'),
        },
      ]);
    } catch (error) {
      console.error('Lỗi khi đặt lịch lái thử:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.title}>Đặt lịch lái thử xe</Text>
          <Text>Tên xe: {productName}</Text>
          <Text>Tên người dùng: {userLogin.fullname}</Text>

          <Text>Chọn ngày:</Text>
          <Button title="Chọn ngày" onPress={() => setOpenDatePicker(true)} />
          <DatePicker
            modal
            open={openDatePicker}
            date={date}
            mode="date"
            minimumDate={new Date()}
            onConfirm={selectedDate => {
              setOpenDatePicker(false);
              setDate(selectedDate);
            }}
            onCancel={() => setOpenDatePicker(false)}
          />
          <Text>Ngày đã chọn: {date.toLocaleDateString()}</Text>

          <Text>Chọn giờ:</Text>
          <Button title="Chọn giờ" onPress={() => setOpenTimePicker(true)} />
          <DatePicker
            modal
            open={openTimePicker}
            date={date}
            mode="time"
            onConfirm={selectedTime => {
              setOpenTimePicker(false);
              setDate(
                new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  selectedTime.getHours(),
                  selectedTime.getMinutes(),
                ),
              );
            }}
            onCancel={() => setOpenTimePicker(false)}
          />
          <Text>
            Giờ đã chọn:{' '}
            {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>

          <Button
            title="Đặt lịch"
            onPress={handleScheduleTestDrive}
            disabled={!date}
          />
        </>
      )}
    </ScrollView>
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
});
