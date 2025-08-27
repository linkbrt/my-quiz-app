import { useState } from 'react';

// Названия разделов, должны совпадать с server.js
const SECTION_NAMES = [
    "Основы алгоритмизации и программирования",
    "ЭВМ  и периферийные устройства",
    "Сети и телекоммуникации",
    "Операционные системы",
    "Базы данных"
];

interface StartScreenProps {
    onStartQuiz: (quizOptions: any) => void;
}

function StartScreen({ onStartQuiz }: StartScreenProps) {
    const [username, setUsername] = useState('');
    const [quizType, setQuizType] = useState('mode_based'); // 'mode_based' или 'section_based'
    const [quizMode, setQuizMode] = useState('5'); // По умолчанию 5 вопросов для быстрого теста
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(''); // String, так как value из select

    const handleStart = () => {
        if (!username.trim()) {
            alert('Пожалуйста, введите ваше имя!');
            return;
        }

        if (quizType === 'mode_based' && !quizMode) {
            alert('Пожалуйста, выберите режим теста.');
            return;
        }
        if (quizType === 'section_based' && selectedSectionIndex === '') {
            alert('Пожалуйста, выберите раздел для прохождения теста.');
            return;
        }

        // Передаем все выбранные параметры в родительский компонент App
        onStartQuiz({ 
            username: username.trim(), 
            quizType, 
            quizMode, 
            selectedSectionIndex: selectedSectionIndex !== '' ? parseInt(selectedSectionIndex) : null 
        });
    };

    return (
        <div id="start-screen" className="screen active">
            <h1>Добро пожаловать в тест!</h1>
            <div className="input-group">
                <label htmlFor="username">Ваше имя:</label>
                <input
                    type="text"
                    id="username"
                    placeholder="Введите ваше имя"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mode-selection">
                <p>Выберите режим теста:</p>
                <label>
                    <input
                        type="radio"
                        name="quiz-type"
                        value="mode_based"
                        checked={quizType === 'mode_based'}
                        onChange={() => {
                            setQuizType('mode_based');
                            setSelectedSectionIndex(''); // Очищаем выбор раздела при переключении
                        }}
                    />
                    Выберите режим:
                </label>
                <div className="mode-options" style={{ display: quizType === 'mode_based' ? 'block' : 'none' }}>
                    <label>
                        <input
                            type="radio"
                            name="quiz-mode"
                            value="50"
                            checked={quizMode === '50'}
                            onChange={() => setQuizMode('50')}
                        /> 50 вопросов
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="quiz-mode"
                            value="all"
                            checked={quizMode === 'all'}
                            onChange={() => setQuizMode('all')}
                        /> Все вопросы
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="quiz-mode"
                            value="simulation"
                            checked={quizMode === 'simulation'}
                            onChange={() => setQuizMode('simulation')}
                        /> Имитация теста (50 вопросов из разных разделов)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="quiz-mode"
                            value="5"
                            checked={quizMode === '5'}
                            onChange={() => setQuizMode('5')}
                        /> 5 вопросов (для тестирования)
                    </label>
                </div>
                <br />
                <label>
                    <input
                        type="radio"
                        name="quiz-type"
                        value="section_based"
                        checked={quizType === 'section_based'}
                        onChange={() => {
                            setQuizType('section_based');
                            setQuizMode(''); // Очищаем выбор режима при переключении
                        }}
                    />
                    Пройти тест по разделу:
                </label>
                <select
                    id="section-select"
                    disabled={quizType === 'mode_based'}
                    value={selectedSectionIndex}
                    onChange={(e) => setSelectedSectionIndex(e.target.value)}
                >
                    <option value="">Выберите раздел</option>
                    {SECTION_NAMES.map((name, index) => (
                        <option key={index} value={index}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>
            <button id="start-quiz-btn" onClick={handleStart}>Начать тест</button>
        </div>
    );
}

export default StartScreen;