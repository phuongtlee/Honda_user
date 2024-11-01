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
import avatarImage from '../assets/2ad86d4128742b555b487c8a62a33e9e-removebg-preview.png';
import avatarImageUser from '../assets/istockphoto-1337144146-612x612-removebg-preview.png';
import PushNotification from 'react-native-push-notification';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faComments} from '@fortawesome/free-solid-svg-icons';

const ChatBubble = ({text, isUser, onLongPress}) => {
  return (
    <TouchableOpacity onLongPress={onLongPress}>
      <View
        style={[
          styles.bubbleContainer,
          {alignSelf: isUser ? 'flex-end' : 'flex-start'},
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
        {isUser && <Image source={avatarImageUser} style={styles.avatar} />}
      </View>
    </TouchableOpacity>
  );
};

export default function Chat() {
  const [visible, setVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket] = useState(io('http://192.168.1.5:4000'));
  const [controller] = useMyContextProvider();
  const {userLogin} = controller;

  useEffect(() => {
    const handleReceiveMessage = data => {
      console.log('Received message data:', data);
      if (data.text) {
        const newMessage = {
          text: data.text,
          isUser: data.isUser === false,
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
        avatar: avatarImageUser,
        userId: userLogin.uid,
        username: userLogin.fullname,
        timestamp: new Date().toISOString(),
      };

      socket.emit('send_message', messageData);
      console.log(messageData);

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
              saveMessagesToStorage(updatedMessages);
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
        icon={() => (
          <FontAwesomeIcon icon={faComments} color="#fff" size={20} />
        )}
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
                  onLongPress={() => handleLongPress(index)}
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
    right: 10,
    bottom: 50,
    backgroundColor: 'red',
    borderRadius: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    backgroundColor: '#f7f9fc',
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
    borderColor: '#1e90ff',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    paddingLeft: 15,
    marginRight: 10,
    backgroundColor: '#f1f7fd',
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#1e90ff',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    fontWeight: '600',
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    resizeMode: 'cover',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '75%',
  },
  userChatBubble: {
    backgroundColor: '#1e90ff',
    borderTopRightRadius: 0,
  },
  otherChatBubble: {
    backgroundColor: '#e1e7f3',
    borderTopLeftRadius: 0,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#333333',
  },
});
