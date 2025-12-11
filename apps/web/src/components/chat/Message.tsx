'use client';

import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TTSButton } from './TTSButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageProps {
  message: MessageType;
}

// Map UI language codes to TTS language codes
type TTSLanguage = 'eng' | 'fil' | 'bcl';
const languageToTTS: Record<string, TTSLanguage> = {
  en: 'eng', // UI uses 'en', TTS uses 'eng'
  fil: 'fil', // Same
  bcl: 'bcl', // Same
};

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const { language } = useLanguage();

  // Get TTS language code (map 'en' to 'eng')
  const ttsLanguage: TTSLanguage = languageToTTS[language] || 'bcl';

  return (
    <div className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}>
      <Avatar
        className={cn(
          'w-8 h-8 flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-teal-500 to-teal-600'
        )}
      >
        <AvatarFallback className="text-sm">{isUser ? '👤' : '🏥'}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-[75%] break-words',
          isUser
            ? 'inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-md'
            : 'block p-0' // assistant: NO bubble
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-teal-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Action buttons for assistant messages - always visible */}
      {!isUser && (
        <div className="flex flex-col gap-1">
          {/* TTS Button - Uses selected language */}
          <TTSButton text={message.content} language={ttsLanguage} />

          {/* Copy button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigator.clipboard.writeText(message.content)}
            title="Copy message"
          >
            <span className="text-xs">📋</span>
          </Button>
        </div>
      )}
    </div>
  );
}
