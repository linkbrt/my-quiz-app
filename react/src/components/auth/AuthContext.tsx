// src/components/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
    id: string; // UUID пользователя, должен приходить из сервиса аутентификации
    username: string;
    is_admin?: boolean;
    // ... любые другие данные пользователя, которые вы хотите хранить
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:8000/api/v1/obtain_token', { // Замените на ваш URL
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        Cookies.remove('token');
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error("Ошибка при запросе данных пользователя:", error);
                    Cookies.remove('token');
                    setUser(null);
                    setIsAuthenticated(false);
                }
                const dummyUserId = "123e4567-e89b-12d3-a456-426614174000"; // Пример UUID
                const dummyUsername = "Иван Петров"; 
                setUser({ id: dummyUserId, username: dummyUsername });
                setIsAuthenticated(true);
                setUser(null);
                setIsAuthenticated(false);
            }
        };
        fetchData();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7 }); 
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};