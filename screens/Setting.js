import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {logout, useMyContextProvider} from '../store/index';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faMailBulk,
  faMailReply,
  faPerson,
} from '@fortawesome/free-solid-svg-icons';

export default function Setting({navigation}) {
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  const onLogout = () => {
    logout(dispatch);
    navigation.navigate('Setting');
  };

  return (
    <View style={styles.container}>
      {userLogin ? (
        <View style={styles.contentContainer}>
          <Text style={styles.header}>Thông tin cá nhân</Text>
          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faPerson} size={24} color="#1e90ff" />
            <Text style={[styles.info, {marginLeft: 8}]}>
              <Text style={styles.label}>Tên người dùng:</Text>{' '}
              {userLogin.fullname}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <FontAwesomeIcon icon={faMailReply} size={24} color="#1e90ff" />
            <Text style={[styles.info, {marginLeft: 8}]}>
              <Text style={styles.label}>Email:</Text> {userLogin.email}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('ChangeDetail', {user: userLogin})
            }>
            <Text style={styles.buttonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.header}>Cài đặt</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e90ff',
    paddingHorizontal: 15,
    paddingVertical: 30,
  },
  label: {fontWeight: 'bold'},
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
