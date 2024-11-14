import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {useMyContextProvider, login} from '../store/index';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export default function Login({navigation}) {
  //staff account STAFFabc1@gmail.com
  // user account test@example.us
  const [email, setEmail] = useState('e@gmail.com');
  // const [email, setEmail] = useState('STAFFasdf@gmail.com');
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [password, setPassword] = useState('123123');
  const [showPass, setShowPass] = useState(false);
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  useEffect(() => {
    if (userLogin) {
      if (userLogin.email.toLowerCase().includes('staff')) {
        navigation.navigate('BottomNavStaff');
      } else {
        navigation.navigate('MyVehicle');
      }

      getTokenAndSaveToFirestore(userLogin);
    }
  }, [userLogin]);

  const handleLogin = async () => {
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
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({fcmToken: token}, {merge: true});
    } catch (error) {
      console.error('Lỗi khi lấy FCM token hoặc lưu vào Firestore:', error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ImageBackground
        source={require('../assets/c0858d3aff288fa15c8609a6f5196dd1.jpg')}
        blurRadius={5}
        style={styles.background}>
        <View style={styles.overlay}>
          <Image
            style={styles.logo}
            source={require('../assets/pngtree-comic-style-login-icon-with-padlock-and-password-vector-png-image_12861183-removebg-preview.png')}
          />

          <TextInput
            label="Nhập số điện thoại"
            value={email}
            onChangeText={setEmail}
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
            textColor="#000"
            // placeholderTextColor="#aaa"
            style={styles.input}
          />

          <TextInput
            label="Nhập số mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
            textColor="#000"
            // placeholderTextColor="#aaa"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={() => (
                  <FontAwesomeIcon
                    icon={showPass ? faEyeSlash : faEye}
                    size={20}
                  />
                )}
                onPress={() => setShowPass(!showPass)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            textColor="#fff"
            style={styles.button}>
            Đăng nhập
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có mật khẩu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Đăng kí tài khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    borderWidth: 0.25,
  },
  logo: {
    height: 200,
    width: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  input: {
    fontSize: 15,
    marginBottom: 15,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: '#1e90ff',
    borderRadius: 5,
    borderBottomWidth: 1,
  },
  button: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#1e90ff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#000',
  },
  registerText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
