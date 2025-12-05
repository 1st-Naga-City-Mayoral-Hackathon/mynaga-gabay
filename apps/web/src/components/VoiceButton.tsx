'use client';

import { useState, useRef } from 'react';
import type { SupportedLanguage } from '@mynaga/shared';

interface VoiceButtonProps {
    onTranscript: (text: string) => void;
    language: SupportedLanguage;
}

export function VoiceButton({ onTranscript, language }: VoiceButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const langMap: Record<SupportedLanguage, string> = {
        en: 'en-US',
        fil: 'fil-PH',
        bcl: 'fil-PH', // Bikol uses Filipino as closest supported
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = langMap[language];

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return (
        <button
            onClick={isListening ? stopListening : startListening}
            className={`
        relative p-3 rounded-xl transition-all duration-300
        ${isListening
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white/50 dark:bg-slate-800/50 text-gabay-teal hover:bg-gabay-teal/20'
                }
      `}
        >
            {isListening && (
                <span className="absolute inset-0 rounded-xl bg-red-500/50 animate-ping" />
            )}
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
            </svg>
        </button>
    );
}

// TypeScript declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
