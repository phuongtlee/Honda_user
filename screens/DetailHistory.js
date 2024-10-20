import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-paper';
import firestore, {Timestamp} from '@react-native-firebase/firestore';

const DetailHistory = ({route, navigation}) => {
  const {schedule} = route.params;
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(schedule);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      try {
        const staffDoc = await firestore()
          .collection('users')
          .doc(schedule.staff)
          .get();
        if (staffDoc.exists) {
          setStaffInfo(staffDoc.data());
        }
      } catch (error) {
        console.error('Error fetching staff info: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffInfo();
  }, [schedule.staff]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchUpdatedSchedule = async () => {
        try {
          const updatedDoc = await firestore()
            .collection('schedules')
            .doc(currentSchedule.id)
            .get();
          if (updatedDoc.exists) {
            setCurrentSchedule(updatedDoc.data());
          }
        } catch (error) {
          console.error('Error fetching updated schedule: ', error);
        }
      };

      fetchUpdatedSchedule();
    });

    return unsubscribe;
  }, [navigation, currentSchedule.id]);

  const handleUpdate = () => {
    navigation.navigate('UpdateSchedule', {
      schedule: currentSchedule,
      setCurrentSchedule,
    });
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
    );
  }

  // Convert Firestore Timestamp to JavaScript Date
  const scheduleDate =
    currentSchedule.date instanceof Timestamp
      ? currentSchedule.date.toDate()
      : new Date(currentSchedule.date);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Thông tin chi tiết lịch sửa xe</Text>
        <Text style={styles.info}>Tên xe: {currentSchedule.carName}</Text>
        <Text style={styles.info}>Loại xe: {currentSchedule.carType}</Text>
        {currentSchedule.damageDescription && (
          <Text style={styles.info}>
            Mô tả thiệt hại: {currentSchedule.damageDescription}
          </Text>
        )}
        <Text style={styles.info}>Dịch vụ: {currentSchedule.service}</Text>
        <Text style={styles.info}>
          Nhân viên: {staffInfo ? staffInfo.fullname : 'Đang tải...'}
        </Text>
        <Text style={styles.info}>
          Ngày: {scheduleDate.toLocaleDateString()}
        </Text>
        <Text style={styles.info}>
          Giờ:{' '}
          {scheduleDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.info}>Trạng thái: {currentSchedule.status}</Text>
        {currentSchedule.imageUrls && currentSchedule.imageUrls.length > 0 && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageTitle}>Hình ảnh:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currentSchedule.imageUrls.map((url, index) => (
                <Image key={index} source={{uri: url}} style={styles.image} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      <Button mode="contained" onPress={handleUpdate} style={styles.button}>
        Cập nhật thông tin
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  imageContainer: {
    marginTop: 20,
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default DetailHistory;
