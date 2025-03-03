import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, set, onDisconnect } from "firebase/database";
import { auth, db } from "../firebase";
import { getUserNameFromDB } from "../utils/getUserNameFromDB";
import routes from "../routs/routes";
import MainPage from "../components/mainPages/MainPage";
import Register from "../components/auth/Register";
import BackgroundWrapper from "./styleControl/BackgroundWrapper";
import "../css/BackgroundAll.css";

const App = () => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("authUser")) || null;
    } catch {
      return null;
    }
  });
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        localStorage.setItem("authUser", JSON.stringify(user));

        const name = await getUserNameFromDB(user.uid);
        setUserName(name);

        // Обновляем статус в Firebase
        const statusRef = ref(db, `status/${name}`);
        set(statusRef, "online");
        onDisconnect(statusRef).set("offline");
      } else {
        setAuthUser(null);
        localStorage.removeItem("authUser");
        setUserName(null);
      }
    });
    return unsubscribe;
  }, []);

  const userSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authUser");
      if (userName) {
        set(ref(db, `status/${userName}`), "offline");
      }
      setAuthUser(null);
      setUserName(null);
    } catch (error) {
      alert("Ошибка выхода: " + error.message);
    }
  };

  return (
    <Router>
      <BackgroundWrapper authUser={authUser}>
        <Routes>
          <Route path={routes.standart} element={<Navigate to={authUser ? routes.main : routes.register} />} />
          <Route path={routes.main} element={authUser ? <MainPage userSignOut={userSignOut} userName={userName} /> : <Navigate to={routes.register} />} />
          <Route path={routes.register} element={authUser ? <Navigate to={routes.main} /> : <Register />} />
          <Route path="*" element={<Navigate to={routes.standart} />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
};

export default App;
