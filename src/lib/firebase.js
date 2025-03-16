// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,  //KEPT SAFE IN .ENV
  authDomain: "soen341-messaging-platform.firebaseapp.com",
  projectId: "soen341-messaging-platform",
  storageBucket: "soen341-messaging-platform.firebasestorage.app",
  messagingSenderId: "1084541114310",
  appId: "1:1084541114310:web:23d7dc7153ab49216004c7",
  measurementId: "G-2N1CRPEWZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
