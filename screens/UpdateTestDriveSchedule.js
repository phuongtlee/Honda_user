import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import {Button} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import firestore, {Timestamp} from '@react-native-firebase/firestore';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state. Check:',
]);

const UpdateTestDriveSchedule = ({route, navigation}) => {
  const {schedule, scheduleId} = route.params;

  const today = new Date();
  const scheduleDate = schedule.date
    ? new Date(schedule.date.seconds * 1000)
    : today;

  scheduleDate.setHours(0, 0, 0, 0);
  const adjustedDate = scheduleDate < today ? today : scheduleDate;

  const [date, setDate] = useState(adjustedDate);
  const [status, setStatus] = useState(schedule.status);
  const [disableUpdate, setDisableUpdate] = useState(
    schedule.status === 'Đã xác nhận',
  );
  const [loading, setLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const handleUpdate = async () => {
    if (disableUpdate || !schedule.id) {
      alert('Không thể cập nhật, ID không tồn tại.');
      return;
    }

    setLoading(true);
    try {
      await firestore()
        .collection('testDriveSchedules')
        .doc(scheduleId)
        .update({
          date: Timestamp.fromDate(date),
          status: status,
        });
      alert('Lịch lái thử đã được cập nhật.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating schedule: ', error);
      alert('Có lỗi xảy ra khi cập nhật lịch lái thử.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#1e90ff" style={styles.loading} />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Tên sản phẩm:</Text>
        <TextInput
          style={styles.input}
          value={schedule.productName}
          editable={false}
        />

        <Text style={styles.label}>Khách hàng:</Text>
        <TextInput
          style={styles.input}
          value={schedule.userName}
          editable={false}
        />

        <Text style={styles.label}>Chọn ngày:</Text>
        <Button
          mode="outlined"
          onPress={() => setOpenDatePicker(true)}
          disabled={disableUpdate}>
          Chọn ngày
        </Button>
        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="date"
          minimumDate={today}
          onConfirm={selectedDate => {
            setOpenDatePicker(false);
            if (!isNaN(selectedDate.getTime())) {
              const updatedDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                date.getHours(),
                date.getMinutes(),
              );
              setDate(updatedDate);
            }
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
        <Text style={styles.selectedDateText}>
          Ngày đã chọn: {date.toLocaleDateString()}
        </Text>

        <Text style={styles.label}>Chọn giờ:</Text>
        <Button
          mode="outlined"
          onPress={() => setOpenTimePicker(true)}
          disabled={disableUpdate}>
          Chọn giờ
        </Button>
        <DatePicker
          modal
          open={openTimePicker}
          date={date}
          mode="time"
          onConfirm={selectedTime => {
            setOpenTimePicker(false);
            if (!isNaN(selectedTime.getTime())) {
              const updatedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes(),
              );
              setDate(updatedDate);
            }
          }}
          onCancel={() => setOpenTimePicker(false)}
        />
        <Text style={styles.selectedTimeText}>
          Giờ đã chọn:{' '}
          {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </Text>

        <Text style={styles.label}>Trạng thái:</Text>
        <TextInput style={styles.input} value={status} editable={false} />
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleUpdate}
        disabled={disableUpdate}
        style={styles.button}>
        Cập nhật thông tin
      </Button>

      {disableUpdate && (
        <Text style={styles.disabledText}>
          Lịch này đã được xác nhận, không thể cập nhật.
        </Text>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e90ff',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e90ff',
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  selectedTimeText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  disabledText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default UpdateTestDriveSchedule;
