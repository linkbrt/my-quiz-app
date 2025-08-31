// src/components/IsAdminCheck.tsx
import React, { FC, ReactNode } from 'react';
import { useAuth } from './auth/AuthContext'; // Путь к вашему AuthContext

interface IsAdminCheckProps {
    children: ReactNode;
    fallback?: ReactNode; // Что отображать, если пользователь не админ
}

export const IsAdminCheck: FC<IsAdminCheckProps> = ({ children, fallback = null }) => {
    const { isAuthenticated } = useAuth();

    const isAdmin = isAuthenticated;

    return isAdmin ? <>{children}</> : <>{fallback}</>;
};