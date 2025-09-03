// src/components/QuestionDisplay.tsx
import type { FC } from 'react';
import type { QuestionContentBlock } from '../types/api';
import React from 'react';

interface QuestionDisplayProps {
    questionContent: string;
}

const QuestionDisplay: FC<QuestionDisplayProps> = ({ questionContent }) => {
    if (!questionContent || !Array.isArray(questionContent)) {
        return <p>Не удалось загрузить содержимое вопроса.</p>;
    }

    return (
        <div className="question-content-renderer">
            {questionContent.map((block, index) => {
                switch (block.type) {
                    case 'text':
                        return <p key={index}>{block.value}</p>;
                    case 'code':
                        return (
                            <pre key={index} className={`language-${block.language || 'plaintext'}`}>
                                <code>{block.value}</code>
                            </pre>
                        );
                    case 'heading':
                        const HeadingTag = `h${block.level || 2}` as keyof HTMLElement;
                        return React.createElement(HeadingTag, { key: index }, block.value);
                    default:
                        return <p key={index}>{block.value}</p>;
                }
            })}
        </div>
    );
};

export default QuestionDisplay;