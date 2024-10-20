import React, {useState} from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import auth from '@react-native-firebase/auth';

const ChangePassword = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const reauthenticate = currentPassword => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    return user.reauthenticateWithCredential(credential);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await reauthenticate(currentPassword);
      await auth().currentUser.updatePassword(newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi thành công.');
      navigation.goBack();
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Lỗi', 'Mật khẩu hiện tại không chính xác.');
      } else {
        Alert.alert('Lỗi', 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          right={
            <TextInput.Icon
              icon={() => (
                <FontAwesomeIcon
                  icon={showCurrentPassword ? faEyeSlash : faEye}
                  size={20}
                />
              )}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            />
          }
          style={styles.input}
        />

        <TextInput
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          right={
            <TextInput.Icon
              icon={() => (
                <FontAwesomeIcon
                  icon={showNewPassword ? faEyeSlash : faEye}
                  size={20}
                />
              )}
              onPress={() => setShowNewPassword(!showNewPassword)}
            />
          }
          style={styles.input}
        />

        <TextInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={() => (
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  size={20}
                />
              )}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleChangePassword}
          disabled={loading}
          style={styles.button}>
          {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff', // Set background color
  },

  inputContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
    marginBottom: 15,
  },

  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#98fb98', // Set button color to light green
  },
});

export default ChangePassword;
