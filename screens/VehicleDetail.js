import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  Alert,
} from 'react-native';
import {LogBox} from 'react-native';
import {deleteVehicle, useMyContextProvider} from '../store/index';

LogBox.ignoreLogs([
  'Warning: VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
]);

const VehicleDetail = ({route, navigation}) => {
  const {vehicle} = route.params;
  const [controller, dispatch] = useMyContextProvider();

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Thông tin xe không có sẵn.</Text>
      </View>
    );
  }

  const handleDeleteVehicle = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa xe này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            await deleteVehicle(dispatch, vehicle.id); // Gọi hàm deleteVehicle
            navigation.goBack(); // Quay lại sau khi xóa
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thông tin chi tiết xe</Text>

      {vehicle.image_uri ? (
        <Image source={{uri: vehicle.image_uri}} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Không có ảnh cho xe này</Text>
      )}

      <Text style={styles.label}>Tên xe:</Text>
      <Text style={styles.text}>{vehicle.vehicle_name}</Text>

      <Text style={styles.label}>Màu xe:</Text>
      <Text style={styles.text}>{vehicle.color}</Text>

      <Text style={styles.label}>Biển số:</Text>
      <Text style={styles.text}>{vehicle.license_plate}</Text>

      <Text style={styles.label}>Số khung (VIN):</Text>
      <Text style={styles.text}>{vehicle.vin_num}</Text>

      <Text style={styles.label}>Số km:</Text>
      <Text style={styles.text}>{vehicle.km}</Text>

      <Text style={styles.label}>Thương hiệu:</Text>
      <Text style={styles.text}>{vehicle.brand}</Text>

      <Text style={styles.label}>Model:</Text>
      <Text style={styles.text}>{vehicle.model}</Text>

      <Text style={styles.label}>Ngày mua:</Text>
      <Text style={styles.text}>{vehicle.purchase_date}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Sửa thông tin"
          onPress={() => navigation.navigate('UpdateVehicle', {vehicle})}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Đặt lịch sửa xe"
          onPress={() =>
            navigation.navigate('ScheduleCarRepair', {
              vehicleName: vehicle.vehicle_name,
              vehicleType: vehicle.model,
            })
          }
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Quay lại" onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Xóa xe"
          color="red"
          onPress={handleDeleteVehicle}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  noImageText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#888',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VehicleDetail;
