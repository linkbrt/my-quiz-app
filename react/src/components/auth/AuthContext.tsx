import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie'; // Используем библиотеку для удобной работы с куками


interface AuthContextProps {
    user: any;
    isAuthenticated: boolean;
    login: (token: string, userData: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<any>(null); // Замените any на конкретный тип пользователя, если он известен
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // При загрузке приложения проверяем наличие токена в куках
        const token = Cookies.get('token');
        if (token) {
            // В реальном приложении здесь должен быть запрос к серверу
            // для валидации токена и получения информации о пользователе.
            // Для примера, пока что просто устанавливаем пользователя.
            // Предположим, что токен содержит закодированное имя пользователя,
            // или мы получаем его другим способом после успешной авторизации.
            const dummyUsername = "Иван Петров"; // Замените на реальное получение имени из токена или API
            setUser({ username: dummyUsername });
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const login = (token: any, userData: any) => {
        // При логине сохраняем токен в куки
        Cookies.set('token', token, { expires: 7 }); // Токен будет храниться 7 дней
        setUser(userData);
        setIsAuthenticated(true);
        // В реальном приложении здесь можно перенаправить пользователя на главную страницу
    };

    const logout = () => {
        // При выходе удаляем токен из куки
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
        // В реальном приложении здесь можно перенаправить пользователя на страницу логина
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};