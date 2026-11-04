import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import { auth, db } from "./JavaScript/config.js";

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
