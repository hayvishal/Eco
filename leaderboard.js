import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const leaderboardList = document.getElementById('leaderboard-list');
    const loadingMessage = document.getElementById('loading-leaderboard');
    const backToFeaturesButton = document.getElementById('back-to-features');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            // Update header with user info
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            // Fetch and display the leaderboard
            loadLeaderboard();
        } else {
            // If no user is logged in, redirect to the login page
            window.location.href = 'login.html';
        }
    });

    /**
     * Fetches user data from Firestore, sorts it by points, and displays the leaderboard.
     */
    async function loadLeaderboard() {
        try {
            // Create a query to get users, ordered by totalPoints descending, and limit to top 50
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("totalPoints", "desc"), limit(50));
            
            const querySnapshot = await getDocs(q);

            // Clear loading message
            leaderboardList.innerHTML = '';

            if (querySnapshot.empty) {
                leaderboardList.innerHTML = '<p class="text-gray-600">No users found in the leaderboard yet.</p>';
                return;
            }

            // Loop through the documents and create HTML elements
            let rank = 1;
            querySnapshot.forEach(doc => {
                const user = doc.data();
                const leaderboardRow = document.createElement('div');
                leaderboardRow.className = 'leaderboard-row';
                
                // Highlight the current user's row
                if (currentUser && user.uid === currentUser.uid) {
                    leaderboardRow.classList.add('current-user');
                }

                leaderboardRow.innerHTML = `
                    <div class="rank">${rank}</div>
                    <div class="user-info">
                        <img src="${user.photoURL || 'https://placehold.co/40x40/cccccc/333333?text=👤'}" alt="User Photo" class="user-photo">
                        <span class="user-name">${user.displayName || 'Anonymous User'}</span>
                    </div>
                    <div class="points">${user.totalPoints || 0} pts</div>
                `;
                leaderboardList.appendChild(leaderboardRow);
                rank++;
            });

        } catch (error) {
            console.error("Error fetching leaderboard: ", error);
            loadingMessage.textContent = 'Could not load leaderboard.';
        }
    }

    // --- Event Listeners ---
    backToFeaturesButton.addEventListener('click', () => {
        window.location.href = 'features.html';
    });
});
