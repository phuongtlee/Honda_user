import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Button} from 'react-native-paper';

export default function ThankYou({navigation}) {
  const handleOK = () => {
    navigation.navigate('HistorySchedule');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/thank-you_5359966.png')}
        style={styles.image}
      />
      <Text style={styles.thankYouText}>Cảm ơn bạn đã sử dụng dịch vụ</Text>
      <Button
        mode="contained"
        onPress={handleOK}
        style={styles.button}
        labelStyle={styles.buttonLabel}>
        Đồng ý
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f8fc',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    // borderRadius: 100,
    // borderWidth: 2,
    // borderColor: '#1e90ff',
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
