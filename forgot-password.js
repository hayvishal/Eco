// forgot-password.js
// This file contains the JavaScript logic for the forgot password page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetMessage = document.getElementById('reset-message');
    const sendResetButton = document.getElementById('send-reset-link-button');
    const backToLoginButton = document.getElementById('back-to-login-button');

    // --- Functions ---
    function handlePasswordReset(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email-input').value;

        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return;
        }

        // Disable button to prevent multiple submissions
        sendResetButton.disabled = true;
        sendResetButton.textContent = 'Sending...';

        // --- Firebase Logic Placeholder ---
        // In a real app, you would call `firebase.auth().sendPasswordResetEmail(email)`
        console.log(`Sending password reset link to: ${email}`);
        
        // Simulate network request
        setTimeout(() => {
            // On success:
            showMessage('If an account exists for this email, a reset link has been sent.', 'success');
            sendResetButton.textContent = 'Reset Link Sent';
            
            // On error (example):
            // showMessage('Error sending reset link. Please try again.', 'error');
            // sendResetButton.disabled = false;
            // sendResetButton.textContent = 'Send Reset Link';
        }, 1500);
    }

    function showMessage(message, type) {
        resetMessage.textContent = message;
        resetMessage.style.display = 'block';
        if (type === 'success') {
            resetMessage.style.backgroundColor = '#c6f6d5'; // Green
            resetMessage.style.color = '#2f855a';
        } else {
            resetMessage.style.backgroundColor = '#fed7d7'; // Red
            resetMessage.style.color = '#c53030';
        }
    }

    // --- Event Listeners ---
    forgotPasswordForm.addEventListener('submit', handlePasswordReset);
    backToLoginButton.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
});
