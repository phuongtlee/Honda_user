import {createContext, useContext, useMemo, useReducer} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';

const MyContext = createContext();

const USERS = firestore().collection('users');
const VEHICLES = firestore().collection('vehicles');

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
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const MyContextControllerProvider = ({children}) => {
  const initialState = {
    userLogin: null,
    vehicles: [],
  };
  const [controller, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => [controller, dispatch], [controller]);
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
      Alert.alert('Login success with ' + u.id);
      const userData = u.data();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log(userData);
      dispatch({type: 'USER_LOGIN', value: userData});
    });
  } catch (e) {
    console.log('Login error: ', e.message);
    Alert.alert('Lỗi', e.message);
  }
};

const logout = async dispatch => {
  try {
    console.log('Logging out...');

    // Đăng xuất từ Firebase Authentication trước
    await auth().signOut();
    console.log('User signed out successfully.');

    // Xóa dữ liệu người dùng từ AsyncStorage
    await AsyncStorage.removeItem('user');
    console.log('User data removed from AsyncStorage successfully.');

    // Cập nhật trạng thái đăng nhập của ứng dụng
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
