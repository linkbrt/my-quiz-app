// src/pages/HomePage.tsx
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

const HomePage: FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="container">
            <h1>Добро пожаловать на платформу квизов!</h1>
            <p>Проверьте свои знания в различных областях программирования.</p>
            
            {isAuthenticated && user ? (
                <p>Привет, {user.username}! Начните изучение, выбрав раздел квизов.</p>
            ) : (
                <p>Для доступа к квизам, пожалуйста, <Link to="/login">войдите</Link> или <Link to="/register">зарегистрируйтесь</Link>.</p>
            )}

            <div style={{ marginTop: '30px' }}>
                <Link to="/sections" className="button">Посмотреть все разделы</Link>
            </div>
        </div>
    );
};

export default HomePage;