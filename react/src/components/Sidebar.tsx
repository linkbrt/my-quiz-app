import React from 'react';
import '../styles/sidebar.css'; // Подключаем стили для меню

function Sidebar() {
    return (
        <aside className="app-sidebar">
            <nav>
                <ul>
                    <li><a href="/">Главная</a></li>
                    <li><a href="/courses">Курсы</a></li>
                    <li><a href="/my-progress">Мой прогресс</a></li>
                    <li><a href="/settings">Настройки</a></li>
                    {/* Здесь можно добавить другие пункты меню */}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;