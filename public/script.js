document.addEventListener('DOMContentLoaded', () => {
    // --- Получение ссылок на элементы DOM ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');

    const usernameInput = document.getElementById('username');
    const quizModeRadios = document.querySelectorAll('input[name="quiz-mode"]');
    const startQuizBtn = document.getElementById('start-quiz-btn');

    const quizHeader = document.getElementById('quiz-header');
    const currentQuestionNumberSpan = document.getElementById('current-question-number');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackDiv = document.getElementById('feedback');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const sectionNameDisplay = document.getElementById('section-name');

    const resultsUsernameSpan = document.getElementById('results-username');
    const correctAnswersCountSpan = document.getElementById('correct-answers-count');
    const incorrectAnswersCountSpan = document.getElementById('incorrect-answers-count');
    const scoreSpan = document.getElementById('score');
    const maxScoreSpan = document.getElementById('max-score');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Переменные состояния викторины ---
    let userName = '';
    let quizMode = '50'; // По умолчанию 50 вопросов
    let questionsForCurrentSession = []; // Массив вопросов для текущей сессии
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = []; // Для сохранения ответов пользователя (для отправки на сервер)

    // --- Вспомогательные функции для управления экранами ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.remove('hidden');
        document.getElementById(screenId).classList.add('active');
    }

    // --- Инициализация и запуск викторины ---
    startQuizBtn.addEventListener('click', async () => {
        userName = usernameInput.value.trim();
        if (!userName) {
            alert('Пожалуйста, введите ваше имя!');
            return;
        }

        quizMode = document.querySelector('input[name="quiz-mode"]:checked').value;

        // Сброс состояния для нового теста
        questionsForCurrentSession = [];
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        feedbackDiv.textContent = '';
        feedbackDiv.classList.remove('correct', 'incorrect');
        nextQuestionBtn.classList.add('hidden');

        try {
            // Запрашиваем вопросы с сервера с учетом выбранного режима
            // ИСПОЛЬЗУЕМ ОТНОСИТЕЛЬНЫЕ ПУТИ, так как бэкенд и фронтенд на одном домене
            const response = await fetch(`/api/questions?mode=${quizMode}`);
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке вопросов: ${response.status}`);
            }
            questionsForCurrentSession = await response.json();

            if (questionsForCurrentSession.length === 0) {
                alert('Не удалось загрузить вопросы. Пожалуйста, попробуйте позже или выберите другой режим.');
                console.error('Сервер вернул пустой список вопросов.');
                showScreen('start-screen'); // Возвращаемся на старт
                return;
            }

            totalQuestionsSpan.textContent = questionsForCurrentSession.length;
            displayQuestion();
            showScreen('quiz-screen');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Произошла ошибка при загрузке теста: ${error.message}`);
            showScreen('start-screen'); // Возвращаемся на старт
        }
    });

    // --- Отображение текущего вопроса ---
    function displayQuestion() {
        const currentQuestion = questionsForCurrentSession[currentQuestionIndex];
        if (!currentQuestion) {
            showResults(); // Если вопросов больше нет, показываем результаты
            return;
        }

        currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;
        questionText.textContent = currentQuestion.question;
        sectionNameDisplay.textContent = currentQuestion.sectionName;
        optionsContainer.innerHTML = ''; // Очищаем предыдущие варианты

        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            // Используем замыкание для передачи выбранного варианта
            button.addEventListener('click', () => handleAnswerClick(button, option, currentQuestion.correct_answer));
            optionsContainer.appendChild(button);
        });

        feedbackDiv.textContent = ''; // Очищаем обратную связь
        feedbackDiv.classList.remove('correct', 'incorrect'); // Удаляем классы обратной связи
        nextQuestionBtn.classList.add('hidden'); // Скрываем кнопку "Далее" до ответа
    }

    // --- Обработка выбора ответа ---
    function handleAnswerClick(clickedButton, selectedOption, correctAnswer) {
        // Отключаем все кнопки вариантов, чтобы нельзя было выбрать несколько раз
        document.querySelectorAll('.option-button').forEach(button => {
            button.classList.add('disabled');
            button.disabled = true; // Отключаем интерактивность
        });

        const isCorrect = (selectedOption === correctAnswer);

        if (isCorrect) {
            score++;
            feedbackDiv.textContent = 'Правильно!';
            feedbackDiv.classList.add('correct');
            feedbackDiv.classList.remove('incorrect');
            clickedButton.classList.add('correct');
        } else {
            feedbackDiv.textContent = 'Неправильно.';
            feedbackDiv.classList.add('incorrect');
            feedbackDiv.classList.remove('correct');
            clickedButton.classList.add('incorrect');

            // Подсвечиваем правильный ответ
            document.querySelectorAll('.option-button').forEach(button => {
                if (button.textContent === correctAnswer) {
                    button.classList.add('correct');
                }
            });
        }

        // Сохраняем ответ пользователя для отправки на сервер
        userAnswers.push({
            question: questionsForCurrentSession[currentQuestionIndex].question,
            user_answer: selectedOption,
            correct_answer: correctAnswer,
            is_correct: isCorrect
        });

        nextQuestionBtn.classList.remove('hidden'); // Показываем кнопку "Далее"
    }

    // --- Переход к следующему вопросу или результатам ---
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questionsForCurrentSession.length) {
            displayQuestion();
        } else {
            showResults();
        }
    });

    // --- Отображение результатов и отправка на сервер ---
    async function showResults() {
        showScreen('results-screen');

        const totalQuestionsCount = questionsForCurrentSession.length;
        const incorrectAnswersCount = totalQuestionsCount - score;

        resultsUsernameSpan.textContent = userName;
        correctAnswersCountSpan.textContent = score;
        incorrectAnswersCountSpan.textContent = incorrectAnswersCount;
        scoreSpan.textContent = score;
        maxScoreSpan.textContent = totalQuestionsCount;

        // --- Отправка результатов на сервер ---
        console.log('Отправка результатов на сервер...');
        try {
            // ИСПОЛЬЗУЕМ ОТНОСИТЕЛЬНЫЙ ПУТЬ, так как бэкенд и фронтенд на одном домене
            const response = await fetch('/api/submit-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: userName,
                    mode: quizMode,
                    score: score,
                    totalQuestions: totalQuestionsCount,
                    answers: userAnswers,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка при сохранении результатов: ${errorData.message || response.statusText}`);
            }
            console.log('Результаты успешно отправлены на сервер!');
        } catch (error) {
            console.error('Ошибка при отправке результатов:', error);
            alert(`Не удалось сохранить результаты на сервере: ${error.message}`);
        }
    }

    // --- Начать тест заново ---
    playAgainBtn.addEventListener('click', () => {
        // Сброс всех переменных состояния
        userName = '';
        usernameInput.value = ''; // Очищаем поле ввода имени
        quizMode = '50'; // Сбрасываем режим на дефолтный
        document.querySelector('input[name="quiz-mode"][value="50"]').checked = true;

        questionsForCurrentSession = []; // Сброс вопросов текущей сессии
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];

        showScreen('start-screen');
    });

    // Инициализация: показываем стартовый экран при загрузке страницы
    showScreen('start-screen');
});