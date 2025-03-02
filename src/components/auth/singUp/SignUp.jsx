import React, { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../../../firebase";

import "../../../css/Register.css";

const SignUp = ({ setMode, setUserName }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Проверка: существует ли уже такое имя
  const checkNameExists = async (name) => {
    const snapshot = await get(ref(db, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      return Object.values(users).some((user) => user.displayName === name);
    }
    return false;
  };

  // Проверка: существует ли уже такой email
  const checkEmailExists = async (email) => {
    const snapshot = await get(ref(db, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      return Object.values(users).some((user) => user.email === email);
    }
    return false;
  };

  async function register(e) {
    e.preventDefault();
    setError("");

    if (password !== copyPassword) {
      setError("Passwords didn't match");
      return;
    }

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    const nameExists = await checkNameExists(name);
    if (nameExists) {
      setError("This name is already taken. Choose another one.");
      return;
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setError("This email is already registered. Try logging in.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        return set(ref(db, "users/" + user.uid), {
          email: user.email,
          displayName: name,
        }).then(() => {
          setUserName(name);
          setEmail("");
          setCopyPassword("");
          setPassword("");
          setName("");
        });
      })
      .catch((error) => {
        setError("Failed to create account.");
      });
  }

  return (
    <div className="login-box">
      <p>Create an account</p>
      <form>
        <div className="user-box">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>
        <div className="user-box">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>
        <div className="user-box">
          <input
            required
            type="password"
            value={copyPassword}
            onChange={(e) => setCopyPassword(e.target.value)}
          />
          <label>Confirm Password</label>
        </div>
        <div className="user-box">
          <input
            required
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
        <a className="a2" onClick={() => setMode("login")}>
          Log in!
        </a>
      </p>
    </div>
  );
};

export default SignUp;
