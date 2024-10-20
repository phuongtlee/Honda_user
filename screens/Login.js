import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, View, Alert} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {useMyContextProvider, login} from '../store/index';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export default function Login({navigation}) {
  //staff account STAFFabc1@gmail.com
  // user account test@example.us
  const [email, setEmail] = useState('test@example.us');
  // const [email, setEmail] = useState('STAFFasdf@gmail.com');
  const [password, setPassword] = useState('123123');
  const [showPass, setShowPass] = useState(false);
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  useEffect(() => {
    if (userLogin) {
      // Check if the email contains "STAFF" (case-insensitive)
      if (userLogin.email.toLowerCase().includes('staff')) {
        navigation.navigate('BottomNavStaff');
      } else {
        navigation.navigate('Home');
      }

      getTokenAndSaveToFirestore(userLogin);
    }
  }, [userLogin]);

  const handleLogin = async () => {
    console.log('Login button pressed');
    if (email === '') {
      Alert.alert('Email không được bỏ trống!');
    } else if (password === '') {
      Alert.alert('Password không được bỏ trống!');
    } else {
      login(dispatch, email, password);
    }
  };

  const getTokenAndSaveToFirestore = async user => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      await firestore().collection('users').doc(user.uid).set(
        {
          fcmToken: token,
        },
        {merge: true},
      );

      console.log('FCM token đã được lưu vào Firestore.');
    } catch (error) {
      console.error('Lỗi khi lấy FCM token hoặc lưu vào Firestore:', error);
    }
  };

  return (
    <View>
      <TextInput
        label="Nhập số điện thoại"
        value={email}
        onChangeText={setEmail}
        underlineColor="none"
        activeUnderlineColor="transparent"
        textColor="#000"
        placeholderTextColor={'#fff'}
        keyboardType="number"
      />

      <TextInput
        label="Nhập số mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPass}
        underlineColor="none"
        activeUnderlineColor="transparent"
        textColor="#000"
        placeholderTextColor={'#fff'}
        right={
          <TextInput.Icon
            icon={() => (
              <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} size={20} />
            )}
            onPress={() => setShowPass(!showPass)}
          />
        }
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        textColor="#000"
        style={{marginTop: 5, padding: 5, backgroundColor: '#98fb98'}}>
        Login
      </Button>
      <Text style={{color: '#000'}}>Bạn chưa có mật khẩu?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{color: 'red', fontWeight: 'bold'}}>
          Đăng kí tài khoản
        </Text>
      </TouchableOpacity>
    </View>
  );
}
