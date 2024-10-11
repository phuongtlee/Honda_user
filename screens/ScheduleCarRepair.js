import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useMyContextProvider} from '../store/index';
import DatePicker from 'react-native-date-picker';
import {useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';

export default function ScheduleCarRepair({navigation}) {
  const [state] = useMyContextProvider();
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;
  const {staffMembers, services} = state;

  const route = useRoute();
  const {vehicleName: initialCarName, vehicleType: initialCarType} =
    route.params;

  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleServiceChange = itemValue => {
    setSelectedService(itemValue);
  };

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
              width: 300,
              height: 400,
              cropping: true,
            })
              .then(image => {
                const imagePath = image.path;
                setImages(prevImages => [...prevImages, imagePath]);
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
              width: 300,
              height: 400,
              cropping: true,
            })
              .then(selectedImages => {
                const imagePaths = selectedImages.map(image => image.path);
                setImages(prevImages => [...prevImages, ...imagePaths]);
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

  const uploadImagesToStorage = async () => {
    const uploadPromises = images.map(async image => {
      const imageName = image.substring(image.lastIndexOf('/') + 1);
      const reference = storage().ref(`repairImages/${imageName}`);

      try {
        await reference.putFile(image);
        const downloadUrl = await reference.getDownloadURL();
        return downloadUrl;
      } catch (error) {
        console.error('Lỗi khi tải ảnh lên:', error);
        return null;
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSchedule = async () => {
    setLoading(true);

    const uploadedImageUrls = await uploadImagesToStorage();

    const scheduleData = {
      carName: initialCarName,
      carType: initialCarType,
      staff: selectedStaff,
      service: selectedService,
      date: date.toString(),
      damageDescription: damageDescription || '',
      imageUrls: uploadedImageUrls.filter(url => url !== null) || [],
      status: 'Chưa hoàn thành',
      userName: userLogin.fullname,
      uid: userLogin.uid,
      ...(selectedService === 'Thay phụ kiện' && {
        damageDescription,
        imageUrls: uploadedImageUrls.filter(url => url !== null),
      }),
    };

    try {
      await firestore().collection('repairSchedules').add(scheduleData);
      console.log('Đặt lịch thành công:', scheduleData);

      Alert.alert('Thông báo', 'Đặt lịch thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ThankYou'),
        },
      ]);
    } catch (error) {
      console.error('Lỗi khi đặt lịch:', error);
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
          <Text style={styles.title}>Đặt lịch sửa xe</Text>
          <Text>Tên xe:</Text>
          <Text style={styles.input}>{initialCarName}</Text>
          <Text>Loại xe:</Text>
          <Text style={styles.input}>{initialCarType}</Text>
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
          <Text>Chọn dịch vụ:</Text>
          <Picker
            selectedValue={selectedService}
            onValueChange={handleServiceChange}>
            <Picker.Item label="Chọn dịch vụ" value="" />
            {services.map(service => (
              <Picker.Item
                key={service.type}
                label={service.name_service}
                value={service.type}
              />
            ))}
          </Picker>
          {selectedService === 'Thay phụ kiện' && (
            <>
              <Text>Mô tả hư hỏng:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={damageDescription}
                onChangeText={setDamageDescription}
                placeholder="Nhập mô tả về hư hỏng..."
              />
              <Button title="Chọn ảnh" onPress={handleImagePick} />
              <ScrollView horizontal style={styles.imageScroll}>
                {images.map((img, index) => (
                  <Image key={index} source={{uri: img}} style={styles.image} />
                ))}
              </ScrollView>
            </>
          )}
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
            onCancel={() => {
              setOpenDatePicker(false);
            }}
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
            onCancel={() => {
              setOpenTimePicker(false);
            }}
          />
          <Text>
            Giờ đã chọn:{' '}
            {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>
          <Button
            title="Đặt lịch"
            onPress={handleSchedule}
            disabled={!selectedStaff || !selectedService}
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
  input: {
    marginBottom: 10,
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
});
