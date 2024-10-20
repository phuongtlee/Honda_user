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

// Ignore warning for non-serializable values in navigation state
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state. Check:',
]);

const UpdateTestDriveSchedule = ({route, navigation}) => {
  const {schedule, scheduleId} = route.params;

  // Log the schedule and ID for debugging
  console.log(schedule);
  console.log('Document ID: ', schedule.id);

  const today = new Date();

  // Convert Firestore timestamp to JavaScript Date
  const scheduleDate = schedule.date
    ? new Date(schedule.date.seconds * 1000) // Convert seconds to milliseconds
    : today; // Fallback to today if no date is provided

  // Set time to midnight for comparison
  scheduleDate.setHours(0, 0, 0, 0);

  // Use today's date if the schedule date is in the past
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
      // Update the date and time as a Firestore timestamp
      await firestore()
        .collection('testDriveSchedules')
        .doc(scheduleId)
        .update({
          date: Timestamp.fromDate(date), // Use the selected date as a Firestore timestamp
          status: status, // Optional: update the status if needed
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
      <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
    );
  }

  console.log(scheduleId);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cập nhật lịch lái thử</Text>

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

        {/* Chọn ngày */}
        <Text style={styles.label}>Chọn ngày:</Text>
        <Button
          onPress={() => setOpenDatePicker(true)}
          disabled={disableUpdate}>
          Chọn ngày
        </Button>
        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="date"
          minimumDate={today} // Prevent past date selection
          onConfirm={selectedDate => {
            setOpenDatePicker(false);
            if (!isNaN(selectedDate.getTime())) {
              // Check if the selected date is valid
              const updatedDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                date.getHours(),
                date.getMinutes(),
              );
              setDate(updatedDate);
            } else {
              console.error('Invalid selected date:', selectedDate);
            }
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
        <Text>Ngày đã chọn: {date.toLocaleDateString()}</Text>

        {/* Chọn giờ */}
        <Text>Chọn giờ:</Text>
        <Button
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
              // Check if the selected time is valid
              const updatedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes(),
              );
              setDate(updatedDate);
            } else {
              console.error('Invalid selected time:', selectedTime);
            }
          }}
          onCancel={() => setOpenTimePicker(false)}
        />
        <Text>
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
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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
