import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import {createAccount} from '../store/index';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';

export default function Register({navigation}) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [errorMessages, setErrorMessages] = useState({});

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handlePhoneChange = input => {
    const cleanedPhone = input.startsWith('0') ? input.slice(1) : input;
    setPhone(cleanedPhone);
  };

  const showDialog = message => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.goBack();
  };

  const handleSubmit = async () => {
    setErrorMessages({});

    let errors = {};

    if (!username) {
      errors.username = 'Vui lòng điền tên người dùng.';
    } else if (username.length < 3) {
      errors.username = 'Tên người dùng phải có ít nhất 3 ký tự.';
    }

    if (!fullname) {
      errors.fullname = 'Vui lòng điền họ và tên.';
    } else if (fullname.length < 3) {
      errors.fullname = 'Họ và tên phải có ít nhất 3 ký tự.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      errors.email = 'Vui lòng điền địa chỉ email.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (!phone) {
      errors.phone = 'Vui lòng điền số điện thoại.';
    } else if (phone.length < 9 || phone.length > 10) {
      errors.phone = 'Số điện thoại phải có 9 hoặc 10 ký tự.';
    }

    if (!address) {
      errors.address = 'Vui lòng điền địa chỉ.';
    } else if (address.length < 5) {
      errors.address = 'Địa chỉ phải có ít nhất 5 ký tự.';
    }

    if (!password) {
      errors.password = 'Vui lòng điền mật khẩu.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    // Set error messages if any
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    try {
      await createAccount(username, password, fullname, phone, address, email);
      setUsername('');
      setFullname('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPassword('');
      setErrorMessages({});
      showDialog('Đăng kí thành công');
    } catch (error) {
      setErrorMessages({api: error.message});
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
            source={require('../assets/pngtree-comicstyle-signup-icon-with-finger-cursor-on-white-background-vector-png-image_41407154-removebg-preview.png')}
          />
          <TextInput
            label="Tên người dùng"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            error={!!errorMessages.username}
            // mode="outlined"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          {errorMessages.username && (
            <Text style={styles.errorText}>{errorMessages.username}</Text>
          )}

          <TextInput
            label="Họ và tên"
            value={fullname}
            onChangeText={setFullname}
            style={styles.input}
            error={!!errorMessages.fullname}
            // mode="outlined"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          {errorMessages.fullname && (
            <Text style={styles.errorText}>{errorMessages.fullname}</Text>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            error={!!errorMessages.email}
            // mode="outlined"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          {errorMessages.email && (
            <Text style={styles.errorText}>{errorMessages.email}</Text>
          )}

          <View style={styles.phoneContainer}>
            <TextInput
              value="+84"
              editable={false}
              style={styles.countryCodeInput}
            />
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              label="Nhập số điện thoại"
              keyboardType="numeric"
              style={styles.phoneInput}
              error={!!errorMessages.phone}
              // mode="outlined"
              underlineColor="#1e90ff"
              theme={{
                colors: {
                  primary: '#1e90ff',
                },
              }}
            />
          </View>
          {errorMessages.phone && (
            <Text style={styles.errorText}>{errorMessages.phone}</Text>
          )}

          <TextInput
            label="Địa chỉ"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            error={!!errorMessages.address}
            // mode="outlined"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
          />
          {errorMessages.address && (
            <Text style={styles.errorText}>{errorMessages.address}</Text>
          )}

          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            style={styles.input}
            error={!!errorMessages.password}
            // mode="outlined"
            underlineColor="#1e90ff"
            theme={{
              colors: {
                primary: '#1e90ff',
              },
            }}
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
          {errorMessages.password && (
            <Text style={styles.errorText}>{errorMessages.password}</Text>
          )}

          {errorMessages.api && (
            <Text style={styles.errorText}>{errorMessages.api}</Text>
          )}

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Đăng ký
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryCodeInput: {
    width: 60,
    marginRight: 10,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 200,
    width: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    borderWidth: 0.25,
  },
  button: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#1e90ff',
  },
  phoneInput: {
    flex: 1,
    marginRight: 2,
    backgroundColor: 'transparent',
    borderColor: '#1e90ff',
    borderBottomWidth: 1,
  },
});
