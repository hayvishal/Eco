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
    const bookmarkButton = document.getElementById('bookmark-question-button');

    let selectedSubject = localStorage.getItem('selectedSubject');
    let selectedTopic = '';
    let questionsForQuiz = [];
    let allTopics = {};
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

            // Fetch user's bookmarks
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().bookmarks) {
                userBookmarks = userDoc.data().bookmarks;
            }

            if (selectedSubject) {
                loadTopics(selectedSubject);
            } else {
                topicContainer.innerHTML = `<h1>Error: No subject selected.</h1><a href="index.html" class="glass-button-base glass-button-primary mt-4">Go Home</a>`;
                showScreen(topicContainer);
            }
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

    async function loadTopics(subject) {
        subjectTitlePlaceholder.textContent = subject;
        topicButtonsContainer.innerHTML = '<p>Loading topics...</p>';

        try {
            const q = query(collection(db, "quizzes"), where("subject", "==", subject));
            const querySnapshot = await getDocs(q);
            
            allTopics = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!allTopics[data.topic]) {
                    allTopics[data.topic] = [];
                }
                allTopics[data.topic].push({ id: doc.id, ...data });
            });

            topicButtonsContainer.innerHTML = '';
            const topicNames = Object.keys(allTopics);

            if (topicNames.length > 0) {
                topicNames.forEach(topicName => {
                    const button = document.createElement('button');
                    button.className = 'topic-button';
                    button.textContent = topicName;
                    button.onclick = () => selectTopic(topicName);
                    topicButtonsContainer.appendChild(button);
                });
            } else {
                topicButtonsContainer.innerHTML = '<p>No topics available for this subject yet.</p>';
            }
        } catch (error) {
            console.error("Error loading topics: ", error);
            topicButtonsContainer.innerHTML = '<p>Could not load topics. Please try again.</p>';
        }
        showScreen(topicContainer);
    }

    function selectTopic(topic) {
        selectedTopic = topic;
        const availableQuestions = allTopics[topic].length;
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
            const allQuestions = allTopics[selectedTopic];
            questionsForQuiz = allQuestions.slice(0, numQuestions);
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

        // Update bookmark button state
        updateBookmarkButton();

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

    function selectOption(btn, selectedAnswer, correctAnswer) {
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
        
        // Check if the question is already bookmarked
        if (userBookmarks.includes(questionId)) {
            // Remove it
            await updateDoc(userDocRef, {
                bookmarks: arrayRemove(questionId)
            });
            userBookmarks = userBookmarks.filter(id => id !== questionId);
        } else {
            // Add it
            await updateDoc(userDocRef, {
                bookmarks: arrayUnion(questionId)
            });
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
    backToTopicsBtn.addEventListener('click', () => loadTopics(selectedSubject));
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
    showResultButton.addEventListener('click', endQuiz);
    bookmarkButton.addEventListener('click', toggleBookmark);
});
