import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { logout, useMyContextProvider } from '../store/index';
import firestore from '@react-native-firebase/firestore';

export default function Setting({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const USER = firestore().collection('users');

  const onLogout = () => {
    logout(dispatch);
    navigation.navigate('Login'); // Chuyển hướng đến màn hình đăng nhập
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {userLogin ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.txt}>Thông tin cá nhân</Text>
          <Text style={styles.txt}>Tên người dùng: {userLogin.fullname}</Text>
          <Text style={styles.txt}>Email: {userLogin.email}</Text>
          <TouchableOpacity style={styles.btnLog}>
            <Text
              style={{ fontSize: 20, color: '#fff', alignSelf: 'center' }}
              onPress={() => navigation.navigate('ChangeName')}>
              Change Full Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnLog}
            onPress={() => navigation.navigate('ChangePass')}>
            <Text style={{ fontSize: 20, color: '#fff', alignSelf: 'center' }}>
              Change Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.btnLog}>
            <Text style={{ fontSize: 20, color: '#fff', alignSelf: 'center' }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 25 }}>
            Cài đặt
          </Text>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{
                ...styles.btnLog,
                alignContent: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: '#fff',
                  alignSelf: 'center',
                }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btnLog: {
    borderWidth: 2,
    borderColor: '#fff',
    width: 200,
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
  txt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    marginLeft: 20,
  },
});
