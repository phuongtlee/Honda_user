import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import BottomNav from './BottomNav';
import Chat from '../screens/Chat';
import {View} from 'react-native';
import AddVehicle from '../screens/AddVehicle';
import VehicleDetail from '../screens/VehicleDetail';
import UpdateVehicle from '../screens/UpdateVehicle';
import ScheduleCarRepair from '../screens/ScheduleCarRepair';

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
          <Stack.Screen name="Login" component={Login} />
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
        </Stack.Navigator>
        <Chat />
      </View>
    </NavigationContainer>
  );
}
