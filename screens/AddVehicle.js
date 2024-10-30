import React, {useState} from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {useMyContextProvider, addVehicle} from '../store/index';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Button, Dialog, Paragraph, Portal, Text} from 'react-native-paper';

const AddVehicle = ({navigation}) => {
  const [controller, dispatch] = useMyContextProvider();
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [idUser] = useState(controller.userLogin?.uid || '');
  const [km, setKm] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [model, setModel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vinNum, setVinNum] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const [loading, setLoading] = useState(false);

  // State để lưu thông báo lỗi
  const [dateError, setDateError] = useState('');
  const [vinError, setVinError] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isErrorDialog, setIsErrorDialog] = useState(false);

  const showDialog = (message, isError = false) => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setDialogVisible(true);
    setIsErrorDialog(isError);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    if (!isErrorDialog) {
      navigation.goBack();
    }
  };

  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState([
    {label: 'Toyota', value: 'Toyota'},
    {label: 'Honda', value: 'Honda'},
    {label: 'Ford', value: 'Ford'},
    {label: 'BMW', value: 'BMW'},
    {label: 'Audi', value: 'Audi'},
    {label: 'Vario', value: 'Vario'},
  ]);

  const isValidDate = date => {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/; // dd/mm/yyyy
    return dateRegex.test(date);
  };

  const isValidVin = vin => {
    return vin.length === 17;
  };

  const handleSubmit = async () => {
    setDateError('');
    setVinError('');

    if (
      !brand ||
      !color ||
      !km ||
      !licensePlate ||
      !model ||
      !purchaseDate ||
      !vehicleName ||
      !vinNum
    ) {
      showDialog('Vui lòng điền tất cả thông tin.', true);
      return;
    }

    // Kiểm tra định dạng ngày và VIN
    if (!isValidDate(purchaseDate)) {
      setDateError('Ngày mua không hợp lệ (dd/mm/yyyy).');
      return;
    }

    if (!isValidVin(vinNum)) {
      setVinError('Số VIN phải có 17 ký tự.');
      return;
    }

    const vehicleData = {
      brand,
      color,
      id_user: idUser,
      km: parseInt(km, 10),
      license_plate: licensePlate,
      model,
      purchase_date: purchaseDate,
      vehicle_name: vehicleName,
      vin_num: vinNum,
      image_uri: imageUri,
    };

    setLoading(true);
    await addVehicle(dispatch, vehicleData);
    showDialog('Xe đã được thêm thành công.');
    setLoading(false);

    resetForm();
  };

  const resetForm = () => {
    setBrand('');
    setColor('');
    setKm('');
    setLicensePlate('');
    setModel('');
    setPurchaseDate('');
    setVehicleName('');
    setVinNum('');
    setImageUri(null);
  };

  const selectImage = () => {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      includeBase64: true,
    })
      .then(image => {
        setImageUri(image.path);
      })
      .catch(error => {
        if (error.message === 'User cancelled image selection') {
          console.log('User cancelled image picker');
        } else {
          console.log('ImagePicker Error: ', error);
        }
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DropDownPicker
        open={open}
        value={brand}
        items={brands}
        setOpen={setOpen}
        setValue={setBrand}
        setItems={setBrands}
        placeholder="Chọn nhãn hiệu xe"
        style={styles.input}
        dropDownContainerStyle={styles.dropdown}
      />
      <TextInput
        style={styles.input}
        placeholder="Màu xe"
        value={color}
        onChangeText={setColor}
      />
      <TextInput
        style={styles.input}
        placeholder="Số km"
        keyboardType="numeric"
        value={km}
        onChangeText={setKm}
      />
      <TextInput
        style={styles.input}
        placeholder="Biển số xe"
        value={licensePlate}
        onChangeText={setLicensePlate}
      />
      <TextInput
        style={styles.input}
        placeholder="Mẫu xe"
        value={model}
        onChangeText={setModel}
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày mua (dd/mm)"
        keyboardType="numeric"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />
      {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Tên xe"
        value={vehicleName}
        onChangeText={setVehicleName}
      />
      <TextInput
        style={styles.input}
        placeholder="Số VIN"
        value={vinNum}
        onChangeText={setVinNum}
      />
      {vinError ? <Text style={styles.errorText}>{vinError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>Chọn ảnh xe</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Thêm xe</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Đang thêm xe, vui lòng chờ...</Text>
        </View>
      )}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  input: {
    fontSize: 16,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    elevation: 2, // Hiệu ứng bóng
  },
  dropdown: {
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default AddVehicle;
