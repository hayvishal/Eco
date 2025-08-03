// quiz.js
// This file contains the JavaScript logic for the entire quiz flow.

// --- MOCK DATABASE ---
// In a real application, this data would be fetched from a server or Firebase.
const quizData = {
    "General Awareness": {
        "Indian History": [
            { question: "Who was the first President of India?", options: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "Sardar Patel", "Mahatma Gandhi"], answer: "Dr. Rajendra Prasad" },
            { question: "The Battle of Plassey was fought in?", options: ["1757", "1782", "1748", "1764"], answer: "1757" }
        ],
        "Indian Polity": [
            { question: "What is the minimum age for becoming a member of the Lok Sabha?", options: ["30 years", "21 years", "25 years", "35 years"], answer: "25 years" },
            { question: "Who appoints the Chief Justice of India?", options: ["The Prime Minister", "The Parliament", "The President", "The Law Minister"], answer: "The President" }
        ]
    },
    "Reasoning": {
        "Analogy": [
            { question: "Doctor is to Patient as Lawyer is to?", options: ["Customer", "Accused", "Client", "Magistrate"], answer: "Client" }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const subjectTitlePlaceholder = document.getElementById('subject-title-placeholder');
    const topicContainer = document.getElementById('generic-subject-topic-container');
    const topicButtonsContainer = document.getElementById('generic-topic-buttons');
    const questionCountContainer = document.getElementById('question-count-container');
    const quizContainer = document.getElementById('quiz-container');
    const startPracticeButton = document.getElementById('start-practice-button');
    const backToHomeBtn = document.getElementById('back-to-home-from-topics');
    const backToTopicsBtn = document.getElementById('back-to-topic-selection');
    const nextButton = document.getElementById('next-button');
    const showResultButton = document.getElementById('show-result-button');

    // --- State Variables ---
    let selectedSubject = '';
    let selectedTopic = '';
    let questionsForQuiz = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;

    // --- Functions ---

    function showScreen(screen) {
        topicContainer.style.display = 'none';
        questionCountContainer.style.display = 'none';
        quizContainer.style.display = 'none';
        screen.style.display = 'block';
    }

    function loadTopics(subject) {
        subjectTitlePlaceholder.textContent = subject;
        topicButtonsContainer.innerHTML = '';
        const topics = Object.keys(quizData[subject] || {});
        if (topics.length > 0) {
            topics.forEach(topic => {
                const button = document.createElement('button');
                button.className = 'topic-button';
                button.textContent = topic;
                button.onclick = () => selectTopic(topic);
                topicButtonsContainer.appendChild(button);
            });
        } else {
            topicButtonsContainer.innerHTML = '<p>No topics available for this subject yet.</p>';
        }
        showScreen(topicContainer);
    }

    function selectTopic(topic) {
        selectedTopic = topic;
        const availableQuestions = quizData[selectedSubject][selectedTopic].length;
        document.getElementById('selected-topic-title').textContent = topic;
        document.getElementById('total-available-questions').textContent = availableQuestions;
        document.getElementById('num-questions').max = availableQuestions;
        showScreen(questionCountContainer);
    }

    function startQuiz() {
        const numQuestionsInput = document.getElementById('num-questions');
        const numQuestions = parseInt(numQuestionsInput.value, 10);
        const maxQuestions = parseInt(numQuestionsInput.max, 10);

        if (numQuestions > 0 && numQuestions <= maxQuestions) {
            const allQuestions = quizData[selectedSubject][selectedTopic];
            questionsForQuiz = allQuestions.slice(0, numQuestions); // Get the requested number of questions
            currentQuestionIndex = 0;
            score = 0;
            showScreen(quizContainer);
            displayQuestion();
        } else {
            document.getElementById('question-count-error').textContent = `Please enter a number between 1 and ${maxQuestions}.`;
            document.getElementById('question-count-error').style.display = 'block';
        }
    }

    function displayQuestion() {
        if (currentQuestionIndex >= questionsForQuiz.length) {
            endQuiz();
            return;
        }

        clearInterval(timer); // Clear previous timer
        const question = questionsForQuiz[currentQuestionIndex];
        document.getElementById('question-number-display').textContent = `Question ${currentQuestionIndex + 1} / ${questionsForQuiz.length}`;
        document.getElementById('question-display').textContent = question.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = optionText;
            button.onclick = () => selectOption(button, optionText, question.answer);
            optionsContainer.appendChild(button);
        });
        
        document.getElementById('feedback-area').style.display = 'none';
        document.getElementById('correct-answer-area').style.display = 'none';
        nextButton.disabled = true;

        // Start timer
        let timeLeft = 20;
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                // Handle time up (e.g., auto-move to next question)
                // For now, just show the correct answer
                showCorrectAnswer();
            }
        }, 1000);
    }

    function selectOption(btn, selectedAnswer, correctAnswer) {
        clearInterval(timer);
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(b => b.disabled = true); // Disable all options

        btn.classList.add('selected');
        if (selectedAnswer === correctAnswer) {
            btn.classList.add('correct');
            score++;
        } else {
            btn.classList.add('incorrect');
            document.getElementById('correct-answer-area').innerHTML = `Correct Answer: <strong>${correctAnswer}</strong>`;
            document.getElementById('correct-answer-area').style.display = 'block';
        }

        nextButton.disabled = false;
        if (currentQuestionIndex === questionsForQuiz.length - 1) {
            nextButton.style.display = 'none';
            showResultButton.style.display = 'inline-block';
        }
    }
    
    function showCorrectAnswer() {
        const correctAnswer = questionsForQuiz[currentQuestionIndex].answer;
        document.getElementById('correct-answer-area').innerHTML = `Time's up! Correct Answer: <strong>${correctAnswer}</strong>`;
        document.getElementById('correct-answer-area').style.display = 'block';
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(b => {
            b.disabled = true;
            if (b.textContent === correctAnswer) {
                b.classList.add('correct');
            }
        });
        nextButton.disabled = false;
        if (currentQuestionIndex === questionsForQuiz.length - 1) {
            nextButton.style.display = 'none';
            showResultButton.style.display = 'inline-block';
        }
    }


    function endQuiz() {
        // In a real app, you would redirect to a results page
        alert(`Quiz Finished!\nYour Score: ${score} / ${questionsForQuiz.length}`);
        // Store results and redirect
        localStorage.setItem('quizResult', JSON.stringify({
            score: score,
            total: questionsForQuiz.length,
            subject: selectedSubject,
            topic: selectedTopic
        }));
        window.location.href = 'results.html';
    }

    // --- Event Listeners ---
    startPracticeButton.addEventListener('click', startQuiz);
    backToHomeBtn.addEventListener('click', () => window.location.href = 'index.html');
    backToTopicsBtn.addEventListener('click', () => loadTopics(selectedSubject));
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
    showResultButton.addEventListener('click', endQuiz);

    // --- Initial Load ---
    selectedSubject = localStorage.getItem('selectedSubject');
    if (selectedSubject && quizData[selectedSubject]) {
        loadTopics(selectedSubject);
    } else {
        // Handle case where no subject is selected or subject is invalid
        topicContainer.innerHTML = `<h1>Error: No subject selected or subject not found.</h1><button id="back-to-home" class="glass-button-base glass-button-default mt-4">Back to Home</button>`;
        document.getElementById('back-to-home').onclick = () => window.location.href = 'index.html';
        showScreen(topicContainer);
    }
});
