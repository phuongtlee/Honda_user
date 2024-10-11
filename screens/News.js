import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';

const NewsDetail = ({route}) => {
  const {bannerData} = route.params;

  // Truy cập vào thuộc tính của bannerData
  const {image} = bannerData || {}; // Lấy thuộc tính image từ bannerData
  const {Title, NewsContent, ImageUrl} = image || {}; // Lấy Title, NewsContent, ImageUrl từ image

  console.log('Data post: ', bannerData);
  console.log('Data post title: ', Title);
  console.log('Data post News: ', NewsContent);
  console.log('Data post image: ', ImageUrl);

  // Kiểm tra nếu bannerData có dữ liệu hợp lệ
  if (!image) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Không tìm thấy dữ liệu tin tức.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {ImageUrl && (
        <Image source={{uri: ImageUrl}} style={styles.bannerImage} />
      )}
      <Text style={styles.title}>{Title || 'Tiêu đề không có sẵn'}</Text>
      <Text style={styles.description}>
        {NewsContent || 'Nội dung không có sẵn.'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
  },
});

export default NewsDetail;
