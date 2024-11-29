import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import Slideshow from 'react-native-image-slider-show';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Warning: componentWillMount has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.',
]);

const Tab = createMaterialTopTabNavigator();

const Product = ({navigation}) => {
  const [bannerImages, setBannerImages] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribeBanner = firestore()
      .collection('banners')
      .onSnapshot(
        snapshot => {
          const bannerList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBannerImages(
            bannerList.map(banner => ({
              url: banner.ImageUrl,
              ...banner,
            })),
          );
        },
        error => {},
      );

    return () => unsubscribeBanner();
  }, []);

  const fetchProducts = async category => {
    try {
      const productSnapshot = await firestore()
        .collection('products')
        .where('Category', '==', category)
        .get();

      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return productList;
    } catch (error) {}
  };

  const ProductList = ({category}) => {
    const [products, setProducts] = useState([]);

    const getProducts = async () => {
      const productList = await fetchProducts(category);
      setProducts(productList);
    };

    const handleRefresh = async () => {
      setIsRefreshing(true);
      await getProducts();
      setIsRefreshing(false);
    };

    useEffect(() => {
      const unsubscribeProducts = firestore()
        .collection('products')
        .where('Category', '==', category)
        .onSnapshot(
          snapshot => {
            const productList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(productList);
          },
          error => {},
        );

      getProducts();

      return () => unsubscribeProducts();
    }, [category]);

    const renderItem = ({item}) => (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          navigation.navigate('ProductDetail', {productId: item.id})
        }>
        <Image source={{uri: item.ImageUrl}} style={styles.productImage} />
        <Text style={styles.productName}>{item.NameProduct}</Text>
        <Text style={styles.productPrice}>{item.Price} VND</Text>
      </TouchableOpacity>
    );

    return (
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {bannerImages.length > 0 && (
        <Slideshow
          dataSource={bannerImages}
          height={200}
          indicatorSize={8}
          arrowSize={20}
          overlay={false}
          scrollEnabled={false}
          containerStyle={styles.slideshow}
          onPress={banner =>
            navigation.navigate('NewsDetail', {bannerData: banner})
          }
        />
      )}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#1e90ff',
          tabBarIndicatorStyle: {backgroundColor: '#1e90ff'},
          tabBarLabelStyle: {fontSize: 14, fontWeight: 'bold'},
        }}>
        <Tab.Screen name="Xe Số">
          {() => <ProductList category="Xe số" />}
        </Tab.Screen>
        <Tab.Screen name="Xe Tay Ga">
          {() => <ProductList category="Tay ga" />}
        </Tab.Screen>
        <Tab.Screen name="Tay Côn">
          {() => <ProductList category="Xe tay côn" />}
        </Tab.Screen>
        <Tab.Screen name="Xe Moto">
          {() => <ProductList category="Xe moto" />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  listContainer: {
    padding: 10,
  },
  slideshow: {
    // marginBottom: 10,
    margin: 10,
    // borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#1e90ff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#1e90ff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f4f7',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  productName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
});

export default Product;
