import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useMyContextProvider} from '../store/index';
import DatePicker from 'react-native-date-picker';
import {useRoute} from '@react-navigation/native';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
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
  const [buttonVisible, setButtonVisible] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

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
    if (!selectedService) {
      Alert.alert('Thông báo', 'Vui lòng chọn dịch vụ trước khi đặt lịch!');
      return;
    }
    setLoading(true);

    const uploadedImageUrls = await uploadImagesToStorage();

    const scheduleData = {
      carName: initialCarName,
      carType: initialCarType,
      staff: selectedStaff,
      service: selectedService,
      date: Timestamp.fromDate(date),
      damageDescription: damageDescription || '',
      imageUrls: uploadedImageUrls.filter(url => url !== null) || [],
      status: 'Chưa hoàn thành',
      statusCheck: 'Chưa xác nhận',
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

  const handleScroll = event => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > 0) {
      setButtonVisible(false);
    } else {
      setButtonVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={styles.label}>Tên xe:</Text>
            <Text style={styles.input}>{initialCarName}</Text>
            <Text style={styles.label}>Loại xe:</Text>
            <Text style={styles.input}>{initialCarType}</Text>

            <Text style={styles.label}>Chọn dịch vụ:</Text>
            <Picker
              selectedValue={selectedService}
              onValueChange={handleServiceChange}
              style={styles.picker}>
              <Picker.Item label="Chọn dịch vụ" value="" />
              {services
                .filter(service => service.type !== 'Phụ tùng')
                .map(service => (
                  <Picker.Item
                    key={service.type}
                    label={service.name_service}
                    value={service.type}
                  />
                ))}
            </Picker>
            {selectedService === 'Thay phụ kiện' && (
              <>
                <Text style={styles.label}>Mô tả hư hỏng:</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={damageDescription}
                  onChangeText={setDamageDescription}
                  placeholder="Nhập mô tả về hư hỏng..."
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleImagePick}>
                  <Text style={styles.buttonText}>Chọn ảnh</Text>
                </TouchableOpacity>
                <ScrollView horizontal style={styles.imageScroll}>
                  {images.map((img, index) => (
                    <Image
                      key={index}
                      source={{uri: img}}
                      style={styles.image}
                    />
                  ))}
                </ScrollView>
              </>
            )}
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
              onCancel={() => {
                setOpenDatePicker(false);
              }}
            />
            <Text style={styles.selectedDate}>
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
                const newDate = new Date(date);
                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());
                setDate(newDate);
              }}
              onCancel={() => {
                setOpenTimePicker(false);
              }}
            />
            <Text style={styles.selectedDate}>
              Giờ đã chọn: {date.toLocaleTimeString()}
            </Text>
          </>
        )}
      </ScrollView>

      {buttonVisible && (
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleSchedule}>
          <Text style={styles.scheduleButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    height: 100,
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageScroll: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  selectedDate: {
    fontSize: 16,
    marginVertical: 10,
  },
  scheduleButton: {
    bottom: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    elevation: 3,
    minWidth: 150,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
