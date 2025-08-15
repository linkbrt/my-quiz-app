const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

let allQuestions = []; // Здесь будут храниться все загруженные вопросы


const SECTION_START_INDICES = [0, 100, 176, 300, 401];
// Названия разделов, соответствующие индексам выше
const SECTION_NAMES = [
    "Основы алгоритмизации и программирования",
    "ЭВМ  и периферийные устройства",
    "Сети и телекоммуникации",
    "Операционные системы",
    "Базы данных"
];

const QUESTIONS_PER_SECTION_IN_SIMULATION = 10;
const TARGET_TOTAL_QUESTIONS_IN_SIMULATION = 50;

// --- Функция для перемешивания массива (алгоритм Фишера-Йетса) ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Обмен элементов
    }
    return array;
}

// --- Функция для определения названия раздела по индексу вопроса ---
function getSectionNameByIndex(questionIndex) {
    for (let i = SECTION_START_INDICES.length - 1; i >= 0; i--) {
        if (questionIndex >= SECTION_START_INDICES[i]) {
            return SECTION_NAMES[i] || `Раздел ${i + 1}`; // Возвращаем название или "Раздел N"
        }
    }
    return "Неизвестный раздел"; // Если индекс не попадает ни в один раздел
}

// --- Загрузка вопросов из JSON файла ---
const questionsFilePath = path.join(__dirname, 'questions.json');

fs.readFile(questionsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка при чтении файла вопросов:', err);
        process.exit(1);
    }
    try {
        allQuestions = JSON.parse(data);
        // Добавляем название раздела к каждому вопросу сразу при загрузке
        allQuestions = allQuestions.map((q, index) => ({
            ...q,
            sectionName: getSectionNameByIndex(index)
        }));
        console.log(`Загружено ${allQuestions.length} вопросов с названиями разделов.`);

        if (allQuestions.length < TARGET_TOTAL_QUESTIONS_IN_SIMULATION) {
            console.warn(`Внимание: Общее количество вопросов (${allQuestions.length}) меньше, чем требуется для режима "Имитация теста" (${TARGET_TOTAL_QUESTIONS_IN_SIMULATION}).`);
        }
    } catch (parseError) {
        console.error('Ошибка при парсинге JSON файла вопросов:', parseError);
        process.exit(1);
    }
});

// --- Middleware для обработки JSON в теле запроса ---
app.use(express.json());

// --- Middleware для обслуживания статических файлов (public) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API endpoint для получения вопросов ---
app.get('/api/questions', (req, res) => {
    const mode = req.query.mode;
    const sectionIndex = req.query.sectionIndex; // <--- НОВОЕ: получаем индекс раздела

    let questionsToPrepare = [];

    if (mode === '50') {
        questionsToPrepare = shuffleArray([...allQuestions]).slice(0, 50);
    } else if (mode === 'simulation') {
        let selectedSimulationQuestions = [];

        if (SECTION_START_INDICES.length < 5) {
            console.warn(`Для режима "Имитация теста" рекомендуется минимум 5 разделов, чтобы получить ${TARGET_TOTAL_QUESTIONS_IN_SIMULATION} вопросов. Обнаружено ${SECTION_START_INDICES.length}.`);
        }

        for (let i = 0; i < SECTION_START_INDICES.length; i++) {
            const startIndex = SECTION_START_INDICES[i];
            const endIndex = (i + 1 < SECTION_START_INDICES.length) ? SECTION_START_INDICES[i + 1] : allQuestions.length;

            const currentSectionQuestions = allQuestions.slice(startIndex, endIndex);

            const shuffledSectionQuestions = shuffleArray([...currentSectionQuestions]);
            const questionsFromThisSection = shuffledSectionQuestions.slice(0, QUESTIONS_PER_SECTION_IN_SIMULATION);

            selectedSimulationQuestions = selectedSimulationQuestions.concat(questionsFromThisSection);

            if (questionsFromThisSection.length < QUESTIONS_PER_SECTION_IN_SIMULATION) {
                console.warn(`Раздел, начинающийся с индекса ${startIndex} (и заканчивающийся перед ${endIndex}), имел только ${currentSectionQuestions.length} вопросов, из них выбрано ${questionsFromThisSection.length}.`);
            }
        }

        questionsToPrepare = shuffleArray(selectedSimulationQuestions).slice(0, TARGET_TOTAL_QUESTIONS_IN_SIMULATION);

        if (questionsToPrepare.length < TARGET_TOTAL_QUESTIONS_IN_SIMULATION) {
            console.warn(`В режиме "Имитация теста" загружено только ${questionsToPrepare.length} вопросов, вместо ${TARGET_TOTAL_QUESTIONS_IN_SIMULATION}.`);
        }
    } else if (sectionIndex !== undefined && sectionIndex !== null && !isNaN(parseInt(sectionIndex))) { // <--- НОВОЕ: Обработка запроса по разделу
        const parsedSectionIndex = parseInt(sectionIndex);

        if (parsedSectionIndex >= 0 && parsedSectionIndex < SECTION_START_INDICES.length) {
            const startIndex = SECTION_START_INDICES[parsedSectionIndex];
            const endIndex = (parsedSectionIndex + 1 < SECTION_START_INDICES.length) ? SECTION_START_INDICES[parsedSectionIndex + 1] : allQuestions.length;

            questionsToPrepare = shuffleArray([...allQuestions.slice(startIndex, endIndex)]);
            console.log(`Запрошены вопросы для раздела "${SECTION_NAMES[parsedSectionIndex]}" (${questionsToPrepare.length} вопросов).`);
        } else {
            console.warn(`Неверный индекс раздела: ${sectionIndex}. Возвращаем все вопросы.`);
            questionsToPrepare = shuffleArray([...allQuestions]); // Fallback на все вопросы
        }
    } else { // 'all' или любой другой режим по умолчанию
        questionsToPrepare = shuffleArray([...allQuestions]);
    }

    const finalQuestions = questionsToPrepare.map(q => {
        const shuffledOptions = shuffleArray([...q.options]);
        return {
            question: q.question,
            options: shuffledOptions,
            correct_answer: q.correct_answer,
            sectionName: q.sectionName
        };
    });

    res.json(finalQuestions);
});

// --- API endpoint для сохранения результатов ---
app.post('/api/submit-results', (req, res) => {
    const results = req.body;
    console.log('Получены результаты теста для сохранения:', results);

    const resultsFilePath = path.join(__dirname, 'results.json');
    fs.appendFile(resultsFilePath, JSON.stringify(results) + '\n', (err) => {
        if (err) {
            console.error('Ошибка при записи результатов:', err);
            return res.status(500).json({ message: 'Ошибка сервера при сохранении результатов.' });
        }
        console.log('Результаты успешно записаны.');
        res.status(200).json({ message: 'Результаты успешно сохранены.' });
    });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Для остановки сервера нажмите Ctrl+C`);
});