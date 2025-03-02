import { db } from "../firebase"; // Импорт базы
import { ref, get } from "firebase/database";

export const getUserNameFromDB = async (uid) => {
  if (!uid) return null;

  try {
    const userRef = ref(db, `users/${uid}/displayName`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val(); // Возвращаем displayName
    } else {
      console.log("Имя пользователя не найдено в базе");
      return null;
    }
  } catch (error) {
    console.error("Ошибка при получении имени:", error);
    return null;
  }
};
