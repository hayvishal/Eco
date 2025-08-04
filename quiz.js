import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, setDoc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(window.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let currentUser = null;

    // --- DOM Element References & State ---
    const topicContainer = document.getElementById('generic-subject-topic-container');
    const questionCountContainer = document.getElementById('question-count-container');
    const quizContainer = document.getElementById('quiz-container');
    const startPracticeButton = document.getElementById('start-practice-button');
    const backToHomeBtn = document.getElementById('back-to-home-from-topics');
    const backToTopicsBtn = document.getElementById('back-to-topic-selection');
    const nextButton = document.getElementById('next-button');
    const showResultButton = document.getElementById('show-result-button');
    const bookmarkButton = document.getElementById('bookmark-question-button');
    const autoGeminiExplanationArea = document.getElementById('auto-gemini-explanation-area');

    // Get subject and topic from previous page
    let selectedSubject = localStorage.getItem('selectedSubject');
    let selectedTopic = localStorage.getItem('selectedTopic'); // This is the key change

    let questionsForQuiz = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let userAnswers = [];
    let userBookmarks = [];

    // --- Auth State Observer ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            const displayName = user.displayName || 'User';
            document.getElementById('header-user-display-name').textContent = displayName;
            if(user.photoURL) {
                document.getElementById('header-profile-photo').src = user.photoURL;
            }

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().bookmarks) {
                userBookmarks = userDoc.data().bookmarks;
            }
            
            // 🟢 START: UPDATED LOGIC 🟢
            // Directly prepare the quiz instead of showing topic selection again
            if (selectedSubject && selectedTopic) {
                prepareQuizForTopic(selectedSubject, selectedTopic);
            } else {
                // Fallback if something went wrong
                topicContainer.innerHTML = `<h1>Error: No subject or topic selected.</h1><a href="index.html" class="glass-button-base glass-button-primary mt-4">Go Home</a>`;
                showScreen(topicContainer);
            }
            // 🟢 END: UPDATED LOGIC 🟢

        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Main Functions ---

    function showScreen(screen) {
        topicContainer.style.display = 'none';
        questionCountContainer.style.display = 'none';
        quizContainer.style.display = 'none';
        screen.style.display = 'block';
    }

    // 🟢 START: NEW FUNCTION 🟢
    /**
     * Fetches questions for a specific topic and displays the question count screen.
     * @param {string} subject - The main subject (e.g., "General Awareness").
     * @param {string} topic - The specific topic (e.g., "History").
     */
    async function prepareQuizForTopic(subject, topic) {
        try {
            const q = query(collection(db, "quizzes"), where("subject", "==", subject), where("topic", "==", topic));
            const querySnapshot = await getDocs(q);
            
            const topicQuestions = [];
            querySnapshot.forEach((doc) => {
                topicQuestions.push({ id: doc.id, ...doc.data() });
            });

            if (topicQuestions.length > 0) {
                questionsForQuiz = topicQuestions; // Store fetched questions
                document.getElementById('selected-topic-title').textContent = `${subject} - ${topic}`;
                document.getElementById('total-available-questions').textContent = topicQuestions.length;
                document.getElementById('num-questions').max = topicQuestions.length;
                document.getElementById('num-questions').value = Math.min(5, topicQuestions.length);
                showScreen(questionCountContainer);
            } else {
                questionCountContainer.innerHTML = `<p>No questions found for ${topic}.</p><button id="back-btn" class="glass-button-base glass-button-default mt-4">Go Back</button>`;
                document.getElementById('back-btn').onclick = () => window.history.back();
                showScreen(questionCountContainer);
            }
        } catch (error) {
            console.error("Error fetching questions for topic: ", error);
            questionCountContainer.innerHTML = `<p>Error loading questions. Please check your database rules and connection.</p><button id="back-btn" class="glass-button-base glass-button-default mt-4">Go Back</button>`;
            document.getElementById('back-btn').onclick = () => window.history.back();
            showScreen(questionCountContainer);
        }
    }
    // 🟢 END: NEW FUNCTION 🟢


    function startQuiz() {
        const numQuestionsInput = document.getElementById('num-questions');
        const numQuestions = parseInt(numQuestionsInput.value, 10);
        const maxQuestions = questionsForQuiz.length;

        if (numQuestions > 0 && numQuestions <= maxQuestions) {
            // Shuffle the questions and slice the requested number
            questionsForQuiz = questionsForQuiz.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            showScreen(quizContainer);
            displayQuestion();
        } else {
            const errorEl = document.getElementById('question-count-error');
            errorEl.textContent = `Please enter a number between 1 and ${maxQuestions}.`;
            errorEl.style.display = 'block';
        }
    }

    function displayQuestion() {
        if (currentQuestionIndex >= questionsForQuiz.length) {
            endQuiz();
            return;
        }

        clearInterval(timer);
        const question = questionsForQuiz[currentQuestionIndex];
        document.getElementById('question-number-display').textContent = `Question ${currentQuestionIndex + 1} / ${questionsForQuiz.length}`;
        document.getElementById('question-display').textContent = question.question;
        
        updateBookmarkButton();
        autoGeminiExplanationArea.style.display = 'none';
        autoGeminiExplanationArea.innerHTML = '';


        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = optionText;
            button.onclick = () => selectOption(button, optionText, question.answer);
            optionsContainer.appendChild(button);
        });
        
        document.getElementById('feedback-area').style.display = 'none';
        document.getElementById('correct-answer-area').style.display = 'none';
        nextButton.disabled = true;
        nextButton.style.display = 'inline-block';
        showResultButton.style.display = 'none';

        let timeLeft = 20;
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                showCorrectAnswer(true);
            }
        }, 1000);
    }

    async function getGeminiExplanation(questionText, correctAnswer) {
        const prompt = `Explain why "${correctAnswer}" is the correct answer for the question: "${questionText}". Keep the explanation concise and easy to understand for a student preparing for an exam.`;
        
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // This will be provided by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                return result.candidates[0].content.parts[0].text;
            } else {
                return "Could not retrieve an explanation at this time.";
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "An error occurred while fetching the explanation.";
        }
    }

    async function selectOption(btn, selectedAnswer, correctAnswer) {
        clearInterval(timer);
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(b => b.disabled = true);

        const isCorrect = selectedAnswer === correctAnswer;
        if (isCorrect) {
            btn.classList.add('correct');
            score++;
        } else {
            btn.classList.add('incorrect');
            document.getElementById('correct-answer-area').innerHTML = `Correct Answer: <strong>${correctAnswer}</strong>`;
            document.getElementById('correct-answer-area').style.display = 'block';

            autoGeminiExplanationArea.style.display = 'block';
            autoGeminiExplanationArea.innerHTML = '<div class="spinner"></div><p>Generating explanation...</p>';
            const explanation = await getGeminiExplanation(questionsForQuiz[currentQuestionIndex].question, correctAnswer);
            autoGeminiExplanationArea.innerHTML = `<p>${explanation}</p>`;
        }
        
        userAnswers.push({
            question: questionsForQuiz[currentQuestionIndex].question,
            selected: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        });

        nextButton.disabled = false;
        if (currentQuestionIndex === questionsForQuiz.length - 1) {
            nextButton.style.display = 'none';
            showResultButton.style.display = 'inline-block';
        }
    }
    
    function showCorrectAnswer(isTimeUp) {
        const correctAnswer = questionsForQuiz[currentQuestionIndex].answer;
        if(isTimeUp) {
            document.getElementById('correct-answer-area').innerHTML = `Time's up! Correct Answer: <strong>${correctAnswer}</strong>`;
        }
        document.getElementById('correct-answer-area').style.display = 'block';
        
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(b => {
            b.disabled = true;
            if (b.textContent === correctAnswer) {
                b.classList.add('correct');
            }
        });

        if(isTimeUp) {
            userAnswers.push({
                question: questionsForQuiz[currentQuestionIndex].question,
                selected: 'Time Up',
                correctAnswer: correctAnswer,
                isCorrect: false
            });
        }

        nextButton.disabled = false;
        if (currentQuestionIndex === questionsForQuiz.length - 1) {
            nextButton.style.display = 'none';
            showResultButton.style.display = 'inline-block';
        }
    }

    async function toggleBookmark() {
        if (!currentUser || !questionsForQuiz[currentQuestionIndex]) return;
        
        const questionId = questionsForQuiz[currentQuestionIndex].id;
        const userDocRef = doc(db, "users", currentUser.uid);
        
        if (userBookmarks.includes(questionId)) {
            await updateDoc(userDocRef, { bookmarks: arrayRemove(questionId) });
            userBookmarks = userBookmarks.filter(id => id !== questionId);
        } else {
            await updateDoc(userDocRef, { bookmarks: arrayUnion(questionId) });
            userBookmarks.push(questionId);
        }
        updateBookmarkButton();
    }

    function updateBookmarkButton() {
        const questionId = questionsForQuiz[currentQuestionIndex]?.id;
        if (userBookmarks.includes(questionId)) {
            bookmarkButton.innerHTML = '🔖 Bookmarked';
            bookmarkButton.classList.add('bookmarked');
        } else {
            bookmarkButton.innerHTML = '🔖 Bookmark';
            bookmarkButton.classList.remove('bookmarked');
        }
    }

    async function endQuiz() {
        const resultData = {
            score: score,
            total: questionsForQuiz.length,
            subject: selectedSubject,
            topic: selectedTopic,
            answers: userAnswers,
            date: new Date().toISOString(),
            userId: currentUser.uid
        };

        try {
            const historyRef = collection(db, "users", currentUser.uid, "history");
            await setDoc(doc(historyRef), resultData);
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                testsAttempted: increment(1),
                totalPoints: increment(score)
            });
        } catch (error) {
            console.error("Error saving quiz results: ", error);
        }

        localStorage.setItem('quizResult', JSON.stringify(resultData));
        window.location.href = 'results.html';
    }

    // --- Event Listeners ---
    startPracticeButton.addEventListener('click', startQuiz);
    backToHomeBtn.addEventListener('click', () => window.location.href = 'index.html');
    backToTopicsBtn.addEventListener('click', () => window.history.back()); // Go back to the previous topic page
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
    showResultButton.addEventListener('click', endQuiz);
    bookmarkButton.addEventListener('click', toggleBookmark);
});
