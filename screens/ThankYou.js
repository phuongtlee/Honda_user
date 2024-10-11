import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';

export default function ThankYou({navigation}) {
  const handleOK = () => {
    navigation.navigate('HistorySchedule');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.thankYouText}>Cảm ơn bạn đã sử dụng dịch vụ</Text>
      <Button mode="contained" onPress={handleOK} style={styles.button}>
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
    padding: 16,
  },
  thankYouText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});
