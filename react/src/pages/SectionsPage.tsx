// src/pages/SectionsPage.tsx
import React, { useEffect, useState, FC } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import { Section } from '../types/api';

const SectionsPage: FC = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSections() {
            try {
                const data = await quizApi.getSections();
                setSections(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSections();
    }, []);

    if (loading) return <p>Загрузка разделов...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="container">
            <h1>Доступные разделы квизов</h1>
            <div className="sections-grid">
                {sections.length > 0 ? (
                    sections.map(section => (
                        <div key={section.id} className="section-card">
                            <h2>{section.title}</h2>
                            <p>{section.description}</p>
                            <Link to={`/sections/${section.id}/quizzes`} className="button small">
                                Посмотреть квизы
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>Пока нет доступных разделов.</p>
                )}
            </div>
        </div>
    );
};

export default SectionsPage;