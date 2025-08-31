// src/pages/AdminCreateAndImportQuizPage.tsx
import React, { useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../api/quizApi';
import { Quiz, Section, QuizCreate, QuizImport, QuestionType, QuestionContentBlock } from '../types/api';
import { IsAdminCheck } from '../components/IsAdminCheck';
import '../styles/global.css';

const AdminCreateAndImportQuizPage: FC = () => {
    const navigate = useNavigate();
    
    // Состояние для создания нового квиза
    const [newQuizData, setNewQuizData] = useState<QuizCreate>({
        section_id: '',
        title: '',
        description: '',
        num_questions_to_show: 10,
        passing_score: 0.70,
    });
    const [sections, setSections] = useState<Section[]>([]);
    const [createdQuiz, setCreatedQuiz] = useState<Quiz | null>(null); // Хранит квиз, созданный в этой сессии
    const [createLoading, setCreateLoading] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    // Состояние для импорта вопросов
    const [selectedQuizIdForImport, setSelectedQuizIdForImport] = useState<string>(''); // Может быть newQuiz.id или существующий
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]); // Список всех квизов для выпадающего списка
    const [jsonInput, setJsonInput] = useState<string>('');
    const [importLoading, setImportLoading] = useState<boolean>(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [quizzesAndSectionsLoading, setQuizzesAndSectionsLoading] = useState<boolean>(true);

    // Загружаем разделы и все квизы при монтировании компонента
    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedSections = await quizApi.getSections();
                setSections(fetchedSections);
                if (fetchedSections.length > 0) {
                    setNewQuizData(prev => ({ ...prev, section_id: fetchedSections[0].id }));
                }

                const fetchedQuizzes = await quizApi.getAllQuizzes();
                setAllQuizzes(fetchedQuizzes);
                if (fetchedQuizzes.length > 0) {
                    setSelectedQuizIdForImport(fetchedQuizzes[0].id);
                }
            } catch (err: any) {
                setCreateError(err.message); // Используем createError для начальных сбоев загрузки
                setImportError(err.message);
            } finally {
                setQuizzesAndSectionsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Обработчики для создания нового квиза
    const handleNewQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setNewQuizData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleCreateQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);
        setCreateSuccess(null);
        try {
            const newQuiz = await quizApi.createQuiz(newQuizData);
            setCreatedQuiz(newQuiz);
            setSelectedQuizIdForImport(newQuiz.id); // Автоматически выбираем новый квиз для импорта
            setCreateSuccess(`Квиз "${newQuiz.title}" успешно создан! Теперь вы можете импортировать вопросы.`);
        } catch (err: any) {
            setCreateError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    // Обработчики для импорта вопросов
    const handleQuizSelectForImport = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedQuizIdForImport(e.target.value);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setImportLoading(true);
        setImportError(null);
        setImportSuccess(null);

        if (!selectedQuizIdForImport) {
            setImportError('Пожалуйста, выберите квиз для импорта.');
            setImportLoading(false);
            return;
        }

        try {
            const importData: QuizImport = JSON.parse(jsonInput);
            const updatedQuiz = await quizApi.importQuestionsToQuiz(selectedQuizIdForImport, importData);
            setImportSuccess(`Вопросы успешно импортированы в квиз "${updatedQuiz.title}"!`);
            setJsonInput(''); // Очищаем поле ввода
            // Опционально: перейти на страницу деталей квиза
            // navigate(`/quizzes/${updatedQuiz.id}`); 
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                setImportError('Некорректный формат JSON. Пожалуйста, проверьте синтаксис.');
            } else {
                setImportError(err.message);
            }
        } finally {
            setImportLoading(false);
        }
    };

    const defaultJsonExample: QuizImport = {
        questions: [
            {
                question_text: [{ type: "text", value: "Пример вопроса с одиночным выбором?" }],
                question_type: QuestionType.SINGLE_CHOICE,
                order_index: 1,
                answers: [{ answer_text: "Вариант 1 (Неверно)", is_correct: false }, { answer_text: "Вариант 2 (Верно)", is_correct: true }]
            },
            {
                question_text: [{ type: "text", value: "Какие языки программирования вам нравятся?" }],
                question_type: QuestionType.MULTIPLE_CHOICE,
                order_index: 2,
                answers: [{ answer_text: "Python", is_correct: true }, { answer_text: "JavaScript", is_correct: true }, { answer_text: "C++", is_correct: false }]
            },
            {
                question_text: [{ type: "text", value: "Напишите, как объявить константу в JavaScript:" }],
                question_type: QuestionType.TEXT_INPUT,
                order_index: 3,
                answers: [{ answer_text: "const MY_VAR = 10;", is_correct: true }]
            }
        ]
    };

    if (quizzesAndSectionsLoading) return <p className="container">Загрузка данных...</p>;

    return (
        <IsAdminCheck fallback={<p className="container">Недостаточно прав для администрирования квизов.</p>}>
            <div className="container">
                <h1>Создание и импорт квизов</h1>

                {/* Секция для создания нового квиза */}
                <div className="admin-form-section">
                    <h2>1. Создать новый квиз</h2>
                    {createSuccess && !createdQuiz && <p className="success-message">{createSuccess}</p>}
                    {!createdQuiz ? (
                        <form onSubmit={handleCreateQuizSubmit} className="admin-form">
                            <div className="form-group">
                                <label htmlFor="newQuizTitle">Название квиза:</label>
                                <input
                                    type="text"
                                    id="newQuizTitle"
                                    name="title"
                                    value={newQuizData.title}
                                    onChange={handleNewQuizChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newQuizDescription">Описание:</label>
                                <textarea
                                    id="newQuizDescription"
                                    name="description"
                                    value={newQuizData.description || ''}
                                    onChange={handleNewQuizChange}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="newQuizSectionId">Раздел:</label>
                                <select
                                    id="newQuizSectionId"
                                    name="section_id"
                                    value={newQuizData.section_id}
                                    onChange={handleNewQuizChange}
                                    required
                                >
                                    {sections.length === 0 && <option value="">Разделы не найдены</option>}
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>{section.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="newQuizNumQuestions">Количество вопросов для показа:</label>
                                <input
                                    type="number"
                                    id="newQuizNumQuestions"
                                    name="num_questions_to_show"
                                    value={newQuizData.num_questions_to_show}
                                    onChange={handleNewQuizChange}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newQuizPassingScore">Проходной балл (0.0 - 1.0):</label>
                                <input
                                    type="number"
                                    id="newQuizPassingScore"
                                    name="passing_score"
                                    value={newQuizData.passing_score}
                                    onChange={handleNewQuizChange}
                                    required
                                    min="0.0"
                                    max="1.0"
                                    step="0.01"
                                />
                            </div>
                            <button type="submit" disabled={createLoading || sections.length === 0} className="button primary">
                                {createLoading ? 'Создание...' : 'Создать квиз'}
                            </button>
                            {createError && <p className="error-message">{createError}</p>}
                        </form>
                    ) : (
                        <p className="success-message">Квиз "{createdQuiz.title}" (ID: {createdQuiz.id.substring(0, 8)}...) успешно создан! Переходите к импорту вопросов.</p>
                    )}
                </div>

                {/* Секция для импорта вопросов в квиз */}
                <div className="admin-form-section" style={{ marginTop: '50px' }}>
                    <h2>2. Импортировать вопросы в квиз</h2>
                    {importSuccess && <p className="success-message">{importSuccess}</p>}
                    <form onSubmit={handleImportSubmit} className="admin-form">
                        <div className="form-group">
                            <label htmlFor="quiz_select_for_import">Выберите квиз:</label>
                            <select
                                id="quiz_select_for_import"
                                name="quiz_select_for_import"
                                value={selectedQuizIdForImport}
                                onChange={handleQuizSelectForImport}
                                required
                                disabled={allQuizzes.length === 0}
                            >
                                {allQuizzes.length === 0 && <option value="">Квизы не найдены</option>}
                                {allQuizzes.map(quiz => (
                                    <option key={quiz.id} value={quiz.id}>
                                        {quiz.title} (ID: {quiz.id.substring(0, 8)}...)
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="json_input">JSON данные вопросов:</label>
                            <textarea
                                id="json_input"
                                name="json_input"
                                value={jsonInput}
                                onChange={handleJsonChange}
                                placeholder={`Пример JSON для импорта вопросов:\n${JSON.stringify(defaultJsonExample, null, 2)}`}
                                rows={15}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" disabled={importLoading || !selectedQuizIdForImport || !jsonInput.trim()} className="button primary">
                            {importLoading ? 'Импорт...' : 'Импортировать вопросы'}
                        </button>
                        {importError && <p className="error-message">{importError}</p>}
                    </form>
                </div>
            </div>
        </IsAdminCheck>
    );
};

export default AdminCreateAndImportQuizPage;