// src/components/Sidebar.tsx
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';
import { useAuth } from './auth/AuthContext';

const Sidebar: FC = () => {
    const { user, isAuthenticated } = useAuth();
    return (
        <aside className="app-sidebar">
            <nav>
                <ul>
                    <li><NavLink to="/" end>Главная</NavLink></li>
                    <li><NavLink to="/sections">Разделы квизов</NavLink></li>
                    {isAuthenticated && <li><NavLink to="/my-attempts">Мои попытки</NavLink></li>}
                    {isAuthenticated && <li><NavLink to="/settings">Настройки</NavLink></li>}
                    {isAuthenticated && user?.is_admin && <li><NavLink to="/admin">Администрирование</NavLink></li>}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;