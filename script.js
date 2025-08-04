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
    
    // Get specific cards by their data-subject attribute
    const generalAwarenessCard = document.querySelector('.quick-access-card[data-subject="General Awareness"]');
    const reasoningCard = document.querySelector('.quick-access-card[data-subject="Reasoning"]');
    const quantitativeAptitudeCard = document.querySelector('.quick-access-card[data-subject="Quantitative Aptitude"]');
    const englishLanguageCard = document.querySelector('.quick-access-card[data-subject="English Language"]');


    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            const displayName = user.displayName || 'User';
            welcomeUserName.textContent = displayName;
            headerUserName.textContent = displayName;
            if (user.photoURL) {
                headerProfilePhoto.src = user.photoURL;
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Event Listeners ---
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).catch(error => console.error('Sign out error', error));
        });
    }

    // --- Navigation for Subject Cards ---
    if (generalAwarenessCard) {
        generalAwarenessCard.addEventListener('click', () => {
            window.location.href = 'ga-topics.html';
        });
    }
    if (reasoningCard) {
        reasoningCard.addEventListener('click', () => {
            window.location.href = 'reasoning-topics.html';
        });
    }
    if (quantitativeAptitudeCard) {
        quantitativeAptitudeCard.addEventListener('click', () => {
            window.location.href = 'maths-topics.html';
        });
    }
    if (englishLanguageCard) {
        englishLanguageCard.addEventListener('click', () => {
            window.location.href = 'english-topics.html';
        });
    }

    // --- Other Navigation ---
    if(historyCard) historyCard.addEventListener('click', () => window.location.href = 'history.html');
    if(extraFeaturesButton) extraFeaturesButton.addEventListener('click', () => window.location.href = 'features.html');
    if(headerProfilePhoto) headerProfilePhoto.addEventListener('click', () => window.location.href = 'profile.html');
});
