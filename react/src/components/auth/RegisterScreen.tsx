import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Здесь должна быть логика регистрации (например, запрос к серверу)
        if (username && password) {
            // После успешной регистрации можно перенаправить на экран входа
            navigate('/login');
        } else {
            setError('Заполните все поля');
        }
    };

    return (
        <div>
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Зарегистрироваться</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button onClick={() => navigate('/login')}>Уже есть аккаунт?</button>
        </div>
    );
};

export default RegisterScreen;