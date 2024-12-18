import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import {Button} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useMyContextProvider} from '../store/index';

export default function VehicleList({navigation}) {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [controller] = useMyContextProvider();
  const idUser = controller.userLogin?.uid;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const vehicleCollection = await firestore().collection('vehicles').get();
      const vehicleList = vehicleCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVehicles(vehicleList);
      setFilteredVehicles(vehicleList);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu xe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();

    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchVehicles();
    });

    return () => {
      unsubscribeFocus();
    };
  }, [navigation]);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.fullname?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const renderVehicleItem = ({item}) => (
    <View style={styles.vehicleItem}>
      {item.image_uri ? (
        <Image source={{uri: item.image_uri}} style={styles.image} />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Xe hiện tại chưa có ảnh</Text>
        </View>
      )}
      <Text style={styles.vehicleText}>{item.vehicle_name}</Text>
      <Text style={styles.vehicleSubText}>Màu: {item.color}</Text>
      <Text style={styles.vehicleSubText}>Biển số: {item.license_plate}</Text>
      <Text style={styles.vehicleSubText}>Chủ sở hữu: {item.fullname}</Text>
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
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm theo tên chủ sở hữu..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredVehicles.length > 0 ? (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDataText}>Không có xe nào.</Text>
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  vehicleItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#1e90ff',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  vehicleSubText: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  detailButton: {
    marginTop: 12,
    borderColor: '#1e90ff',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
  },
});
