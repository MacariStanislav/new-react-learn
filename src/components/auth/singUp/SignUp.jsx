import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; // Для работы с Realtime Database
import React, {  useState } from "react";
import { auth, db } from "../../../firebase";
import "../../../css/Register.css";

const SignUp = ({ setMode }) => { // Получаем setMode через пропс
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [name, setName] = useState(""); 
  const [error, setError] = useState("");

  function register(e) {
    e.preventDefault();
    if (copyPassword !== password) {
      setError("Passwords didn't match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        set(
          ref(db, "users/" + user.uid),
          {
            email: user.email,
            displayName: name,
          }
        )
          .then(() => {
            setError(""); 
            setEmail("");
            setCopyPassword("");
            setPassword("");
            setName(""); 
            // Переход на профиль после успешной регистрации
          })
          .catch((error) => {
            setError("Failed to save user data.");
          });
      })
      .catch((error) => {
        setError("Failed to create account.");
      });
  }

  return (
    <div className="login-box">
      <p>Create an account</p>
      <form >
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
        <div className="user-box">
          <input
            required=""
            name="copyPassword"
            type="password"
         
            value={copyPassword}
            onChange={(e) => setCopyPassword(e.target.value)}
          />
          <label>Confirm Password</label>
        </div>
        <div className="user-box">
          <input
            required=""
            name="name"
            type="text"
           
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Name</label>
        </div>
        <a href="#" onClick={register} className="kiberpunk">
        
          Create Account
        </a>
        
          
      </form>
      {error && <p className="eror">{error}</p>}
      <p>
        Already have an account?{" "}
        <a className="a2" onClick={() => setMode("login")}>Log in!</a> 
      </p>
    </div>
  );
};

export default SignUp;

