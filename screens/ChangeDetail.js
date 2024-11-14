import React, {useState} from 'react';
import {
  View,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
  StyleSheet,
} from 'react-native';
import {Button, Dialog, Portal, Paragraph, TextInput} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMyContextProvider} from '../store/index';

const ChangeDetail = ({navigation}) => {
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  const [fullname, setFullname] = useState(userLogin.fullname);
  const [address, setAddress] = useState(userLogin.address);
  const [phone, setPhone] = useState(userLogin.phone);
  const [username, setUsername] = useState(userLogin.username);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = message => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.goBack();
  };

  const handleUpdate = async () => {
    if (!fullname || !address || !phone || !username) {
      showDialog('Vui lòng điền vào tất cả các trường.');
      return;
    }

    try {
      await firestore().collection('users').doc(userLogin.uid).update({
        fullname,
        address,
        phone,
        username,
      });

      const updatedUser = {...userLogin, fullname, address, phone, username};
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({type: 'USER_LOGIN', value: updatedUser});

      showDialog('Thông tin của bạn đã được cập nhật');
    } catch (error) {
      console.error('Error updating user details:', error);
      showDialog('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}}>
      <ImageBackground
        source={require('../assets/c0858d3aff288fa15c8609a6f5196dd1.jpg')}
        blurRadius={5}
        style={styles.background}>
        <View style={styles.overlay}>
          <Image
            style={styles.logo}
            source={require('../assets/istockphoto-1216856320-612x612-removebg-preview.png')}
          />
          <TextInput
            value={fullname}
            onChangeText={setFullname}
            placeholder="Họ và tên"
            style={styles.input}
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Địa chỉ"
            style={styles.input}
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
            textColor="#000"
            style={styles.input}
          />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Tên đăng nhập"
            style={styles.input}
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          <Button style={styles.button} mode="contained" onPress={handleUpdate}>
            Lưu thông tin
          </Button>
        </View>
      </ImageBackground>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Thông báo</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
});

export default ChangeDetail;
