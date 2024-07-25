// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCjRdfqECn2v2w1LMOiRqyuvuy82whYfEA",
    authDomain: "miplatform-43425.firebaseapp.com",
    projectId: "miplatform-43425",
    storageBucket: "miplatform-43425.appspot.com",
    messagingSenderId: "451276673742",
    appId: "1:451276673742:web:1b33a7813a05430574369f",
    measurementId: "G-T9K5XXSYPK"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa el servicio de autenticación
const auth = getAuth(app);
// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
