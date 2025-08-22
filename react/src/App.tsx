import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import StartScreen from './components/StartScreen.tsx'; // <--- Убедитесь, что здесь .tsx
import QuizScreen from './components/QuizScreen.tsx';   // <--- Убедитесь, что здесь .tsx
import ResultsScreen from './components/ResultsScreen.tsx'; // <--- Убедитесь, что здесь .tsx

// Названия разделов, должны совпадать с server.js
const SECTION_NAMES = [
    "Основы алгоритмизации и программирования",
    "ЭВМ  и периферийные устройства",
    "Сети и телекоммуникации",
    "Операционные системы",
    "Базы данных"
];

// Функция для перемешивания массива (нужна на фронтенде для пересдачи ошибок)
function shuffleArray(array: any[]): any[] { // <--- Добавил тип для TypeScript
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function App() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [quizMode, setQuizMode] = useState('');
    const [quizType, setQuizType] = useState('');
    const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null); // <--- Тип для TypeScript

    const [questions, setQuestions] = useState<any[]>([]); // <--- Тип для TypeScript
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState<any[]>([]); // <--- Тип для TypeScript

    const [incorrectQuestionsData, setIncorrectQuestionsData] = useState<any[]>([]); // <--- Тип для TypeScript

    const startQuizSession = async (params: { username: string; quizType: string; quizMode: string; selectedSectionIndex: number | null; }, questionsSubset: any[] | null = null) => {
        // ... (остальной код функции startQuizSession) ...
    };

    const handleAnswer = (answerData: any) => { // <--- Тип для TypeScript
        // ... (остальной код функции handleAnswer) ...
    };

    const handleNextQuestion = () => {
        // ... (остальной код функции handleNextQuestion) ...
    };

    const handleShowResults = async () => {
        // ... (остальной код функции handleShowResults) ...
    };

    const handleRetakeMistakes = () => {
        // ... (остальной код функции handleRetakeMistakes) ...
    };

    const handlePlayAgain = () => {
        // ... (остальной код функции handlePlayAgain) ...
    };

    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<StartScreen onStartQuiz={startQuizSession} />} />
                <Route path="/quiz" element={
                    <QuizScreen
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        onAnswer={handleAnswer}
                        onNextQuestion={handleNextQuestion}
                    />
                } />
                <Route path="/results" element={
                    <ResultsScreen
                        username={username}
                        score={score}
                        totalQuestions={questions.length}
                        userAnswers={userAnswers}
                        onRetakeMistakes={handleRetakeMistakes}
                        onPlayAgain={handlePlayAgain}
                    />
                } />
            </Routes>
        </div>
    );
}

export default App;