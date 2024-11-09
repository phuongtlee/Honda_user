import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
import storage from '@react-native-firebase/storage';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMyContextProvider} from '../store';
import {Button} from 'react-native-paper';

const UpdateSchedule = ({route, navigation}) => {
  const {schedule} = route.params;
  const [state] = useMyContextProvider();

  const [carName, setCarName] = useState(schedule.carName);
  const [carType, setCarType] = useState(schedule.carType);
  const [service, setService] = useState(schedule.service);
  const [damageDescription, setDamageDescription] = useState(
    schedule.damageDescription,
  );
  // const [customerName, setCustomerName] = useState(schedule.customerName || '');
  const {staffMembers} = state;
  const [selectedStaff, setSelectedStaff] = useState('');
  const [serviceError, setServiceError] = useState(false);
  const [date, setDate] = useState(new Date(schedule.date.seconds * 1000));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [imageUrls, setImageUrls] = useState(schedule.imageUrls || []);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageReminder, setShowImageReminder] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [status, setStatus] = useState(schedule.status || 'Chưa hoàn thành');
  const today = new Date();
  const [disableUpdate, setDisableUpdate] = useState(
    schedule.statusCheck === 'Đã xác nhận',
  );

  useEffect(() => {
    const checkUserRole = async () => {
      const email = await AsyncStorage.getItem('user');
      if (email && email.includes('STAFF')) {
        setIsStaff(true);
      }
    };
    checkUserRole();
  }, []);

  const handleImagePick = () => {
    if (isStaff) return;

    Alert.alert(
      'Chọn nguồn hình ảnh',
      'Bạn muốn chọn từ thư viện hay chụp ảnh mới?',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => {
            ImagePicker.openCamera({mediaType: 'photo'})
              .then(image => {
                setImageUrls([image.path]);
                setImageError(false);
                setShowImageReminder(false);
              })
              .catch(error => {
                console.log(error);
                Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
              });
          },
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => {
            ImagePicker.openPicker({multiple: true, mediaType: 'photo'})
              .then(images => {
                const urls = images.map(image => image.path);
                setImageUrls(urls);
                setImageError(false);
                setShowImageReminder(false);
              })
              .catch(error => {
                console.log(error);
              });
          },
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
    );
  };

  const uploadImage = async image => {
    const filename = image.substring(image.lastIndexOf('/') + 1);
    const reference = storage().ref(`repairImages/${filename}`);
    await reference.putFile(image);
    return reference.getDownloadURL();
  };

  const handleServiceChange = value => {
    setService(value);
    if (value === 'Thay nhớt') {
      setDamageDescription('');
      setImageUrls([]);
      setShowImageReminder(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!service) {
      setServiceError(true);
      setLoading(false);
      return;
    }

    if (service === 'Thay phụ kiện' && imageUrls.length === 0) {
      setLoading(false);
      setImageError(true);
      setShowImageReminder(true);
      return;
    }

    try {
      let updatedImageUrls = [];

      if (!isStaff && imageUrls.length > 0) {
        updatedImageUrls = await Promise.all(imageUrls.map(uploadImage));
      } else {
        updatedImageUrls = schedule.imageUrls || [];
      }

      let updatedSchedule;
      if (isStaff) {
        // updatedSchedule = {status};
        navigation.navigate('BillingScreen', {
          customerUid: schedule.uid,
          repairScheduleId: schedule.id,
          staffUid: schedule.staff,
          // customerName,
          carName,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } else {
        updatedSchedule = {
          carName,
          carType,
          service,
          staff: selectedStaff,
          damageDescription,
          date: Timestamp.fromDate(date),
          imageUrls: updatedImageUrls,
          status,
        };
        await firestore()
          .collection('repairSchedules')
          .doc(schedule.id)
          .update(updatedSchedule);

        navigation.navigate('HistorySchedule');
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      setLoading(false);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi cập nhật. Vui lòng chọn lại ảnh hoặc thử lại.',
      );
    }
  };
  console.log(schedule.staff);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cập nhật thông tin lịch sửa xe</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên xe"
          value={carName}
          editable={false}
          onChangeText={setCarName}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Tên khách hàng"
          value={customerName}
          onChangeText={setCustomerName}
          editable={!isStaff} 
        /> */}
        {!isStaff && (
          <>
            <Text>Chọn nhân viên:</Text>
            <Picker
              selectedValue={selectedStaff}
              onValueChange={itemValue => setSelectedStaff(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Chọn nhân viên" value="" />
              {staffMembers.map(staff => (
                <Picker.Item
                  key={staff.id}
                  label={staff.username}
                  value={staff.id}
                />
              ))}
            </Picker>
          </>
        )}
        <TextInput
          style={styles.input}
          placeholder="Loại xe"
          value={carType}
          editable={false}
          onChangeText={setCarType}
        />

        <Text style={styles.serviceLabel}>Chọn dịch vụ:</Text>
        <Picker
          selectedValue={service}
          onValueChange={handleServiceChange}
          style={styles.picker}
          enabled={!isStaff}>
          <Picker.Item label="Thay nhớt" value="Thay nhớt" />
          <Picker.Item label="Hư hỏng" value="Thay phụ kiện" />
        </Picker>
        {serviceError && (
          <Text style={styles.errorText}>
            Vui lòng chọn lại dịch vụ trước khi tiếp tục.
          </Text>
        )}

        {service === 'Thay phụ kiện' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Mô tả thiệt hại"
              value={damageDescription}
              onChangeText={setDamageDescription}
              multiline
              editable={!isStaff}
            />

            <Text style={styles.imageUrlsTitle}>Hình ảnh:</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleImagePick}
              disabled={isStaff}>
              <Text style={styles.buttonText}>Chọn hình ảnh</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageContainer}>
              {imageUrls.length > 0 ? (
                imageUrls.map((url, index) => (
                  <Image key={index} source={{uri: url}} style={styles.image} />
                ))
              ) : (
                <Text>Chưa có hình ảnh nào được chọn</Text>
              )}
            </ScrollView>

            <Text style={styles.reminderText}>
              Hãy thêm lại ảnh để cập nhật dữ liệu.
            </Text>
          </>
        )}

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
        {isStaff && (
          <>
            <Text style={styles.serviceLabel}>Trạng thái:</Text>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={styles.picker}
              enabled={status !== 'Đã hoàn thành'}>
              <Picker.Item label="Đã hoàn thành" value="Đã hoàn thành" />
              <Picker.Item label="Chưa hoàn thành" value="Chưa hoàn thành" />
            </Picker>
          </>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Cập nhật lịch sửa</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
  },
  reminderText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    padding: 15,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dateText: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default UpdateSchedule;
