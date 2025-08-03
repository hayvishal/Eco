import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const profileContainer = document.getElementById('user-profile-container');
    const settingsContainer = document.getElementById('settings-container');
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
        } else {
            // If no user is logged in, redirect to the login page
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---

    /**
     * Populates the profile page with user data from Firebase Auth and Firestore.
     * @param {object} user - The Firebase user object.
     */
    async function populateProfile(user) {
        if (!user) return;

        // Populate header and basic info from Firebase Auth
        document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
        document.getElementById('edit-display-name-input').value = user.displayName || '';
        document.getElementById('edit-email-input').value = user.email || '';
        document.getElementById('profile-user-id').textContent = user.uid;
        if (user.photoURL) {
            const photoUrl = user.photoURL;
            document.getElementById('profile-photo').src = photoUrl;
            document.getElementById('header-profile-photo').src = photoUrl;
        }

        // Fetch additional stats from the user's document in Firestore
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('profile-tests-attempted').textContent = userData.testsAttempted || 0;
                document.getElementById('profile-average-score').textContent = `${userData.averageScore || 0}%`;
                document.getElementById('profile-total-points').textContent = userData.totalPoints || 0;
            } else {
                console.log("No such user document!");
            }
        } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
        }
    }

    /**
     * Toggles visibility between the main profile view and the settings view.
     * @param {HTMLElement} screenToShow - The container element to display.
     */
    function showScreen(screenToShow) {
        profileContainer.style.display = 'none';
        settingsContainer.style.display = 'none';
        screenToShow.style.display = 'block';
    }

    /**
     * Saves the updated user profile information to Firebase.
     */
    async function saveProfile() {
        if (!currentUser) return;

        saveProfileButton.disabled = true;
        saveProfileButton.textContent = 'Saving...';

        const newName = document.getElementById('edit-display-name-input').value;

        try {
            // 1. Update the profile in Firebase Authentication
            await updateProfile(currentUser, { displayName: newName });

            // 2. Update the display name in the user's Firestore document
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                displayName: newName
            });

            // Update UI immediately and show success message
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
            // Re-enable button and hide message after a delay
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = 'Save Profile';
            setTimeout(() => {
                profileMessage.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Signs the user out of the application.
     */
    function handleLogout() {
        signOut(auth).catch(error => console.error('Logout Error:', error));
    }

    // --- Event Listeners ---
    goToSettingsButton.addEventListener('click', () => showScreen(settingsContainer));
    backToProfileButton.addEventListener('click', () => showScreen(profileContainer));
    backToHomeButton.addEventListener('click', () => window.location.href = 'index.html');
    saveProfileButton.addEventListener('click', saveProfile);
    logoutButton.addEventListener('click', handleLogout);

    // --- Initial Load ---
    showScreen(profileContainer); // Show profile view by default
});
