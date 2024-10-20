import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
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
        <Image
          source={{uri: item.ImageUrl || 'URL_HÌNH_ẢNH_MẶC_ĐỊNH'}}
          style={styles.productImage}
        />
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
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
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
          onPress={banner =>
            navigation.navigate('NewsDetail', {bannerData: banner})
          }
        />
      )}
      <Tab.Navigator>
        <Tab.Screen name="Xe Số">
          {() => <ProductList category="Xe số" />}
        </Tab.Screen>
        <Tab.Screen name="Xe Tay Ga">
          {() => <ProductList category="Tay ga" />}
        </Tab.Screen>
        <Tab.Screen name="Xe Tay Côn">
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
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  productName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 14,
    color: '#888',
  },
});

export default Product;
