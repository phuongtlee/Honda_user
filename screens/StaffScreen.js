import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useMyContextProvider} from '../store/index';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrash, faSort} from '@fortawesome/free-solid-svg-icons'; // Thêm icon sắp xếp
import {useNavigation} from '@react-navigation/native';

const StaffSchedule = () => {
  const [repairSchedules, setRepairSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;

  useEffect(() => {
    if (!userLogin) {
      setRepairSchedules([]);
      setFilteredSchedules([]);
      setLoading(false);
      return;
    }

    const unsubscribeSchedules = fetchRepairSchedules();
    fetchCustomers(); // Call fetchCustomers without awaiting or unsubscribing

    return () => {
      unsubscribeSchedules();
    };
  }, [userLogin]);

  const fetchRepairSchedules = () => {
    const unsubscribe = firestore()
      .collection('repairSchedules')
      .where('staff', '==', userLogin.uid)
      .onSnapshot(
        snapshot => {
          const schedulesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRepairSchedules(schedulesData);
          setFilteredSchedules(schedulesData);
          setLoading(false);
        },
        err => {
          setError(err.message);
          setLoading(false);
        },
      );

    return unsubscribe;
  };

  const fetchCustomers = async () => {
    try {
      const customerDocs = await firestore().collection('users').get();
      const customersData = {};
      customerDocs.forEach(doc => {
        customersData[doc.id] = doc.data().fullname;
      });
      setCustomers(customersData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = query => {
    setSearchQuery(query);
    const filteredData = query
      ? repairSchedules.filter(item => {
          const customerName = customers[item.uid] || '';
          return customerName.toLowerCase().includes(query.toLowerCase());
        })
      : repairSchedules;

    setFilteredSchedules(filteredData);
  };

  const handleSort = () => {
    const sortedData = [...filteredSchedules].sort((a, b) => {
      const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date();
      const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date();
      return dateA - dateB; // Sắp xếp theo thứ tự tăng dần
    });
    setFilteredSchedules(sortedData);
  };

  const handlePressItem = item => {
    navigation.navigate('DetailHistory', {schedule: item});
  };

  const renderItem = ({item}) => {
    const formattedDate =
      item.date instanceof Timestamp
        ? item.date.toDate().toLocaleDateString()
        : 'Không tìm thấy';

    const formattedTime =
      item.date instanceof Timestamp
        ? item.date.toDate().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Không tìm thấy';

    return (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={styles.item}>
        <View style={styles.infoContainer}>
          <Text style={styles.carInfo}>Tên xe: {item.carName}</Text>
          <Text style={styles.carInfo}>Loại xe: {item.carType}</Text>
          <Text style={styles.serviceInfo}>
            Dịch vụ: {item.service || 'Không tìm thấy dịch vụ'}
          </Text>
          <Text style={styles.customerInfo}>
            Khách hàng: {customers[item.uid] || 'Không tìm thấy khách hàng'}
          </Text>
          <Text style={styles.dateInfo}>Ngày: {formattedDate}</Text>
          <Text style={styles.timeInfo}>Giờ: {formattedTime}</Text>
          <Text
            style={[
              styles.statusInfo,
              {color: item.status === 'Đã hoàn thành' ? 'green' : 'red'},
            ]}>
            Trạng thái: {item.status}
          </Text>
        </View>

        {userLogin.role === 'admin' && (
          <TouchableOpacity style={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrash} size={20} color="red" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khách hàng"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
          <FontAwesomeIcon icon={faSort} size={20} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredSchedules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sortButton: {
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  infoContainer: {
    flex: 1,
  },
  carInfo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceInfo: {
    fontSize: 14,
    color: '#555',
  },
  customerInfo: {
    fontSize: 14,
    color: '#555',
  },
  dateInfo: {
    fontSize: 14,
  },
  timeInfo: {
    fontSize: 14,
  },
  statusInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StaffSchedule;
