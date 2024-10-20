import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
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
import firestore, {Timestamp} from '@react-native-firebase/firestore'; // Import Timestamp
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMyContextProvider} from '../store';

const UpdateSchedule = ({route, navigation}) => {
  const {schedule} = route.params;
  const [state] = useMyContextProvider();

  const [carName, setCarName] = useState(schedule.carName);
  const [carType, setCarType] = useState(schedule.carType);
  const [service, setService] = useState(schedule.service);
  const [damageDescription, setDamageDescription] = useState(
    schedule.damageDescription,
  );
  const {staffMembers} = state;
  const [selectedStaff, setSelectedStaff] = useState('');
  const [serviceError, setServiceError] = useState(false);
  const [date, setDate] = useState(new Date(schedule.date.seconds * 1000)); // Convert Firestore Timestamp to JS Date
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [imageUrls, setImageUrls] = useState(schedule.imageUrls || []);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageReminder, setShowImageReminder] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [status, setStatus] = useState(schedule.status || 'Chưa hoàn thành');

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
    if (isStaff) return; // Không cho phép nhân viên chọn hình ảnh

    Alert.alert(
      'Chọn nguồn hình ảnh',
      'Bạn muốn chọn từ thư viện hay chụp ảnh mới?',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => {
            ImagePicker.openCamera({
              mediaType: 'photo',
            })
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
            ImagePicker.openPicker({
              multiple: true,
              mediaType: 'photo',
            })
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
      setImageUrls([]); // Clear image URLs when switching to this service
      setShowImageReminder(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Kiểm tra nếu chưa chọn dịch vụ
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

      // Chỉ tải lên ảnh nếu không phải nhân viên và có ảnh mới
      if (!isStaff && imageUrls.length > 0) {
        updatedImageUrls = await Promise.all(imageUrls.map(uploadImage));
      } else {
        updatedImageUrls = schedule.imageUrls || []; // Giữ nguyên hình ảnh cũ nếu không tải mới
      }

      let updatedSchedule;
      if (isStaff) {
        updatedSchedule = {status};
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
      }

      await firestore()
        .collection('repairSchedules')
        .doc(schedule.id)
        .update(updatedSchedule);

      setLoading(false);

      if (isStaff) {
        navigation.navigate('BottomNavStaff');
      } else {
        navigation.navigate('HistorySchedule');
      }
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      setLoading(false);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi cập nhật. Vui lòng chọn lại ảnh hoặc thử lại.',
      );
    }
  };

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
        {!isStaff && (
          <>
            <Text>Chọn nhân viên:</Text>
            <Picker
              selectedValue={selectedStaff}
              onValueChange={itemValue => setSelectedStaff(itemValue)}>
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
          <Picker.Item label="Thay phụ kiện" value="Thay phụ kiện" />
        </Picker>

        <Text style={styles.errorText}>
          Vui lòng chọn lại dịch vụ trước khi tiếp tục.
        </Text>

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
            <Button
              title="Chọn hình ảnh"
              onPress={handleImagePick}
              disabled={isStaff}
            />

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
          title="Chọn ngày"
          onPress={() => setOpenDatePicker(true)}
          disabled={isStaff}
        />
        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="date"
          minimumDate={new Date()}
          onConfirm={selectedDate => {
            setOpenDatePicker(false);
            setDate(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                date.getHours(),
                date.getMinutes(),
              ),
            );
          }}
          onCancel={() => {
            setOpenDatePicker(false);
          }}
        />
        <Text style={styles.dateText}>Ngày: {date.toLocaleDateString()}</Text>

        <Button
          title="Chọn giờ"
          onPress={() => setOpenTimePicker(true)}
          disabled={isStaff}
        />
        <DatePicker
          modal
          open={openTimePicker}
          date={date}
          mode="time"
          onConfirm={selectedTime => {
            setOpenTimePicker(false);
            setDate(
              prevDate =>
                new Date(
                  prevDate.getFullYear(),
                  prevDate.getMonth(),
                  prevDate.getDate(),
                  selectedTime.getHours(),
                  selectedTime.getMinutes(),
                ),
            );
          }}
          onCancel={() => {
            setOpenTimePicker(false);
          }}
        />
        <Text style={styles.dateText}>
          Giờ:{' '}
          {date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {showImageReminder && (
          <Text style={styles.reminderText}>
            Vui lòng thêm hình ảnh nếu bạn đã chọn dịch vụ thay phụ kiện.
          </Text>
        )}
        {isStaff && (
          <>
            <Text style={styles.serviceLabel}>Trạng thái:</Text>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={styles.picker}
              enabled={status !== 'Đã hoàn thành'} // Disable if status is 'Đã hoàn thành'
            >
              <Picker.Item label="Đã hoàn thành" value="Đã hoàn thành" />
              <Picker.Item label="Chưa hoàn thành" value="Chưa hoàn thành" />
            </Picker>
          </>
        )}

        <Button
          title="Cập nhật"
          onPress={handleSubmit}
          disabled={loading || (status === 'Đã hoàn thành' && !isStaff)}
        />
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
  imageUrlsTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
  },
  reminderText: {
    color: 'red',
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default UpdateSchedule;
