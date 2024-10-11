import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useMyContextProvider} from '../store/index';

export default function MyVehicle({navigation}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [controller] = useMyContextProvider();
  const idUser = controller.userLogin?.uid;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      if (!idUser) {
        setVehicles([]); // Reset dữ liệu nếu không có user
        return;
      }
      const vehicleCollection = await firestore()
        .collection('vehicles')
        .where('id_user', '==', idUser)
        .get();

      const vehicleList = vehicleCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVehicles(vehicleList);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu xe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(); // Gọi hàm lấy dữ liệu ngay khi component được mount

    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchVehicles(); // Gọi lại hàm khi màn hình được focus
    });

    const unsubscribeLogout = navigation.addListener('blur', () => {
      // Reset dữ liệu khi rời khỏi màn hình
      setVehicles([]);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeLogout();
    };
  }, [navigation, idUser]); // Thêm idUser vào dependency array để gọi lại khi nó thay đổi

  const renderVehicleItem = ({item}) => (
    <View style={styles.vehicleItem}>
      <Text style={styles.vehicleText}>{item.vehicle_name}</Text>
      <Text style={styles.vehicleText}>Màu: {item.color}</Text>
      <Text style={styles.vehicleText}>Biển số: {item.license_plate}</Text>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('VehicleDetail', {vehicle: item})}
        style={styles.detailButton}>
        Xem chi tiết
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, padding: 16}}>
      {vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text>Không có xe nào.</Text>
      )}
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVehicle')}>
        Thêm xe
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  vehicleItem: {
    padding: 16,
    marginVertical: 8,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  vehicleText: {
    fontSize: 16,
  },
  addButton: {
    marginTop: 16,
  },
});
