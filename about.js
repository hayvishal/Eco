import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const backToHomeButton = document.getElementById('back-to-home-btn');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in, update the header
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
        } else {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    // --- Event Listeners ---
    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
