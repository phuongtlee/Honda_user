import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import RepairHistory from './RepairHistory'; 
import TestDriveHistory from './TestDriveHistory'; 

const Tab = createMaterialTopTabNavigator();

export default function HistorySchedule() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Lịch sử sửa chữa" component={RepairHistory} />
      <Tab.Screen name="Lịch sử lái thử" component={TestDriveHistory} />
    </Tab.Navigator>
  );
}
