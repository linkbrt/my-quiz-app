// Соответствует QuestionType enum из FastAPI
export enum QuestionType {
    SINGLE_CHOICE = "single_choice",
    MULTIPLE_CHOICE = "multiple_choice",
    TEXT_INPUT = "text_input",
}

// Для JSONB поля question_text
export interface QuestionContentBlock {
    type: string; // 'text', 'code', 'heading'
    value: string;
    language?: string; // Для блоков типа 'code'
    level?: number; // Для блоков типа 'heading' (например, 2 для h2)
}

// Соответствует SectionSchema
export interface Section {
    id: string; // UUID как строка
    title: string;
    description: string | null;
    order_index: number;
    is_published: boolean;
}

// Соответствует QuizSchema
export interface Quiz {
    id: string; // UUID как строка
    section_id: string; // UUID как строка
    title: string;
    description: string | null;
    num_questions_to_show: number;
    passing_score: number;
}

// Соответствует AnswerSchema (если вы вынесете его)
export interface Answer {
    id: string; // UUID как строка
    answer_text: string;
    is_correct?: boolean; // Возможно, не будет в схеме для клиента
}

// Соответствует QuestionSchema
export interface Question {
    id: string; // UUID как строка
    quiz_id: string; // UUID как строка
    question_text: QuestionContentBlock[]; // JSONB
    question_type: QuestionType;
    order_index: number;
    answers: Answer[]; // Если вопросы сразу приходят с вариантами ответов
}

// Соответствует UserQuizAttemptSchema
export interface UserQuizAttempt {
    id: string; // UUID как строка
    user_id: string; // UUID как строка
    quiz_id: string; // UUID как строка
    score: number | null;
    is_passed: boolean | null;
    attempt_number: number;
    started_at: string; // ISO 8601 string
    finished_at: string | null; // ISO 8601 string
}

// Если у вас будут схемы для запросов/ответов, например:
export interface SubmitAnswerRequest {
    question_id: string;
    chosen_answer_ids?: string[]; // Для single_choice/multiple_choice
    user_text_answer?: string; // Для text_input
}