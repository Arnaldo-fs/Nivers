import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFhiGq4dQqcUuuSLMuRq8VjTthB7WBStY",
    authDomain: "nivers-31888.firebaseapp.com",
    projectId: "nivers-31888",
    storageBucket: "nivers-31888.firebasestorage.app",
    messagingSenderId: "499784849117",
    appId: "1:499784849117:web:155ebd61d7f00174ee6d34"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);