import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../../firebase";
import "../../../css/Register.css";

const SignIn = ({setMode}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function logIn(e) {
    e.preventDefault();
    
    signInWithEmailAndPassword(auth, email, password)
      .then/*выполняеться если данные пришли успешно*/((user) => {
        console.log(user);
        setError("");
        setEmail("");
        setPassword("");
      })
        .catch/*применяеться если данные не пришли */((error) => {
            console.log(error); 
            setError(" Sorry, couldn't find your account")
      });
  }
  return (
    
    <div className="login-box">
      <p>Login</p>
      <form>
        <div className="user-box">
          <input
            required=""
            name="email"
            type="email"
        
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>
        <div className="user-box">
          <input
            required=""
            
            name="password"
            type="password"
       
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>
        <a href="#" onClick={logIn} className="kiberpunk2">
         
          Submit
        </a>
      </form>
      {error && <p className="eror">{error}</p>}
      <p>
        Don't have an account? <a className="a2" onClick={() => setMode("signup")}>Sign up!</a>
      </p>
    </div>
  );
};

export default SignIn;