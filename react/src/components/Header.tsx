import { useAuth } from '../components/auth/AuthContext.tsx';
import '../styles/header.css';

function Header() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="app-header">
            <div className="app-layout">
                <div className="header-logo">
                    <a href="/">DevSkill Hub</a>
                </div>
                <nav className="header-nav">
                    {isAuthenticated ? (
                        <>
                            <span className="username-display">Привет, {user?.username || 'Пользователь'}!</span>
                            <a href="/profile" className="profile-link">Личный кабинет</a>
                            <button onClick={logout} className="logout-button">Выйти</button>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="auth-link">Войти</a>
                            <a href="/register" className="auth-link">Регистрация</a>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;