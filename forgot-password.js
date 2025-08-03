import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetMessage = document.getElementById('reset-message');
    const sendResetButton = document.getElementById('send-reset-link-button');
    const backToLoginButton = document.getElementById('back-to-login-button');

    // --- Functions ---
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
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email-input').value;

        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return;
        }

        // Disable button to prevent multiple submissions
        sendResetButton.disabled = true;
        sendResetButton.textContent = 'Sending...';

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('If an account exists for this email, a reset link has been sent.', 'success');
                sendResetButton.textContent = 'Reset Link Sent';
            })
            .catch((error) => {
                showMessage(error.message.replace('Firebase: ', ''), 'error');
                sendResetButton.disabled = false;
                sendResetButton.textContent = 'Send Reset Link';
            });
    });

    backToLoginButton.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
});
