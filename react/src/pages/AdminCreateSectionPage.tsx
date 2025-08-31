// src/pages/AdminCreateSectionPage.tsx
import React, { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import { SectionCreate } from '../types/api';
import { IsAdminCheck } from '../components/IsAdminCheck'; // Убедитесь, что путь правильный
import '../styles/global.css'; // Для стилей форм

const AdminCreateSectionPage: FC = () => {
    const navigate = useNavigate();
    const [sectionData, setSectionData] = useState<SectionCreate>({
        title: '',
        description: '',
        order_index: 0,
        is_published: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSectionData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'order_index' ? parseInt(value) || 0 : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            console.log("Отправляемые данные sectionData:", sectionData);
            const newSection = await quizApi.createSection(sectionData);
            setSuccess(`Раздел "${newSection.title}" успешно создан!`);
            setSectionData({ title: '', description: '', order_index: 0, is_published: false }); // Очистить форму
            navigate(`/sections/${newSection.id}/quizzes`); // Перейти к квизам нового раздела
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <IsAdminCheck fallback={<p>Недостаточно прав для создания раздела.</p>}>
            <div className="container">
                <h1>Создать новый раздел квизов</h1>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="title">Название раздела:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={sectionData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Описание:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={sectionData.description || ''}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="order_index">Порядковый номер:</label>
                        <input
                            type="number"
                            id="order_index"
                            name="order_index"
                            value={sectionData.order_index}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={sectionData.is_published}
                            onChange={handleChange}
                        />
                        <label htmlFor="is_published">Опубликовать</label>
                    </div>
                    <button type="submit" disabled={loading} className="button primary">
                        {loading ? 'Создание...' : 'Создать раздел'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </form>
            </div>
        </IsAdminCheck>
    );
};

export default AdminCreateSectionPage;