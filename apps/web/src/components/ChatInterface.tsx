'use client';

import { useState, useRef, useEffect } from 'react';
import { VoiceButton } from './VoiceButton';
import type { SupportedLanguage, Message } from '@mynaga/shared';

interface ChatInterfaceProps {
    language: SupportedLanguage;
}

export function ChatInterface({ language }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            type: 'text',
            content: text,
            language,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                type: 'text',
                content: data.reply || 'Pasensya na, may problema sa sistema. Subukan muli mamaya.',
                language,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const fallbackMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                type: 'text',
                content: language === 'bcl'
                    ? 'Pasensya na, dai pa konektado an sistema. Balik ka sa iba pang oras.'
                    : 'Pasensya, hindi pa konektado ang sistema. Subukan muli mamaya.',
                language,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceInput = (transcript: string) => {
        handleSendMessage(transcript);
    };

    return (
        <div className="glass-card flex flex-col h-[400px] overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500">
                        <div className="text-4xl mb-3 opacity-50">💬</div>
                        <p className="text-sm">
                            {language === 'bcl' ? 'Mag-hapot ka sa Gabay...' : 'Magtanong kay Gabay...'}
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gabay-teal to-teal-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                                <span className="text-sm">🏥</span>
                            </div>
                        )}
                        <div
                            className={`
                max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm
                ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-gabay-teal to-teal-500 text-white rounded-br-md'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-600'
                                }
              `}
                        >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gabay-teal to-teal-500 flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-sm">🏥</span>
                        </div>
                        <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100 dark:border-slate-600">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                    <VoiceButton onTranscript={handleVoiceInput} language={language} />

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                        placeholder={language === 'bcl' ? 'Mag-type digdi...' : 'Mag-type dito...'}
                        className="glass-input flex-1 py-2.5"
                    />

                    <button
                        onClick={() => handleSendMessage(inputText)}
                        disabled={!inputText.trim() || isLoading}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-gabay-teal to-teal-500 text-white shadow-lg shadow-gabay-teal/25
                       hover:shadow-xl hover:shadow-gabay-teal/30 hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
