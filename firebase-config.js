// firebase-config.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChjZ5N-1FEnejaahfpFPxIq2R7nQuTuDc",
  authDomain: "test-2378c.firebaseapp.com",
  databaseURL: "https://test-2378c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-2378c",
  storageBucket: "test-2378c.appspot.com",
  messagingSenderId: "440618434249",
  appId: "1:440618434249:web:f5c3d49edc53545a459718",
  measurementId: "G-NB1917M42Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
