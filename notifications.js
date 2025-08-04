import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References ---
    const enableToggle = document.getElementById('enable-notifications-toggle');
    const timeSelectorContainer = document.getElementById('time-selector-container');
    const timeInput = document.getElementById('notification-time');
    const saveButton = document.getElementById('save-settings-btn');
    const statusMessage = document.getElementById('status-message');
    const permissionNotice = document.getElementById('permission-notice');
    const backToFeaturesButton = document.getElementById('back-to-features');

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            document.getElementById('header-user-display-name').textContent = user.displayName || 'User';
            if (user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            loadNotificationSettings();
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---
    async function loadNotificationSettings() {
        if (!currentUser) return;
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().notificationSettings) {
            const settings = userDoc.data().notificationSettings;
            enableToggle.checked = settings.enabled || false;
            timeInput.value = settings.time || '09:00';
        }
        // Update UI based on the toggle state
        timeSelectorContainer.style.display = enableToggle.checked ? 'flex' : 'none';
    }

    async function saveNotificationSettings() {
        if (!currentUser) return;

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        const settings = {
            enabled: enableToggle.checked,
            time: timeInput.value
        };

        try {
            // Request permission if enabling notifications
            if (settings.enabled && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    showMessage('Notification permission denied. Please enable it in your browser settings.', 'error');
                    enableToggle.checked = false; // Uncheck the box if permission is denied
                    timeSelectorContainer.style.display = 'none';
                    return; // Stop the save process
                }
            }

            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(userDocRef, { notificationSettings: settings }, { merge: true });
            showMessage('Settings saved successfully!', 'success');

        } catch (error) {
            console.error("Error saving settings: ", error);
            showMessage('Could not save settings.', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Settings';
        }
    }

    function showMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = type === 'success' ? '#dcfce7' : '#fee2e2';
        statusMessage.style.color = type === 'success' ? '#166534' : '#991b1b';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 4000);
    }

    // --- Event Listeners ---
    enableToggle.addEventListener('change', () => {
        timeSelectorContainer.style.display = enableToggle.checked ? 'flex' : 'none';
        if (enableToggle.checked) {
            permissionNotice.style.display = 'block';
        } else {
            permissionNotice.style.display = 'none';
        }
    });

    saveButton.addEventListener('click', saveNotificationSettings);
    backToFeaturesButton.addEventListener('click', () => window.location.href = 'features.html');
});
