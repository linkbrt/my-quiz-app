import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Введите имя пользователя и пароль');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/v1/tokens/obtain_token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Получен токен:', data.access_token);
                document.cookie = `token=${data.access_token}; path=/`;
                onLogin(username);
                navigate('/');
            } else {
                setError('Неверное имя пользователя или пароль');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        }
    };

    return (
        <div className="container">
            <h1>Вход</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Пароль</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">Войти</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button onClick={() => navigate('/register')}>Регистрация</button>
        </div>
    );
};

export default LoginScreen;