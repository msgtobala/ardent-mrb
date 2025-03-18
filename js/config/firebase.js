import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyCMcETlXfcL9QhKOADuD6VKhFfzmiwRZ2M",
  authDomain: "mrb-ardent-mds.firebaseapp.com",
  projectId: "mrb-ardent-mds",
  storageBucket: "mrb-ardent-mds.firebasestorage.app",
  messagingSenderId: "943112834235",
  appId: "1:943112834235:web:be7fb624ccb98ce357ed9e",
  measurementId: "G-KZSS9T8PQG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized");

// Export Firebase services to use in other files
export { app, auth, db };
