// history.js
// This file contains the JavaScript logic for the quiz history page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const historyListContainer = document.getElementById('question-history-list');
    const loadingMessage = document.getElementById('loading-history-message');
    const backToHomeButton = document.getElementById('back-to-home-from-question-history');

    // --- Mock Data ---
    // In a real app, this array would be fetched from Firestore for the logged-in user.
    const mockHistory = [
        {
            subject: 'General Awareness',
            topic: 'Indian History',
            score: 8,
            total: 10,
            date: '2025-08-02T14:30:00Z'
        },
        {
            subject: 'Reasoning',
            topic: 'Analogy',
            score: 4,
            total: 5,
            date: '2025-08-01T11:00:00Z'
        },
        {
            subject: 'General Awareness',
            topic: 'Indian Polity',
            score: 9,
            total: 10,
            date: '2025-07-31T18:00:00Z'
        }
    ];

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

    function displayHistory(historyData) {
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
        
        if (!historyData || historyData.length === 0) {
            historyListContainer.innerHTML = '<p>You have no quiz history yet. Go practice!</p>';
            return;
        }

        // Sort by most recent date first
        historyData.sort((a, b) => new Date(b.date) - new Date(a.date));

        historyData.forEach(item => {
            const historyItemDiv = document.createElement('div');
            historyItemDiv.className = 'history-item';

            const percentage = Math.round((item.score / item.total) * 100);
            const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            historyItemDiv.innerHTML = `
                <div class="history-item-info">
                    <div class="subject">${item.subject}</div>
                    <div class="topic">${item.topic}</div>
                    <div class="history-item-date">${formattedDate}</div>
                </div>
                <div class="history-item-score">${item.score}/${item.total} (${percentage}%)</div>
            `;
            historyListContainer.appendChild(historyItemDiv);
        });
    }

    // --- Event Listeners ---
    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // --- Initial Load ---
    populateHeader(mockUser);
    // Simulate a network request delay
    setTimeout(() => {
        displayHistory(mockHistory);
    }, 500);
});

