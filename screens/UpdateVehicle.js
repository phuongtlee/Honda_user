import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';

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
  const {userLogin} = controller;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isErrorDialog, setIsErrorDialog] = useState(false);

  const [openBrand, setOpenBrand] = useState(false);
  const [valueBrand, setValueBrand] = useState(brand);
  const [itemsBrand, setItemsBrand] = useState([
    {label: 'Toyota', value: 'Toyota'},
    {label: 'Honda', value: 'Honda'},
    {label: 'Ford', value: 'Ford'},
  ]);

  const [maintenanceDate, setMaintenanceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const email = await AsyncStorage.getItem('user');
      if (email && email.includes('STAFF')) {
        setIsStaff(true);
      }
    };
    checkUserRole();
  }, []);

  const showDialog = (message, isError = false) => {
    setDialogMessage(message);
    setDialogVisible(true);
    setIsErrorDialog(isError);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.goBack();
  };

  const handleUpdate = async () => {
    let maintenanceDateValue = 'Invalid Date';
    if (isStaff) {
      maintenanceDateValue = maintenanceDate.toISOString();
    }
    setLoading(true);
    const updatedData = {
      vehicle_name: vehicleName || null,
      color: color || null,
      license_plate: licensePlate || null,
      vin_num: vinNum || null,
      km: Number(km) || 0,
      brand: valueBrand || null,
      model: model || null,
      purchase_date: purchaseDate || null,
      image_uri: imageUri || null,
      last_update: new Date().toISOString(),
      maintenance_date: maintenanceDateValue,
    };

    console.log('Updated Data:', updatedData);

    try {
      await updateVehicle(dispatch, vehicle.id, updatedData);
      showDialog('Thông tin xe đã được cập nhật.');

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
    } catch (error) {
      showDialog('Có lỗi xảy ra khi cập nhật.', true);
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
  console.log('isStaff:', isStaff);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          placeholder="Ngày mua (dd/mm/yyyy)"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />

        {showDatePicker && (
          <DatePicker
            date={maintenanceDate}
            onDateChange={setMaintenanceDate}
            mode="date"
          />
        )}

        <TouchableOpacity
          style={{...styles.button, backgroundColor: '#1e90ff'}}
          onPress={handleImagePick}>
          <Text style={styles.buttonText}>Chọn ảnh</Text>
        </TouchableOpacity>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} />
        ) : null}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Cập nhật</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default UpdateVehicle;
