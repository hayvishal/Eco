// profile.js
// This file contains the JavaScript logic for the profile and settings page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const profileContainer = document.getElementById('user-profile-container');
    const settingsContainer = document.getElementById('settings-container');
    const goToSettingsButton = document.getElementById('go-to-settings-button');
    const backToProfileButton = document.getElementById('back-to-profile-from-settings');
    const backToHomeButton = document.getElementById('back-to-home-from-profile');
    const logoutButton = document.getElementById('logout-button');
    const saveProfileButton = document.getElementById('save-profile-button');
    const profileMessage = document.getElementById('profile-message');

    // --- Mock User Data (replace with Firebase Auth and Firestore data) ---
    const mockUser = {
        uid: 'abc123xyz456',
        email: 'aspirant@example.com',
        displayName: 'Aspirant',
        photoURL: 'https://placehold.co/120x120/4a90e2/ffffff?text=A',
        stats: {
            testsAttempted: 12,
            averageScore: 78,
            totalPoints: 940
        }
    };

    // --- Functions ---

    function populateProfile(user) {
        if (!user) return;
        document.getElementById('edit-display-name-input').value = user.displayName || '';
        document.getElementById('edit-email-input').value = user.email || '';
        document.getElementById('profile-user-id').textContent = user.uid;
        if (user.photoURL) {
            document.getElementById('profile-photo').src = user.photoURL;
            document.getElementById('header-profile-photo').src = user.photoURL.replace('120x120', '40x40');
        }
        document.getElementById('header-user-display-name').textContent = user.displayName || 'User';

        // Populate stats
        document.getElementById('profile-tests-attempted').textContent = user.stats.testsAttempted;
        document.getElementById('profile-average-score').textContent = `${user.stats.averageScore}%`;
        document.getElementById('profile-total-points').textContent = user.stats.totalPoints;
    }

    function showScreen(screenToShow) {
        profileContainer.style.display = 'none';
        settingsContainer.style.display = 'none';
        screenToShow.style.display = 'block';
    }

    function saveProfile() {
        // In a real app, you'd update the user's profile in Firebase
        const newName = document.getElementById('edit-display-name-input').value;
        console.log('Saving profile...', { newName });

        // Show a success message
        profileMessage.textContent = 'Profile saved successfully!';
        profileMessage.style.backgroundColor = '#c6f6d5';
        profileMessage.style.color = '#2f855a';
        profileMessage.style.display = 'block';

        setTimeout(() => {
            profileMessage.style.display = 'none';
        }, 3000);
    }

    function logout() {
        // In a real app, this would be `firebase.auth().signOut()`
        console.log('Logging out...');
        alert('You have been logged out.');
        // Clear any user-related localStorage and redirect to login
        localStorage.clear();
        window.location.href = 'login.html';
    }

    // --- Event Listeners ---
    goToSettingsButton.addEventListener('click', () => showScreen(settingsContainer));
    backToProfileButton.addEventListener('click', () => showScreen(profileContainer));
    backToHomeButton.addEventListener('click', () => window.location.href = 'index.html');
    saveProfileButton.addEventListener('click', saveProfile);
    logoutButton.addEventListener('click', logout);

    // --- Initial Load ---
    populateProfile(mockUser);
    showScreen(profileContainer); // Show profile by default
});
