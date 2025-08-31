// src/components/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
    user_id: string;
    username: string;
    is_admin: boolean;
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
                    const response = await fetch('http://localhost:8000/api/v1/users/me/', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        console.log("Данные пользователя:", userData);
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