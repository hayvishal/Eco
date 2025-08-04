import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, setDoc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 🟢 START: FIX - Add your Gemini API Key here 🟢
// You can get a free key from Google AI Studio.
const GEMINI_API_KEY = "AIzaSyC_fN4BF66NPCP2gqrOFW2wyABV_uwK9Xc"; // IMPORTANT: Paste your Gemini API Key here
// 🟢 END: FIX 🟢

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
    const backToTopicsBtn = document.getElementById('back-to-topic-selection');
    const nextButton = document.getElementById('next-button');
    const showResultButton = document.getElementById('show-result-button');
    const bookmarkButton = document.getElementById('bookmark-question-button');
    const autoGeminiExplanationArea = document.getElementById('auto-gemini-explanation-area');

    let selectedSubject = localStorage.getItem('selectedSubject');
    let selectedTopic = localStorage.getItem('selectedTopic');

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
            
            if (selectedSubject && selectedTopic) {
                prepareQuizForTopic(selectedSubject, selectedTopic);
            } else {
                topicContainer.innerHTML = `<h1>Error: No subject or topic selected.</h1><a href="index.html" class="glass-button-base glass-button-primary mt-4">Go Home</a>`;
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

    async function prepareQuizForTopic(subject, topic) {
        try {
            const q = query(collection(db, "quizzes"), where("subject", "==", subject), where("topic", "==", topic));
            const querySnapshot = await getDocs(q);
            
            const topicQuestions = [];
            querySnapshot.forEach((doc) => {
                topicQuestions.push({ id: doc.id, ...doc.data() });
            });

            if (topicQuestions.length > 0) {
                questionsForQuiz = topicQuestions;
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
            questionCountContainer.innerHTML = `<p>Error loading questions.</p><button id="back-btn" class="glass-button-base glass-button-default mt-4">Go Back</button>`;
            document.getElementById('back-btn').onclick = () => window.history.back();
            showScreen(questionCountContainer);
        }
    }

    function startQuiz() {
        const numQuestionsInput = document.getElementById('num-questions');
        const numQuestions = parseInt(numQuestionsInput.value, 10);
        const maxQuestions = questionsForQuiz.length;

        if (numQuestions > 0 && numQuestions <= maxQuestions) {
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
        clearInterval(timer);

        if (currentQuestionIndex >= questionsForQuiz.length) {
            endQuiz();
            return;
        }

        const questionData = questionsForQuiz[currentQuestionIndex];

        if (!questionData || !questionData.question || !Array.isArray(questionData.options)) {
            console.error("Invalid question data:", questionData);
            currentQuestionIndex++;
            displayQuestion();
            return;
        }

        document.getElementById('question-number-display').textContent = `Question ${currentQuestionIndex + 1} / ${questionsForQuiz.length}`;
        document.getElementById('question-display').textContent = questionData.question;
        
        updateBookmarkButton();
        if (autoGeminiExplanationArea) {
            autoGeminiExplanationArea.style.display = 'none';
            autoGeminiExplanationArea.innerHTML = '';
        }

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const shuffledOptions = [...questionData.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = optionText;
            button.onclick = () => selectOption(button, optionText, questionData.answer);
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

    function formatExplanation(text) {
        if (typeof text !== 'string' || !text) {
            return '<p class="text-justify">No explanation available for this question.</p>';
        }

        let sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const lines = sanitizedText.split('\n');
        let html = '';
        let inList = null;

        for (const rawLine of lines) {
            let line = rawLine.trim();

            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/(?<!\*)\*(?!\*|_)(.*?)(?<!\*)\*(?!\*|_)/g, '<em>$1</em>');

            const isOl = /^\d+\.\s/.test(line);
            const isUl = /^[\*\-]\s/.test(line);

            if (isOl || isUl) {
                const listType = isOl ? 'ol' : 'ul';
                if (inList !== listType) {
                    if (inList) html += `</${inList}>`;
                    const listClass = listType === 'ol' ? 'list-decimal' : 'list-disc';
                    html += `<${listType} class="${listClass} list-inside space-y-1 mt-2 pl-4">`;
                    inList = listType;
                }
                html += `<li>${line.replace(/^(\d+\.|\*|\-)\s/, '')}</li>`;
            } else {
                if (inList) {
                    html += `</${inList}>`;
                    inList = null;
                }
                if (line) {
                    html += `<p class="mb-2 text-justify">${line}</p>`;
                }
            }
        }

        if (inList) html += `</${inList}>`;
        
        return html;
    }

    async function getGeminiExplanationWithRetry(questionText, correctAnswer, retries = 3, delay = 1000) {
        if (!GEMINI_API_KEY) {
            return "Explanation feature is not configured. An API key is required.";
        }

        const prompt = `Explain why "${correctAnswer}" is the correct answer for the question: "${questionText}". Keep the explanation concise and easy to understand for a student preparing for an exam. Use bolding for key terms and numbered lists for steps if applicable.`;
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    console.error("Gemini API Error:", result.error);
                    return `API Error: ${result.error.message}`;
                }

                if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    console.error("Gemini API response format unexpected:", result);
                    throw new Error("Unexpected response format from API.");
                }
            } catch (error) {
                console.error(`Gemini Fetch Error (Attempt ${i + 1}/${retries}):`, error);
                if (i === retries - 1) {
                    return "An error occurred while fetching the explanation. Please check your network connection.";
                }
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            }
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

            if (autoGeminiExplanationArea) {
                autoGeminiExplanationArea.style.display = 'block';
                autoGeminiExplanationArea.innerHTML = '<div class="spinner"></div><p>Loading explanation...</p>';

                const currentQuestion = questionsForQuiz[currentQuestionIndex];
                
                if (currentQuestion.explanation && currentQuestion.explanation.trim() !== '') {
                    autoGeminiExplanationArea.innerHTML = formatExplanation(currentQuestion.explanation);
                } else {
                    // 🟢 START: FIX - Added logic to save explanation back to DB 🟢
                    try {
                        const explanation = await getGeminiExplanationWithRetry(currentQuestion.question, correctAnswer);
                        autoGeminiExplanationArea.innerHTML = formatExplanation(explanation);
                        
                        // Save the new explanation to Firestore
                        // This will only work if the user is an admin, due to security rules.
                        // This is a failsafe; explanations should ideally be added via the admin panel.
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists() && userDoc.data().isAdmin === true) {
                           const questionRef = doc(db, "quizzes", currentQuestion.id);
                           await updateDoc(questionRef, { explanation: explanation });
                           currentQuestion.explanation = explanation; // Update local cache
                        }
                    } catch(error) {
                        console.error("Error during explanation generation/saving:", error);
                        // The formatExplanation function will handle displaying the error message.
                        autoGeminiExplanationArea.innerHTML = formatExplanation(error.message);
                    }
                    // 🟢 END: FIX 🟢
                }
            }
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
    backToTopicsBtn.addEventListener('click', () => window.history.back());
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
    showResultButton.addEventListener('click', endQuiz);
    bookmarkButton.addEventListener('click', toggleBookmark);
});
