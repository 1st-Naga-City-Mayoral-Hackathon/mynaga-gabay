'use client';

import { useState, useCallback } from 'react';
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

  // Get the last assistant message for voice mode TTS
  const lastAssistantMessage =
    messages.length > 0
      ? messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content
      : undefined;

  const handleSubmit = useCallback(
    async (overrideText?: string) => {
      const textToSubmit = overrideText ?? input;
      if (!textToSubmit.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: textToSubmit,
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
    },
    [input, isLoading, messages, language]
  );

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

        {/* Input with Voice Mode */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={t('chat.placeholder')}
          lastAssistantMessage={lastAssistantMessage}
        />
      </div>
    </div>
  );
}
