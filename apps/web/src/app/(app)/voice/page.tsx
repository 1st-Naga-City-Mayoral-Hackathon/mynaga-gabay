'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MatrixRain, CircularHUD, JarvisVisualizer } from '@/components/jarvis';

// States for the voice conversation
type ConversationState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';

// Web Speech API language codes
const WEB_SPEECH_LANGS: Record<string, string> = {
    en: 'en-US',
    fil: 'fil-PH',
    bcl: 'fil-PH',
};

// TTS language codes
const TTS_LANGS: Record<string, string> = {
    en: 'eng',
    fil: 'fil',
    bcl: 'bcl',
};

export default function VoicePage() {
    const router = useRouter();
    const { language, t } = useLanguage();

    const [state, setState] = useState<ConversationState>('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [audioLevel, setAudioLevel] = useState(0);
    const [barLevels, setBarLevels] = useState<number[]>([0.2, 0.3, 0.5, 0.7, 0.5, 0.3, 0.2]);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const isInterruptedRef = useRef(false);

    // Animate bars during speaking
    useEffect(() => {
        if (state === 'speaking' || state === 'listening') {
            const interval = setInterval(() => {
                setBarLevels(prev => prev.map(() =>
                    state === 'speaking'
                        ? 0.3 + Math.random() * 0.7
                        : 0.2 + audioLevel * 0.8 + Math.random() * 0.2
                ));
            }, 100);
            return () => clearInterval(interval);
        } else {
            setBarLevels([0.2, 0.3, 0.5, 0.7, 0.5, 0.3, 0.2]);
        }
    }, [state, audioLevel]);

    // Voice Activity Detection
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

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkLevel = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(average / 255);

                // Interrupt if user speaks while agent is speaking
                if (state === 'speaking' && average > 50 && audioRef.current) {
                    console.log('[Voice] User interrupted');
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
            console.error('[Voice] VAD error:', err);
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

    // Speech recognition with retry limit
    const listenRetryCountRef = useRef(0);
    const MAX_LISTEN_RETRIES = 5;

    const startListening = useCallback(() => {
        // Don't start if interrupted (user clicked End Conversation)
        if (isInterruptedRef.current) {
            console.log('[Voice] Interrupted, not starting listening');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        // Check retry limit
        if (listenRetryCountRef.current >= MAX_LISTEN_RETRIES) {
            console.log('[Voice] Max listen retries reached, stopping');
            setState('idle');
            listenRetryCountRef.current = 0;
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = WEB_SPEECH_LANGS[language] || 'en-US';

        let finalTranscriptResult = '';

        recognition.onstart = () => {
            setState('listening');
            setTranscript('');
            isInterruptedRef.current = false;
            finalTranscriptResult = '';
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += t;
                } else {
                    interimText += t;
                }
            }

            // Store final transcript for onend
            if (finalText) {
                finalTranscriptResult = finalText;
                // Reset retry count on successful speech
                listenRetryCountRef.current = 0;
            }

            setTranscript(finalText || interimText);
        };

        let hasCriticalError = false;

        recognition.onend = () => {
            console.log('[Voice] Recognition ended, finalTranscript:', finalTranscriptResult, 'criticalError:', hasCriticalError);

            // Don't restart if there was a critical error
            if (hasCriticalError) {
                return;
            }

            if (finalTranscriptResult && !isInterruptedRef.current) {
                listenRetryCountRef.current = 0; // Reset on success
                processMessage(finalTranscriptResult);
            } else if (!isInterruptedRef.current) {
                // No speech detected, restart with retry limit
                listenRetryCountRef.current++;
                console.log(`[Voice] No speech, retry ${listenRetryCountRef.current}/${MAX_LISTEN_RETRIES}`);
                setTimeout(() => startListening(), 1000);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error('[Voice] Recognition error:', event.error);

            switch (event.error) {
                case 'no-speech':
                    // Restart listening on no-speech with retry limit
                    listenRetryCountRef.current++;
                    console.log(`[Voice] No-speech error, retry ${listenRetryCountRef.current}/${MAX_LISTEN_RETRIES}`);
                    setTimeout(() => startListening(), 1000);
                    break;
                case 'aborted':
                    // User or system aborted, ignore
                    console.log('[Voice] Recognition aborted');
                    break;
                case 'not-allowed':
                case 'service-not-allowed':
                    // Microphone permission denied
                    console.error('[Voice] Microphone permission denied');
                    setResponse('Pakibigyan ng permiso ang mikropono.');
                    hasCriticalError = true;
                    setState('idle');
                    break;
                case 'network':
                    // Network error
                    console.error('[Voice] Network error');
                    setResponse('May problema sa koneksyon.');
                    hasCriticalError = true;
                    setState('idle');
                    break;
                default:
                    // Other errors - try to continue
                    listenRetryCountRef.current++;
                    if (listenRetryCountRef.current < MAX_LISTEN_RETRIES) {
                        setTimeout(() => startListening(), 1000);
                    } else {
                        setState('idle');
                        listenRetryCountRef.current = 0;
                    }
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
            console.log('[Voice] Recognition started successfully');
        } catch (err) {
            console.error('[Voice] Failed to start recognition:', err);
            setState('idle');
        }
    }, [language]);

    // Process and get response with retry logic
    const processMessage = useCallback(async (text: string) => {
        if (!text.trim()) {
            setState('listening');
            startListening();
            return;
        }

        setState('processing');
        setTranscript(text);

        const newMessages = [...messages, { role: 'user' as const, content: text }];
        setMessages(newMessages);

        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[Voice] Chat attempt ${attempt}/${maxRetries}`);

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: newMessages,
                        language,
                    }),
                });

                if (!response.ok) throw new Error(`Chat failed: ${response.status}`);

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let fullResponse = '';

                if (reader) {
                    let done = false;
                    while (!done) {
                        const result = await reader.read();
                        done = result.done;
                        if (done) break;

                        const chunk = decoder.decode(result.value, { stream: true });
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('0:')) {
                                try {
                                    const parsedText = JSON.parse(line.slice(2));
                                    if (typeof parsedText === 'string') {
                                        fullResponse += parsedText;
                                    }
                                } catch {
                                    // Skip malformed JSON
                                }
                            }
                        }
                    }
                }

                // Check if we got a valid response
                if (!fullResponse.trim()) {
                    throw new Error('Empty response from chat API');
                }

                setResponse(fullResponse);
                setMessages([...newMessages, { role: 'assistant', content: fullResponse }]);

                await speakResponse(fullResponse);
                return; // Success, exit the retry loop

            } catch (err) {
                lastError = err instanceof Error ? err : new Error('Unknown error');
                console.error(`[Voice] Chat attempt ${attempt} failed:`, lastError.message);

                if (attempt < maxRetries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // All retries failed
        console.error('[Voice] All chat attempts failed');
        setResponse('Pasensya, may problema sa koneksyon. Subukan ulit.');
        // Restart listening after error
        listenRetryCountRef.current = 0; // Reset retry counter
        setTimeout(() => startListening(), 1000);
    }, [messages, language]);

    // TTS
    const speakResponse = useCallback(async (text: string) => {
        setState('speaking');

        try {
            const ttsLang = TTS_LANGS[language] || 'bcl';

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: ttsLang }),
            });

            if (!response.ok) {
                console.error('[Voice] TTS response not ok:', response.status);
                throw new Error('TTS failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (!isInterruptedRef.current) {
                    console.log('[Voice] Audio ended, restarting listening');
                    listenRetryCountRef.current = 0; // Reset retry counter for new session
                    setTimeout(() => startListening(), 500);
                }
            };

            audio.onerror = (e) => {
                console.error('[Voice] Audio playback error:', e);
                URL.revokeObjectURL(audioUrl);
                // Restart listening after audio error
                listenRetryCountRef.current = 0; // Reset retry counter
                setTimeout(() => startListening(), 500);
            };

            await audio.play();
        } catch (err) {
            console.error('[Voice] TTS error:', err);
            // On TTS error, restart listening instead of going idle
            listenRetryCountRef.current = 0; // Reset retry counter
            setTimeout(() => startListening(), 1000);
        }
    }, [language, startListening]);

    // Start conversation with explicit microphone permission request
    const handleStart = useCallback(async () => {
        setState('connecting');
        listenRetryCountRef.current = 0; // Reset retry counter
        isInterruptedRef.current = false; // Reset interrupted flag

        // Explicitly request microphone permission first (with timeout)
        try {
            console.log('[Voice] Requesting microphone permission...');

            // Timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Microphone request timeout')), 10000);
            });

            // Get user media with timeout
            const stream = await Promise.race([
                navigator.mediaDevices.getUserMedia({ audio: true }),
                timeoutPromise
            ]);

            // Stop the stream immediately - we just needed the permission
            stream.getTracks().forEach(track => track.stop());
            console.log('[Voice] Microphone permission granted');
        } catch (err) {
            console.error('[Voice] Microphone error:', err);
            const message = err instanceof Error && err.message.includes('timeout')
                ? 'Nagtimeout ang pagkonekta sa mikropono. Subukan ulit.'
                : 'Pakibigyan ng permiso ang mikropono para magamit ang voice mode.';
            setResponse(message);
            setState('idle');
            return;
        }

        // Now start VAD and speech recognition
        console.log('[Voice] Starting VAD and speech recognition...');
        setTimeout(() => {
            startVAD();
            startListening();
        }, 300);
    }, [startVAD, startListening]);

    // Stop
    const handleStop = useCallback(() => {
        console.log('[Voice] Stopping conversation...');
        isInterruptedRef.current = true; // Prevent onend from restarting

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        stopVAD();
        setState('idle');
        setTranscript('');
        setResponse('');
    }, [stopVAD]);

    // Cleanup
    useEffect(() => {
        return () => {
            handleStop();
        };
    }, [handleStop]);

    const getStateLabel = () => {
        switch (state) {
            case 'idle': return t('voiceMode.tapToStart') || 'Tap to start';
            case 'connecting': return 'Connecting...';
            case 'listening': return t('voiceMode.listening') || 'Listening...';
            case 'processing': return t('voiceMode.thinking') || 'Thinking...';
            case 'speaking': return t('voiceMode.speaking') || 'Speaking...';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen jarvis-bg text-white flex flex-col relative overflow-hidden">
            {/* Matrix Rain Background */}
            <MatrixRain opacity={0.12} />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-4 border-b border-cyan-500/20 bg-black/30 backdrop-blur-sm">
                <Link href="/chat" className="flex items-center gap-2 text-cyan-400/70 hover:text-cyan-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Bumalik
                </Link>

                <h1 className="text-lg font-medium jarvis-cyan jarvis-glow">Gabay Voice</h1>

                <div className="w-24" />
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
                {/* Circular HUD with JARVIS Visualizer */}
                <div className="mb-8">
                    <CircularHUD state={state} audioLevel={audioLevel}>
                        {/* JARVIS Dot Visualizer */}
                        <JarvisVisualizer state={state} audioLevel={audioLevel} />
                    </CircularHUD>
                </div>

                {/* Agent Name */}
                <h2 className="text-3xl font-bold mb-2 jarvis-cyan jarvis-glow">
                    Gabay
                </h2>
                <p className="text-cyan-400/50 mb-6">Ang Iyong Katulong sa Kalusugan</p>

                {/* State Label */}
                <div className={`flex items-center gap-2 mb-8 ${state === 'idle' ? 'text-cyan-500/50' :
                    state === 'listening' ? 'text-cyan-400' :
                        state === 'processing' ? 'text-yellow-400' :
                            state === 'speaking' ? 'text-cyan-300' :
                                'text-cyan-500/50'
                    }`}>
                    {state !== 'idle' && (
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ boxShadow: '0 0 8px currentColor' }} />
                    )}
                    <span className="text-lg">{getStateLabel()}</span>
                </div>

                {/* Transcript/Response Display */}
                <div className="max-w-lg w-full space-y-4 mb-8">
                    {transcript && state !== 'idle' && (
                        <div className="bg-cyan-500/10 rounded-xl p-4 backdrop-blur-sm border border-cyan-500/20">
                            <p className="text-xs text-cyan-400/60 mb-1">Ikaw</p>
                            <p className="text-cyan-100">{transcript}</p>
                        </div>
                    )}

                    {response && (state === 'speaking' || messages.length > 0) && (
                        <div className="bg-cyan-500/15 rounded-xl p-4 backdrop-blur-sm border border-cyan-400/30">
                            <p className="text-xs text-cyan-400/70 mb-1">Gabay</p>
                            <p className="text-white jarvis-glow">{response}</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    {state === 'idle' ? (
                        <Button
                            onClick={handleStart}
                            size="lg"
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 px-8 py-6 text-lg rounded-full shadow-lg animate-glow-pulse"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Magsimula
                        </Button>
                    ) : (
                        <Button
                            onClick={handleStop}
                            size="lg"
                            variant="outline"
                            className="border-red-500/50 hover:bg-red-500/20 text-red-400 px-8 py-6 text-lg rounded-full"
                        >
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                            Tapusin
                        </Button>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-4 text-center text-cyan-500/40 text-sm border-t border-cyan-500/10 bg-black/30 backdrop-blur-sm">
                <p>Magsalita ng natural. Handa akong makinig sa iyo.</p>
            </footer>
        </div>
    );
}
