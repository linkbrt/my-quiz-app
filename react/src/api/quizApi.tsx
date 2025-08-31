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
            // Здесь можно вызвать logout() из AuthContext, но это приведет к циклической зависимости
            // Лучше обработать это на более высоком уровне или через события.
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
    }

    return response.json() as Promise<T>;
}

export const quizApi = {
    getSections: (): Promise<Section[]> => fetchWithAuth<Section[]>('/sections/'),
    getSectionById: (sectionId: string): Promise<Section> => fetchWithAuth<Section>(`/sections/${sectionId}`),

    getAllQuizzes: (): Promise<Quiz[]> => fetchWithAuth<Quiz[]>('/'), 
    
    getQuizById: (quizId: string): Promise<Quiz> => fetchWithAuth<Quiz>(`/${quizId}`),
    getQuizzesBySection: (sectionId: string): Promise<Quiz[]> => fetchWithAuth<Quiz[]>(`/section/${sectionId}`),
    
    // Путь уточнен согласно вашему последнему роутеру, но если префикс используется, поправьте.
    getQuestionsByQuiz: (quizId: string): Promise<Question[]> => fetchWithAuth<Question[]>(`/${quizId}/questions`), 
    
    getQuestionById: (questionId: string): Promise<Question> => fetchWithAuth<Question>(`/questions/${questionId}`),
    getUserAttempts: (userId: string): Promise<UserQuizAttempt[]> => fetchWithAuth<UserQuizAttempt[]>(`/user/${userId}/attempts`),
    
    // Заглушки для интерактивных эндпоинтов, если они появятся:
    // startQuiz: (quizId: string, userId: string): Promise<UserQuizAttempt> => fetchWithAuth<UserQuizAttempt>(`/${quizId}/start`, {
    //     method: 'POST',
    //     headers: { 'X-User-ID': userId } // Передаем user_id в заголовке
    // }),
    // submitAnswer: (attemptId: string, payload: SubmitAnswerRequest, userId: string): Promise<UserQuizAttempt> => fetchWithAuth<UserQuizAttempt>(`/attempts/${attemptId}/submit_answer`, {
    //     method: 'POST',
    //     headers: { 'X-User-ID': userId },
    //     body: JSON.stringify(payload)
    // }),
    // finalizeQuiz: (attemptId: string, userId: string): Promise<UserQuizAttempt> => fetchWithAuth<UserQuizAttempt>(`/attempts/${attemptId}/finalize`, {
    //     method: 'POST',
    //     headers: { 'X-User-ID': userId }
    // }),
};