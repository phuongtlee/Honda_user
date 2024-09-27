import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  Image,
} from 'react-native';
import {FAB} from 'react-native-paper';

const ChatBubble = ({text, isUser, avatar}) => {
  return (
    <View
      style={[
        styles.bubbleContainer,
        {alignSelf: isUser ? 'flex-end' : 'flex-start'}, // Điều chỉnh ở đây
      ]}>
      {!isUser && (
        <Image
          source={require('../assets/94694379_p0.jpg')} // Avatar của người nhận
          style={styles.avatar}
        />
      )}
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
      {isUser && (
        <Image
          source={require('../assets/94694379_p0.jpg')} // Avatar của người gửi
          style={styles.avatar}
        />
      )}
    </View>
  );
};

export default function Chat() {
  const [visible, setVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [messages, setMessages] = useState([
    {
      text: 'Hi, how are you?',
      isUser: true,
      avatar: 'https://via.placeholder.com/40',
    }, // Avatar giả
    {
      text: "I'm good, thanks! How about you?",
      isUser: false,
      avatar: 'https://via.placeholder.com/40',
    }, // Avatar giả
  ]);
  const [inputText, setInputText] = useState('');

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
      setMessages([
        ...messages,
        {
          text: inputText,
          isUser: true,
          avatar: 'https://via.placeholder.com/40',
        },
      ]); // Avatar giả
      setInputText('');
    }
  };

  return (
    <>
      {/* Nút nổi để mở chat */}
      <FAB
        style={styles.fab}
        small
        icon="chat"
        onPress={toggleChat}
        color="#fff"
      />

      {/* Modal hiển thị giao diện chat */}
      <Modal visible={visible} animationType="none" transparent={true}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.chatContainer, {transform: [{translateY}]}]}>
            <TouchableOpacity onPress={toggleChat}>
              <Text style={styles.closeText}>Đóng Chat</Text>
            </TouchableOpacity>

            <View style={styles.chatMessages}>
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  text={msg.text}
                  isUser={msg.isUser}
                  avatar={msg.avatar}
                />
              ))}
            </View>

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
    right: 0,
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
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  closeText: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: 'red',
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userChatBubble: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherChatBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  bubbleText: {
    fontSize: 16,
  },
  userText: {
    color: '#000',
  },
  otherText: {
    color: '#000',
  },
});
