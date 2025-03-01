import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate,} from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import MainPage from "../components/mainPages/MainPage";
import Register from "../components/auth/Register";
import routes from "../routs/routes"; // Подключаем маршруты
import "../css/BackgroundAll.css";
import BackgroundWrapper from "./styleControl/BackgroundWrapper";//для backgraund

const App = () => {
  const [authUser, setAuthUser] = useState(//проверка зареган ли пользователь через localStorage
    JSON.parse(localStorage.getItem("authUser")) || null
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        localStorage.setItem("authUser", JSON.stringify(user));//сохраняем данные в localStorage чтобы не терять данные после перезагрузки
      } else {
        setAuthUser(null);
        localStorage.removeItem("authUser");
      }
    });

    return () => unsubscribe();
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("authUser");
        setAuthUser(null);
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  return (
    <Router>
      <BackgroundWrapper authUser={authUser}>
        {/* Обернули все в компонент с фоном */}
        <Routes>
          <Route
            path={routes.standart}
            element={<Navigate to={authUser ? routes.main : routes.register} />}
          />
          <Route
            path={routes.main}
            element={
              authUser ? (
                <MainPage userSignOut={userSignOut} />
              ) : (
                <Navigate to={routes.register} />
              )
            }
          />
          <Route
            path={routes.register}
            element={authUser ? <Navigate to={routes.main} /> : <Register />}
          />
          <Route path="*" element={<Navigate to={routes.standart} />} />{/*если человек прищёл по какому-то URl не правильный на мой сайт его перекинет на standart роут */}
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
};

export default App;
