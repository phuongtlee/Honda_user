import React, {useState} from 'react';
import {View, TextInput, Button, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMyContextProvider} from '../store/index';

const ChangeDetail = ({navigation}) => {
  const [controller, dispatch] = useMyContextProvider();
  const {userLogin} = controller;

  // Local state for user details
  const [fullname, setFullname] = useState(userLogin.fullname);
  const [address, setAddress] = useState(userLogin.address);
  const [phone, setPhone] = useState(userLogin.phone);
  const [username, setUsername] = useState(userLogin.username);

  const handleUpdate = async () => {
    if (!fullname || !address || !phone || !username) {
      Alert.alert('Error', 'Please fill in all fields.');
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

      Alert.alert('Success', 'Your details have been updated!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', 'Failed to update details. Please try again.');
    }
  };

  return (
    <View style={{padding: 20}}>
      <TextInput
        value={fullname}
        onChangeText={setFullname}
        placeholder="Full Name"
        style={{marginBottom: 10}}
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        style={{marginBottom: 10}}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone"
        keyboardType="phone-pad"
        style={{marginBottom: 10}}
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={{marginBottom: 10}}
      />
      <Button title="Update Details" onPress={handleUpdate} />
    </View>
  );
};

export default ChangeDetail;
