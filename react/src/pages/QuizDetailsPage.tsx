// src/pages/QuizDetailsPage.tsx
import React, { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import { useAuth } from '../components/auth/AuthContext';
import { Quiz, Question } from '../types/api';

const QuizDetailsPage: FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!quizId) return;

            try {
                const quizData = await quizApi.getQuizById(quizId);
                setQuiz(quizData.quiz);
                setQuestions(quizData.questions);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [quizId]);

    const handleStartQuiz = async () => {
        if (!isAuthenticated || !user?.user_id) {
            alert("Вы должны быть авторизованы для начала квиза!");
            navigate('/login');
            return;
        }
        // Здесь должна быть логика вызова эндпоинта 'start_quiz'
        // Например: const attempt = await quizApi.startQuiz(quiz.id, user.id);
        // navigate(`/quiz/${attempt.id}`); // Перенаправить на страницу прохождения квиза
        alert("Функционал начала квиза пока не реализован на бэкенде. Отображаем вопросы.");
        navigate(`/quiz/${quizId}/take`); // Временный переход для демонстрации вопросов
    };

    if (loading) return <p>Загрузка деталей квиза...</p>;
    if (error) return <p>Ошибка: {error}</p>;
    if (!quiz) return <p>Квиз не найден.</p>;

    return (
        <div className="container quiz-details">
            <h1>{quiz.title}</h1>
            <p className="quiz-description">{quiz.description}</p>
            <p><strong>Количество вопросов:</strong> {quiz.num_questions_to_show}</p>
            <p><strong>Проходной балл:</strong> {(quiz.passing_score * 100).toFixed(0)}%</p>
            
            <button onClick={handleStartQuiz} className="button primary" style={{ marginTop: '20px' }}>
                Начать квиз
            </button>

            <h2 style={{marginTop: '40px'}}>Обзор вопросов (без ответов)</h2>
            {questions.length > 0 ? (
                <div className="questions-overview">
                    {questions.map((question, index) => (
                        <div key={question.id} className="question-item-overview">
                            <h3>Вопрос {index + 1}</h3>
                            <p>{question.question_text || 'Содержимое вопроса...'}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Вопросы для этого квиза не найдены.</p>
            )}
        </div>
    );
};

export default QuizDetailsPage;