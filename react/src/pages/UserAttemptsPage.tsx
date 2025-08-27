// src/pages/UserAttemptsPage.tsx
import React, { useEffect, useState, FC } from 'react';
import { quizApi } from '../api/quizApi';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserQuizAttempt } from '../types/api';

const UserAttemptsPage: FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            alert("Вы должны быть авторизованы для просмотра истории попыток.");
            navigate('/login');
            return;
        }

        async function fetchUserAttempts() {
            try {
                const data = await quizApi.getUserAttempts(user.id);
                setAttempts(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUserAttempts();
    }, [isAuthenticated, user?.id, navigate]);

    if (loading) return <p>Загрузка истории попыток...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="container user-attempts-page">
            <h1>Ваши попытки прохождения квизов</h1>
            {attempts.length > 0 ? (
                <div className="attempts-list">
                    {attempts.map(attempt => (
                        <div key={attempt.id} className="attempt-card">
                            <h3>Квиз ID: {attempt.quiz_id}</h3>
                            <p>Попытка №: {attempt.attempt_number}</p>
                            <p>Балл: {attempt.score !== null ? `${(attempt.score * 100).toFixed(2)}%` : 'N/A'}</p>
                            <p>Статус: {attempt.is_passed ? 'Пройден' : (attempt.is_passed === false ? 'Не пройден' : 'В процессе')}</p>
                            <p>Начато: {new Date(attempt.started_at).toLocaleString()}</p>
                            {attempt.finished_at && <p>Завершено: {new Date(attempt.finished_at).toLocaleString()}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <p>У вас пока нет попыток прохождения квизов.</p>
            )}
        </div>
    );
};

export default UserAttemptsPage;