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
import {faTrash, faSort} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

const StaffSchedule = () => {
  const [repairSchedules, setRepairSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortedAscending, setIsSortedAscending] = useState(true);
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
    fetchCustomers();

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
      const statusA = a.status === 'Đã hoàn thành' ? 1 : 0;
      const statusB = b.status === 'Đã hoàn thành' ? 1 : 0;

      if (isSortedAscending) {
        return statusA - statusB;
      } else {
        return statusB - statusA;
      }
    });

    setFilteredSchedules(sortedData);
    setIsSortedAscending(!isSortedAscending);
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

        {userLogin && userLogin.role === 'admin' && (
          <TouchableOpacity style={styles.deleteButton}>
            <FontAwesomeIcon icon={faTrash} size={20} color="red" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1e90ff" />;
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
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSort} style={styles.sortButton}>
          <FontAwesomeIcon icon={faSort} size={20} color="#1e90ff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredSchedules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f8fc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  sortButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  listContainer: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  carInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e90ff',
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
    color: '#555',
  },
  timeInfo: {
    fontSize: 14,
    color: '#555',
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
