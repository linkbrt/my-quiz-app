import { useState, useEffect, type SetStateAction } from 'react';

interface Question {
    question: string;
    options: string[];
    correct_answer: string;
    sectionName?: string;
}

interface QuizScreenProps {
    questions: Question[];
    currentQuestionIndex: number;
    onAnswer: (answer: any) => void;
    onNextQuestion: () => void;
}

function QuizScreen({ questions, currentQuestionIndex, onAnswer, onNextQuestion }: QuizScreenProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // null, true, false
    const [answered, setAnswered] = useState(false); // Для предотвращения повторных ответов

    const currentQuestion = questions[currentQuestionIndex];

    // Сброс состояния при смене вопроса
    useEffect(() => {
        setSelectedOption(null);
        setFeedback('');
        setIsCorrect(null);
        setAnswered(false);
    }, [currentQuestionIndex, questions]); // Зависит от индекса и самих вопросов

    const handleOptionClick = (option: string | SetStateAction<null>) => {
        if (answered) return; // Если уже ответили, игнорируем клик

        setSelectedOption(option as string);
        setAnswered(true);

        const correct = (option === currentQuestion.correct_answer);
        setIsCorrect(correct);

        if (correct) {
            setFeedback('Правильно!');
        } else {
            setFeedback('Неправильно.');
        }

        // Передаем полную информацию о вопросе и ответе в родительский компонент App
        onAnswer({
            question_text: currentQuestion.question,
            user_answer: option,
            correct_answer: currentQuestion.correct_answer,
            is_correct: correct,
            sectionName: currentQuestion.sectionName,
            original_question_data: currentQuestion // Сохраняем полный объект вопроса для пересдачи
        });
    };

    if (!currentQuestion) {
        return <p>Загрузка вопроса...</p>; // Или какой-то спиннер
    }

    return (
        <div id="quiz-screen" className="screen active">
            <h2 id="quiz-header">Вопрос {currentQuestionIndex + 1} из {questions.length}</h2>
            <p id="section-name" className="section-display">{currentQuestion.sectionName || 'Неизвестный раздел'}</p>
            <div className="question-container">
                <p id="question-text">{currentQuestion.question}</p>
                <div id="options-container" className="options-grid">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option-button 
                                ${answered ? 'disabled' : ''} 
                                ${answered && option === currentQuestion.correct_answer ? 'correct' : ''} 
                                ${answered && option === selectedOption && !isCorrect ? 'incorrect' : ''}
                            `}
                            onClick={() => handleOptionClick(option)}
                            disabled={answered}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {feedback && (
                    <div id="feedback" className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {feedback}
                    </div>
                )}
            </div>
            {answered && ( // Кнопка "Далее" показывается только после ответа
                <button id="next-question-btn" onClick={onNextQuestion}>
                    Далее
                </button>
            )}
        </div>
    );
}

export default QuizScreen;