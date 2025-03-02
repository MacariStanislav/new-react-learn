import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { getUserNameFromDB } from "../utils/getUserNameFromDB";
import routes from "../routs/routes";

import MainPage from "../components/mainPages/MainPage";
import Register from "../components/auth/Register";
import BackgroundWrapper from "./styleControl/BackgroundWrapper";

import "../css/BackgroundAll.css";

const App = () => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("authUser"))
  );

  const [userName, setUserName] = useState(null);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        localStorage.setItem("authUser", JSON.stringify(user));

        // Получаем имя пользователя из базы
        const fetchedUserName = await getUserNameFromDB(user.uid);
        setUserName(fetchedUserName);
      } else {
        setAuthUser(null);
        localStorage.removeItem("authUser");
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Выход пользователя
  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("authUser");
        setAuthUser(null);
        setUserName(null);
      })
      .catch((error) => {
        alert("Ошибка выхода: " + error.message);
      });
  };

  return (
    <Router>
      <BackgroundWrapper authUser={authUser}>
        <Routes>
          {/* Если пользователь авторизован, отправляем его на главную */}
          <Route
            path={routes.standart}
            element={<Navigate to={authUser ? routes.main : routes.register} />}
          />

          {/* Главная страница */}
          <Route
            path={routes.main}
            element={
              authUser ? (
                <MainPage userSignOut={userSignOut} userName={userName} />
              ) : (
                <Navigate to={routes.register} />
              )
            }
          />

          {/* Регистрация */}
          <Route
            path={routes.register}
            element={authUser ? <Navigate to={routes.main} /> : <Register />}
          />

          {/* Если URL не найден, отправляем на стандартный маршрут */}
          <Route path="*" element={<Navigate to={routes.standart} />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
};

export default App;
