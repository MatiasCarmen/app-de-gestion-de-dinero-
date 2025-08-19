// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnD5fBwl8HwpvzAU9aazCoBnl3rjZx_FM",
  authDomain: "gestion-finanzas-familia.firebaseapp.com",
  projectId: "gestion-finanzas-familia",
  storageBucket: "gestion-finanzas-familia.firebasestorage.app",
  messagingSenderId: "670168209652",
  appId: "1:670168209652:web:5f8bd4a51c43088214e6a1",
  measurementId: "G-NETLEH0QHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
