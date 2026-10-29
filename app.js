import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Firebase Console se apni original configuration paste karo
const firebaseConfig = {
  apiKey: "AIzaSyA3WrfqIjaNDfXMn0Sm135D13ZSh2TkZ8M",
  authDomain: "smit-project-signup-login.firebaseapp.com",
  projectId: "smit-project-signup-login",
  storageBucket: "smit-project-signup-login.firebasestorage.app",
  messagingSenderId: "202127204739",
  appId: "1:202127204739:web:d73e4720ab36b8c74616b6",
};

// Firebase initialization
const app = initializeApp(firebaseConfig);

// Authentication service
const auth = getAuth(app);

const db = getFirestore(app);

// Sign-up functionality
const signupForm = document.getElementById("signupForm");

if (signupForm)
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: name,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      message.textContent = "Account created successfully!";
      window.location.href = "dashboard.html";
    } catch (error) {
      // message.textContent = error.message;
      console.error("Signup error code:", error.code);
      console.error("Signup error message:", error.message);

      message.textContent = `${error.code}: ${error.message}`;
    }
  });

// dashboard functionality
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (userName) {
      userName.textContent = `Hello, ${user.displayName || "User"}!`;
    }

    if (userEmail) {
      userEmail.textContent = user.email;
    }
  } else {
    if (userName || userEmail || logoutBtn) {
      window.location.replace("login.html");
    }
  }
});

// signout functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("login.html");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  });
}

// login functionality
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName || "",
          createdAt: serverTimestamp(),
        });
      }

      message.textContent = "Login Successfully!";
      window.location.href = "dashboard.html";
    } catch (error) {
      message.textContent = "Login Failed: " + error.message;
    }
  });
}
