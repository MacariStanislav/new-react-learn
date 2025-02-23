import React, { useState } from "react";
import SignUp from "./SignUp"; // Импортируем компонент для регистрации
import SignIn from "./SignIn"; // Импортируем компонент для входа
import '../../css/Register.css'
import'../../css/PaneliRegister.css'
const Register = () => {
  const [mode, setMode] = useState(""); // Состояние для режима регистрации или входа
console.log(mode)
  return (
    <div className="registerLogin">

      {mode==""? (<div className="paneliVibora"><a onClick={()=>setMode('signup')} >Register</a>
          <a onClick={()=>setMode('register')} className="a">Submit</a>
          </div>
    ):mode === "signup" ? (
        <SignUp setMode={setMode} /> // Передаем setMode как пропс
      ) : (
        <SignIn setMode={setMode} /> // Передаем setMode как пропс
      )}
    </div>
  );
};

export default Register;
