import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const backToHomeButton = document.getElementById('back-to-home-from-extra-features');
    const historyButton = document.getElementById('feature-history-page');
    const leaderboardButton = document.getElementById('feature-leaderboard');
    const bookmarksButton = document.getElementById('feature-bookmark-questions');
    const forumButton = document.getElementById('feature-doubt-discussion-forum');
    const notificationsButton = document.getElementById('feature-daily-quiz-notification');
    
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

    function showComingSoonAlert() {
        alert('This feature is coming soon. Stay tuned!');
    }

    // --- Event Listeners ---
    backToHomeButton.addEventListener('click', () => window.location.href = 'index.html');
    historyButton.addEventListener('click', () => window.location.href = 'history.html');
    leaderboardButton.addEventListener('click', () => window.location.href = 'leaderboard.html');
    bookmarksButton.addEventListener('click', () => window.location.href = 'bookmarks.html');
    forumButton.addEventListener('click', () => window.location.href = 'forum.html');
    notificationsButton.addEventListener('click', () => window.location.href = 'notifications.html');

    // Add event listeners for all "coming soon" features
    document.getElementById('feature-offline-mode').addEventListener('click', showComingSoonAlert);
});
