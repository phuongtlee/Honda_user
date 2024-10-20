import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from 'react';
import {Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';

const MyContext = createContext();

const USERS = firestore().collection('users');
const VEHICLES = firestore().collection('vehicles');
const SERVICES = firestore().collection('services');

const reducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOGIN':
      return {...state, userLogin: action.value};
    case 'USER_LOGOUT':
      return {...state, userLogin: null};
    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [...(state.vehicles || []), action.value],
      };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: (state.vehicles || [])
          .filter(vehicle => vehicle.id !== action.value.id)
          .concat({...action.value}),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: (state.vehicles || []).filter(
          vehicle => vehicle.id !== action.value,
        ),
      };
    case 'SET_SERVICES':
      return {...state, services: action.value};
    case 'SET_STAFF_MEMBERS':
      return {...state, staffMembers: action.value};
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const MyContextControllerProvider = ({children}) => {
  const initialState = {
    userLogin: null,
    vehicles: [],
    services: [],
    staffMembers: [],
  };
  const [controller, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => [controller, dispatch], [controller]);

  const fetchStaffMembers = () => {
    const unsubscribe = USERS.onSnapshot(
      staffQuerySnapshot => {
        const staffList = staffQuerySnapshot.docs
          .map(doc => ({id: doc.id, ...doc.data()}))
          .filter(staff => staff.email.startsWith('STAFF')); // Filter staff members

        dispatch({type: 'SET_STAFF_MEMBERS', value: staffList});
      },
      error => {
        console.error('Error fetching staff members:', error);
      },
    );

    return unsubscribe; // Ensure this returns the unsubscribe function
  };

  useEffect(() => {
    const unsubscribeServices = fetchServices();
    const unsubscribeStaff = fetchStaffMembers();

    return () => {
      unsubscribeServices();
      unsubscribeStaff();
    };
  }, []);

  const fetchServices = () => {
    const unsubscribe = SERVICES.onSnapshot(
      servicesQuerySnapshot => {
        const servicesList = servicesQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({type: 'SET_SERVICES', value: servicesList});
      },
      error => {
        console.error('Error fetching services:', error);
      },
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribeServices = fetchServices();
    const unsubscribeStaff = fetchStaffMembers();

    return () => {
      unsubscribeServices();
      unsubscribeStaff();
    };
  }, []);

  useEffect(() => {
    fetchStaffMembers();
    fetchServices();
  }, []);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

const useMyContextProvider = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      'useMyContextController phải được đặt trong MyContextControllerProvider',
    );
  }
  return context;
};

const createAccount = async (
  username,
  password,
  fullname,
  phone,
  address,
  email,
) => {
  try {
    const formattedPhone = `+84${phone}`;

    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const uid = userCredential.user.uid;

    await USERS.doc(uid).set({
      uid: uid,
      username: username,
      fullname: fullname,
      phone: formattedPhone,
      address: address,
      email: email,
      password: password,
      isActive: true,
    });

    Alert.alert(
      'Tạo tài khoản thành công',
      'Thông tin người dùng đã được lưu.',
    );
  } catch (e) {
    console.log(e.message);
    Alert.alert('Lỗi', e.message);
  }
};

const login = async (dispatch, email, password) => {
  try {
    const userQuerySnapshot = await USERS.where('email', '==', email).get();

    if (userQuerySnapshot.empty) {
      Alert.alert('Tài khoản không tồn tại');
      return;
    }

    await auth().signInWithEmailAndPassword(email, password);

    userQuerySnapshot.forEach(async u => {
      // Alert.alert('Login success with ' + u.username);
      const userData = u.data();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log(userData);
      dispatch({type: 'USER_LOGIN', value: userData});
    });
  } catch (error) {
    console.log('Login error: ', error.message);
    if (error.code === 'auth/user-not-found') {
      Alert.alert('Tài khoản không tồn tại!', 'Vui lòng kiểm tra lại email.');
    } else if (error.code === 'auth/wrong-password') {
      Alert.alert('Sai mật khẩu!', 'Vui lòng kiểm tra lại mật khẩu.');
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert('Email không hợp lệ!', 'Vui lòng nhập email đúng định dạng.');
    } else if (error.code === 'auth/invalid-credential') {
      Alert.alert('Email hoặc mật khẩu bị sai', 'Vui lòng nhập lại.');
    } else {
      Alert.alert('Lỗi đăng nhập', 'Vui lòng thử lại sau.');
    }
  }
};

const logout = async dispatch => {
  try {
    console.log('Logging out...');

    await auth().signOut();
    console.log('User signed out successfully.');

    await AsyncStorage.removeItem('user');
    console.log('User data removed from AsyncStorage successfully.');

    dispatch({type: 'USER_LOGOUT'});
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

const addVehicle = async (dispatch, vehicleData) => {
  try {
    let imageUrl = '';

    if (vehicleData.image_uri) {
      const response = await fetch(vehicleData.image_uri);
      const blob = await response.blob();

      const ref = storage().ref(`vehicles/${Date.now()}.jpg`);

      await ref.put(blob);

      imageUrl = await ref.getDownloadURL();
    }

    vehicleData.image_url = imageUrl;

    await VEHICLES.add(vehicleData);

    dispatch({type: 'ADD_VEHICLE', value: vehicleData});

    Alert.alert('Thành công', 'Xe đã được thêm thành công.');
  } catch (error) {
    console.error(error);
    Alert.alert('Lỗi', 'Không thể thêm xe.');
  }
};

const updateVehicle = async (dispatch, vehicleId, updatedData) => {
  try {
    const dataToUpdate = {...updatedData};

    if (!updatedData.image_uri) {
      delete dataToUpdate.image_uri;
    } else {
      const response = await fetch(updatedData.image_uri);
      const blob = await response.blob();
      const ref = storage().ref(`vehicles/${Date.now()}.jpg`);
      await ref.put(blob);
      dataToUpdate.image_url = await ref.getDownloadURL();
    }
    await VEHICLES.doc(vehicleId).update(dataToUpdate);

    dispatch({type: 'UPDATE_VEHICLE', value: {id: vehicleId, ...dataToUpdate}});
  } catch (error) {
    console.error(error);
    Alert.alert('Lỗi', 'Không thể cập nhật xe.');
  }
};

const deleteVehicle = async (dispatch, vehicleId) => {
  try {
    await VEHICLES.doc(vehicleId).delete();

    dispatch({type: 'DELETE_VEHICLE', value: vehicleId});

    Alert.alert('Thành công', 'Xe đã được xóa thành công.');
  } catch (error) {
    console.error(error);
    Alert.alert('Lỗi', 'Không thể xóa xe.');
  }
};

export {
  MyContextControllerProvider,
  useMyContextProvider,
  createAccount,
  login,
  logout,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
