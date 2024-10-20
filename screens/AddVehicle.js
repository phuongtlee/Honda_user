import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator, 
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {useMyContextProvider, addVehicle} from '../store/index';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Text} from 'react-native-paper';

const AddVehicle = () => {
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

  // Thêm trạng thái loading
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState([
    {label: 'Toyota', value: 'Toyota'},
    {label: 'Honda', value: 'Honda'},
    {label: 'Ford', value: 'Ford'},
    {label: 'BMW', value: 'BMW'},
    {label: 'Audi', value: 'Audi'},
  ]);

  const handleSubmit = async () => {
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
      Alert.alert('Lỗi', 'Vui lòng điền tất cả thông tin.');
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
        placeholder="Ngày mua"
        keyboardType="numeric"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />
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
      <Button title="Chọn ảnh xe" onPress={selectImage} />
      {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
      <Button title="Thêm xe" onPress={handleSubmit} />

      {/* Hiển thị loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Đang thêm xe, vui lòng chờ...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  dropdown: {
    borderColor: 'gray',
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 12,
    borderRadius: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default AddVehicle;
