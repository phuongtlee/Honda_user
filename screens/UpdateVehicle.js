import React, {useState} from 'react';
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

  const showDialog = (message, isError = false) => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setDialogVisible(true);
    setIsErrorDialog(isError);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.navigate('MyVehicle');
  };

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
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdown: {
    marginBottom: 15,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default UpdateVehicle;
