import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
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
  faStar,
} from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailHistory = ({route, navigation}) => {
  const {schedule} = route.params;
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(schedule);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const disabled = true;

  useEffect(() => {
    const checkUserRole = async () => {
      const email = await AsyncStorage.getItem('user');
      if (email && email.includes('STAFF')) {
        setIsStaff(true);
      }
    };
    checkUserRole();
  }, []);

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

  useEffect(() => {
    const checkIfReviewExists = async () => {
      try {
        const reviewsQuery = await firestore()
          .collection('reviews')
          .where('scheduleId', '==', currentSchedule.id)
          .get();

        if (!reviewsQuery.empty) {
          const review = reviewsQuery.docs[0].data();
          setReviewSubmitted(true);
          setRating(review.rating);
          setComment(review.comment);
        }
      } catch (error) {
        console.error('Error checking if review exists: ', error);
      }
    };

    checkIfReviewExists();
  }, [currentSchedule.id]);

  const handleUpdate = () => {
    navigation.navigate('UpdateSchedule', {
      schedule: currentSchedule,
      setCurrentSchedule,
    });
  };

  const handleStarPress = star => {
    if (!reviewSubmitted) {
      setRating(star);
    }
  };

  const handleSaveReview = async () => {
    if (rating === 0 || !comment.trim()) {
      alert('Vui lòng đánh giá và viết bình luận');
      return;
    }

    try {
      await firestore().collection('reviews').add({
        scheduleId: currentSchedule.id,
        staffId: schedule.staff,
        rating,
        comment,
        createdAt: firestore.Timestamp.now(),
      });

      setReviewSubmitted(true);
      alert('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Không thể lưu đánh giá');
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#1e90ff" style={styles.loading} />
    );
  }

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

        {currentSchedule.status === 'Đã hoàn thành' && !isStaff && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đánh giá nhân viên</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  disabled={reviewSubmitted}>
                  <FontAwesomeIcon
                    icon={faStar}
                    size={30}
                    color={star <= rating ? '#FFD700' : '#ccc'}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Viết bình luận..."
              multiline
              value={comment}
              onChangeText={setComment}
              editable={!reviewSubmitted}
            />

            <Button
              mode="contained"
              onPress={handleSaveReview}
              style={styles.button}
              disabled={reviewSubmitted}>
              Gửi Đánh Giá
            </Button>
          </View>
        )}
      </ScrollView>
      {currentSchedule.status === 'Đã hoàn thành' ? (
        <Button
          disabled
          mode="contained"
          onPress={handleUpdate}
          style={styles.button}>
          Cập nhật thông tin
        </Button>
      ) : (
        <Button mode="contained" onPress={handleUpdate} style={styles.button}>
          Cập nhật thông tin
        </Button>
      )}
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
    color: '#1e90ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e90ff',
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e90ff',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  commentInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1e90ff',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetailHistory;
