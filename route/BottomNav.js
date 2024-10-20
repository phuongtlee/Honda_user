import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye} from '@fortawesome/free-solid-svg-icons';
import {useMyContextProvider} from '../store/index';
import Home from '../screens/Home';
import MyVehicle from '../screens/MyVehicle';
import Product from '../screens/Product';
import {LogBox} from 'react-native';
import Setting from '../screens/Setting';
import HistorySchedule from '../screens/HistorySchedule';

LogBox.ignoreLogs([
  'Warning: A props object containing a "key" prop is being spread into JSX',
]);

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {backgroundColor: '#fff'},
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: 'Trang chủ',
          headerShown: true,
          tabBarLabel: 'Home',
          tabBarIcon: () => (
            <FontAwesomeIcon icon={faEye} color="#000" size={26} />
          ),
          tabBarLabelStyle: {color: '#000', fontSize: 13},
        }}
      />

      <Tab.Screen
        name="MyVehicle"
        component={MyVehicle}
        options={{
          headerTitle: 'Xe của tôi',
          headerShown: true,
          tabBarLabel: 'Xe của tôi',
          tabBarIcon: () => (
            <FontAwesomeIcon icon={faEye} color="#000" size={26} />
          ),
          tabBarLabelStyle: {color: '#000', fontSize: 13},
        }}
      />

      <Tab.Screen
        name="Product"
        component={Product}
        options={{
          headerTitle: 'Sản phẩm',
          headerShown: true,
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: () => (
            <FontAwesomeIcon icon={faEye} color="#000" size={26} />
          ),
          tabBarLabelStyle: {color: '#000', fontSize: 13},
        }}
      />

      <Tab.Screen
        name="HistorySchedule"
        component={HistorySchedule}
        options={{
          headerTitle: 'Lịch sử',
          headerShown: true,
          tabBarLabel: 'Lịch sử',
          tabBarIcon: () => (
            <FontAwesomeIcon icon={faEye} color="#000" size={26} />
          ),
          tabBarLabelStyle: {color: '#000', fontSize: 13},
        }}
      />

      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          headerTitle: 'Cài đặt',
          headerShown: true,
          tabBarLabel: 'Cài đặt',
          tabBarIcon: () => (
            <FontAwesomeIcon icon={faEye} color="#000" size={26} />
          ),
          tabBarLabelStyle: {color: '#000', fontSize: 13},
        }}
      />
    </Tab.Navigator>
  );
}
