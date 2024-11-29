import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCar, faCog, faEye} from '@fortawesome/free-solid-svg-icons';
import StaffScreen from '../screens/StaffScreen';
import Setting from '../screens/Setting';
import {LogBox} from 'react-native';
import VehicleList from '../screens/MyVehicleStaff';

LogBox.ignoreLogs([
  'Warning: A props object containing a "key" prop is being spread into JSX',
]);

const Tab = createBottomTabNavigator();

export default function BottomNavStaff() {
  return (
    <Tab.Navigator
      initialRouteName="StaffScreen"
      screenOptions={({route}) => ({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          height: 60,
        },
        tabBarActiveTintColor: '#1e90ff',
        headerTitleAlign: 'center',
        tabBarInactiveTintColor: '#808080',
        tabBarIcon: ({focused}) => {
          let iconName;

          if (route.name === 'StaffScreen') {
            iconName = faEye;
          } else if (route.name === 'Setting') {
            iconName = faCog;
          }

          return (
            <FontAwesomeIcon
              icon={iconName}
              color={focused ? '#1e90ff' : '#808080'}
              size={focused ? 28 : 24}
            />
          );
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'normal',
        },
      })}
      sceneContainerStyle={{
        backgroundColor: '#fff',
      }}>
      <Tab.Screen
        name="StaffScreen"
        component={StaffScreen}
        options={{
          headerTitle: 'Trang chủ nhân viên',
          headerStyle: {backgroundColor: '#1e90ff'},
          headerTintColor: '#fff',
          tabBarLabel: 'Trang chủ',
        }}
      />

      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          headerTitle: 'Cài đặt',
          headerStyle: {backgroundColor: '#1e90ff'},
          headerTintColor: '#fff',
          tabBarLabel: 'Cài đặt',
        }}
      />
    </Tab.Navigator>
  );
}
