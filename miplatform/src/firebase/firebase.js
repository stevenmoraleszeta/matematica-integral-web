import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDNDu7vXFqZs8K5dnMEqR3NkLWPOmTWgOU",
    authDomain: "miplatform-3c978.firebaseapp.com",
    projectId: "miplatform-3c978",
    storageBucket: "miplatform-3c978.appspot.com",
    messagingSenderId: "900192918336",
    appId: "1:900192918336:web:d5010ec4dc12b80b8038a5",
    measurementId: "G-KFHKWVMLM4"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa el servicio de autenticación
const auth = getAuth(app);
// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
