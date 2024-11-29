import React, {useEffect} from 'react';
import {View} from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeApp from './screens/AppHome';

const App = () => {
  useEffect(() => {
    createNotificationChannel();

    getAndSaveFCMToken();

    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      saveFCMToken(token);
    });

    return () => unsubscribe();
  }, []);

  const createNotificationChannel = () => {
    PushNotification.createChannel(
      {
        channelId: 'default-channel-id',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for notifications',
        importance: 4,
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`),
    );
  };

  const getAndSaveFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        saveFCMToken(fcmToken); // Lưu FCM token
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const saveFCMToken = async token => {
    try {
      await AsyncStorage.setItem('fcmToken', token);
      console.log('FCM Token saved to AsyncStorage:', token);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      <HomeApp />
    </View>
  );
};

export default App;
