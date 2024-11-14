import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {LogBox} from 'react-native';
import {deleteVehicle, useMyContextProvider} from '../store/index';
import firestore from '@react-native-firebase/firestore';
import PushNotification from 'react-native-push-notification';

LogBox.ignoreLogs([
  'Warning: VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
]);

const VehicleDetail = ({route, navigation}) => {
  const {vehicle} = route.params;
  const [controller, dispatch] = useMyContextProvider();
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date(vehicle.maintenance_date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('vehicles')
      .doc(vehicle.id)
      .onSnapshot(doc => {
        const updatedVehicle = doc.data();
        const updatedMaintenanceDate = updatedVehicle.maintenance_date;

        const formattedDate = new Date(
          updatedMaintenanceDate,
        ).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        if (formattedDate !== maintenanceDate) {
          setMaintenanceDate(formattedDate);

          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: 'Thông báo bảo trì',
            message: `Xe ${vehicle.vehicle_name} cần bảo trì vào ${formattedDate}`,
          });
        }
      });

    // Cleanup listener khi component bị hủy
    return () => unsubscribe();
  }, [maintenanceDate, vehicle.id]);

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
            await deleteVehicle(dispatch, vehicle.id);
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Thông tin xe không có sẵn.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {vehicle.image_uri ? (
        <Image source={{uri: vehicle.image_uri}} style={styles.image} />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Xe hiện tại chưa có ảnh</Text>
        </View>
      )}
      <View style={styles.info}>
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

        <Text style={styles.label}>Ngày bảo trì tiếp theo:</Text>
        <Text style={styles.text}>{maintenanceDate}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('UpdateVehicle', {vehicle})}>
          <Text style={styles.buttonText}>Sửa thông tin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() =>
            navigation.navigate('ScheduleCarRepair', {
              vehicleName: vehicle.vehicle_name,
              vehicleType: vehicle.model,
            })
          }>
          <Text style={styles.buttonText}>Đặt lịch sửa xe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonDelete}
          onPress={handleDeleteVehicle}>
          <Text style={styles.buttonText}>Xóa xe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f5',
  },
  info: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#444',
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  buttonGroup: {
    marginTop: 30,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonDelete: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VehicleDetail;
