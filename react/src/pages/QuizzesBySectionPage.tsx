// src/pages/QuizzesBySectionPage.tsx
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import type { Section, Quiz } from '../types/api';

const QuizzesBySectionPage: FC = () => {
    const { sectionId } = useParams<{ sectionId: string }>();
    const [section, setSection] = useState<Section | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!sectionId) return;

            try {
                const sectionData = await quizApi.getSectionById(sectionId);
                setSection(sectionData);
                const quizzesData = await quizApi.getQuizzesBySection(sectionId);
                setQuizzes(quizzesData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [sectionId]);

    if (loading) return <p>Загрузка квизов...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="container">
            <h1>Квизы в разделе: {section ? section.title : 'Неизвестный раздел'}</h1>
            <div className="quizzes-list">
                {quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                        <div key={quiz.id} className="quiz-card">
                            <h2>{quiz.title}</h2>
                            <p>{quiz.description}</p>
                            <p>Вопросов: {quiz.num_questions_to_show}</p>
                            <p>Проходной балл: {(quiz.passing_score * 100).toFixed(0)}%</p>
                            <Link to={`/quizzes/${quiz.id}`} className="button small">
                                Подробнее
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>В этом разделе пока нет квизов.</p>
                )}
            </div>
        </div>
    );
};

export default QuizzesBySectionPage;