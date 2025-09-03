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

export interface QuestionAnswerBlock {
    text: string;
    is_correct: string;
}


export interface Section {
    id: string; // UUID как строка
    title: string;
    description: string | null;
    order_index: number;
    is_published: boolean;
}

export interface SectionFullInfo {
    section: Section,
    quizzes: Quiz[];
}

export interface SectionCreate {
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

export interface QuizFullInfo {
    quiz: Quiz,
    questions: Question[],
}


// Соответствует QuestionSchema
export interface Question {
    id: string; // UUID как строка
    quiz_id: string; // UUID как строка
    question_text: string; // JSONB
    question_type: QuestionType;
    order_index: number;
    answers: QuestionAnswerBlock[];
}
