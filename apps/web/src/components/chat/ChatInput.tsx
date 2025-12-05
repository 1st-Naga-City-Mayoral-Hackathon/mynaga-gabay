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
}

export function ChatInput({ value, onChange, onSubmit, isLoading, placeholder }: ChatInputProps) {
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

                    {/* Attachment Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl flex-shrink-0"
                                >
                                    <span className="text-lg">📎</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Attach file</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

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
