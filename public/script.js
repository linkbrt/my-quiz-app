document.addEventListener('DOMContentLoaded', () => {
    // --- Получение ссылок на элементы DOM ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');

    const usernameInput = document.getElementById('username');
    const quizTypeRadios = document.querySelectorAll('input[name="quiz-type"]'); // <--- НОВОЕ
    const modeOptionsDiv = document.querySelector('.mode-options'); // <--- НОВОЕ
    const quizModeRadios = document.querySelectorAll('input[name="quiz-mode"]');
    const sectionSelect = document.getElementById('section-select'); // <--- НОВОЕ
    const startQuizBtn = document.getElementById('start-quiz-btn');

    const quizHeader = document.getElementById('quiz-header');
    const currentQuestionNumberSpan = document.getElementById('current-question-number');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const sectionNameDisplay = document.getElementById('section-name');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackDiv = document.getElementById('feedback');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    const resultsUsernameSpan = document.getElementById('results-username');
    const correctAnswersCountSpan = document.getElementById('correct-answers-count');
    const incorrectAnswersCountSpan = document.getElementById('incorrect-answers-count');
    const scoreSpan = document.getElementById('score');
    const maxScoreSpan = document.getElementById('max-score');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Переменные состояния викторины ---
    let userName = '';
    let selectedQuizType = 'mode_based'; // 'mode_based' или 'section_based'
    let selectedMode = '50'; // Для 'mode_based'
    let selectedSectionIndex = null; // Для 'section_based'
    let questionsForCurrentSession = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];

    // Названия разделов, должны совпадать с server.js
    // Используем эти названия для заполнения выпадающего списка
    const SECTION_NAMES = [
        "Основы алгоритмизации и программирования",
        "ЭВМ  и периферийные устройства",
        "Сети и телекоммуникации",
        "Операционные системы",
        "Базы данных"
    ];

    // --- Вспомогательные функции для управления экранами ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.remove('hidden');
        document.getElementById(screenId).classList.add('active');
    }

    // --- Инициализация выпадающего списка разделов ---
    function populateSectionSelect() {
        sectionSelect.innerHTML = '<option value="">Выберите раздел</option>'; // Очищаем и добавляем дефолтную опцию
        SECTION_NAMES.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index; // Отправляем индекс раздела на бэкенд
            option.textContent = name;
            sectionSelect.appendChild(option);
        });
    }

    // --- Логика переключения между выбором режима и выбором раздела ---
    function updateQuizTypeSelection() {
        selectedQuizType = document.querySelector('input[name="quiz-type"]:checked').value;

        if (selectedQuizType === 'mode_based') {
            modeOptionsDiv.style.display = 'block';
            sectionSelect.disabled = true;
            // Убедимся, что выбран хоть какой-то режим, если его не было
            selectedMode = document.querySelector('input[name="quiz-mode"]:checked')?.value || '50';
            selectedSectionIndex = null;
        } else if (selectedQuizType === 'section_based') {
            modeOptionsDiv.style.display = 'none';
            sectionSelect.disabled = false;
            // Убедимся, что выбран хоть какой-то раздел, если его не было
            selectedSectionIndex = sectionSelect.value === '' ? null : parseInt(sectionSelect.value);
            selectedMode = null;
        }
    }

    // --- Обработчики событий для радио-кнопок и селекта ---
    quizTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateQuizTypeSelection);
    });

    quizModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (document.querySelector('input[name="quiz-type"][value="mode_based"]').checked) {
                selectedMode = radio.value;
            }
        });
    });

    sectionSelect.addEventListener('change', () => {
        if (document.querySelector('input[name="quiz-type"][value="section_based"]').checked) {
            selectedSectionIndex = sectionSelect.value === '' ? null : parseInt(sectionSelect.value);
        }
    });


    // --- Инициализация и запуск викторины ---
    startQuizBtn.addEventListener('click', async () => {
        userName = usernameInput.value.trim();
        if (!userName) {
            alert('Пожалуйста, введите ваше имя!');
            return;
        }

        // Проверка выбранного режима/раздела перед стартом
        if (selectedQuizType === 'mode_based' && !selectedMode) {
            alert('Пожалуйста, выберите режим теста (50 вопросов, Все вопросы, Имитация теста).');
            return;
        }
        if (selectedQuizType === 'section_based' && (selectedSectionIndex === null || isNaN(selectedSectionIndex))) {
            alert('Пожалуйста, выберите раздел для прохождения теста.');
            return;
        }


        // Сброс состояния для нового теста
        questionsForCurrentSession = [];
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        feedbackDiv.textContent = '';
        feedbackDiv.classList.remove('correct', 'incorrect');
        nextQuestionBtn.classList.add('hidden');

        try {
            let apiUrl = '/api/questions?';
            if (selectedQuizType === 'mode_based') {
                apiUrl += `mode=${selectedMode}`;
            } else { // 'section_based'
                apiUrl += `sectionIndex=${selectedSectionIndex}`;
            }

            const response = await fetch(apiUrl); // Отправляем запрос с соответствующими параметрами
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке вопросов: ${response.status}`);
            }
            questionsForCurrentSession = await response.json();

            if (questionsForCurrentSession.length === 0) {
                alert('Не удалось загрузить вопросы. Пожалуйста, попробуйте позже или выберите другой режим/раздел.');
                console.error('Сервер вернул пустой список вопросов.');
                showScreen('start-screen');
                return;
            }

            totalQuestionsSpan.textContent = questionsForCurrentSession.length;
            displayQuestion();
            showScreen('quiz-screen');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Произошла ошибка при загрузке теста: ${error.message}`);
            showScreen('start-screen');
        }
    });

    // --- Отображение текущего вопроса ---
    function displayQuestion() {
        const currentQuestion = questionsForCurrentSession[currentQuestionIndex];
        if (!currentQuestion) {
            showResults();
            return;
        }

        currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;
        sectionNameDisplay.textContent = currentQuestion.sectionName;
        questionText.textContent = currentQuestion.question;
        optionsContainer.innerHTML = '';

        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.addEventListener('click', () => handleAnswerClick(button, option, currentQuestion.correct_answer));
            optionsContainer.appendChild(button);
        });

        feedbackDiv.textContent = '';
        feedbackDiv.classList.remove('correct', 'incorrect');
        nextQuestionBtn.classList.add('hidden');
    }

    // --- Обработка выбора ответа ---
    function handleAnswerClick(clickedButton, selectedOption, correctAnswer) {
        document.querySelectorAll('.option-button').forEach(button => {
            button.classList.add('disabled');
            button.disabled = true;
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

            document.querySelectorAll('.option-button').forEach(button => {
                if (button.textContent === correctAnswer) {
                    button.classList.add('correct');
                }
            });
        }

        userAnswers.push({
            question: questionsForCurrentSession[currentQuestionIndex].question,
            user_answer: selectedOption,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            sectionName: questionsForCurrentSession[currentQuestionIndex].sectionName // Добавляем раздел в сохраняемые ответы
        });

        nextQuestionBtn.classList.remove('hidden');
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

        console.log('Отправка результатов на сервер...');
        try {
            const response = await fetch('/api/submit-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: userName,
                    quizType: selectedQuizType, // Тип теста (режимный или по разделу)
                    mode: selectedMode, // Если режимный
                    sectionIndex: selectedSectionIndex, // Если по разделу
                    sectionName: selectedQuizType === 'section_based' ? SECTION_NAMES[selectedSectionIndex] : null, // Название раздела
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
        usernameInput.value = '';
        document.querySelector('input[name="quiz-type"][value="mode_based"]').checked = true; // Сбрасываем тип на "режимы"
        selectedQuizType = 'mode_based';
        selectedMode = '50'; // Сбрасываем режим на дефолтный
        document.querySelector('input[name="quiz-mode"][value="50"]').checked = true;
        selectedSectionIndex = null; // Сбрасываем выбранный раздел
        sectionSelect.value = ''; // Очищаем выбор в селекте

        questionsForCurrentSession = [];
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];

        updateQuizTypeSelection(); // Обновим состояние элементов формы
        showScreen('start-screen');
    });

    // --- Инициализация при загрузке страницы ---
    populateSectionSelect(); // Заполняем выпадающий список разделов
    updateQuizTypeSelection(); // Устанавливаем начальное состояние формы
    showScreen('start-screen');
});