import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { ref, get } from "firebase/database";

const Messages = ({ userName: userNameFromProps }) => {
  const [userName, setUserName] = useState(userNameFromProps || "Loading...");

  useEffect(() => {
    console.log("userNameFromProps:", userNameFromProps);

    if (userNameFromProps) {
      // Если имя уже передали через props, используем его
      setUserName(userNameFromProps);
      return;
    }

    // Если пропс ещё не пришёл, пробуем загрузить из Firebase
    const user = auth.currentUser;
    if (user) {
      console.log("User is logged in:", user.uid);
      const userRef = ref(db, `users/${user.uid}/displayName`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log("Имя из базы:", snapshot.val());
            setUserName(snapshot.val());
          } else {
            console.log("Имя пользователя не найдено в базе");
            setUserName("User");
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении имени:", error);
          setUserName("User");
        });
    } else {
      console.log("User is not logged in");
      setUserName("Guest");
    }
  }, [userNameFromProps]); // Обновляемся, если `userNameFromProps` изменится

  return (
    <div className="user-name-display">
      <span>Welcome, {userName}</span>
    </div>
  );
};

export default Messages;
