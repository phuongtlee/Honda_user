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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faScroll,
  faCar,
  faBellConcierge,
  faPerson,
  faCalendar,
  faTimesCircle,
  faClock,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

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
      <ActivityIndicator size="large" color="#1e90ff" style={styles.loading} />
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin xe</Text>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faCar} size={24} color="#1e90ff" />
            <Text style={styles.info}>Tên xe: {currentSchedule.carName}</Text>
          </View>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faCar} size={24} color="#1e90ff" />
            <Text style={styles.info}>Loại xe: {currentSchedule.carType}</Text>
          </View>
          {currentSchedule.damageDescription && (
            <View style={styles.infoContainer}>
              <FontAwesomeIcon icon={faScroll} size={24} color="#1e90ff" />
              <Text style={styles.info}>
                Mô tả thiệt hại: {currentSchedule.damageDescription}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faBellConcierge} size={24} color="#1e90ff" />
            <Text style={styles.info}>Dịch vụ: {currentSchedule.service}</Text>
          </View>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faPerson} size={24} color="#1e90ff" />
            <Text style={styles.info}>
              Nhân viên: {staffInfo ? staffInfo.fullname : 'Đang tải...'}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faCalendar} size={24} color="#1e90ff" />
            <Text style={styles.info}>
              Ngày: {scheduleDate.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faClock} size={24} color="#1e90ff" />
            <Text style={styles.info}>
              Giờ:{' '}
              {scheduleDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faCheck} size={24} color="#1e90ff" />
            <Text style={styles.info}>
              Trạng thái: {currentSchedule.status}
            </Text>
          </View>
        </View>

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
    backgroundColor: '#f0f4f7',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e90ff', // Primary color for title
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 3, // Shadow for Android
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2}, // Shadow for iOS
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e90ff', // Primary color for card title
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333', // Dark text for readability
  },
  imageContainer: {
    marginTop: 20,
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e90ff', // Primary color for image title
  },
  image: {
    width: 150,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e90ff', // Border color matching the theme
    shadowColor: '#1e90ff',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  button: {
    margin: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e90ff', // Button color matching the theme
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default DetailHistory;
