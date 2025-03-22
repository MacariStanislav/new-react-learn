import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database"; // Импортируем get для проверки существования имени и email
import { auth, db } from "../../../firebase";

const SignUp = ({ setMode, setUserName }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Для отслеживания загрузки

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
      }
    });

    return () => unsubscribe();
  }, [setUserName]);

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
      // Проверка на наличие имени в базе данных
      const nameRef = ref(db, "users/"); // Путь, где хранятся пользователи
      const snapshot = await get(nameRef); // Получаем все данные пользователей
      let nameExists = false;
      let emailExists = false;

      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.displayName === name) {
          nameExists = true;
        }
        if (user.email === email) { // Добавляем проверку на email
          emailExists = true;
        }
      });

      if (nameExists) {
        setError("This name is already taken.");
        setLoading(false);
        return;
      }

      if (emailExists) {
        setError("This email is already registered.");
        setLoading(false);
        return;
      }

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

      // После регистрации перенаправляем на главную
    } catch (error) {
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
