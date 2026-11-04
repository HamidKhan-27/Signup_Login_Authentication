import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import { auth, db } from "./config.js";

// Dashboard elements
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Todo elements
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");

// Authentication check
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTodos(user.uid);

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

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("index.html");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  });
}

// Add Todo
if (todoForm) {
  todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const todoText = todoInput.value.trim();

    if (todoText === "") return;

    const user = auth.currentUser;

    if (!user) {
      alert("User is not logged in");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "todos"), {
        title: todoText,
        completed: false,
        createdAt: serverTimestamp(),
      });

      await loadTodos(user.uid);
      todoInput.value = "";
    } catch (error) {
      console.error("Todo save error:", error);
    }
  });
}

// Load Todos
async function loadTodos(userId) {
  try {
    const todosRef = collection(db, "users", userId, "todos");
    const querySnapshot = await getDocs(todosRef);

    todoList.innerHTML = "";

    if (querySnapshot.empty) {
      todoList.innerHTML = `
        <div class="empty-state">
          <span>📝</span>
          <h3>No tasks yet!</h3>
          <p>Add your first todo and start being productive.</p>
        </div>
      `;

      totalCount.textContent = 0;
      completedCount.textContent = 0;
      pendingCount.textContent = 0;
      return;
    }

    totalCount.textContent = querySnapshot.size;

    let completed = 0;

    querySnapshot.forEach((todo) => {
      const todoData = todo.data();
      const todoId = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todoData.completed;

      if (todoData.completed === true) {
        completed++;
      }

      checkbox.addEventListener("change", async () => {
        try {
          await updateDoc(doc(db, "users", userId, "todos", todoId), {
            completed: checkbox.checked,
          });

          await loadTodos(userId);
        } catch (error) {
          console.error("Todo update error:", error);
        }
      });

      const li = document.createElement("li");
      li.className = "todo-item";
      li.appendChild(checkbox);

      const title = document.createElement("span");
      title.textContent = todoData.title;
      li.appendChild(title);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "users", userId, "todos", todoId));
          await loadTodos(userId);
        } catch (error) {
          console.error("Todo delete error:", error);
        }
      });

      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });

    completedCount.textContent = completed;
    pendingCount.textContent = querySnapshot.size - completed;
  } catch (error) {
    console.log("Error loading todos:", error);
  }
}
