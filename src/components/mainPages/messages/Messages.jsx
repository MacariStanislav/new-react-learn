import React, { useState, useEffect, useRef } from "react";
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

const Messages = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isTyping, setTypingStatus] = useState(false); // Статус набора текста
  const [otherUserTyping, setOtherUserTyping] = useState(false); // Статус того, кто пишет
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Загружаем пользователей
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(Object.values(snapshot.val()));
      }
    });
  }, []);

  // Загружаем статусы пользователей в реальном времени
  useEffect(() => {
    const statusRef = ref(db, "status");

    const handleStatusUpdate = (snapshot) => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [snapshot.key]: snapshot.val(),
      }));
    };

    onChildAdded(statusRef, handleStatusUpdate);
    onChildChanged(statusRef, handleStatusUpdate);
  }, []);

  // Загружаем список чатов пользователя (убираем дубли)
  useEffect(() => {
    const messagesRef = ref(db, "messages");

    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatKeys = Object.keys(snapshot.val());
        const userChats = new Set(); // Используем Set для удаления дубликатов

        chatKeys.forEach((key) => {
          if (key.includes(userName)) {
            const chatUser = key
              .replace(`${userName}_`, "")
              .replace(`_${userName}`, "");
            userChats.add(chatUser); // Set не допускает дубликатов
          }
        });

        setChatUsers(Array.from(userChats)); // Преобразуем Set обратно в массив
      }
    });
  }, [userName]);

  // Загружаем сообщения с выбранным пользователем
  useEffect(() => {
    if (selectedUser) {
      const messagesRef = ref(db, `messages/${userName}_${selectedUser}`);
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          setMessages(Object.values(snapshot.val()));
        } else {
          setMessages([]);
        }
      });
    }
  }, [selectedUser, userName]);

  // Прокрутка вниз при новом сообщении
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Отправка сообщения
  const sendMessage = () => {
    if (newMessage.trim() !== "" && selectedUser) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const messageData = { text: newMessage, sender: userName, timestamp };
      push(ref(db, `messages/${userName}_${selectedUser}`), messageData);
      push(ref(db, `messages/${selectedUser}_${userName}`), messageData);
      setNewMessage("");
    }
  };

  // Удаление переписки
  const deleteChat = () => {
    if (selectedUser) {
      const chatRef1 = ref(db, `messages/${userName}_${selectedUser}`);
      const chatRef2 = ref(db, `messages/${selectedUser}_${userName}`);

      remove(chatRef1);
      remove(chatRef2);

      setChatUsers((prev) => prev.filter((u) => u !== selectedUser));
      setSelectedUser(null);
      setMessages([]);
    }
  };

  // Фильтрация пользователей для поиска новых контактов
  const filteredNewUsers = users.filter(
    (u) =>
      u.displayName &&
      u.displayName !== userName &&
      !chatUsers.includes(u.displayName) &&
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Функция для обновления статуса набора текста
  useEffect(() => {
    if (selectedUser) {
      const typingRef = ref(db, `typing/${userName}_${selectedUser}`);
      if (isTyping) {
        set(typingRef, true);
      } else {
        set(typingRef, false);
      }
    }
  }, [isTyping, selectedUser]);

  // Слушатель для статуса набора текста другого пользователя
  useEffect(() => {
    if (selectedUser) {
      const typingRef = ref(db, `typing/${selectedUser}_${userName}`);
      onValue(typingRef, (snapshot) => {
        if (snapshot.exists()) {
          setOtherUserTyping(snapshot.val());
        } else {
          setOtherUserTyping(false);
        }
      });
    }
  }, [selectedUser, userName]);
  const typingTimeoutRef = useRef(null);
  // Обработчик изменения текста в поле ввода
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setTypingStatus(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 2000);
   };

  let typingTimeout;

  return (
    <div className="chat-container">
      {/* Список чатов */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        <div className="chat-users-list">
          {chatUsers.map((user, index) => (
            <div
              key={index}
              className={`user-item ${selectedUser === user ? "active" : ""}`}
              onClick={() => setSelectedUser(user)}
            >
              <div
                className="status-indicator"
                style={{
                  background: onlineStatus[user] === "online" ? "green" : "red",
                }}
              ></div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="user-icon"
                className="avatar"
              />
              <span>{user}</span>
            </div>
          ))}
        </div>
        <button
          className="new-chat-button"
          onClick={() => setShowNewChatModal(true)}
        >
          New Chat
        </button>
      </div>

      {/* Чат */}
      <div className="chat-main">
        {selectedUser ? (
          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat with {selectedUser}</h3>
              <div
                className="status-indicator vtoroi"
                style={{
                  background:
                    onlineStatus[selectedUser] === "online" ? "green" : "red",
                }}
              ></div>{" "}
              <div className="status-typ">
                {otherUserTyping && (
                  <div className="typing-status">Is typing...</div>
                )}
              </div>
              <button className="delete-chat-button" onClick={deleteChat}>
                Delete Chat
              </button>
            </div>

            <div className="messages" ref={messagesContainerRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === userName ? "my-message" : "other-message"
                  }`}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="user-icon"
                    className="message-avatar"
                  />
                  <div className="message-content">
                    <span className="sender">{msg.sender}</span>
                    <p>{msg.text}</p>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Печатает ли другой пользователь */}

            {/* Ввод сообщения */}
            <div className="input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="send-button">
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-placeholder">
            Select a user to start chatting
          </div>
        )}
      </div>

      {/* Модальное окно для нового чата */}
      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>New Chat</h3>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            
            <div className="new-users-list">
              {filteredNewUsers.map((u, index) => (
                <div
                  key={index}
                  className="user-item"
                  onClick={() => setSelectedUser(u.displayName)}
                >
                  
                  <span>{u.displayName}</span>
                </div>
              ))}
            </div>
            <button
              className="close-button"
              onClick={() => setShowNewChatModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;


