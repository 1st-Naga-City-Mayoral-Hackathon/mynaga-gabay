'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceModeProps {
    onClose: () => void;
    onSendMessage: (text: string) => Promise<string>;
}

// States for the voice conversation
type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

// Web Speech API language codes
const WEB_SPEECH_LANGS: Record<string, string> = {
    en: 'en-US',
    fil: 'fil-PH',
    bcl: 'fil-PH', // Fallback for Bikol
};

// TTS language codes
const TTS_LANGS: Record<string, string> = {
    en: 'eng',
    fil: 'fil',
    bcl: 'bcl',
};

export function VoiceMode({ onClose, onSendMessage }: VoiceModeProps) {
    const { language, t } = useLanguage();

    const [state, setState] = useState<ConversationState>('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const isInterruptedRef = useRef(false);

    // Voice Activity Detection - monitor microphone levels
    const startVAD = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Monitor audio levels
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkLevel = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(average / 255);

                // If speaking and user starts talking loudly, interrupt
                if (state === 'speaking' && average > 50 && audioRef.current) {
                    console.log('[VoiceMode] User interrupted - stopping TTS');
                    isInterruptedRef.current = true;
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    setState('listening');
                    startListening();
                }

                animationFrameRef.current = requestAnimationFrame(checkLevel);
            };

            checkLevel();
        } catch (err) {
            console.error('[VoiceMode] VAD error:', err);
        }
    }, [state]);

    const stopVAD = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    }, []);

    // Start speech recognition
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = WEB_SPEECH_LANGS[language] || 'en-US';

        recognition.onstart = () => {
            setState('listening');
            setTranscript('');
            isInterruptedRef.current = false;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            setTranscript(finalTranscript || interimTranscript);
        };

        recognition.onend = () => {
            if (transcript && !isInterruptedRef.current) {
                processMessage(transcript);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('[VoiceMode] Recognition error:', event.error);
            if (event.error !== 'no-speech') {
                setError(`Speech error: ${event.error}`);
            }
            setState('idle');
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [language, transcript]);

    // Process message and get response
    const processMessage = useCallback(async (text: string) => {
        if (!text.trim()) {
            setState('idle');
            return;
        }

        setState('processing');
        setTranscript(text);

        try {
            const responseText = await onSendMessage(text);
            setResponse(responseText);

            // Speak the response
            await speakResponse(responseText);
        } catch (err) {
            console.error('[VoiceMode] Error:', err);
            setError('Failed to process message');
            setState('idle');
        }
    }, [onSendMessage]);

    // Speak the response using TTS
    const speakResponse = useCallback(async (text: string) => {
        setState('speaking');

        try {
            const ttsLang = TTS_LANGS[language] || 'bcl';

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: ttsLang }),
            });

            if (!response.ok) throw new Error('TTS failed');

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (!isInterruptedRef.current) {
                    // Continue listening after speaking
                    setTimeout(() => startListening(), 500);
                }
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setState('idle');
            };

            await audio.play();
        } catch (err) {
            console.error('[VoiceMode] TTS error:', err);
            setState('idle');
        }
    }, [language, startListening]);

    // Start voice mode
    const handleStart = useCallback(() => {
        startVAD();
        startListening();
    }, [startVAD, startListening]);

    // Stop everything
    const handleStop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        stopVAD();
        setState('idle');
    }, [stopVAD]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            handleStop();
        };
    }, [handleStop]);

    // Avatar animation based on state
    const getAvatarClasses = () => {
        const base = 'w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300';

        switch (state) {
            case 'idle':
                return `${base} bg-gradient-to-br from-teal-500 to-teal-600 scale-100`;
            case 'listening':
                return `${base} bg-gradient-to-br from-blue-500 to-blue-600 scale-110 animate-pulse`;
            case 'processing':
                return `${base} bg-gradient-to-br from-yellow-500 to-orange-500 scale-100 animate-spin`;
            case 'speaking':
                return `${base} bg-gradient-to-br from-teal-400 to-emerald-500 scale-105`;
            default:
                return base;
        }
    };

    const getStateText = () => {
        switch (state) {
            case 'idle': return t('voiceMode.tapToStart') || 'Tap to start';
            case 'listening': return t('voiceMode.listening') || 'Listening...';
            case 'processing': return t('voiceMode.thinking') || 'Thinking...';
            case 'speaking': return t('voiceMode.speaking') || 'Speaking...';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            {/* Close button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </Button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-8 text-foreground">
                {t('voiceMode.title') || 'Voice Mode'}
            </h2>

            {/* Avatar with audio visualization */}
            <div className="relative mb-8">
                {/* Audio level ring */}
                <div
                    className="absolute inset-0 rounded-full bg-teal-500/20 transition-transform duration-100"
                    style={{
                        transform: `scale(${1 + audioLevel * 0.5})`,
                        opacity: state === 'listening' ? 1 : 0
                    }}
                />

                {/* Speaking animation rings */}
                {state === 'speaking' && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
                        <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse" />
                    </>
                )}

                {/* Main avatar */}
                <button
                    onClick={state === 'idle' ? handleStart : handleStop}
                    className={getAvatarClasses()}
                >
                    <span className="text-4xl">
                        {state === 'listening' ? '👂' : state === 'processing' ? '🤔' : '🏥'}
                    </span>
                </button>
            </div>

            {/* State indicator */}
            <p className="text-lg font-medium text-muted-foreground mb-4">
                {getStateText()}
            </p>

            {/* Transcript */}
            {transcript && (
                <div className="max-w-md text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">You said:</p>
                    <p className="text-foreground">{transcript}</p>
                </div>
            )}

            {/* Response */}
            {response && state !== 'processing' && (
                <div className="max-w-md text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Gabay:</p>
                    <p className="text-foreground">{response}</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-destructive text-sm mb-4">{error}</p>
            )}

            {/* Controls */}
            <div className="flex gap-4 mt-4">
                {state === 'idle' ? (
                    <Button onClick={handleStart} size="lg" className="bg-teal-600 hover:bg-teal-700">
                        Start Conversation
                    </Button>
                ) : (
                    <Button onClick={handleStop} variant="outline" size="lg">
                        Stop
                    </Button>
                )}
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted-foreground mt-8 text-center max-w-sm">
                {t('voiceMode.instructions') || 'Speak naturally. Gabay will respond and continue listening. You can interrupt at any time.'}
            </p>
        </div>
    );
}
