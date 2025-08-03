import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const historyListContainer = document.getElementById('question-history-list');
    const loadingMessage = document.getElementById('loading-history-message');
    const backToHomeButton = document.getElementById('back-to-home-from-question-history');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            // Update header with user info
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            // Fetch and display the user's quiz history
            displayHistory();
        } else {
            // If no user is logged in, redirect to the login page
            window.location.href = 'login.html';
        }
    });

    /**
     * Fetches quiz history from Firestore for the current user and displays it.
     */
    async function displayHistory() {
        if (!currentUser) return;

        try {
            // Create a query to get the history, ordered by date descending
            const historyRef = collection(db, "users", currentUser.uid, "history");
            const q = query(historyRef, orderBy("date", "desc"));
            
            const querySnapshot = await getDocs(q);

            // Clear loading message
            historyListContainer.innerHTML = '';

            if (querySnapshot.empty) {
                historyListContainer.innerHTML = '<p class="text-gray-600">You have no quiz history yet. Go practice!</p>';
                return;
            }

            // Loop through the documents and create HTML elements
            querySnapshot.forEach(doc => {
                const item = doc.data();
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

        } catch (error) {
            console.error("Error fetching quiz history: ", error);
            loadingMessage.textContent = 'Could not load quiz history.';
        }
    }

    // --- Event Listeners ---
    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
