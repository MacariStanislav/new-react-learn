import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase";
import { ref, push, onValue, remove } from "firebase/database";
import "../../../css/Messages.css";

const Messages = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Загружаем пользователей и их онлайн-статус
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(Object.values(snapshot.val()));
      }
    });

    const statusRef = ref(db, "status");
    onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setOnlineStatus(snapshot.val());
      }
    });
  }, []);

  // Загружаем сообщения
  useEffect(() => {
    if (selectedUser) {
      const messagesRef = ref(db, `messages/${userName}_${selectedUser}`);
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          setMessages(Object.values(snapshot.val()));
        } else {
          setMessages([]); // Если переписки нет, очищаем сообщения
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

  // Отправка сообщения
  const sendMessage = () => {
    if (newMessage.trim() !== "" && selectedUser) {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const messageData = { text: newMessage, sender: userName, timestamp };
      push(ref(db, `messages/${userName}_${selectedUser}`), messageData);
      push(ref(db, `messages/${selectedUser}_${userName}`), messageData);
      setNewMessage("");
    }
  };

  // Удаление переписки
  const deleteChat = () => {
    if (selectedUser) {
      const chatRef = ref(db, `messages/${userName}_${selectedUser}`);
      remove(chatRef).then(() => {
        setSelectedUser(null); // Сбрасываем выбранного пользователя
        setMessages([]); // Очищаем сообщения
      });
    }
  };

  // Получаем список пользователей, с которыми уже есть переписка
  const getChatUsers = () => {
    const chatUsers = users.filter((u) => {
      return (
        u.displayName &&
        u.displayName !== userName &&
        (messages.some((msg) => msg.sender === u.displayName) ||
          messages.some((msg) => msg.receiver === u.displayName))
      );
    });
    return chatUsers;
  };

  // Фильтрация пользователей для поиска новых контактов
  const filteredNewUsers = users.filter(
    (u) =>
      u.displayName &&
      u.displayName !== userName &&
      !getChatUsers().some((chatUser) => chatUser.displayName === u.displayName) &&
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-container">
      {/* Список чатов */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        <div className="chat-users-list">
          {getChatUsers().map((u, index) => (
            <div
              key={index}
              className={`user-item ${selectedUser === u.displayName ? "active" : ""}`}
              onClick={() => setSelectedUser(u.displayName)}
            >
              <div
                className="status-indicator"
                style={{ background: onlineStatus[u.displayName] ? "green" : "red" }}
              ></div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="user-icon"
                className="avatar"
              />
              <span>{u.displayName}</span>
            </div>
          ))}
        </div>
        <button className="new-chat-button" onClick={() => setShowNewChatModal(true)}>
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
                className="status-indicator"
                style={{ background: onlineStatus[selectedUser] ? "green" : "red" }}
              ></div>
              <button className="delete-chat-button" onClick={deleteChat}>
                Delete Chat
              </button>
            </div>

            <div className="messages" ref={messagesContainerRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === userName ? "my-message" : "other-message"}`}
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

            {/* Ввод сообщения */}
            <div className="input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="send-button">
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-placeholder">Select a user to start chatting</div>
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
                  onClick={() => {
                    setSelectedUser(u.displayName);
                    setShowNewChatModal(false);
                  }}
                >
                  <div
                    className="status-indicator"
                    style={{ background: onlineStatus[u.displayName] ? "green" : "red" }}
                  ></div>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="user-icon"
                    className="avatar"
                  />
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