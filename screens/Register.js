import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {createAccount} from '../store/index';

export default function Register({navigation}) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // State for error messages
  const [errorMessages, setErrorMessages] = useState({});

  const handlePhoneChange = input => {
    const cleanedPhone = input.startsWith('0') ? input.slice(1) : input;
    setPhone(cleanedPhone);
  };

  const handleSubmit = async () => {
    // Reset error messages
    setErrorMessages({});

    // Input validation
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
      // Reset fields after successful registration
      setUsername('');
      setFullname('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPassword('');
      setErrorMessages({});
      Alert.alert('Thành công', 'Tài khoản đã được tạo thành công!');
      navigation.goBack();
    } catch (error) {
      setErrorMessages({api: error.message});
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Tên người dùng"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        error={!!errorMessages.username}
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
          placeholder="Nhập số điện thoại"
          keyboardType="numeric"
          style={styles.phoneInput}
          error={!!errorMessages.phone}
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
      />
      {errorMessages.address && (
        <Text style={styles.errorText}>{errorMessages.address}</Text>
      )}

      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        error={!!errorMessages.password}
      />
      {errorMessages.password && (
        <Text style={styles.errorText}>{errorMessages.password}</Text>
      )}

      {errorMessages.api && (
        <Text style={styles.errorText}>{errorMessages.api}</Text>
      )}

      <Button mode="contained" onPress={handleSubmit}>
        Đăng ký
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginBottom: 10,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryCodeInput: {
    width: 60,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
