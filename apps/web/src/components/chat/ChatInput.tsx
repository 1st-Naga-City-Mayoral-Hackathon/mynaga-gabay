'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (overrideText?: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    autoTTS?: boolean;
    onAutoTTSChange?: (enabled: boolean) => void;
    isSpeaking?: boolean;
}

// Web Speech API language codes
const WEB_SPEECH_LANGS: Record<string, string> = {
    en: 'en-US',
    fil: 'fil-PH',
    // bcl not supported by Web Speech API - will use Python STT
};

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
    const { language } = useLanguage();

    // STT state
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const finalTranscriptRef = useRef('');
    const originalValueRef = useRef(''); // Store input value at start of recording
    const onSubmitRef = useRef(onSubmit); // Ref to always have latest onSubmit

    // Keep onSubmit ref up to date
    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

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

    // Clear silence timeout
    const clearSilenceTimeout = useCallback(() => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    // Web Speech API STT (for English and Filipino)
    const startWebSpeechSTT = useCallback(() => {
        console.log('[STT] Starting Web Speech API for language:', language);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('[STT] Speech recognition not supported');
            alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;  // Keep listening through pauses
        recognition.interimResults = true;  // Show interim results as user speaks
        recognition.lang = WEB_SPEECH_LANGS[language] || 'en-US';

        console.log('[STT] Using language code:', recognition.lang);

        // Reset state - store original value at start using ref to avoid stale closure
        originalValueRef.current = value;
        let accumulatedTranscript = '';
        finalTranscriptRef.current = '';
        setInterimTranscript('');

        recognition.onstart = () => {
            console.log('[STT] Recognition started');
            setIsListening(true);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';

            // Process all results
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            // Accumulate final transcript
            if (finalText) {
                accumulatedTranscript = finalText; // Web Speech API accumulates, so use latest
                finalTranscriptRef.current = accumulatedTranscript;
                const origVal = originalValueRef.current;
                const newValue = origVal + (origVal ? ' ' : '') + accumulatedTranscript;
                onChange(newValue);
            }

            // Show interim transcript
            setInterimTranscript(interimText);

            // Reset silence timer on any speech activity
            clearSilenceTimeout();

            // Start silence timer when we have final text
            if (finalText) {
                silenceTimeoutRef.current = setTimeout(() => {
                    console.log('[STT] Silence detected, auto-submitting');
                    if (recognitionRef.current) {
                        recognitionRef.current.stop();
                    }
                }, 1500); // 1.5 second silence timeout
            }
        };

        recognition.onspeechend = () => {
            console.log('[STT] Speech ended');
            // Start a shorter timeout when speech ends
            clearSilenceTimeout();
            silenceTimeoutRef.current = setTimeout(() => {
                console.log('[STT] Post-speech silence, stopping recognition');
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            }, 1000); // 1 second after speech ends
        };

        recognition.onerror = (event: Event & { error?: string }) => {
            console.error('[STT] Error:', event.error || event);
            clearSilenceTimeout();
            setIsListening(false);
            setInterimTranscript('');
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            } else if (event.error === 'no-speech') {
                console.log('[STT] No speech detected');
                // Don't show alert for no-speech, just end quietly
            } else if (event.error === 'network') {
                alert('Network error. Web Speech API requires internet connection.');
            } else if (event.error === 'aborted') {
                // User stopped, don't show error
                console.log('[STT] Recognition aborted');
            } else if (event.error) {
                alert(`Speech recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            console.log('[STT] Recognition ended, accumulated:', accumulatedTranscript);
            clearSilenceTimeout();
            setIsListening(false);
            setInterimTranscript('');

            // Auto-submit if we have a transcript
            if (accumulatedTranscript) {
                const origVal = originalValueRef.current;
                const fullMessage = origVal + (origVal ? ' ' : '') + accumulatedTranscript;
                console.log('[STT] Auto-submitting:', fullMessage);
                // Use setTimeout to ensure state is updated, call via ref for latest version
                setTimeout(() => {
                    onSubmitRef.current(fullMessage);
                }, 100);
            }
            finalTranscriptRef.current = '';
            originalValueRef.current = ''; // Clear for next use
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
            console.log('[STT] Recognition.start() called');
        } catch (err) {
            console.error('[STT] Failed to start recognition:', err);
            alert('Failed to start speech recognition. Please try again.');
            setIsListening(false);
        }
    }, [language, onChange, clearSilenceTimeout]); // Removed 'value' - using ref instead to avoid stale closures

    // Python STT (for Bikol - record and send to server)
    const startPythonSTT = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Send to STT API
                setIsListening(true);
                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');
                    formData.append('language', 'bcl');

                    const response = await fetch('/api/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.text) {
                            const newValue = value + (value ? ' ' : '') + result.text;
                            onChange(newValue);

                            // Auto-submit with the text directly
                            onSubmit(newValue);
                        }
                    } else {
                        const error = await response.json();
                        console.error('STT error:', error);
                        alert(error.message || 'Speech recognition failed');
                    }
                } catch (err) {
                    console.error('STT request error:', err);
                    alert('Could not connect to speech service');
                } finally {
                    setIsListening(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone error:', err);
            alert('Could not access microphone. Please allow microphone access.');
        }
    }, [value, onChange]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const handleVoiceClick = useCallback(() => {
        if (isRecording) {
            // Stop recording (Bikol mode)
            stopRecording();
        } else if (isListening) {
            // Stop Web Speech API
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            // Start STT
            if (language === 'bcl') {
                // Bikol uses Python STT
                startPythonSTT();
            } else {
                // English/Filipino use Web Speech API
                startWebSpeechSTT();
            }
        }
    }, [language, isListening, isRecording, startWebSpeechSTT, startPythonSTT, stopRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="border-t bg-background p-4">
            <div className="max-w-3xl mx-auto">
                <div className="relative flex items-end gap-2 bg-muted rounded-2xl p-2">
                    {/* Voice Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isRecording || isListening ? "default" : "ghost"}
                                    size="icon"
                                    onClick={handleVoiceClick}
                                    disabled={isLoading}
                                    className={`h-10 w-10 rounded-xl flex-shrink-0 relative ${isRecording || isListening
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : ''
                                        }`}
                                >
                                    {/* Pulsing ring animation when listening */}
                                    {(isListening || isRecording) && (
                                        <>
                                            <span className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-75" />
                                            <span className="absolute inset-0 rounded-xl bg-red-500 animate-pulse" />
                                        </>
                                    )}
                                    {isListening ? (
                                        <svg className="w-5 h-5 relative z-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                                        </svg>
                                    ) : isRecording ? (
                                        <svg className="w-5 h-5 relative z-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="6" width="12" height="12" rx="2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isRecording ? 'Tap to stop recording' :
                                    isListening ? 'Listening... Tap to stop' :
                                        language === 'bcl' ? 'Voice input (Bikol)' : 'Voice input'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Text Input with Interim Transcript Overlay */}
                    <div className="flex-1 relative">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? 'Listening...' : (placeholder || 'Ask Gabay anything...')}
                            className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-3"
                            rows={1}
                            disabled={isListening}
                        />
                        {/* Interim transcript overlay */}
                        {isListening && interimTranscript && (
                            <div className="absolute inset-0 flex items-center px-3 py-3 pointer-events-none">
                                <span className="text-sm text-muted-foreground italic">
                                    {value && <span className="text-foreground">{value} </span>}
                                    {interimTranscript}
                                    <span className="animate-pulse">|</span>
                                </span>
                            </div>
                        )}
                    </div>

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
                                    {autoTTS ? 'Auto-voice on' : 'Auto-voice off'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Voice Mode Link */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/voice"
                                    className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center hover:bg-accent transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 18l6-6V6a3 3 0 00-6 0v6l6 6z" />
                                    </svg>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Voice Mode</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Send Button */}
                    <Button
                        onClick={() => onSubmit()}
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
