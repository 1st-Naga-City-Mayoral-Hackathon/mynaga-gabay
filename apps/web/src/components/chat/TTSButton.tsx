'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
    text: string;
    language?: 'bcl' | 'fil' | 'eng';
    className?: string;
}

/**
 * Text-to-Speech button component
 * Uses Meta MMS Bikol model for authentic Bikolano pronunciation
 */
export function TTSButton({ text, language = 'bcl', className }: TTSButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSpeak = useCallback(async () => {
        // If already playing, stop
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call TTS API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, language }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'TTS failed');
            }

            // Get audio blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create audio element and play
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
                setIsPlaying(false);
                setError('Audio playback failed');
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();

        } catch (err) {
            console.error('TTS error:', err);
            setError(err instanceof Error ? err.message : 'TTS unavailable');
        } finally {
            setIsLoading(false);
        }
    }, [text, language, isPlaying]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            disabled={isLoading || !text}
            className={cn(
                'h-7 w-7 transition-colors',
                isPlaying && 'text-teal-500 bg-teal-500/10',
                error && 'text-red-500',
                className
            )}
            title={error || (isPlaying ? 'Stop' : 'Listen in Bikol')}
        >
            {isLoading ? (
                // Loading spinner
                <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : isPlaying ? (
                // Stop icon (square)
                <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
            ) : (
                // Speaker icon
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                </svg>
            )}
        </Button>
    );
}
