import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, AlertTriangleIcon, SendIcon } from './Icons';
import { ChatMessage } from '../types';

interface ChatCardProps {
  chatHistory: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  hasData: boolean;
  dataType: 'attendance' | 'directory' | null;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
    </div>
);


const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-start gap-3 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
        <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
            <p className="font-semibold text-sm">Ошибка AI-Ассистента</p>
            <p className="text-xs">{message}</p>
        </div>
    </div>
);


const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';

    const renderContent = () => {
        const markedParser = (window as any).marked;
        let htmlContent: string;
        if (typeof markedParser?.parse === 'function') {
            try {
                htmlContent = markedParser.parse(message.content);
            } catch (e) {
                const escapedContent = message.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '>');
                htmlContent = `<p>${escapedContent.replace(/\n/g, '<br>')}</p>`;
            }
        } else {
            const escapedContent = message.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '>');
            htmlContent = `<p>${escapedContent.replace(/\n/g, '<br>')}</p>`;
        }
        
        return (
            <div
                className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        );
    };

    if (isModel) {
        return (
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg rounded-tl-none">
                {renderContent()}
            </div>
        );
    }
    
    return (
        <div className="p-3 bg-blue-500 text-white rounded-lg rounded-br-none">
            <p>{message.content}</p>
        </div>
    );
};

export const ChatCard: React.FC<ChatCardProps> = ({ chatHistory, isStreaming, error, onSendMessage, hasData, dataType }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory, isStreaming]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isStreaming) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const getPlaceholderText = () => {
        if (dataType === 'directory') {
            return "AI-Ассистент доступен только для файлов посещаемости.";
        }
        if (!hasData) {
            return "Загрузите файл, чтобы начать чат с данными.";
        }
        return "Задайте вопрос по данным...";
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col h-[calc(100vh-6rem)] sticky top-8 w-full min-w-0">
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                <SparklesIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI-Ассистент</h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatHistory.length === 0 && !isStreaming && !error && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-4">{getPlaceholderText()}</p>
                )}
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-md">
                            <ChatBubble message={msg} />
                        </div>
                    </div>
                ))}
                {isStreaming && (chatHistory.length === 0 || chatHistory[chatHistory.length - 1]?.role === 'user') && (
                    <div className="flex justify-start">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg rounded-tl-none">
                           <TypingIndicator />
                        </div>
                    </div>
                )}
                {error && <ErrorDisplay message={error} />}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={getPlaceholderText()}
                        disabled={isStreaming || !hasData || dataType === 'directory'}
                        className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isStreaming || !input.trim() || !hasData || dataType === 'directory'}
                        className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        aria-label="Отправить"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
