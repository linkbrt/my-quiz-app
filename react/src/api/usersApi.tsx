// src/api/quizApi.ts
import Cookies from 'js-cookie';
import type { Question, Section, Quiz, UserQuizAttempt, SubmitAnswerRequest } from '../types/api';

const API_BASE_URL = 'http://localhost:8001/api/v1'; // Замените на адрес вашего FastAPI микросервиса

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

async function fetchWithAuth<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const token = Cookies.get('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.error("Authentication failed or token expired. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
    }

    return response.json() as Promise<T>;
}
