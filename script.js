// script.js - Updated for Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const welcomeUserName = document.getElementById('welcome-user-name');
    const headerUserName = document.getElementById('header-user-display-name');
    const headerProfilePhoto = document.getElementById('header-profile-photo');
    const logoutButton = document.getElementById('logout-button');
    const historyCard = document.getElementById('card-question-history');
    const extraFeaturesButton = document.getElementById('extra-features-button');
    const subjectCards = document.querySelectorAll('.quick-access-card[data-subject]');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in, update the UI
            console.log("User logged in:", user);
            const displayName = user.displayName || 'User';
            welcomeUserName.textContent = displayName;
            headerUserName.textContent = displayName;
            if (user.photoURL) {
                headerProfilePhoto.src = user.photoURL;
            }
        } else {
            // No user is signed in. Redirect to login page.
            console.log("No user found, redirecting to login.");
            window.location.href = 'login.html';
        }
    });

    // --- Event Listeners ---
    
    // Logout Button
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                // Sign-out successful. The onAuthStateChanged observer will handle the redirect.
                console.log('User signed out.');
            }).catch((error) => {
                console.error('Sign out error', error);
            });
        });
    }

    // Subject Cards
    subjectCards.forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.dataset.subject;
            console.log(`Selected subject: ${subject}`);
            localStorage.setItem('selectedSubject', subject);
            window.location.href = 'quiz.html';
        });
    });

    // Other Navigation
    if(historyCard) historyCard.addEventListener('click', () => window.location.href = 'history.html');
    if(extraFeaturesButton) extraFeaturesButton.addEventListener('click', () => window.location.href = 'features.html');
    if(headerProfilePhoto) headerProfilePhoto.addEventListener('click', () => window.location.href = 'profile.html');
});
