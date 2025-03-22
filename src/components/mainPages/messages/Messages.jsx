import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { db } from "../../../firebase";
import {
  ref,
  push,
  onValue,
  remove,
  onChildAdded,
  onChildChanged,
  set,
} from "firebase/database";
import "../../../css/Messages.css";
import Picker from 'emoji-picker-react';

const Messages = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isTyping, setTypingStatus] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [contextMenu, setContextMenu] = useState(null); 
  const [editMessage, setEditMessage] = useState(null); 
  const [editingMessageId, setEditingMessageId] = useState(null); 

  const onEmojiClick = (emojiObject) => {
    setShowEmojiPicker(emojiObject);
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  // Загружаем пользователей и статусы
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) setUsers(Object.values(snapshot.val()));
    });

    const statusRef = ref(db, "status");
    const handleStatusUpdate = (snapshot) => {
      setOnlineStatus((prev) => ({ ...prev, [snapshot.key]: snapshot.val() }));
    };
    onChildAdded(statusRef, handleStatusUpdate);
    onChildChanged(statusRef, handleStatusUpdate);
  }, []);

  // Загружаем список чатов пользователя
  useEffect(() => {
    const messagesRef = ref(db, "messages");
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatKeys = Object.keys(snapshot.val());
        const userChats = new Set();

        chatKeys.forEach((key) => {
          if (key.includes(userName)) {
            const chatUser = key.replace(`${userName}_`, "").replace(`_${userName}`, "");
            userChats.add(chatUser);
          }
        });

        setChatUsers(Array.from(userChats));
      }
    });
  }, [userName]);

  // Загружаем сообщения с выбранным пользователем
  useEffect(() => {
    if (selectedUser) {
      const messagesRef = ref(db, `messages/${userName}_${selectedUser}`);
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesArray = Object.keys(messagesData).map((key) => ({
            id: key,
            ...messagesData[key],
          }));
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      });
    }
  }, [selectedUser, userName]);

  // Прокрутка вниз при новом сообщении
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Обработчик отправки сообщения
  const sendMessage = useCallback(() => {
    if (newMessage.trim() && selectedUser) {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const messageId = new Date().getTime().toString(); // Уникальный ID на основе времени
      const messageData = { text: newMessage, sender: userName, timestamp, messageId }; // Добавляем messageId
      push(ref(db, `messages/${userName}_${selectedUser}`), messageData);
      push(ref(db, `messages/${selectedUser}_${userName}`), messageData);
      setNewMessage("");
    }
  }, [newMessage, selectedUser, userName]);

  // Удаление переписки
  const deleteChat = useCallback(() => {
    if (selectedUser) {
      const chatRef1 = ref(db, `messages/${userName}_${selectedUser}`);
      const chatRef2 = ref(db, `messages/${selectedUser}_${userName}`);

      remove(chatRef1);
      remove(chatRef2);

      setChatUsers((prev) => prev.filter((u) => u !== selectedUser));
      setSelectedUser(null);
      setMessages([]);
    }
  }, [selectedUser, userName]);

  // Фильтрация пользователей для поиска новых контактов
  const filteredNewUsers = useMemo(() => users.filter(
    (u) =>
      u.displayName &&
      u.displayName !== userName &&
      !chatUsers.includes(u.displayName) &&
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  ), [users, chatUsers, searchQuery, userName]);

  // Обновление статуса набора текста
  useEffect(() => {
    if (selectedUser) {
      const typingRef = ref(db, `typing/${userName}_${selectedUser}`);
      set(typingRef, isTyping);
    }
  }, [isTyping, selectedUser, userName]);

  // Слушатель для статуса набора текста другого пользователя
  useEffect(() => {
    if (selectedUser) {
      const typingRef = ref(db, `typing/${selectedUser}_${userName}`);
      onValue(typingRef, (snapshot) => {
        setOtherUserTyping(snapshot.exists() ? snapshot.val() : false);
      });
    }
  }, [selectedUser, userName]);

  // Обработчик изменения текста в поле ввода
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setTypingStatus(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => setTypingStatus(false), 2000);
  };

  // Обработчик правого клика на сообщение
  const handleRightClick = (e, message) => {
    e.preventDefault();
    // Показываем контекстное меню только для своих сообщений
    if (message.sender === userName) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        messageId: message.messageId, // Используем messageId вместо id
      });
    }
  };

  // Удаление сообщения
  const deleteMessage = (messageId) => {
    if (selectedUser && messageId) {
      // Находим сообщение в вашем чате
      const messagesRef1 = ref(db, `messages/${userName}_${selectedUser}`);
      onValue(messagesRef1, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          Object.keys(messagesData).forEach((key) => {
            if (messagesData[key].messageId === messageId) {
              remove(ref(db, `messages/${userName}_${selectedUser}/${key}`));
            }
          });
        }
      });

      // Находим сообщение в чате собеседника
      const messagesRef2 = ref(db, `messages/${selectedUser}_${userName}`);
      onValue(messagesRef2, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          Object.keys(messagesData).forEach((key) => {
            if (messagesData[key].messageId === messageId) {
              remove(ref(db, `messages/${selectedUser}_${userName}/${key}`));
            }
          });
        }
      });

      setContextMenu(null);
    }
  };

  // Обработчик изменения сообщения
  const editMessageHandler = (messageId) => {
    const message = messages.find((msg) => msg.messageId === messageId);
    if (message) {
      setEditMessage(message.text); 
      setEditingMessageId(messageId); 
      setContextMenu(null); 
    }
  };

  // Сохранение измененного сообщения
  const saveEditedMessage = () => {
    if (selectedUser && editingMessageId) {
      const message = messages.find((msg) => msg.messageId === editingMessageId);
      
      // Проверяем, изменился ли текст сообщения
      if (message && message.text === editMessage) {
        // Если текст не изменился, просто закрываем режим редактирования
        setEditMessage(null);
        setEditingMessageId(null);
        return;
      }
  
      const updatedMessage = {
        text: editMessage,
        sender: userName,
        timestamp: new Date().toLocaleTimeString(),
        messageId: editingMessageId, 
      };
  
      // Находим сообщение в вашем чате
      const messagesRef1 = ref(db, `messages/${userName}_${selectedUser}`);
      onValue(messagesRef1, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          Object.keys(messagesData).forEach((key) => {
            if (messagesData[key].messageId === editingMessageId) {
              set(ref(db, `messages/${userName}_${selectedUser}/${key}`), updatedMessage);
            }
          });
        }
      });
  
      // Находим сообщение в чате собеседника
      const messagesRef2 = ref(db, `messages/${selectedUser}_${userName}`);
      onValue(messagesRef2, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          Object.keys(messagesData).forEach((key) => {
            if (messagesData[key].messageId === editingMessageId) {
              set(ref(db, `messages/${selectedUser}_${userName}/${key}`), updatedMessage);
            }
          });
        }
      });
  
      setEditMessage(null);
      setEditingMessageId(null); 
    }
  };

  return (
    <div className="chat-container">
     
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => deleteMessage(contextMenu.messageId)}>Delete</button>
          <button onClick={() => editMessageHandler(contextMenu.messageId)}>Edit</button>
        </div>
      )}

      <div className="chat-sidebar">
        <h3>Chats</h3>
        <div className="chat-users-list">
          {chatUsers.map((user) => (
            <div
              key={user}
              className={`user-item ${selectedUser === user ? "active" : ""}`}
              onClick={() => setSelectedUser(user)}
            >
              <div
                className="status-indicator"
                style={{ background: onlineStatus[user] === "online" ? "green" : "red" }}
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="user-icon"
                className="avatar"
              />
              <span>{user}</span>
            </div>
          ))}
        </div>
        <button className="new-chat-button" onClick={() => setShowNewChatModal(true)}>
          New Chat
        </button>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat with {selectedUser}</h3>
              <div
                className="status-indicator vtoroi"
                style={{
                  background: onlineStatus[selectedUser] === "online" ? "green" : "red",
                }}
              />
              <div className="typing-status">
                {otherUserTyping && 'Is typing...'}
              </div>
              <button className="delete-chat-button" onClick={deleteChat}>
                Delete Chat
              </button>
            </div>

            <div className="messages" ref={messagesContainerRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === userName ? "my-message" : "other-message"}`}
                  onContextMenu={(e) => handleRightClick(e, msg)}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="user-icon"
                    className="message-avatar"
                  />
                  <div className="message-content">
                    <span className="sender">{msg.sender}</span>
                    {editingMessageId === msg.messageId ? (
                      <input className="saveInput"
                        type="text"
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                  {editingMessageId === msg.messageId && (
                    <button  className="saveButton" onClick={saveEditedMessage}>Save</button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <div className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                😀
              </div>

              <div className="emoji">
                {showEmojiPicker && <Picker onEmojiClick={onEmojiClick} className="emoji-picker" />}
              </div>

              <button onClick={sendMessage} className="send-button">
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-placeholder">Select a user to start chatting</div>
        )}
      </div>

      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>New Chat</h3>
            <input
              type="text"
              placeholder="   Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="new-users-list">
              {filteredNewUsers.map((u) => (
                <div
                  key={u.displayName}
                  className="user-item"
                  onClick={() => setSelectedUser(u.displayName)}
                >
                  <span>{u.displayName}</span>
                </div>
              ))}
            </div>
            <button className="close-button" onClick={() => setShowNewChatModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;