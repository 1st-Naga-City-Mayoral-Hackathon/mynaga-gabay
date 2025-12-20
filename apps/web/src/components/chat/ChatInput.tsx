'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, Mic, Send, Volume2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

// Voice mode states for hands-free conversation
type VoiceModeState = 'off' | 'listening' | 'processing' | 'speaking';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (overrideText?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  // For voice mode - callback to get response text for TTS
  lastAssistantMessage?: string;
  onVoiceModeChange?: (active: boolean) => void;
}

// Web Speech API language codes
const WEB_SPEECH_LANGS: Record<string, string> = {
  en: 'en-US',
  fil: 'fil-PH',
  // bcl not supported by Web Speech API - will use Python STT
};

// TTS language codes
const TTS_LANGS: Record<string, string> = {
  en: 'eng',
  fil: 'fil',
  bcl: 'bcl',
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  lastAssistantMessage,
  onVoiceModeChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language, t } = useLanguage();

  // Voice mode state
  const [voiceMode, setVoiceMode] = useState<VoiceModeState>('off');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Refs for voice handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bikolRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bikolRetryCountRef = useRef(0);
  const webSpeechRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const webSpeechRetryCountRef = useRef(0);
  const webSpeechBusyRef = useRef(false);
  const isVoiceModeActiveRef = useRef(false);
  const lastProcessedMessageRef = useRef<string | null>(null);
  const onSubmitRef = useRef(onSubmit);

  // Keep onSubmit ref up to date
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Sync ref with state
  useEffect(() => {
    isVoiceModeActiveRef.current = voiceMode !== 'off';
    onVoiceModeChange?.(voiceMode !== 'off');
  }, [voiceMode, onVoiceModeChange]);

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

  const clearBikolRetryTimeout = useCallback(() => {
    if (bikolRetryTimeoutRef.current) {
      clearTimeout(bikolRetryTimeoutRef.current);
      bikolRetryTimeoutRef.current = null;
    }
  }, []);

  const clearWebSpeechRetryTimeout = useCallback(() => {
    if (webSpeechRetryTimeoutRef.current) {
      clearTimeout(webSpeechRetryTimeoutRef.current);
      webSpeechRetryTimeoutRef.current = null;
    }
  }, []);

  // TTS playback
  const playTTS = useCallback(
    async (text: string): Promise<void> => {
      if (!text || !isVoiceModeActiveRef.current) return;

      setVoiceMode('speaking');
      const ttsLang = TTS_LANGS[language] || 'bcl';

      try {
        console.log('[VoiceMode] Playing TTS:', text.substring(0, 50) + '...');

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: ttsLang }),
        });

        if (!response.ok) {
          throw new Error('TTS failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.play().catch(() => resolve());
        });
      } catch (err) {
        console.error('[VoiceMode] TTS error:', err);

        // Production on Vercel often won't have the Python TTS service running.
        // Fall back to the browser's built-in Speech Synthesis for English/Filipino.
        if (language === 'en' || language === 'fil') {
          try {
            if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

            // Stop any ongoing speech
            window.speechSynthesis.cancel();

            await new Promise<void>((resolve) => {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = language === 'fil' ? 'fil-PH' : 'en-US';
              utterance.onend = () => resolve();
              utterance.onerror = () => resolve();
              window.speechSynthesis.speak(utterance);
            });
          } catch (fallbackErr) {
            console.error('[VoiceMode] Browser TTS fallback error:', fallbackErr);
          }
        }
      }
    },
    [language]
  );

  // Start listening with Web Speech API
  const startListening = useCallback(() => {
    if (!isVoiceModeActiveRef.current) {
      console.log('[VoiceMode] Not active, skipping listen');
      return;
    }

    // Avoid restart storms / overlapping recognition instances
    clearWebSpeechRetryTimeout();
    if (webSpeechBusyRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('[VoiceMode] Speech recognition not supported');
      setVoiceMode('off');
      return;
    }

    console.log('[VoiceMode] Starting listening...');
    setVoiceMode('listening');
    setInterimTranscript('');

    // Abort any existing instance before starting a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    const scheduleRestart = () => {
      if (!isVoiceModeActiveRef.current) return;

      webSpeechRetryCountRef.current += 1;

      // If recognition is repeatedly failing, stop voice mode rather than pegging CPU
      if (webSpeechRetryCountRef.current >= 8) {
        isVoiceModeActiveRef.current = false;
        webSpeechBusyRef.current = false;
        setVoiceMode('off');
        setInterimTranscript('');
        clearWebSpeechRetryTimeout();
        alert(
          t('voiceMode.recognitionStuck') ||
            'Voice mode stopped: Speech recognition kept failing. Try again or switch language.'
        );
        return;
      }

      const retryDelayMs = Math.min(8000, 300 * 2 ** Math.min(webSpeechRetryCountRef.current, 4));
      clearWebSpeechRetryTimeout();
      webSpeechRetryTimeoutRef.current = setTimeout(() => {
        if (isVoiceModeActiveRef.current) startListening();
      }, retryDelayMs);
    };

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = WEB_SPEECH_LANGS[language] || 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('[VoiceMode] Recognition started');
      webSpeechBusyRef.current = true;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        finalTranscript = finalText;
      }
      setInterimTranscript(interimText);

      // Reset silence timer
      clearSilenceTimeout();
      if (finalText) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 1500);
      }
    };

    recognition.onend = () => {
      console.log('[VoiceMode] Recognition ended, transcript:', finalTranscript);
      clearSilenceTimeout();
      setInterimTranscript('');
      webSpeechBusyRef.current = false;

      if (finalTranscript && isVoiceModeActiveRef.current) {
        webSpeechRetryCountRef.current = 0;
        setVoiceMode('processing');
        onChange(finalTranscript);
        setTimeout(() => {
          onSubmitRef.current(finalTranscript);
        }, 100);
      } else if (isVoiceModeActiveRef.current) {
        // No speech detected, restart listening
        scheduleRestart();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('[VoiceMode] Recognition error:', event.error);
      clearSilenceTimeout();
      webSpeechBusyRef.current = false;

      if (event.error === 'no-speech' && isVoiceModeActiveRef.current) {
        scheduleRestart();
      } else if (event.error === 'not-allowed') {
        setVoiceMode('off');
        isVoiceModeActiveRef.current = false;
        clearWebSpeechRetryTimeout();
        alert('Microphone access denied. Please allow microphone access.');
      } else if (event.error !== 'aborted' && isVoiceModeActiveRef.current) {
        scheduleRestart();
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('[VoiceMode] Failed to start:', err);
      webSpeechBusyRef.current = false;
      if (isVoiceModeActiveRef.current) {
        scheduleRestart();
      }
    }
  }, [language, onChange, clearSilenceTimeout, clearWebSpeechRetryTimeout, t]);

  // Handle Bikol STT (Python backend)
  const startBikolListening = useCallback(async () => {
    if (!isVoiceModeActiveRef.current) return;

    setVoiceMode('listening');

    try {
      // Prevent overlapping recordings (can happen if we retry too aggressively)
      if (mediaRecorderRef.current?.state === 'recording') return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (!isVoiceModeActiveRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceMode('processing');

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
            if (result.text && isVoiceModeActiveRef.current) {
              // Success: reset backoff counters
              bikolRetryCountRef.current = 0;
              clearBikolRetryTimeout();
              onChange(result.text);
              onSubmitRef.current(result.text);
            } else if (isVoiceModeActiveRef.current) {
              // No transcription returned; retry with backoff
              bikolRetryCountRef.current += 1;
              const retryDelayMs = Math.min(8000, 1000 * 2 ** Math.min(bikolRetryCountRef.current, 3));
              clearBikolRetryTimeout();
              bikolRetryTimeoutRef.current = setTimeout(() => {
                if (isVoiceModeActiveRef.current) startBikolListening();
              }, retryDelayMs);
            }
          } else if (isVoiceModeActiveRef.current) {
            // Service failed (often AI service is down). Avoid hot-looping getUserMedia/MediaRecorder.
            bikolRetryCountRef.current += 1;
            if (bikolRetryCountRef.current >= 3) {
              setVoiceMode('off');
              isVoiceModeActiveRef.current = false;
              clearBikolRetryTimeout();
              alert(
                t('voiceMode.sttUnavailable') ||
                  'Voice mode stopped: Speech-to-text service is unavailable. Start the AI service (packages/ai) and try again.'
              );
              return;
            }
            const retryDelayMs = Math.min(8000, 1000 * 2 ** Math.min(bikolRetryCountRef.current, 3));
            clearBikolRetryTimeout();
            bikolRetryTimeoutRef.current = setTimeout(() => {
              if (isVoiceModeActiveRef.current) startBikolListening();
            }, retryDelayMs);
          }
        } catch (err) {
          console.error('[VoiceMode] Bikol STT error:', err);
          if (isVoiceModeActiveRef.current) {
            bikolRetryCountRef.current += 1;
            const retryDelayMs = Math.min(8000, 1000 * 2 ** Math.min(bikolRetryCountRef.current, 3));
            clearBikolRetryTimeout();
            bikolRetryTimeoutRef.current = setTimeout(() => {
              if (isVoiceModeActiveRef.current) startBikolListening();
            }, retryDelayMs);
          }
        }
      };

      mediaRecorder.start();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (err) {
      console.error('[VoiceMode] Microphone error:', err);
      setVoiceMode('off');
      alert('Could not access microphone. Please allow microphone access.');
    }
  }, [onChange, clearBikolRetryTimeout, t]);

  // Watch for new assistant messages to play TTS
  useEffect(() => {
    if (
      voiceMode === 'processing' &&
      lastAssistantMessage &&
      lastAssistantMessage !== lastProcessedMessageRef.current &&
      !isLoading
    ) {
      lastProcessedMessageRef.current = lastAssistantMessage;

      // Play TTS then restart listening
      playTTS(lastAssistantMessage).then(() => {
        if (isVoiceModeActiveRef.current) {
          if (language === 'bcl') {
            startBikolListening();
          } else {
            startListening();
          }
        }
      });
    }
  }, [lastAssistantMessage, isLoading, voiceMode, playTTS, startListening, startBikolListening, language]);

  // Toggle voice mode
  const handleVoiceModeToggle = useCallback(async () => {
    if (voiceMode !== 'off') {
      // Stop voice mode
      console.log('[VoiceMode] Stopping...');
      isVoiceModeActiveRef.current = false;
      webSpeechBusyRef.current = false;

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      clearSilenceTimeout();
      clearBikolRetryTimeout();
      clearWebSpeechRetryTimeout();

      setVoiceMode('off');
      setInterimTranscript('');
      lastProcessedMessageRef.current = null;
    } else {
      // Start voice mode - request mic permission first
      console.log('[VoiceMode] Starting...');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());

        isVoiceModeActiveRef.current = true;
        lastProcessedMessageRef.current = null;
        bikolRetryCountRef.current = 0;
        clearBikolRetryTimeout();
        webSpeechRetryCountRef.current = 0;
        clearWebSpeechRetryTimeout();

        if (language === 'bcl') {
          startBikolListening();
        } else {
          startListening();
        }
      } catch (err) {
        console.error('[VoiceMode] Mic permission denied:', err);
        alert('Microphone access is required for voice mode.');
      }
    }
  }, [
    voiceMode,
    language,
    startListening,
    startBikolListening,
    clearSilenceTimeout,
    clearBikolRetryTimeout,
    clearWebSpeechRetryTimeout,
    t,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isVoiceModeActiveRef.current = false;
      webSpeechBusyRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (bikolRetryTimeoutRef.current) {
        clearTimeout(bikolRetryTimeoutRef.current);
      }
      if (webSpeechRetryTimeoutRef.current) {
        clearTimeout(webSpeechRetryTimeoutRef.current);
      }
    };
  }, []);

  // Get voice button icon and style
  const getVoiceButtonContent = () => {
    switch (voiceMode) {
      case 'listening':
        return (
          <>
            {/* Pulsing animation */}
            <span className="absolute inset-0 rounded-xl bg-gabay-orange animate-ping opacity-50" />
            <span className="absolute inset-0 rounded-xl bg-gabay-orange animate-pulse opacity-30" />
            <Mic className="w-5 h-5 relative z-10 text-white" />
          </>
        );
      case 'processing':
        return (
          <>
            <span className="absolute inset-0 rounded-xl bg-gabay-purple/20 animate-pulse" />
            <Loader2 className="w-5 h-5 relative z-10 animate-spin text-gabay-purple" />
          </>
        );
      case 'speaking':
        return (
          <>
            <span className="absolute inset-0 rounded-xl bg-gabay-teal/20 animate-pulse" />
            <Volume2 className="w-5 h-5 relative z-10 text-gabay-teal animate-pulse" />
          </>
        );
      default:
        return <Mic className="w-5 h-5" />;
    }
  };

  const getVoiceButtonClass = () => {
    if (voiceMode === 'listening') return 'bg-gabay-orange hover:bg-gabay-orange/90';
    if (voiceMode === 'processing') return 'bg-gabay-purple/10 border border-gabay-purple text-gabay-purple';
    if (voiceMode === 'speaking') return 'bg-gabay-teal/10 border border-gabay-teal text-gabay-teal';
    return '';
  };

  const getVoiceTooltip = () => {
    switch (voiceMode) {
      case 'listening':
        return t('voiceMode.listening') || 'Listening... Tap to stop';
      case 'processing':
        return t('voiceMode.thinking') || 'Thinking...';
      case 'speaking':
        return t('voiceMode.speaking') || 'Speaking... Tap to stop';
      default:
        return t('voiceMode.tapToStart') || 'Start voice conversation';
    }
  };

  const isVoiceModeActive = voiceMode !== 'off';

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Voice Mode Status Bar */}
        {isVoiceModeActive && (
          <div className="flex items-center justify-center gap-2 mb-3 py-2 px-4 rounded-full bg-muted text-sm">
            <span
              className={[
                'w-2 h-2 rounded-full animate-pulse',
                voiceMode === 'listening'
                  ? 'bg-gabay-orange'
                  : voiceMode === 'processing'
                    ? 'bg-gabay-purple'
                    : 'bg-gabay-teal',
              ].join(' ')}
            />
            <span className="text-muted-foreground">
              {voiceMode === 'listening' && (t('voiceMode.listening') || 'Listening...')}
              {voiceMode === 'processing' && (t('voiceMode.thinking') || 'Thinking...')}
              {voiceMode === 'speaking' && (t('voiceMode.speaking') || 'Speaking...')}
            </span>
            {interimTranscript && (
              <span className="text-foreground italic truncate max-w-[200px]">
                &quot;{interimTranscript}&quot;
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-muted rounded-2xl p-2">
          {/* Voice Mode Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVoiceModeActive ? 'default' : 'ghost'}
                  size="icon"
                  onClick={handleVoiceModeToggle}
                  disabled={isLoading && !isVoiceModeActive}
                  className={`h-10 w-10 rounded-xl flex-shrink-0 relative ${getVoiceButtonClass()}`}
                >
                  {getVoiceButtonContent()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{getVoiceTooltip()}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isVoiceModeActive
                  ? t('voiceMode.listening') || 'Listening...'
                  : placeholder || 'Ask Gabay anything...'
              }
              className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-3"
              rows={1}
              disabled={isVoiceModeActive}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={() => onSubmit()}
            disabled={!value.trim() || isLoading || isVoiceModeActive}
            size="icon"
            className="h-10 w-10 rounded-xl bg-gabay-teal hover:bg-gabay-teal/90 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
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
