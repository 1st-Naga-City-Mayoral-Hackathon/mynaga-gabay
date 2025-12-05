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
            // TODO: Connect to actual API
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
            // Fallback response when API is not connected
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
        <div className="glass-card flex flex-col h-[500px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-gabay-teal to-gabay-blue text-white'
                                    : 'bg-white/80 dark:bg-slate-700/80 text-slate-800 dark:text-white'
                                }
              `}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/80 dark:bg-slate-700/80 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <span className="w-2 h-2 bg-gabay-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/20">
                <div className="flex gap-3">
                    <VoiceButton onTranscript={handleVoiceInput} language={language} />

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                        placeholder={language === 'bcl' ? 'Mag-type digdi...' : 'Mag-type dito...'}
                        className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl px-4 py-3 
                       outline-none focus:ring-2 focus:ring-gabay-teal/50
                       placeholder:text-slate-400"
                    />

                    <button
                        onClick={() => handleSendMessage(inputText)}
                        disabled={!inputText.trim() || isLoading}
                        className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
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
