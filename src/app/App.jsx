import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; // Импорт настроек Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";
import MainPage from "../components/aaa/MainPage";

// Импорт компонентов

import Register from "../components/auth/Register";

// Импорт CSS
import "../css/App.css";

const App = () => {
  const [authUser, setAuthUser] = useState(null); // Состояние для авторизации пользователя

  // Проверяем, есть ли авторизованный пользователь при загрузке компонента
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user); // Пользователь авторизован
      } else {
        setAuthUser(null); // Пользователь не авторизован
      }
    });

    return () => unsubscribe(); // Отписка от слушателя
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        alert("Successfully signed out!");
        setAuthUser(null); // Когда пользователь выходит, сбрасываем состояние
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  // Определяем, какой класс применить
  const backgroundClass = authUser ? "authenticated" : "unauthenticated";

  return (
    <div className={backgroundClass}>
      {authUser ? (
        <div>
          <MainPage /*user={authUser}*/ userSignOut={userSignOut} />
        </div>
      ) : (
        <div>
          <Register />dd
        </div>
      )}
    </div>
  );
};

export default App;
