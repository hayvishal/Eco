// features.js
// This file contains the JavaScript logic for the extra features page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const backToHomeButton = document.getElementById('back-to-home-from-extra-features');
    const historyButton = document.getElementById('feature-history-page');
    
    // --- Mock User Data (for header consistency) ---
    const mockUser = {
        displayName: 'Aspirant',
        photoURL: 'https://placehold.co/40x40/4a90e2/ffffff?text=A'
    };

    // --- Functions ---
    function populateHeader(user) {
        if (!user) return;
        if (user.photoURL) {
            document.getElementById('header-profile-photo').src = user.photoURL;
        }
        document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
    }

    function showComingSoonAlert() {
        alert('This feature is coming soon. Stay tuned!');
    }

    // --- Event Listeners ---
    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    if (historyButton) {
        historyButton.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }

    // Add event listeners for all "coming soon" features
    document.getElementById('feature-daily-quiz-notification').addEventListener('click', showComingSoonAlert);
    document.getElementById('feature-bookmark-questions').addEventListener('click', showComingSoonAlert);
    document.getElementById('feature-doubt-discussion-forum').addEventListener('click', showComingSoonAlert);
    document.getElementById('feature-leaderboard').addEventListener('click', showComingSoonAlert);
    document.getElementById('feature-offline-mode').addEventListener('click', showComingSoonAlert);

    // --- Initial Load ---
    populateHeader(mockUser);
});

