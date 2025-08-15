document.addEventListener('DOMContentLoaded', () => {
    // --- Получение ссылок на элементы DOM ---
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');

    const usernameInput = document.getElementById('username');
    const quizTypeRadios = document.querySelectorAll('input[name="quiz-type"]');
    const modeOptionsDiv = document.querySelector('.mode-options');
    const quizModeRadios = document.querySelectorAll('input[name="quiz-mode"]');
    const sectionSelect = document.getElementById('section-select');
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

    const mistakesListDiv = document.getElementById('mistakes-list'); // <--- НОВОЕ
    const noMistakesMessage = document.querySelector('.no-mistakes-message'); // <--- НОВОЕ
    const retakeMistakesBtn = document.getElementById('retake-mistakes-btn'); // <--- НОВОЕ
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Переменные состояния викторины ---
    let userName = '';
    let selectedQuizType = 'mode_based';
    let selectedMode = '50';
    let selectedSectionIndex = null;
    let questionsForCurrentSession = []; // Вопросы для текущей сессии, включая полную информацию
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = []; // Детальные ответы пользователя для сохранения и анализа ошибок
    let incorrectQuestionsData = []; // <--- НОВОЕ: Для хранения полной информации о вопросах, на которые ответили неверно

    // Названия разделов, должны совпадать с server.js
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
        sectionSelect.innerHTML = '<option value="">Выберите раздел</option>';
        SECTION_NAMES.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index;
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
            selectedMode = document.querySelector('input[name="quiz-mode"]:checked')?.value || '50';
            selectedSectionIndex = null;
        } else if (selectedQuizType === 'section_based') {
            modeOptionsDiv.style.display = 'none';
            sectionSelect.disabled = false;
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

    // --- Основная функция для запуска теста (используется как при первом старте, так и при пересдаче ошибок) ---
    async function startQuizSession(questionsSubset = null) {
        // Сброс состояния для нового теста
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = []; // Важно сбросить для новой сессии
        feedbackDiv.textContent = '';
        feedbackDiv.classList.remove('correct', 'incorrect');
        nextQuestionBtn.classList.add('hidden');

        if (questionsSubset) {
            // Если передан подмножество вопросов (например, для пересдачи ошибок)
            questionsForCurrentSession = questionsSubset;
            console.log(`Начата сессия теста с ${questionsSubset.length} вопросами (пересдача ошибок).`);
        } else {
            // Обычный старт теста, запрос вопросов с сервера
            if (!userName) { // Если userName еще не задан при обычном старте
                userName = usernameInput.value.trim();
                if (!userName) {
                    alert('Пожалуйста, введите ваше имя!');
                    showScreen('start-screen');
                    return;
                }
            }

            // Проверка выбранного режима/раздела перед стартом
            if (selectedQuizType === 'mode_based' && !selectedMode) {
                alert('Пожалуйста, выберите режим теста (50 вопросов, Все вопросы, Имитация теста).');
                showScreen('start-screen');
                return;
            }
            if (selectedQuizType === 'section_based' && (selectedSectionIndex === null || isNaN(selectedSectionIndex))) {
                alert('Пожалуйста, выберите раздел для прохождения теста.');
                showScreen('start-screen');
                return;
            }

            try {
                let apiUrl = '/api/questions?';
                if (selectedQuizType === 'mode_based') {
                    apiUrl += `mode=${selectedMode}`;
                } else { // 'section_based'
                    apiUrl += `sectionIndex=${selectedSectionIndex}`;
                }

                const response = await fetch(apiUrl);
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
                console.log(`Начата сессия теста с ${questionsForCurrentSession.length} вопросами.`);
            } catch (error) {
                console.error('Ошибка:', error);
                alert(`Произошла ошибка при загрузке теста: ${error.message}`);
                showScreen('start-screen');
                return;
            }
        }

        totalQuestionsSpan.textContent = questionsForCurrentSession.length;
        displayQuestion();
        showScreen('quiz-screen');
    }

    // --- Инициализация и запуск викторины (через кнопку) ---
    startQuizBtn.addEventListener('click', () => startQuizSession());


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
            question_text: questionsForCurrentSession[currentQuestionIndex].question, // <--- ИЗМЕНЕНО: используем question_text для ясности
            user_answer: selectedOption,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            sectionName: questionsForCurrentSession[currentQuestionIndex].sectionName,
            // Сохраняем весь объект вопроса, если нужно для повторного теста
            original_question_data: questionsForCurrentSession[currentQuestionIndex] // <--- НОВОЕ: сохраняем полный объект вопроса
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

        // --- Отображение ошибок ---
        mistakesListDiv.innerHTML = ''; // Очищаем предыдущий список
        incorrectQuestionsData = userAnswers.filter(answer => !answer.is_correct)
                                            .map(answer => answer.original_question_data); // Сохраняем полные данные об ошибочных вопросах

        if (incorrectQuestionsData.length > 0) {
            noMistakesMessage.classList.add('hidden');
            incorrectQuestionsData.forEach((mistake, index) => {
                const userAnswerData = userAnswers.find(ua => ua.question_text === mistake.question); // Находим данные ответа пользователя
                
                const mistakeItem = document.createElement('div');
                mistakeItem.classList.add('mistake-item');
                mistakeItem.innerHTML = `
                    <p class="question-text">${index + 1}. ${mistake.question}</p>
                    <p>Ваш ответ: <span class="user-answer">${userAnswerData ? userAnswerData.user_answer : 'Неизвестно'}</span></p>
                    <p>Правильный ответ: <span class="correct-answer">${mistake.correct_answer}</span></p>
                    <p>Раздел: <em>${mistake.sectionName || 'Не указан'}</em></p>
                `;
                mistakesListDiv.appendChild(mistakeItem);
            });
            retakeMistakesBtn.classList.remove('hidden'); // Показываем кнопку пересдачи ошибок
        } else {
            noMistakesMessage.classList.remove('hidden');
            retakeMistakesBtn.classList.add('hidden'); // Скрываем кнопку, если нет ошибок
        }

        // --- Отправка результатов на сервер ---
        console.log('Отправка результатов на сервер...');
        try {
            const response = await fetch('/api/submit-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: userName,
                    quizType: selectedQuizType,
                    mode: selectedMode,
                    sectionIndex: selectedSectionIndex,
                    sectionName: selectedQuizType === 'section_based' ? SECTION_NAMES[selectedSectionIndex] : null,
                    score: score,
                    totalQuestions: totalQuestionsCount,
                    answers: userAnswers.map(a => ({ // Отправляем только нужные поля для экономии места
                        question_text: a.question_text,
                        user_answer: a.user_answer,
                        correct_answer: a.correct_answer,
                        is_correct: a.is_correct,
                        sectionName: a.sectionName
                    })),
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

    // --- Начать тест заново (полный сброс) ---
    playAgainBtn.addEventListener('click', () => {
        userName = '';
        usernameInput.value = '';
        document.querySelector('input[name="quiz-type"][value="mode_based"]').checked = true;
        selectedQuizType = 'mode_based';
        selectedMode = '50';
        document.querySelector('input[name="quiz-mode"][value="50"]').checked = true;
        selectedSectionIndex = null;
        sectionSelect.value = '';

        questionsForCurrentSession = [];
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        incorrectQuestionsData = []; // Сброс списка ошибок

        updateQuizTypeSelection();
        showScreen('start-screen');
    });

    // --- Перезапуск теста только с ошибками ---
    retakeMistakesBtn.addEventListener('click', () => {
        if (incorrectQuestionsData.length > 0) {
            // Перемешиваем вопросы с ошибками для нового теста
            const questionsToRetake = shuffleArray([...incorrectQuestionsData]);
            startQuizSession(questionsToRetake); // Запускаем новую сессию с ошибочными вопросами
        } else {
            alert('Нет ошибок для повторного прохождения.');
            retakeMistakesBtn.classList.add('hidden');
        }
    });

    // --- Инициализация при загрузке страницы ---
    populateSectionSelect();
    updateQuizTypeSelection();
    showScreen('start-screen');

    // Функция для перемешивания массива (повтор из server.js для фронтенда)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});