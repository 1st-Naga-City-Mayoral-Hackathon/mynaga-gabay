'use client';

import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageType {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface MessageProps {
    message: MessageType;
}

export function Message({ message }: MessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
            <Avatar className={cn('w-8 h-8 flex-shrink-0', isUser ? 'bg-primary' : 'bg-gradient-to-br from-teal-500 to-teal-600')}>
                <AvatarFallback className="text-sm">
                    {isUser ? '👤' : '🏥'}
                </AvatarFallback>
            </Avatar>

            <div className={cn(
                'flex-1 max-w-[85%] rounded-2xl px-4 py-3',
                isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-md'
                    : 'bg-muted rounded-tl-md'
            )}>
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
                                    <a href={href} className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
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

            {!isUser && (
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <span className="text-xs">📋</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
