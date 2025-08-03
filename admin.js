import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const adminPanel = document.getElementById('admin-panel');
    const accessDeniedPanel = document.getElementById('access-denied');
    const fileInput = document.getElementById('json-file-input');
    const uploadButton = document.getElementById('upload-button');
    const statusMessage = document.getElementById('status-message');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check if the user is an admin
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().isAdmin === true) {
                // User is an admin, show the panel
                adminPanel.style.display = 'block';
                document.getElementById('header-user-display-name').textContent = user.displayName || 'Admin';
            } else {
                // User is not an admin, show access denied
                accessDeniedPanel.style.display = 'block';
            }
        } else {
            // No user is signed in, redirect to login
            window.location.href = 'login.html';
        }
    });

    uploadButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            showMessage('Please select a JSON file first.', 'error');
            return;
        }

        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const questions = JSON.parse(event.target.result);
                if (!Array.isArray(questions)) {
                    throw new Error('JSON file must contain an array of questions.');
                }

                // Use a batch write for efficiency
                const batch = writeBatch(db);
                const quizzesCollection = collection(db, 'quizzes');

                questions.forEach(question => {
                    const newQuestionRef = doc(quizzesCollection); // Auto-generate a new ID
                    batch.set(newQuestionRef, question);
                });

                await batch.commit();
                showMessage(`${questions.length} questions uploaded successfully!`, 'success');
                fileInput.value = ''; // Clear the file input

            } catch (error) {
                console.error("Upload Error: ", error);
                showMessage(`Error: ${error.message}`, 'error');
            } finally {
                uploadButton.disabled = false;
                uploadButton.textContent = 'Upload Questions';
            }
        };
        reader.readAsText(file);
    });

    function showMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = type === 'success' ? '#dcfce7' : '#fee2e2';
        statusMessage.style.color = type === 'success' ? '#166534' : '#991b1b';
    }
});
