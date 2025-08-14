const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

let allQuestions = []; // Здесь будут храниться все загруженные вопросы

// --- Функция для перемешивания массива (алгоритм Фишера-Йетса) ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Обмен элементов
    }
    return array;
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
        console.log(`Загружено ${allQuestions.length} вопросов.`);
    } catch (parseError) {
        console.error('Ошибка при парсинге JSON файла вопросов:', parseError);
        process.exit(1);
    }
});

// --- Middleware для обслуживания статических файлов ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API endpoint для получения вопросов ---
// Добавим логику для режимов и перемешивания
app.get('/api/questions', (req, res) => {
    const mode = req.query.mode; // Получаем режим из параметров запроса (e.g., /api/questions?mode=50)
    let questionsToSend = [];

    // Создаем копию массива, чтобы не изменять исходный allQuestions при перемешивании
    let shuffledAllQuestions = shuffleArray([...allQuestions]);

    if (mode === '50') {
        questionsToSend = shuffledAllQuestions.slice(0, 50); // Берем первые 50 вопросов после перемешивания
    } else { // 'all' или любой другой режим по умолчанию
        questionsToSend = shuffledAllQuestions; // Все вопросы
    }

    // Теперь для каждого вопроса перемешаем его варианты ответов
    const finalQuestions = questionsToSend.map(q => {
        const shuffledOptions = shuffleArray([...q.options]); // Копируем и перемешиваем опции
        return {
            question: q.question,
            options: shuffledOptions,
            correct_answer: q.correct_answer // Правильный ответ остается тем же
        };
    });

    res.json(finalQuestions);
});


// ... (существующий код server.js) ...

// Middleware для обработки JSON в теле запроса
app.use(express.json());

// --- API endpoint для сохранения результатов ---
app.post('/api/submit-results', (req, res) => {
    const results = req.body;
    console.log('Получены результаты теста для сохранения:', results);

    // Здесь в будущем будет логика сохранения в файл
    // Например: fs.appendFileSync('results.json', JSON.stringify(results) + '\n');

    res.status(200).json({ message: 'Результаты получены, но пока не сохранены.' });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Для остановки сервера нажмите Ctrl+C`);
});
// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Для остановки сервера нажмите Ctrl+C`);
});