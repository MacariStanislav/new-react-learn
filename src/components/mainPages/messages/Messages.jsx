import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase";
import { ref, push, onValue, set, update } from "firebase/database";
import "../../../css/Messages.css";

const Messages = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const messagesEndRef = useRef(null);

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
        setMessages(snapshot.exists() ? Object.values(snapshot.val()) : []);
      });
    }
  }, [selectedUser]);

  // Прокрутка вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="chat-container">
      {/* Список пользователей */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {users
          .filter((u) => u.displayName !== userName)
          .map((u, index) => (
            <div key={index} className="user-item" onClick={() => setSelectedUser(u.displayName)}>
              <div className="status-indicator" style={{ background: onlineStatus[u.displayName] ? "green" : "red" }}></div>
              <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user-icon" className="avatar" />
              <span>{u.displayName}</span>
            </div>
          ))}
      </div>

      {/* Чат */}
      <div className="chat-main">
        {selectedUser ? (
          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat with {selectedUser}</h3>
            </div>

            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === userName ? "my-message" : "other-message"}`}>
                  <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="user-icon" className="message-avatar" />
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
              />
              <button onClick={sendMessage} className="send-button">Send</button>
            </div>
          </div>
        ) : (
          <div className="chat-placeholder">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
