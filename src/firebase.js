// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJrvnUaYx267CYzAHtKRpiI2KQxokz-TU",
  databaseURL: "https://stas-fb38d-default-rtdb.firebaseio.com/",
  authDomain: "stas-fb38d.firebaseapp.com",
  projectId: "stas-fb38d",
  storageBucket: "stas-fb38d.firebasestorage.app",
  messagingSenderId: "862571568189",
  appId: "1:862571568189:web:7a46592e84a72fb4d29e54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db=getDatabase(app)
export const auth=getAuth(app)