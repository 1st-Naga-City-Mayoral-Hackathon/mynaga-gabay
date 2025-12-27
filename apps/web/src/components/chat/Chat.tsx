'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { LocationCapture } from './LocationCapture';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UserLocation, AssistantEnvelope } from '@mynaga/shared';

interface ChatProps {
  // Language prop is optional - will use context if not provided
  language?: 'en' | 'fil' | 'bcl';
}

// Type for our messages
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imagePreviewUrl?: string;
  imageName?: string;
}

export function Chat({ language: langProp }: ChatProps) {
  // Use language from context, fallback to prop
  const { language: contextLang, t } = useLanguage();
  const language = langProp || contextLang;

  const { status: sessionStatus } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showLocationCapture, setShowLocationCapture] = useState(false);
  const [dismissedLocationPrompt, setDismissedLocationPrompt] = useState(false);
  const [dismissedSignInPrompt, setDismissedSignInPrompt] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  // Get the last assistant message for voice mode TTS
  const lastAssistantMessage =
    messages.length > 0
      ? messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content
      : undefined;

  // Get text content from potentially structured message
  const getTextContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.text === 'string') {
        return parsed.text;
      }
    } catch {
      // Not JSON, return as-is
    }
    return content;
  };

  const lastAssistantText = lastAssistantMessage
    ? getTextContent(lastAssistantMessage)
    : undefined;

  // From the start, prompt for location permission (non-blocking) so we can show nearby facilities/routes.
  // We don't auto-trigger the browser permission dialog; we show a banner with an explicit "Use GPS" action.
  useEffect(() => {
    try {
      // Restore saved location (so the location bar persists across refreshes)
      const savedLocationRaw = localStorage.getItem('gabay.userLocation');
      if (savedLocationRaw) {
        const parsed = JSON.parse(savedLocationRaw) as UserLocation;
        if (
          parsed &&
          typeof parsed === 'object' &&
          (typeof parsed.manualText === 'string' ||
            (typeof parsed.lat === 'number' && typeof parsed.lng === 'number'))
        ) {
          setUserLocation(parsed);
        }
      }

      const dismissed = localStorage.getItem('gabay.locationPromptDismissed') === '1';
      setDismissedLocationPrompt(dismissed);
      // If no saved location, show the capture prompt unless the user dismissed it.
      // (We still render a small "Location not set" bar so the user can set it later.)
      if (!dismissed && !savedLocationRaw) {
        setShowLocationCapture(true);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request location on first health-related message
  useEffect(() => {
    // Show location capture if we have messages but no location yet
    if (messages.length > 0 && !userLocation && !showLocationCapture) {
      // Show location capture when the user asks for nearby facilities, directions, or booking.
      // (Not only symptom keywords.)
      const hasHealthMessage = messages.some(
        (m) =>
          m.role === 'user' &&
          /\b(cough|coughing|fever|pain|sick|symptom|sakit|lagnat|ubo|masakit|hospital|clinic|health\s*center|facility|nearest|near\b|directions|route|map|book|booking|schedule|appointment)\b/i.test(
            m.content
          )
      );

      if (hasHealthMessage) {
        setShowLocationCapture(true);
      }
    }
  }, [messages, userLocation, showLocationCapture]);

  const handleLocationCapture = useCallback((location: UserLocation) => {
    setUserLocation(location);
    setShowLocationCapture(false);
    setDismissedLocationPrompt(true);
    try {
      localStorage.setItem('gabay.locationPromptDismissed', '1');
      localStorage.setItem('gabay.userLocation', JSON.stringify(location));
    } catch {
      // ignore
    }
  }, []);

  const handleDismissLocationPrompt = useCallback(() => {
    setShowLocationCapture(false);
    setDismissedLocationPrompt(true);
    try {
      localStorage.setItem('gabay.locationPromptDismissed', '1');
    } catch {
      // ignore
    }
  }, []);

  const handleClearLocation = useCallback(() => {
    setUserLocation(null);
    try {
      localStorage.removeItem('gabay.userLocation');
      localStorage.removeItem('gabay.locationPromptDismissed');
    } catch {
      // ignore
    }
    setDismissedLocationPrompt(false);
    setShowLocationCapture(true);
  }, []);

  const handleDismissSignInPrompt = useCallback(() => {
    setDismissedSignInPrompt(true);
    try {
      localStorage.setItem('gabay.signInPromptDismissed', '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('gabay.signInPromptDismissed') === '1';
      setDismissedSignInPrompt(dismissed);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = useCallback(
    async (overrideText?: string) => {
      const textToSubmit = overrideText ?? input;
      if ((!textToSubmit.trim() && !attachedImage) || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: textToSubmit.trim() ? textToSubmit : '[Image attached]',
        imagePreviewUrl: attachedImage?.previewUrl,
        imageName: attachedImage?.file?.name,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      if (attachedImage) setAttachedImage(null);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            language,
            location: userLocation || undefined,
            wantsBooking: true, // Enable booking by default
            hasImageAttachment: Boolean(attachedImage),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (reader) {
          let done = false;
          while (!done) {
            const result = await reader.read();
            done = result.done;
            if (done) break;

            const chunk = decoder.decode(result.value, { stream: true });
            // Parse SSE data
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  const payload = JSON.parse(line.slice(2));

                  // Check if it's a structured envelope or plain text
                  if (typeof payload === 'string') {
                    // Plain text response
                    assistantMessage.content += payload;
                  } else if (
                    typeof payload === 'object' &&
                    payload !== null &&
                    typeof payload.text === 'string'
                  ) {
                    // Structured envelope - store as JSON string
                    assistantMessage.content = JSON.stringify(payload);
                  }

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content }
                        : m
                    )
                  );
                } catch {
                  // Skip malformed lines
                }
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, language, userLocation, attachedImage]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Sign-in prompt (non-blocking): lets users know booking requires login */}
        {sessionStatus !== 'authenticated' && !dismissedSignInPrompt && (
          <div className="px-4 py-2 border-b bg-blue-50/60 dark:bg-blue-950/20 text-xs flex items-center justify-between gap-3">
            <span className="text-blue-800 dark:text-blue-200">
              To book appointments and save your history, please sign in.
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/login"
                className="text-blue-700 dark:text-blue-200 font-medium hover:underline"
              >
                Sign in
              </Link>
              <button
                onClick={handleDismissSignInPrompt}
                className="text-blue-700/80 dark:text-blue-200/80 hover:underline"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {/* Location capture prompt */}
        {showLocationCapture && (
          <LocationCapture
            onLocationCapture={handleLocationCapture}
            onDismiss={handleDismissLocationPrompt}
          />
        )}

        {/* Location indicator when captured */}
        {userLocation ? (
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b text-xs text-green-700 dark:text-green-300 flex items-center justify-between">
            <span>
              📍 Location:{' '}
              {userLocation.manualText
                ? userLocation.manualText
                : userLocation.lat && userLocation.lng
                  ? 'Coordinates'
                  : 'Set'}
              {userLocation.lat && userLocation.lng && (
                <span className="text-green-700/80 dark:text-green-300/80">
                  {' '}
                  ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                </span>
              )}
            </span>
            <button
              onClick={() => setShowLocationCapture(true)}
              className="text-green-600 hover:underline"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground flex items-center justify-between">
            <span>📍 Location not set (needed for nearby facilities & directions)</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLocationCapture(true)}
                className="text-gabay-orange-600 hover:underline"
              >
                Set
              </button>
              {dismissedLocationPrompt && (
                <button
                  onClick={handleClearLocation}
                  className="text-muted-foreground hover:underline"
                  title="Reset location prompt"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm text-center">
            {error.message || 'Something went wrong. Please try again.'}
          </div>
        )}

        {/* Input with Voice Mode */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={t('chat.placeholder')}
          lastAssistantMessage={lastAssistantText}
          attachmentPreviewUrl={attachedImage?.previewUrl || null}
          attachmentName={attachedImage?.file?.name || null}
          onAttachImage={(file) => {
            const previewUrl = URL.createObjectURL(file);
            setAttachedImage((prev) => {
              if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
              return { file, previewUrl };
            });
          }}
          onClearAttachment={() => {
            setAttachedImage((prev) => {
              if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
              return null;
            });
          }}
        />
      </div>
    </div>
  );
}
