import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye} from '@fortawesome/free-solid-svg-icons';
import StaffScreen from '../screens/StaffScreen';
import Setting from '../screens/Setting';

const Tab = createBottomTabNavigator();

export default function BottomNavStaff() {
  return (
    <Tab.Navigator
      initialRouteName="StaffScreen"
      screenOptions={{
        tabBarStyle: {backgroundColor: '#fff'},
      }}>
      <Tab.Screen
        name="StaffScreen"
        component={StaffScreen}
        options={{
          headerTitle: 'Trang chủ nhân viên',
          headerShown: true,
          tabBarLabel: 'Home',
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
