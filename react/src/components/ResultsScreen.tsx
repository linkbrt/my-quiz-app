import React from 'react';

// Названия разделов, должны совпадать с server.js
const SECTION_NAMES = [
    "Основы алгоритмизации и программирования",
    "ЭВМ  и периферийные устройства",
    "Сети и телекоммуникации",
    "Операционные системы",
    "Базы данных"
];

function ResultsScreen({ username, score, totalQuestions, userAnswers, onRetakeMistakes, onPlayAgain }) {
    const incorrectAnswers = userAnswers.filter(answer => !answer.is_correct);

    // Можно использовать для отображения типа теста, если нужно
    // const quizTypeDisplay = userAnswers[0]?.quizType === 'section_based'
    //     ? `по разделу: ${SECTION_NAMES[userAnswers[0].sectionIndex] || 'Неизвестный'}`
    //     : `в режиме: ${userAnswers[0]?.mode === '5' ? '5 вопросов' : userAnswers[0]?.mode === '50' ? '50 вопросов' : userAnswers[0]?.mode === 'all' ? 'Все вопросы' : userAnswers[0]?.mode === 'simulation' ? 'Имитация теста' : 'Неизвестно'}`;

    return (
        <div id="results-screen" className="screen active">
            <h1>Результаты теста</h1>
            <p>Имя пользователя: <strong id="results-username">{username}</strong></p>
            <p>Вы ответили правильно на: <strong id="correct-answers-count">{score}</strong> вопросов</p>
            <p>Вы ответили неправильно на: <strong id="incorrect-answers-count">{incorrectAnswers.length}</strong> вопросов</p>
            <p>Ваш итоговый балл: <strong id="score">{score}</strong> из <strong id="max-score">{totalQuestions}</strong></p>

            <div id="mistakes-summary" className="mistakes-summary">
                <h2>Ваши ошибки:</h2>
                <div id="mistakes-list">
                    {incorrectAnswers.length > 0 ? (
                        incorrectAnswers.map((answer, index) => (
                            <div key={index} className="mistake-item">
                                <p className="question-text">{index + 1}. {answer.question_text}</p>
                                <p>Ваш ответ: <span className="user-answer">{answer.user_answer}</span></p>
                                <p>Правильный ответ: <span className="correct-answer">{answer.correct_answer}</span></p>
                                <p>Раздел: <em>{answer.sectionName || 'Не указан'}</em></p>
                            </div>
                        ))
                    ) : (
                        <p className="no-mistakes-message">Поздравляем! Вы не допустили ошибок.</p>
                    )}
                </div>
                {incorrectAnswers.length > 0 && (
                    <button id="retake-mistakes-btn" onClick={onRetakeMistakes}>Пройти тест с ошибками</button>
                )}
            </div>

            <button id="play-again-btn" onClick={onPlayAgain}>Начать тест заново</button>
        </div>
    );
}

export default ResultsScreen;