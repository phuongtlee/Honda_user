import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
} from 'react-native';
import {TextInput, Button, Portal, Dialog, Paragraph} from 'react-native-paper';
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
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isErrorDialog, setIsErrorDialog] = useState(false);

  const reauthenticate = currentPassword => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    return user.reauthenticateWithCredential(credential);
  };

  const showDialog = (message, isError = false) => {
    console.log('Dialog message:', message);
    setDialogMessage(message);
    setIsErrorDialog(isError);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    if (!isErrorDialog) {
      navigation.goBack();
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showDialog('Vui lòng nhập đầy đủ thông tin.', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showDialog('Mật khẩu mới và xác nhận mật khẩu không khớp.', true);
      return;
    }

    if (newPassword.length < 6) {
      showDialog('Mật khẩu mới phải có ít nhất 6 ký tự.', true);
      return;
    }

    setLoading(true);
    try {
      await reauthenticate(currentPassword);
      await auth().currentUser.updatePassword(newPassword);
      showDialog('Mật khẩu đã được thay đổi thành công.');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'aunpth/wrong-password') {
        showDialog('Mật khẩu hiện tại không chính xác.', true);
      } else {
        showDialog('Không thể đổi mật khẩu. Vui lòng thử lại.', true);
      }
    } finally {
      setLoading(false);
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
});

export default ChangePassword;
