'use client';

import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading?: boolean;
    placeholder?: string;
    autoTTS?: boolean;
    onAutoTTSChange?: (enabled: boolean) => void;
    isSpeaking?: boolean;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    isLoading,
    placeholder,
    autoTTS = false,
    onAutoTTSChange,
    isSpeaking = false,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSubmit();
            }
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="max-w-3xl mx-auto">
                <div className="relative flex items-end gap-2 bg-muted rounded-2xl p-2">
                    {/* Voice Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl flex-shrink-0"
                                >
                                    <span className="text-lg">🎤</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voice input</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Text Input */}
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || 'Ask Gabay anything...'}
                        className="min-h-[44px] max-h-[200px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-3"
                        rows={1}
                    />

                    {/* Auto-TTS Toggle */}
                    {onAutoTTSChange && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={autoTTS ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => onAutoTTSChange(!autoTTS)}
                                        className={`h-10 w-10 rounded-xl flex-shrink-0 ${autoTTS
                                                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                                : ''
                                            }`}
                                    >
                                        {isSpeaking ? (
                                            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {autoTTS ? 'Auto-voice on (click to disable)' : 'Auto-voice off (click to enable)'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Send Button */}
                    <Button
                        onClick={onSubmit}
                        disabled={!value.trim() || isLoading}
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-teal-600 hover:bg-teal-700 flex-shrink-0"
                    >
                        {isLoading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                    Gabay can make mistakes. Consider verifying important health information.
                </p>
            </div>
        </div>
    );
}
