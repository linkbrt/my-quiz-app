// src/App.tsx
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import SectionsPage from './pages/SectionsPage';
import QuizzesBySectionPage from './pages/QuizzesBySectionPage';
import QuizDetailsPage from './pages/QuizDetailsPage';
import QuizAttemptPage from './pages/QuizAttemptPage';
import UserAttemptsPage from './pages/UserAttemptsPage';
import './styles/global.css';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import AdminCreateAndImportQuizPage from './pages/AdminCreateAndImportQuizPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreateSectionPage from './pages/AdminCreateSectionPage';

const App: FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <div className="app-layout">
                    <Sidebar />
                    <main className="app-content">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/sections" element={<SectionsPage />} />
                            <Route path="/sections/:sectionId/quizzes" element={<QuizzesBySectionPage />} />
                            <Route path="/quizzes/:quizId" element={<QuizDetailsPage />} />
                            <Route path="/quiz/:quizId/take" element={<QuizAttemptPage />} /> 
                            <Route path="/my-attempts" element={<UserAttemptsPage />} />
                            <Route path="/login" element={<LoginScreen onLogin={() => {}} />} /> 
                            <Route path="/register" element={<RegisterScreen />} /> 
                            <Route path="/profile" element={<div>Страница профиля пользователя</div>} /> 

                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="/admin/sections/create" element={<AdminCreateSectionPage />} />'
                            <Route path="/admin/quizzes/create-and-import" element={<AdminCreateAndImportQuizPage />} />
                            <Route path="*" element={<div>404: Страница не найдена</div>} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
};

export default App;