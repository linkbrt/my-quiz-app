// src/pages/AdminDashboardPage.tsx (Обновлен)
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { IsAdminCheck } from '../components/IsAdminCheck';

const AdminDashboardPage: FC = () => {
    return (
        <IsAdminCheck fallback={<p>У вас нет доступа к панели администратора.</p>}>
            <div className="container">
                <h1>Панель администратора</h1>
                <p>Здесь вы можете управлять разделами и квизами.</p>
                <nav style={{ marginTop: '30px' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/admin/sections/create" className="button">Создать новый раздел</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/admin/quizzes/create-and-import" className="button">Создать квиз и импортировать вопросы</Link> {/* <<< НОВАЯ ССЫЛКА */}
                        </li>
                        {/* Вы можете удалить ссылки на старые страницы AdminCreateQuizPage и AdminImportQuestionsPage, если они вам больше не нужны */}
                    </ul>
                </nav>
            </div>
        </IsAdminCheck>
    );
};

export default AdminDashboardPage;