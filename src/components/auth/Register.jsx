import React, { useState } from "react";

import SignUp from "./singUp/SignUp";
import SignIn from "./login/SignIn";

import "../../css/PaneliRegister.css";

const Register = () => {
  const [mode, setMode] = useState("");
  console.log(mode);
  return (
    <div className="registerLogin">
      {mode == "" ? (
        <div className="paneliVibora">
          <a onClick={() => setMode("signup")}>Register</a>
          <a onClick={() => setMode("register")} className="a">
            Submit
          </a>
        </div>
      ) : mode === "signup" ? (
        <SignUp setMode={setMode} />
      ) : (
        <SignIn setMode={setMode} />
      )}
    </div>
  );
};

export default Register;
