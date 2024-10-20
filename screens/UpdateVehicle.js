import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {updateVehicle, useMyContextProvider} from '../store/index';
import PushNotification from 'react-native-push-notification';

const UpdateVehicle = ({route, navigation}) => {
  const {vehicle} = route.params;
  const [vehicleName, setVehicleName] = useState(vehicle.vehicle_name);
  const [color, setColor] = useState(vehicle.color);
  const [licensePlate, setLicensePlate] = useState(vehicle.license_plate);
  const [vinNum, setVinNum] = useState(vehicle.vin_num);
  const [km, setKm] = useState(vehicle.km.toString());
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [purchaseDate, setPurchaseDate] = useState(vehicle.purchase_date);
  const [imageUri, setImageUri] = useState(vehicle.image_url);
  const [loading, setLoading] = useState(false);

  const [controller, dispatch] = useMyContextProvider();

  const [openBrand, setOpenBrand] = useState(false);
  const [valueBrand, setValueBrand] = useState(brand);
  const [itemsBrand, setItemsBrand] = useState([
    {label: 'Toyota', value: 'Toyota'},
    {label: 'Honda', value: 'Honda'},
    {label: 'Ford', value: 'Ford'},
  ]);

  const handleUpdate = async () => {
    setLoading(true);
    const updatedData = {
      vehicle_name: vehicleName,
      color,
      license_plate: licensePlate,
      vin_num: vinNum,
      km: Number(km),
      brand: valueBrand,
      model,
      purchase_date: purchaseDate,
      image_uri: imageUri,
      last_update: new Date().toISOString(),
    };

    try {
      await updateVehicle(dispatch, vehicle.id, updatedData);
      Alert.alert('Cập nhật thành công!', 'Thông tin xe đã được cập nhật.');

      const mileageLimit = 1000;
      const lastUpdateDate = new Date(vehicle.last_update);
      const currentDate = new Date();
      const oneWeekAgo = new Date(
        currentDate.setDate(currentDate.getDate() - 7),
      );

      if (Number(km) > mileageLimit) {
        PushNotification.localNotification({
          channelId: 'default-channel-id',
          title: 'Nhắc nhở bảo dưỡng',
          message: 'Bạn đã đi quá 1000 km, hãy đưa xe đi bảo dưỡng!',
        });
      }

      if (lastUpdateDate < oneWeekAgo) {
        PushNotification.localNotification({
          channelId: 'default-channel-id',
          title: 'Nhắc nhở cập nhật số km',
          message:
            'Bạn đã một tuần chưa cập nhật số km. Vui lòng cập nhật ngay!',
        });
      }

      navigation.navigate('MyVehicle');
    } catch (error) {
      Alert.alert('Cập nhật thất bại', 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
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
            })
              .then(image => {
                setImageUri(image.path); 
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
              mediaType: 'photo',
            })
              .then(image => {
                setImageUri(image.path); 
              })
              .catch(error => {
                console.log(error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh.');
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cập nhật thông tin xe</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên xe"
          value={vehicleName}
          onChangeText={setVehicleName}
        />
        <TextInput
          style={styles.input}
          placeholder="Màu xe"
          value={color}
          onChangeText={setColor}
        />
        <TextInput
          style={styles.input}
          placeholder="Biển số"
          value={licensePlate}
          onChangeText={setLicensePlate}
        />
        <TextInput
          style={styles.input}
          placeholder="Số khung (VIN)"
          value={vinNum}
          onChangeText={setVinNum}
        />
        <TextInput
          style={styles.input}
          placeholder="Số km"
          value={km}
          onChangeText={setKm}
          keyboardType="numeric"
        />
        <DropDownPicker
          open={openBrand}
          value={valueBrand}
          items={itemsBrand}
          setOpen={setOpenBrand}
          setValue={setValueBrand}
          setItems={setItemsBrand}
          placeholder="Chọn thương hiệu"
          style={styles.dropdown}
        />
        <TextInput
          style={styles.input}
          placeholder="Model"
          value={model}
          onChangeText={setModel}
        />
        <TextInput
          style={styles.input}
          placeholder="Ngày mua (YYYY-MM-DD)"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />
        <Button title="Chọn ảnh" onPress={handleImagePick} />
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} />
        ) : null}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Cập nhật" onPress={handleUpdate} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
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
  dropdown: {
    marginBottom: 15,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default UpdateVehicle;
