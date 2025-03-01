// import React from "react";
// import { useLocation } from "react-router-dom";
// import "../css/App.css";

// const BackgroundWrapper = ({ authUser, children }) => {
//   const location = useLocation(); // Получаем текущий маршрут

//   // Если пользователь авторизован → authenticated
//   // Если на странице регистрации ("/login", "/register") → unauthenticated
//   // Если не авторизован и перешел не на страницу регистрации → unauthenticated (на всякий случай)
//   const backgroundClass = authUser ? "authenticated" : "unauthenticated";

//   return <div className={backgroundClass}>{children}</div>;
// };

// export default BackgroundWrapper;

import React from "react";
import { useLocation } from "react-router-dom";
import "../../css/BackgroundAll.css";

const BackgroundWrapper = ({ authUser, children }) => {
  const location = useLocation(); // Получаем текущий маршрут


  let backgroundClass =null

  if (!authUser) {
    if ( location.pathname === "/register") {
      backgroundClass = "unauthenticated"; 
    } 
  } else{
    backgroundClass="authenticated"
  }

  return <div className={backgroundClass}>{children}</div>;
};

export default BackgroundWrapper;
