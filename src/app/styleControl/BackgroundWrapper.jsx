import React from "react";

import { useLocation } from "react-router-dom";

import "../../css/BackgroundAll.css";

const BackgroundWrapper = ({ authUser, children }) => {
  const location = useLocation();

  let backgroundClass = null;

  if (!authUser) {
    if (location.pathname === "/register") {
      backgroundClass = "unauthenticated";
    }
  } else {
    backgroundClass = "authenticated";
  }

  return <div className={backgroundClass}>{children}</div>;
};

export default BackgroundWrapper;
