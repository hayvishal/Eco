import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    // --- DOM Element References ---
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const showSignupButton = document.getElementById('show-signup-button');
    const showLoginButton = document.getElementById('show-login-button');
    const signupPanel = document.getElementById('signup-panel');
    const signinPanel = document.getElementById('signin-panel');
    
    // Forms & Buttons
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const signupButton = document.getElementById('email-signup-button');
    const signinButton = document.getElementById('email-login-button');

    // Other Buttons
    const googleSignupButton = document.getElementById('google-signup-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const anonymousLoginButton = document.getElementById('anonymous-login-button');
    const forgotPasswordButton = document.getElementById('forgot-password-button');

    // Error Messages
    const signupErrorMsg = document.getElementById('auth-error-message-signup');
    const signinErrorMsg = document.getElementById('auth-error-message-signin');

    // --- Splash Screen Logic ---
    setTimeout(() => {
        splashScreen.style.display = 'none';
        authContainer.style.display = 'flex';
    }, 4000);

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in, redirect to the home page.
            window.location.href = 'index.html';
        }
    });

    // --- Helper Functions ---
    function showAuthError(element, message) {
        element.textContent = message.replace('Firebase: ', '');
        element.style.display = 'block';
    }

    // --- Auth Form Toggle Logic ---
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

    // --- Event Listeners for Authentication ---

    // Email/Password Sign-Up
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('signup-first-name-input').value;
        const email = document.getElementById('signup-email-input').value;
        const password = document.getElementById('signup-password-input').value;
        const confirmPassword = document.getElementById('signup-confirm-password-input').value;
        const displayName = firstName.trim();

        if (password !== confirmPassword) {
            showAuthError(signupErrorMsg, "Passwords do not match.");
            return;
        }

        signupButton.disabled = true;
        signupButton.textContent = 'Creating account...';

        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                // Update Auth profile and create a user document in Firestore
                return Promise.all([
                    updateProfile(user, { displayName }),
                    setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        displayName: displayName,
                        email: user.email,
                        createdAt: new Date(),
                        testsAttempted: 0,
                        totalPoints: 0,
                        averageScore: 0
                    })
                ]);
            })
            .catch(error => {
                showAuthError(signupErrorMsg, error.message);
                signupButton.disabled = false;
                signupButton.textContent = 'Create an account';
            });
    });

    // Email/Password Sign-In
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email-input').value;
        const password = document.getElementById('login-password-input').value;
        signinButton.disabled = true;
        signinButton.textContent = 'Signing in...';
        signInWithEmailAndPassword(auth, email, password)
            .catch(error => {
                showAuthError(signinErrorMsg, error.message);
                signinButton.disabled = false;
                signinButton.textContent = 'Sign in';
            });
    });

    // Google Sign-In
    const handleGoogleSignIn = () => {
        signInWithPopup(auth, googleProvider)
            .catch(error => {
                showAuthError(signinErrorMsg, error.message);
            });
    };
    googleSignupButton.addEventListener('click', handleGoogleSignIn);
    googleLoginButton.addEventListener('click', handleGoogleSignIn);

    // Anonymous Sign-In
    anonymousLoginButton.addEventListener('click', () => {
        signInAnonymously(auth)
            .catch(error => {
                showAuthError(signinErrorMsg, error.message);
            });
    });
    
    // Forgot Password
    forgotPasswordButton.addEventListener('click', () => {
        window.location.href = 'forgot-password.html';
    });
});
