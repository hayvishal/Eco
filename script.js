// script.js
// This file contains the main JavaScript logic for the Home Page (index.html).

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const generalAwarenessCard = document.getElementById('card-general-awareness');
    const historyCard = document.getElementById('card-question-history');
    const extraFeaturesButton = document.getElementById('extra-features-button');
    const profileButton = document.getElementById('profile-button');
    const profilePhoto = document.getElementById('header-profile-photo');
    const welcomeUserName = document.getElementById('welcome-user-name');
    const headerUserName = document.getElementById('header-user-display-name');

    // --- Mock User Data ---
    // In a real app, this would come from Firebase Auth after login.
    const user = {
        displayName: 'Aspirant',
        photoURL: 'https://placehold.co/40x40/4a90e2/ffffff?text=A'
    };

    // --- Initialize Page with User Data ---
    if (user) {
        welcomeUserName.textContent = user.displayName;
        headerUserName.textContent = user.displayName;
        if (user.photoURL) {
            profilePhoto.src = user.photoURL;
        }
    }

    // --- Event Listeners for Navigation ---

    if (generalAwarenessCard) {
        // Example: Clicking "General Awareness" navigates to the quiz page.
        generalAwarenessCard.addEventListener('click', () => {
            console.log('Navigating to General Awareness quiz...');
            // We'll store the selected subject and redirect.
            // In a real app, you might use localStorage or URL parameters.
            localStorage.setItem('selectedSubject', 'General Awareness');
            window.location.href = 'quiz.html';
        });
    }

    if (historyCard) {
        historyCard.addEventListener('click', () => {
            console.log('Navigating to question history...');
            window.location.href = 'history.html';
        });
    }

    if (extraFeaturesButton) {
        extraFeaturesButton.addEventListener('click', () => {
            console.log('Navigating to extra features...');
            window.location.href = 'features.html';
        });
    }

    // Both the profile button and the header photo can lead to the profile page
    const navigateToProfile = () => {
        console.log('Navigating to profile...');
        window.location.href = 'profile.html';
    };

    if (profileButton) {
        profileButton.addEventListener('click', navigateToProfile);
    }
    if (profilePhoto) {
        profilePhoto.addEventListener('click', navigateToProfile);
    }
    
    // You can add event listeners for all the other cards here,
    // pointing them to quiz.html or other specific pages.
    // For example:
    const reasoningCard = document.getElementById('card-reasoning');
    if(reasoningCard) {
        reasoningCard.addEventListener('click', () => {
            localStorage.setItem('selectedSubject', 'Reasoning');
            window.location.href = 'quiz.html';
        });
    }

});

