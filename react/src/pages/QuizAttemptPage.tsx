// src/pages/QuizAttemptPage.tsx
import React, { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import QuestionDisplay from '../components/QuestionDisplay';
import { useAuth } from '../components/auth/AuthContext';
import { Question, QuestionType } from '../types/api';

const QuizAttemptPage: FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({}); // {questionId: chosenAnswerIds/text}
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            alert("Для прохождения квиза необходимо авторизоваться.");
            navigate('/login');
            return;
        }

        async function fetchQuizData() {
            if (!quizId) return;
            try {
                // Здесь в идеале должен быть вызов startQuiz и получение initial questions
                // Но так как у нас нет такого эндпоинта, просто получаем вопросы для квиза.
                const fetchedQuestions = await quizApi.getQuestionsByQuiz(quizId);
                setQuestions(fetchedQuestions);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchQuizData();
    }, [quizId, isAuthenticated, user?.id, navigate]);

    const handleAnswerChange = (questionId: string, value: string | string[]) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitAnswer = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        const answer = userAnswers[currentQuestion.id];
        if (!answer) {
            alert("Пожалуйста, выберите ответ.");
            return;
        }

        // Здесь должна быть логика отправки ответа на бэкенд
        // const chosenAnswerIds = Array.isArray(answer) ? answer : [answer]; // Для single_choice/multiple_choice
        // const userTextAnswer = typeof answer === 'string' ? answer : undefined; // Для text_input
        // await quizApi.submitAnswer(attemptId, currentQuestion.id, chosenAnswerIds, userTextAnswer, user.id);
        
        alert(`Ответ на вопрос ${currentQuestion.id} отправлен: ${JSON.stringify(answer)}`);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Если это последний вопрос, финализируем квиз
            // await quizApi.finalizeQuiz(attemptId, user.id);
            alert("Квиз завершен!");
            navigate(`/user/${user?.id}/attempts`); // Перенаправить на результаты
        }
    };

    if (loading) return <p>Загрузка квиза...</p>;
    if (error) return <p>Ошибка: {error}</p>;
    if (questions.length === 0) return <p>Квиз пуст или вопросы не найдены.</p>;

    const question = questions[currentQuestionIndex];

    return (
        <div className="container quiz-attempt-page">
            <h1>Прохождение квиза: {quizId}</h1>
            <h2>Вопрос {currentQuestionIndex + 1} из {questions.length}</h2>

            <div className="question-block">
                <QuestionDisplay questionContent={question.question_text} />
            </div>

            <div className="answers-block" style={{ marginTop: '20px' }}>
                {question.question_type === QuestionType.SINGLE_CHOICE && (
                    question.answers.map(answer => (
                        <label key={answer.id} style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                value={answer.id}
                                checked={userAnswers[question.id] === answer.id}
                                onChange={() => handleAnswerChange(question.id, answer.id)}
                            />
                            {answer.answer_text}
                        </label>
                    ))
                )}
                {question.question_type === QuestionType.MULTIPLE_CHOICE && (
                    question.answers.map(answer => (
                        <label key={answer.id} style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="checkbox"
                                name={`question_${question.id}`}
                                value={answer.id}
                                checked={Array.isArray(userAnswers[question.id]) && (userAnswers[question.id] as string[]).includes(answer.id)}
                                onChange={(e) => {
                                    const currentSelected = Array.isArray(userAnswers[question.id]) ? (userAnswers[question.id] as string[]) : [];
                                    const newSelected = e.target.checked
                                        ? [...currentSelected, answer.id]
                                        : currentSelected.filter(id => id !== answer.id);
                                    handleAnswerChange(question.id, newSelected);
                                }}
                            />
                            {answer.answer_text}
                        </label>
                    ))
                )}
                {question.question_type === QuestionType.TEXT_INPUT && (
                    <textarea
                        placeholder="Введите ваш ответ"
                        value={typeof userAnswers[question.id] === 'string' ? (userAnswers[question.id] as string) : ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '10px', marginTop: '10px' }}
                    />
                )}
            </div>

            <button onClick={handleSubmitAnswer} className="button primary" style={{ marginTop: '30px' }}>
                {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить квиз'}
            </button>
        </div>
    );
};

export default QuizAttemptPage;