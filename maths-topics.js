import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    const topicCards = document.querySelectorAll('.quick-access-card[data-topic]');
    const backToHomeButton = document.getElementById('back-to-home-btn');

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

    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.dataset.topic;
            localStorage.setItem('selectedSubject', 'Quantitative Aptitude');
            localStorage.setItem('selectedTopic', topic);
            window.location.href = 'quiz.html';
        });
    });

    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
