import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const profileContainer = document.getElementById('user-profile-container');
    const settingsContainer = document.getElementById('settings-container');
    const weakAreasList = document.getElementById('profile-weak-areas');
    // ... other element references
    const goToSettingsButton = document.getElementById('go-to-settings-button');
    const backToProfileButton = document.getElementById('back-to-profile-from-settings');
    const backToHomeButton = document.getElementById('back-to-home-from-profile');
    const logoutButton = document.getElementById('logout-button');
    const saveProfileButton = document.getElementById('save-profile-button');
    const profileMessage = document.getElementById('profile-message');


    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            populateProfile(user);
            analyzeAndDisplayWeakAreas(user.uid); // 🟢 New function call
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---
    async function populateProfile(user) {
        if (!user) return;
        // ... (this function remains the same as before)
        document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
        document.getElementById('edit-display-name-input').value = user.displayName || '';
        document.getElementById('edit-email-input').value = user.email || '';
        document.getElementById('profile-user-id').textContent = user.uid;
        if (user.photoURL) {
            const photoUrl = user.photoURL;
            document.getElementById('profile-photo').src = photoUrl;
            document.getElementById('header-profile-photo').src = photoUrl;
        }
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('profile-tests-attempted').textContent = userData.testsAttempted || 0;
                document.getElementById('profile-average-score').textContent = `${userData.averageScore || 0}%`;
                document.getElementById('profile-total-points').textContent = userData.totalPoints || 0;
            }
        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
    }

    // 🟢 START: NEW FUNCTION 🟢
    /**
     * Fetches quiz history, analyzes it to find weak topics, and updates the UI.
     * @param {string} userId - The UID of the current user.
     */
    async function analyzeAndDisplayWeakAreas(userId) {
        try {
            const historyRef = collection(db, "users", userId, "history");
            const q = query(historyRef);
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                weakAreasList.innerHTML = '<li>Take some quizzes to identify areas for improvement!</li>';
                return;
            }

            const topicStats = {}; // { topicName: { totalScore: X, totalQuestions: Y, count: Z } }

            querySnapshot.forEach(doc => {
                const historyItem = doc.data();
                const topic = historyItem.topic;

                if (!topicStats[topic]) {
                    topicStats[topic] = { totalScore: 0, totalQuestions: 0, count: 0 };
                }

                topicStats[topic].totalScore += historyItem.score;
                topicStats[topic].totalQuestions += historyItem.total;
                topicStats[topic].count++;
            });

            const topicAverages = Object.keys(topicStats).map(topic => {
                const stats = topicStats[topic];
                return {
                    topic: topic,
                    average: Math.round((stats.totalScore / stats.totalQuestions) * 100)
                };
            });

            // Filter for topics with an average score below 70% and sort them
            const weakAreas = topicAverages
                .filter(item => item.average < 70)
                .sort((a, b) => a.average - b.average);

            weakAreasList.innerHTML = ''; // Clear the loading message

            if (weakAreas.length === 0) {
                weakAreasList.innerHTML = '<li>Great job! No weak areas found. Keep practicing!</li>';
            } else {
                weakAreas.slice(0, 3).forEach(area => { // Show top 3 weak areas
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${area.topic}</span> <span class="score">${area.average}% Avg</span>`;
                    weakAreasList.appendChild(li);
                });
            }

        } catch (error) {
            console.error("Error analyzing weak areas:", error);
            weakAreasList.innerHTML = '<li>Could not analyze your performance.</li>';
        }
    }
    // 🟢 END: NEW FUNCTION 🟢

    function showScreen(screenToShow) {
        // ... (this function remains the same)
        profileContainer.style.display = 'none';
        settingsContainer.style.display = 'none';
        screenToShow.style.display = 'block';
    }

    async function saveProfile() {
        // ... (this function remains the same)
        if (!currentUser) return;
        saveProfileButton.disabled = true;
        saveProfileButton.textContent = 'Saving...';
        const newName = document.getElementById('edit-display-name-input').value;
        try {
            await updateProfile(currentUser, { displayName: newName });
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, { displayName: newName });
            document.getElementById('header-user-display-name').textContent = newName;
            profileMessage.textContent = 'Profile saved successfully!';
            profileMessage.style.backgroundColor = '#c6f6d5';
            profileMessage.style.color = '#2f855a';
            profileMessage.style.display = 'block';
        } catch (error) {
            console.error("Error saving profile:", error);
            profileMessage.textContent = 'Error saving profile.';
            profileMessage.style.backgroundColor = '#fed7d7';
            profileMessage.style.color = '#c53030';
            profileMessage.style.display = 'block';
        } finally {
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = 'Save Profile';
            setTimeout(() => { profileMessage.style.display = 'none'; }, 3000);
        }
    }

    function handleLogout() {
        // ... (this function remains the same)
        signOut(auth).catch(error => console.error('Logout Error:', error));
    }

    // --- Event Listeners ---
    goToSettingsButton.addEventListener('click', () => showScreen(settingsContainer));
    backToProfileButton.addEventListener('click', () => showScreen(profileContainer));
    backToHomeButton.addEventListener('click', () => window.location.href = 'index.html');
    saveProfileButton.addEventListener('click', saveProfile);
    logoutButton.addEventListener('click', handleLogout);

    // --- Initial Load ---
    showScreen(profileContainer);
});
