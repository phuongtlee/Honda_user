import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faCar,
  faKey,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import {useMyContextProvider} from '../store/index';
import MyVehicle from '../screens/MyVehicle';
import Product from '../screens/Product';
import Setting from '../screens/Setting';
import HistorySchedule from '../screens/HistorySchedule';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Warning: A props object containing a "key" prop is being spread into JSX',
]);

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  return (
    <Tab.Navigator
      initialRouteName="MyVehicle"
      screenOptions={({route}) => ({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.2,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#1e90ff',
        tabBarInactiveTintColor: '#808080',
        tabBarIcon: ({focused}) => {
          let iconName;

          if (route.name === 'MyVehicle') {
            iconName = faKey;
          } else if (route.name === 'Product') {
            iconName = faCar;
          } else if (route.name === 'HistorySchedule') {
            iconName = faHistory;
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
        name="MyVehicle"
        component={MyVehicle}
        options={{
          headerTitle: 'Xe của tôi',
          headerStyle: {backgroundColor: '#1e90ff'},
          headerTintColor: '#fff',
          tabBarLabel: 'Xe của tôi',
        }}
      />
      <Tab.Screen
        name="Product"
        component={Product}
        options={{
          headerTitle: 'Sản phẩm',
          headerStyle: {backgroundColor: '#1e90ff'},
          headerTintColor: '#fff',
          tabBarLabel: 'Sản phẩm',
        }}
      />
      <Tab.Screen
        name="HistorySchedule"
        component={HistorySchedule}
        options={{
          headerTitle: 'Lịch sử',
          headerStyle: {backgroundColor: '#1e90ff'},
          headerTintColor: '#fff',
          tabBarLabel: 'Lịch sử',
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
