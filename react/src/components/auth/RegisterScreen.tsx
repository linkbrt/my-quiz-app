import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8000/api/v1/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email: "ddgd@agd.ru" }),
            });
            if (response.ok) {
                const data = await response.json();
                
            if (data.username) {
                navigate('/login');
            } else {
                setError('Заполните все поля');
            }
            } else {
                setError('Неверное имя пользователя или пароль');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
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