import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import {
  MyContextControllerProvider,
  useMyContextProvider,
} from '../store/index';
import StackNav from '../route/StackNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainApp = () => {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {

        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          dispatch({ type: 'USER_LOGIN', value: user });
        } else {
          dispatch({ type: 'USER_LOGOUT' });
        }
      } catch (error) {
        console.error('Error loading user data from AsyncStorage:', error);
      } finally {
        setInitializing(false);
      }
    };

    checkUserLogin();
  }, [dispatch]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang kiểm tra trạng thái đăng nhập...</Text>
      </View>
    );
  }

  return <StackNav />;
};

const HomeApp = () => {
  return (
    <View style={{ flex: 1 }}>
      <MyContextControllerProvider>
        <PaperProvider>
          <MainApp />
        </PaperProvider>
      </MyContextControllerProvider>
    </View>
  );
};

export default HomeApp;
