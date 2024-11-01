import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import BottomNav from './BottomNav';
import Chat from '../screens/Chat';
import {TouchableOpacity, View} from 'react-native';
import AddVehicle from '../screens/AddVehicle';
import VehicleDetail from '../screens/VehicleDetail';
import UpdateVehicle from '../screens/UpdateVehicle';
import ScheduleCarRepair from '../screens/ScheduleCarRepair';
import DetailHistory from '../screens/DetailHistory';
import ProductDetail from '../screens/ProductDetail';
import TestDriveSchedule from '../screens/TestDriveSchedule';
import ThankYou from '../screens/ThankYou';
import {Text} from 'react-native-paper';
import UpdateSchedule from '../screens/UpdateSchedule';
import NewsDetail from '../screens/News';
import StaffScreen from '../screens/StaffScreen';
import BottomNavStaff from './BottomNavStaff';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestDriveDetail from '../screens/testDriveDetail';
import UpdateTestDriveSchedule from '../screens/UpdateTestDriveSchedule';
import ChangeDetail from '../screens/ChangeDetail';
import ChangePassword from '../screens/ChangePassword';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';

const Stack = createNativeStackNavigator();

export default function StackNav() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('user');
        console.log(userEmail);
        if (userEmail && userEmail.toLowerCase().includes('staff')) {
          setInitialRoute('BottomNavStaff');
        } else {
          setInitialRoute('BottomTab');
        }
      } catch (error) {
        console.error('Lỗi khi lấy email từ AsyncStorage:', error);
        setInitialRoute('Login');
      }
    };

    checkUserType();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{flex: 1}}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
          }}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Đăng kí tài khoản',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="AddVehicle"
            component={AddVehicle}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Thêm xe',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="BottomTab"
            component={BottomNav}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="VehicleDetail"
            component={VehicleDetail}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Thông tin chi tiết xe',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="UpdateVehicle"
            component={UpdateVehicle}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Sửa thông tin xe',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ScheduleCarRepair"
            component={ScheduleCarRepair}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Đặt lịch lái thử',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="DetailHistory"
            component={DetailHistory}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Chi tiết lịch sử',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetail}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Chi tiết sản phẩm',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="TestDriveSchedule"
            component={TestDriveSchedule}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Đặt lịch lái thử',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ThankYou"
            component={ThankYou}
            options={{headerShown: false, headerTitle: 'Cảm ơn'}}
          />
          <Stack.Screen
            name="UpdateSchedule"
            component={UpdateSchedule}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Cập nhật lịch sửa xe',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="NewsDetail"
            component={NewsDetail}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Tin tức',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="BottomNavStaff"
            component={BottomNavStaff}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="testDriveDetail"
            component={TestDriveDetail}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Chi tiết lịch lát thử',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="UpdateTestDriveSchedule"
            component={UpdateTestDriveSchedule}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Cập nhật lịch lái thử',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ChangeDetail"
            component={ChangeDetail}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Cập nhật thông tin',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={({navigation}) => ({
              headerShown: true,
              headerTitle: 'Cập nhật mật khẩu',
              headerStyle: {
                backgroundColor: '#1e90ff',
              },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
        <Chat />
      </View>
    </NavigationContainer>
  );
}
