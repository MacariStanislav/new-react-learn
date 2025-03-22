import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom"; // Используем useNavigate

const SignUp = ({ setMode, setUserName }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Для отслеживания загрузки
  const navigate = useNavigate(); // Для редиректа после регистрации

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
        // После того как пользователь аутентифицирован, редирект на главную
        navigate("/main");
      }
    });

    return () => unsubscribe();
  }, [navigate, setUserName]);

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== copyPassword) {
      setError("Passwords didn't match");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Name cannot be empty");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email cannot be empty");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Сохраняем пользователя в базе данных
      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        displayName: name,
      });

      // Пользователь успешно зарегистрирован, состояние аутентификации должно обновиться
      setUserName(name);
      setEmail("");
      setCopyPassword("");
      setPassword("");
      setName("");
    } catch (error) {
      setError("Failed to create account. Please try again.");
      console.error("Error during registration:", error);
    } finally {
      setLoading(false);
    }
  };

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
      {loading && <p>Loading...</p>}
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
