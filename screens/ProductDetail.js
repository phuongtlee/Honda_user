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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const handleScheduleTestDrive = () => {
    navigation.navigate('TestDriveSchedule', {
      productId,
      productName: product.NameProduct,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image source={{uri: product.ImageUrl}} style={styles.productImage} />
      <View style={styles.productContainer}>
        <Text style={styles.productName}>{product.NameProduct}</Text>
        <Text style={styles.productPrice}>{product.Price} VND</Text>
        <Text style={styles.productDescription}>{product.Description}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleScheduleTestDrive}>
        <Text style={styles.buttonText}>Đặt Lịch Lái Thử</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#1e90ff',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
