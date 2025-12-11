'use client';

import { useRef, useEffect } from 'react';
import { Message } from './Message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: MessageType[];
  isLoading?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

// Wrapper to handle SSR
export function ChatMessages(props: ChatMessagesProps) {
  return <ChatMessagesInner {...props} />;
}

function ChatMessagesInner({ messages, isLoading, onSuggestionClick }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Safe access to language context
  let t: (key: string) => string;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch {
    t = (key: string) => key;
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const suggestions = [
    t('suggestion.hospital'),
    t('suggestion.philhealth'),
    t('suggestion.dosage'),
  ];

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('chat.greeting')}</h2>
            <p className="text-muted-foreground max-w-md">{t('chat.description')}</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="px-3 py-1.5 text-sm rounded-full border border-border hover:bg-accent transition-colors text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🏥</span>
            </div>
            <div className="flex-1 px-4 py-3 bg-transparent">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
