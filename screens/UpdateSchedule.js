import React, {useState} from 'react';
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
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {Picker} from '@react-native-picker/picker';

const UpdateSchedule = ({route, navigation}) => {
  const {schedule} = route.params;

  const [carName] = useState(schedule.carName);
  const [carType] = useState(schedule.carType);
  const [service, setService] = useState(schedule.service);
  const [damageDescription, setDamageDescription] = useState(
    schedule.damageDescription,
  );
  const [date, setDate] = useState(new Date(schedule.date));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [imageUrls, setImageUrls] = useState(schedule.imageUrls || []);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageReminder, setShowImageReminder] = useState(false);

  const handleImagePick = () => {
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
                // Xóa dữ liệu ảnh cũ
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
      setImageUrls([]);
      setShowImageReminder(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (service === 'Thay phụ kiện' && imageUrls.length === 0) {
      setLoading(false);
      setImageError(true);
      setShowImageReminder(true);
      return;
    }

    try {
      let updatedImageUrls = [];
      if (imageUrls.length > 0) {
        updatedImageUrls = await Promise.all(imageUrls.map(uploadImage));
      } else {
        updatedImageUrls = schedule.imageUrls || [];
      }

      const updatedSchedule = {
        carName,
        carType,
        service,
        damageDescription,
        date: date.toString(),
        imageUrls: updatedImageUrls,
      };

      await firestore()
        .collection('repairSchedules')
        .doc(schedule.id)
        .update(updatedSchedule);

      setLoading(false);
      navigation.navigate('HistorySchedule');
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cập nhật thông tin lịch sửa xe</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên xe"
        value={carName}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Loại xe"
        value={carType}
        editable={false}
      />

      <Text style={styles.serviceLabel}>Chọn dịch vụ:</Text>
      <Picker
        selectedValue={service}
        onValueChange={handleServiceChange}
        style={styles.picker}>
        <Picker.Item label="Thay nhớt" value="Thay nhớt" />
        <Picker.Item label="Thay phụ kiện" value="Thay phụ kiện" />
      </Picker>

      {service === 'Thay phụ kiện' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Mô tả thiệt hại"
            value={damageDescription}
            onChangeText={setDamageDescription}
            multiline
          />

          <Text style={styles.imageUrlsTitle}>Hình ảnh:</Text>
          <Button title="Chọn hình ảnh" onPress={handleImagePick} />

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

      <Button title="Chọn ngày" onPress={() => setOpenDatePicker(true)} />
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

      <Button title="Chọn giờ" onPress={() => setOpenTimePicker(true)} />
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
        Giờ: {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
      </Text>

      {imageError && (
        <Text style={styles.errorText}>
          Vui lòng chọn hình ảnh để cập nhật.
        </Text>
      )}

      <Button title="Lưu" onPress={handleSubmit} />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      )}
    </ScrollView>
  );
};

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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  dateText: {
    marginBottom: 15,
    fontSize: 16,
  },
  imageUrlsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  reminderText: {
    color: 'red',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loading: {
    marginTop: 20,
  },
});

export default UpdateSchedule;
