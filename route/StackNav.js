import React from 'react';
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

const Stack = createNativeStackNavigator();

export default function StackNav() {
  return (
    <NavigationContainer>
      <View style={{flex: 1}}>
        <Stack.Navigator
          initialRouteName="BottomTab"
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
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="AddVehicle" component={AddVehicle} />
          <Stack.Screen
            name="BottomTab"
            component={BottomNav}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="VehicleDetail"
            component={VehicleDetail}
            options={{headerShown: true, headerTitle: 'Thông tin xe'}}
          />
          <Stack.Screen
            name="UpdateVehicle"
            component={UpdateVehicle}
            options={{headerShown: true, headerTitle: 'Sửa thông tin'}}
          />
          <Stack.Screen
            name="ScheduleCarRepair"
            component={ScheduleCarRepair}
            options={{headerShown: true, headerTitle: 'Đặt lịch sửa xe'}}
          />
          <Stack.Screen
            name="DetailHistory"
            component={DetailHistory}
            options={{
              headerShown: true,
              headerTitle: 'Chi tiết lịch sử',
            }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetail}
            options={{headerShown: true, headerTitle: 'Chi tiết sản phẩm'}}
          />
          <Stack.Screen
            name="TestDriveSchedule"
            component={TestDriveSchedule}
            options={{headerShown: true, headerTitle: 'Đặt lịch lái thử'}}
          />
          <Stack.Screen
            name="ThankYou"
            component={ThankYou}
            options={{headerShown: false, headerTitle: 'Cảm ơn'}}
          />
          <Stack.Screen
            name="UpdateSchedule"
            component={UpdateSchedule}
            options={{headerShown: true, headerTitle: 'Cập nhật lịch'}}
          />
          <Stack.Screen
            name="NewsDetail"
            component={NewsDetail}
            options={{headerShown: true, headerTitle: 'Cập nhật lịch'}}
          />
        </Stack.Navigator>
        <Chat />
      </View>
    </NavigationContainer>
  );
}
