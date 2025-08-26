import React from 'react';
import { AuthProvider } from './components/auth/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './styles/global.css'; // Убедитесь, что глобальные стили подключены

function App() {
    return (
        <AuthProvider>
            <Header />
            <div className="app-layout">
                <Sidebar />
                <main className="app-content">
                    <h1>Добро пожаловать на курсы по языкам программирования!</h1>
                    <p>Здесь будет основное содержимое вашего сайта.</p>
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;