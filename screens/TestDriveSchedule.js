import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useMyContextProvider} from '../store/index';
import DatePicker from 'react-native-date-picker';
import firestore from '@react-native-firebase/firestore';
import {Timestamp} from '@react-native-firebase/firestore';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';

export default function TestDriveSchedule({route, navigation}) {
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;

  const {productId, productName} = route.params;
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = message => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.navigate('ThankYou');
  };

  const handleScheduleTestDrive = async () => {
    setLoading(true);

    const timestamp = Timestamp.fromDate(date);

    const testDriveData = {
      userName: userLogin.fullname,
      uid: userLogin.uid,
      productId,
      productName,
      date: timestamp,
      status: 'Chờ xác nhận',
    };

    try {
      await firestore().collection('testDriveSchedules').add(testDriveData);
      showDialog('Đặt lịch lái thử thành công!');
    } catch (error) {
      console.error('Lỗi khi đặt lịch lái thử:', error);
      showDialog('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : (
        <>
          <Text style={styles.infoText}>Tên xe: {productName}</Text>
          <Text style={styles.infoText}>
            Tên người dùng: {userLogin.fullname}
          </Text>

          <Text style={styles.label}>Chọn ngày:</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpenDatePicker(true)}>
            <Text style={styles.buttonText}>Chọn ngày</Text>
          </TouchableOpacity>
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
          <Text style={styles.selectedDateText}>
            Ngày đã chọn: {date.toLocaleDateString()}
          </Text>

          <Text style={styles.label}>Chọn giờ:</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpenTimePicker(true)}>
            <Text style={styles.buttonText}>Chọn giờ</Text>
          </TouchableOpacity>
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
          <Text style={styles.selectedTimeText}>
            Giờ đã chọn:{' '}
            {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.scheduleButton]}
            onPress={handleScheduleTestDrive}
            disabled={!date}>
            <Text style={styles.buttonText}>Đặt lịch</Text>
          </TouchableOpacity>
        </>
      )}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Thông báo</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e90ff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#1e90ff',
  },
  infoText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  selectedDateText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  selectedTimeText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleButton: {
    marginTop: 20,
  },
});
