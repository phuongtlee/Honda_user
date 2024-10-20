import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ProductDetail = ({route, navigation}) => {
  const {productId} = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDoc = await firestore()
          .collection('products')
          .doc(productId)
          .get();
        if (productDoc.exists) {
          setProduct(productDoc.data());
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!product) {
    return <Text>Product not found.</Text>;
  }

  const handleScheduleTestDrive = () => {
    navigation.navigate('TestDriveSchedule', {
      productId, // ID của xe
      productName: product.NameProduct,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{uri: product.ImageUrl}} style={styles.productImage} />
      <Text style={styles.productName}>{product.NameProduct}</Text>
      <Text style={styles.productPrice}>{product.Price} VND</Text>
      <Text style={styles.productDescription}>{product.Description}</Text>

      <TouchableOpacity style={styles.button} onPress={handleScheduleTestDrive}>
        <Text style={styles.buttonText}>Đặt Lịch Lái Thử</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 5,
  },
  productName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 18,
    color: '#888',
  },
  productDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
