// login.js
// This file contains JavaScript logic for the login and signup page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const showSignupButton = document.getElementById('show-signup-button');
    const showLoginButton = document.getElementById('show-login-button');
    const signupPanel = document.getElementById('signup-panel');
    const signinPanel = document.getElementById('signin-panel');
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const anonymousLoginButton = document.getElementById('anonymous-login-button');
    const googleLoginButton = document.getElementById('google-login-button');

    // --- Splash Screen Logic ---
    // Hide splash screen and show auth form after a delay
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        if (authContainer) {
            authContainer.style.display = 'flex';
        }
    }, 4000); // 4 seconds delay to show the animation

    // --- Auth Form Toggle Logic ---
    if (showSignupButton && showLoginButton) {
        showSignupButton.addEventListener('click', () => {
            signupPanel.style.display = 'block';
            signinPanel.style.display = 'none';
            showSignupButton.classList.add('active');
            showLoginButton.classList.remove('active');
        });

        showLoginButton.addEventListener('click', () => {
            signupPanel.style.display = 'none';
            signinPanel.style.display = 'block';
            showSignupButton.classList.remove('active');
            showLoginButton.classList.add('active');
        });
    }

    // --- Form Submission Logic ---
    // NOTE: This is a placeholder for your actual Firebase/backend authentication.
    // On successful login/signup, it will redirect to 'index.html'.

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission
            console.log('Signup form submitted');
            // Add your signup validation and Firebase logic here.
            // For demonstration, we'll just redirect.
            alert('Signup successful! Redirecting to home page...');
            window.location.href = 'index.html'; // Redirect to the main home page
        });
    }

    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission
            console.log('Signin form submitted');
            // Add your signin validation and Firebase logic here.
            // For demonstration, we'll just redirect.
            alert('Sign in successful! Redirecting to home page...');
            window.location.href = 'index.html'; // Redirect to the main home page
        });
    }

    // --- OAuth and Anonymous Login ---
    if (anonymousLoginButton) {
        anonymousLoginButton.addEventListener('click', () => {
            console.log('Anonymous login clicked');
            // Add your anonymous login logic here.
            alert('Signing in anonymously...');
            window.location.href = 'index.html';
        });
    }

     if (googleLoginButton) {
        googleLoginButton.addEventListener('click', () => {
            console.log('Google login clicked');
            // Add your Google OAuth logic here.
            alert('Redirecting to Google for sign in...');
            // On success, your Firebase listener would redirect to index.html
        });
    }

});
