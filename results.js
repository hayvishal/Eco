import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);

    // --- DOM Element References ---
    const resultSummaryContainer = document.getElementById('result-summary-container');
    const solutionContainer = document.getElementById('solution-explanation-container');
    const scorePercentageDisplay = document.getElementById('result-score-percentage');
    const scoreCircle = document.getElementById('score-circle');
    const subjectDisplay = document.getElementById('result-subject');
    const topicDisplay = document.getElementById('result-topic');
    const totalQuestionsDisplay = document.getElementById('result-total-questions');
    const correctCountDisplay = document.getElementById('result-correct-count');
    const incorrectCountDisplay = document.getElementById('result-incorrect-count');
    const solutionsList = document.getElementById('solutions-list');
    
    // Buttons
    const retryButton = document.getElementById('retry-quiz-button');
    const backToHomeButton = document.getElementById('back-to-home-from-results');
    const viewSolutionsButton = document.getElementById('view-solutions-button');
    const backToResultsButton = document.getElementById('back-to-results-button');

    let resultData = null;

    // --- Auth State Observer ---
    onAuthStateChanged(auth, user => {
        if (user) {
            const displayName = user.displayName || 'User';
            document.getElementById('header-user-display-name').textContent = displayName;
            if(user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }
            loadResults();
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Functions ---
    function loadResults() {
        const resultDataString = localStorage.getItem('quizResult');
        if (resultDataString) {
            resultData = JSON.parse(resultDataString);
            displaySummary(resultData);
        } else {
            document.querySelector('.results-main-container').innerHTML = `
                <h1 class="text-2xl font-bold">No quiz data found!</h1>
                <p class="my-4">Please complete a quiz to see your results.</p>
                <button onclick="window.location.href='index.html'" class="glass-button-base glass-button-primary">Back to Home</button>
            `;
        }
    }

    function displaySummary(results) {
        const { score, total, subject, topic } = results;
        const incorrect = total - score;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        subjectDisplay.textContent = subject || 'N/A';
        topicDisplay.textContent = topic || 'N/A';
        totalQuestionsDisplay.textContent = total || 0;
        correctCountDisplay.textContent = score || 0;
        incorrectCountDisplay.textContent = incorrect || 0;
        scorePercentageDisplay.textContent = `${percentage}%`;
        scoreCircle.style.background = `conic-gradient(#48bb78 ${percentage}%, #e2e8f0 ${percentage}%)`;
    }

    function displaySolutions() {
        if (!resultData || !resultData.answers) return;

        solutionsList.innerHTML = ''; // Clear previous solutions
        resultData.answers.forEach((answer, index) => {
            const solutionItem = document.createElement('div');
            solutionItem.className = 'solution-item';
            
            const correctnessClass = answer.isCorrect ? 'correct' : 'incorrect';
            const correctnessIndicator = answer.isCorrect ? '✔' : '✖';

            solutionItem.innerHTML = `
                <div class="solution-question">${index + 1}. ${answer.question}</div>
                <div class="solution-answer your-answer ${correctnessClass}">
                    Your Answer: ${answer.selected} <span class="indicator">${correctnessIndicator}</span>
                </div>
                ${!answer.isCorrect ? `<div class="solution-answer correct-answer">Correct Answer: ${answer.correctAnswer}</div>` : ''}
            `;
            solutionsList.appendChild(solutionItem);
        });

        // Show solutions and hide summary
        resultSummaryContainer.style.display = 'none';
        solutionContainer.style.display = 'block';
    }

    function showSummary() {
        solutionContainer.style.display = 'none';
        resultSummaryContainer.style.display = 'block';
    }

    // --- Event Listeners ---
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // Subject is already in localStorage, so just go back to quiz page
            window.location.href = 'quiz.html';
        });
    }

    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (viewSolutionsButton) {
        viewSolutionsButton.addEventListener('click', displaySolutions);
    }

    if (backToResultsButton) {
        backToResultsButton.addEventListener('click', showSummary);
    }
});
