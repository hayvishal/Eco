// results.js
// This file contains the JavaScript logic for the results page.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const scorePercentageDisplay = document.getElementById('result-score-percentage');
    const scoreCircle = document.getElementById('score-circle');
    const subjectDisplay = document.getElementById('result-subject');
    const topicDisplay = document.getElementById('result-topic');
    const totalQuestionsDisplay = document.getElementById('result-total-questions');
    const correctCountDisplay = document.getElementById('result-correct-count');
    const incorrectCountDisplay = document.getElementById('result-incorrect-count');
    const retryButton = document.getElementById('retry-quiz-button');
    const backToHomeButton = document.getElementById('back-to-home-from-results');

    // --- Load Results from localStorage ---
    const resultDataString = localStorage.getItem('quizResult');

    if (resultDataString) {
        const results = JSON.parse(resultDataString);
        const { score, total, subject, topic } = results;
        const incorrect = total - score;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        // --- Populate the page with data ---
        subjectDisplay.textContent = subject || 'N/A';
        topicDisplay.textContent = topic || 'N/A';
        totalQuestionsDisplay.textContent = total || 0;
        correctCountDisplay.textContent = score || 0;
        incorrectCountDisplay.textContent = incorrect || 0;
        scorePercentageDisplay.textContent = `${percentage}%`;

        // --- Update the score circle gradient ---
        // This creates the circular progress bar effect
        scoreCircle.style.background = `conic-gradient(#48bb78 ${percentage}%, #e2e8f0 ${percentage}%)`;

    } else {
        // Handle case where no result data is found
        document.querySelector('.results-main-container').innerHTML = `
            <h1 class="text-2xl font-bold">No quiz data found!</h1>
            <p class="my-4">Please complete a quiz to see your results.</p>
            <button id="back-to-home" class="glass-button-base glass-button-primary">Back to Home</button>
        `;
        document.getElementById('back-to-home').onclick = () => window.location.href = 'index.html';
    }

    // --- Event Listeners ---
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // To retry, we just navigate back to the quiz page.
            // The quiz.js script will re-read the subject from localStorage.
            window.location.href = 'quiz.html';
        });
    }

    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Clean up the result from localStorage so it's not shown again by mistake
    // localStorage.removeItem('quizResult'); 
    // Note: You might want to keep this for a "View Last Result" feature.
    // For now, we'll leave it, but in a real app, you'd manage this state carefully.
});
