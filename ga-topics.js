import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const topicCards = document.querySelectorAll('.quick-access-card[data-topic]');
    const backToHomeButton = document.getElementById('back-to-home-btn');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Event Listeners ---
    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.dataset.topic;
            // Store both the main subject and the chosen topic
            localStorage.setItem('selectedSubject', 'General Awareness');
            localStorage.setItem('selectedTopic', topic);
            // Navigate to the quiz page to select number of questions
            window.location.href = 'quiz.html';
        });
    });

    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
