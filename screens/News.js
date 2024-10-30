import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';

const NewsDetail = ({route}) => {
  const {bannerData} = route.params;
  const {image} = bannerData || {};
  const {Title, NewsContent, ImageUrl} = image || {};

  console.log('Data post: ', bannerData);
  console.log('Data post title: ', Title);
  console.log('Data post News: ', NewsContent);
  console.log('Data post image: ', ImageUrl);

  if (!image) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Không tìm thấy dữ liệu tin tức.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {ImageUrl && (
        <Image source={{uri: ImageUrl}} style={styles.bannerImage} />
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{Title || 'Tiêu đề không có sẵn'}</Text>
        <Text style={styles.description}>
          {NewsContent || 'Nội dung không có sẵn.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  bannerImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e90ff',
    shadowColor: '#1e90ff',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#ff4c4c',
  },
});

export default NewsDetail;
