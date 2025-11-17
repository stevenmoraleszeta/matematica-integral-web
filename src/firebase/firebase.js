// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjRdfqECn2v2w1LMOiRqyuvuy82whYfEA",
  authDomain: "miplatform-43425.firebaseapp.com",
  projectId: "miplatform-43425",
  storageBucket: "miplatform-43425.firebasestorage.app",
  messagingSenderId: "451276673742",
  appId: "1:451276673742:web:1b33a7813a05430574369f",
  measurementId: "G-T9K5XXSYPK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Inicializa el servicio de autenticación
const auth = getAuth(app);

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Firebase Storage
const storage = getStorage(app);

export { auth, db, storage, analytics };
