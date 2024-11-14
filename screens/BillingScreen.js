import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Button, Dialog, Portal} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import firestore from '@react-native-firebase/firestore';
import {faCheck, faCircleXmark} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-native-date-picker';

const BillingScreen = ({route, navigation}) => {
  const {customerUid, date, carName, repairScheduleId, staffUid} = route.params;
  const [customerInfo, setCustomerInfo] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(new Date());
  const [kmDriven, setKmDriven] = useState('');
  const [isManualDate, setIsManualDate] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = message => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerDoc = await firestore()
          .collection('users')
          .doc(customerUid)
          .get();
        const staffDoc = await firestore()
          .collection('users')
          .doc(staffUid)
          .get();
        const servicesSnapshot = await firestore().collection('services').get();

        if (customerDoc.exists) setCustomerInfo(customerDoc.data());
        if (staffDoc.exists) setStaffInfo(staffDoc.data());

        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showDialog('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerUid, staffUid]);

  const toggleServiceSelection = service => {
    const isSelected = selectedServices.some(
      selected => selected.id === service.id,
    );
    const updatedServices = isSelected
      ? selectedServices.filter(selected => selected.id !== service.id)
      : [...selectedServices, service];
    setSelectedServices(updatedServices);
    setTotalCost(updatedServices.reduce((sum, s) => sum + s.price, 0));
  };

  const calculateMaintenanceDate = () => {
    const km = parseInt(kmDriven, 10);
    if (isNaN(km) || km <= 0) {
      showDialog('Vui lòng nhập số km hợp lệ.');
      return;
    }
    const monthsToAdd = Math.floor(km / 1000);
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + monthsToAdd);
    setNextMaintenanceDate(newDate);
  };

  const handleSaveBilling = async () => {
    if (selectedServices.length === 0) {
      showDialog('Vui lòng chọn ít nhất một dịch vụ.');
      return;
    }

    setLoading(true);
    try {
      // Save billing info
      const billingDocRef = await firestore()
        .collection('billing')
        .add({
          customerUid,
          customerName: customerInfo?.fullname,
          staffUid,
          staffName: staffInfo?.fullname,
          carName,
          date,
          services: selectedServices.map(service => ({
            id: service.id,
            name: service.name_service,
            price: service.price,
          })),
          totalCost,
          createdAt: firestore.Timestamp.now(),
        });

      const billId = billingDocRef.id;

      await firestore()
        .collection('repairSchedules')
        .where('carName', '==', carName)
        .where('status', '==', 'Chưa hoàn thành')
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            firestore().collection('repairSchedules').doc(doc.id).update({
              status: 'Đã hoàn thành',
              billId,
              totalCost,
            });
          });
        });

      const vehicleDoc = await firestore()
        .collection('vehicles')
        .where('vehicle_name', '==', carName)
        .get();
      if (!vehicleDoc.empty) {
        const vehicleId = vehicleDoc.docs[0].id;
        await firestore().collection('vehicles').doc(vehicleId).update({
          maintenance_date: nextMaintenanceDate.toISOString(),
        });
      }

      showDialog(
        'Thông tin hóa đơn đã được lưu và ngày bảo trì tiếp theo đã cập nhật.',
      );
      navigation.navigate('StaffScreen');
    } catch (error) {
      console.error('Error saving billing:', error);
      showDialog('Không thể lưu thông tin hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceNames = selectedServices
    .map(service => service.name_service)
    .join(', ');

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.customerInfoContainer}>
        {customerInfo && (
          <>
            <Text style={styles.infoTitle}>Thông Tin Khách Hàng</Text>
            <Text style={styles.info}>Tên: {customerInfo.fullname}</Text>
            <Text style={styles.info}>Số Điện Thoại: {customerInfo.phone}</Text>
            <Text style={styles.info}>Xe: {carName}</Text>
            <Text style={styles.info}>Ngày Sửa Chữa: {date}</Text>
            <Text style={styles.info}>Nhân Viên: {staffInfo?.fullname}</Text>
          </>
        )}
      </View>

      <Text style={styles.subTitle}>Chọn Dịch Vụ:</Text>
      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={styles.button}>
        Chọn Dịch Vụ
      </Button>

      <TextInput
        value={selectedServiceNames}
        style={styles.selectedServicesInput}
        placeholder="Dịch Vụ Đã Chọn"
        editable={false}
      />

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TextInput
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
            style={styles.searchInput}
          />
          <FlatList
            data={services.filter(
              service =>
                service.name_service
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) &&
                service.type === 'Sửa chữa',
            )}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => toggleServiceSelection(item)}
                style={styles.serviceItem}>
                <FontAwesomeIcon
                  icon={
                    selectedServices.some(selected => selected.id === item.id)
                      ? faCheck
                      : faCircleXmark
                  }
                  size={24}
                  color={
                    selectedServices.some(selected => selected.id === item.id)
                      ? '#4CAF50'
                      : '#C62828'
                  }
                />
                <Text style={styles.serviceText}>
                  {item.name_service} - {item.price} VND
                </Text>
              </TouchableOpacity>
            )}
          />
          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={styles.button}>
            Đóng
          </Button>
        </View>
      </Modal>

      <Text style={styles.subTitle}>Nhập Số Kilomet Đã Chạy:</Text>
      <TextInput
        value={kmDriven}
        onChangeText={setKmDriven}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Nhập số km (ví dụ: 6000)"
      />
      <Button
        mode="contained"
        onPress={calculateMaintenanceDate}
        style={styles.button}>
        Tính Ngày Bảo Trì
      </Button>

      <Text style={styles.subTitle}>Chọn Chế Độ Ngày Bảo Trì:</Text>
      <Button
        mode="contained"
        onPress={() => setIsManualDate(!isManualDate)}
        style={styles.button}>
        {isManualDate ? 'Chọn Ngày Tự Động' : 'Chọn Ngày Thủ Công'}
      </Button>

      {isManualDate ? (
        <DatePicker
          date={nextMaintenanceDate}
          onDateChange={setNextMaintenanceDate}
          mode="date"
        />
      ) : (
        <Text style={styles.dateText}>
          Ngày Bảo Trì Dự Kiến: {nextMaintenanceDate.toLocaleDateString()}
        </Text>
      )}

      <Text style={styles.totalCost}>Tổng Chi Phí: {totalCost} VND</Text>
      <Button
        mode="contained"
        onPress={handleSaveBilling}
        style={styles.button}
        disabled={loading}>
        Lưu Thông Tin Hóa Đơn
      </Button>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Thông Báo</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
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
  container: {padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1},
  loading: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  customerInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  info: {fontSize: 16, marginVertical: 2},
  subTitle: {fontSize: 16, fontWeight: 'bold', marginVertical: 8},
  button: {backgroundColor: '#4CAF50', marginVertical: 10},
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  selectedServicesInput: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  modalOverlay: {flex: 1, padding: 20, backgroundColor: '#fff'},
  searchInput: {
    marginBottom: 15,
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  serviceText: {marginLeft: 10, fontSize: 16},
  dateText: {fontSize: 16, marginVertical: 5},
  totalCost: {fontSize: 18, fontWeight: 'bold', marginTop: 15},
});

export default BillingScreen;
