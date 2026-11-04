// FIREBASE CONFIGURATION

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyA3WrfqIjaNDfXMn0Sm135D13ZSh2TkZ8M",
  authDomain: "smit-project-signup-login.firebaseapp.com",
  projectId: "smit-project-signup-login",
  storageBucket: "smit-project-signup-login.firebasestorage.app",
  messagingSenderId: "202127204739",
  appId: "1:202127204739:web:d73e4720ab36b8c74616b6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };
