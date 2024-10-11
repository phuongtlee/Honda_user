import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {FAB} from 'react-native-paper';
import io from 'socket.io-client';
import {useMyContextProvider} from '../store/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import avatarImage from '../assets/94694379_p0.jpg';
import PushNotification from 'react-native-push-notification'; // Import thư viện

const ChatBubble = ({text, isUser, onLongPress}) => {
  return (
    <TouchableOpacity onLongPress={onLongPress}>
      <View
        style={[
          styles.bubbleContainer,
          {alignSelf: isUser ? 'flex-end' : 'flex-start'}, // Quyết định vị trí của tin nhắn
        ]}>
        {!isUser && <Image source={avatarImage} style={styles.avatar} />}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userChatBubble : styles.otherChatBubble,
          ]}>
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.userText : styles.otherText,
            ]}>
            {text}
          </Text>
        </View>
        {isUser && <Image source={avatarImage} style={styles.avatar} />}
      </View>
    </TouchableOpacity>
  );
};

export default function Chat() {
  const [visible, setVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket] = useState(io('http://192.168.1.7:4000'));
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;

  useEffect(() => {
    const handleReceiveMessage = data => {
      console.log('Received message data:', data); // Ghi log dữ liệu để kiểm tra
      if (data.text) {
        const newMessage = {
          text: data.text,
          isUser: data.isUser === false, // Kiểm tra giá trị của isUser
          avatar: avatarImage,
        };

        PushNotification.localNotification({
          channelId: 'default-channel-id',
          title: 'Tin nhắn mới',
          message: data.text,
          playSound: true,
          sound: 'default',
          vibrate: true,
        });

        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMessage];
          saveMessagesToStorage(updatedMessages);
          return updatedMessages;
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();
    };
  }, [socket]);

  const toggleChat = () => {
    if (!visible) {
      setVisible(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [900, 0],
  });

  const handleSend = () => {
    if (inputText.trim()) {
      const messageData = {
        text: inputText,
        isUser: true,
        avatar: avatarImage,
        userId: userLogin.uid,
        username: userLogin.fullname,
      };

      socket.emit('send_message', messageData);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, messageData];
        saveMessagesToStorage(updatedMessages);
        return updatedMessages;
      });
      setInputText('');
    }
  };

  const saveMessagesToStorage = async messages => {
    try {
      await AsyncStorage.setItem(
        `messages_${userLogin.uid}`,
        JSON.stringify(messages),
      );
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(
        `messages_${userLogin.uid}`,
      );
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    if (userLogin) {
      loadMessagesFromStorage();
    } else {
      setMessages([]);
    }
  }, [userLogin]);

  const handleLongPress = index => {
    Alert.alert(
      'Xóa tin nhắn',
      'Bạn có chắc chắn muốn xóa tin nhắn này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => {
            setMessages(prevMessages => {
              const updatedMessages = prevMessages.filter(
                (_, i) => i !== index,
              );
              saveMessagesToStorage(updatedMessages); // Lưu tin nhắn đã xóa
              return updatedMessages;
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  if (!userLogin) return null;

  return (
    <>
      <FAB
        style={styles.fab}
        small
        icon="chat"
        onPress={toggleChat}
        color="#fff"
      />

      <Modal visible={visible} animationType="none" transparent={true}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.chatContainer, {transform: [{translateY}]}]}>
            <TouchableOpacity onPress={toggleChat}>
              <Text style={styles.closeText}>Đóng Chat</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.chatMessages}
              contentContainerStyle={{paddingBottom: 20}}>
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  text={msg.text}
                  isUser={msg.isUser}
                  onLongPress={() => handleLongPress(index)} // Gọi hàm xử lý khi giữ tin nhắn
                />
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Nhập tin nhắn..."
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend}>
                <Text style={styles.sendButton}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 50,
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  closeText: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderColor: '#6200ee',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#6200ee',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  bubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userChatBubble: {
    backgroundColor: '#6200ee',
  },
  otherChatBubble: {
    backgroundColor: '#e0e0e0',
  },
  bubbleText: {
    fontSize: 16,
  },
  userText: {
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },
});
