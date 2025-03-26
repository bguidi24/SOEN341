// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyClsa5TE77M2IDrB8rZexYVvfv_l4cvIPs",
  authDomain: "soen341-messaging-platform.firebaseapp.com",
  projectId: "soen341-messaging-platform",
  storageBucket: "soen341-messaging-platform.firebasestorage.app",
  messagingSenderId: "1084541114310",
  appId: "1:1084541114310:web:23d7dc7153ab49216004c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export const auth = getAuth()
export { db };
export const storage = getStorage()
