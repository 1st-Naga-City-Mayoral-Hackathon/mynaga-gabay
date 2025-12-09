'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatProps {
    // Language prop is optional - will use context if not provided
    language?: 'en' | 'fil' | 'bcl';
}

// Type for our messages
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// Map UI language codes to TTS language codes
type TTSLanguage = 'eng' | 'fil' | 'bcl';
const languageToTTS: Record<string, TTSLanguage> = {
    en: 'eng',
    fil: 'fil',
    bcl: 'bcl',
};

export function Chat({ language: langProp }: ChatProps) {
    // Use language from context, fallback to prop
    const { language: contextLang, t } = useLanguage();
    const language = langProp || contextLang;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Auto-TTS state
    const [autoTTS, setAutoTTS] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastMessageIdRef = useRef<string | null>(null);

    // Get TTS language code
    const ttsLanguage = languageToTTS[language] || 'bcl';

    // Play TTS for a message
    const playTTS = useCallback(async (text: string) => {
        if (!text || isSpeaking) return;

        setIsSpeaking(true);
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: ttsLanguage }),
            });

            if (!response.ok) {
                throw new Error('TTS failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
        } catch (err) {
            console.error('Auto-TTS error:', err);
            setIsSpeaking(false);
        }
    }, [ttsLanguage, isSpeaking]);

    // Auto-play TTS when new assistant message arrives
    useEffect(() => {
        if (!autoTTS || isLoading) return;

        const lastMessage = messages[messages.length - 1];
        if (
            lastMessage &&
            lastMessage.role === 'assistant' &&
            lastMessage.content &&
            lastMessage.id !== lastMessageIdRef.current
        ) {
            lastMessageIdRef.current = lastMessage.id;
            playTTS(lastMessage.content);
        }
    }, [messages, autoTTS, isLoading, playTTS]);

    // Stop audio when autoTTS is toggled off
    useEffect(() => {
        if (!autoTTS && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
    }, [autoTTS]);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    language,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '',
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (reader) {
                let done = false;
                while (!done) {
                    const result = await reader.read();
                    done = result.done;
                    if (done) break;

                    const chunk = decoder.decode(result.value, { stream: true });
                    // Parse SSE data
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('0:')) {
                            try {
                                const text = JSON.parse(line.slice(2));
                                if (typeof text === 'string') {
                                    assistantMessage.content += text;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === assistantMessage.id
                                                ? { ...m, content: assistantMessage.content }
                                                : m
                                        )
                                    );
                                }
                            } catch {
                                // Skip malformed lines
                            }
                        }
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background">
            {/* Sidebar */}
            <ChatSidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={() => setSidebarOpen(false)}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

                {/* Messages */}
                <ChatMessages messages={messages} isLoading={isLoading} />

                {/* Error Display */}
                {error && (
                    <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
                        {error.message || 'Something went wrong. Please try again.'}
                    </div>
                )}

                {/* Input with Auto-TTS toggle */}
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    placeholder={t('chat.placeholder')}
                    autoTTS={autoTTS}
                    onAutoTTSChange={setAutoTTS}
                    isSpeaking={isSpeaking}
                />
            </div>
        </div>
    );
}
