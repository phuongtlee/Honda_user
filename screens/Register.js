import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {createAccount} from '../store/index';

export default function Register() {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneChange = input => {
    // Nếu số nhập vào bắt đầu bằng '0', loại bỏ nó
    const cleanedPhone = input.startsWith('0') ? input.slice(1) : input;
    setPhone(cleanedPhone);
  };

  const handleSubmit = async () => {
    if (!username || !fullname || !email || !phone || !address || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      // Gọi hàm createAccount với tất cả các tham số
      await createAccount(username, password, fullname, phone, address, email);
      Alert.alert('Thành công', 'Tài khoản đã được tạo thành công!');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Tên người dùng"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Họ và tên"
        value={fullname}
        onChangeText={setFullname}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
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
        />
      </View>
      <TextInput
        label="Địa chỉ"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
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
});
