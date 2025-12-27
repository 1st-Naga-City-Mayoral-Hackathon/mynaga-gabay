'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TTSButton } from './TTSButton';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MedicationCardUI,
  FacilityCardUI,
  RouteMapCard,
  ScheduleCardUI,
  BookingCardUI,
  PrescriptionCardUI,
  MedicationPlanCardUI,
  SafetyBanner,
} from './cards';
import type {
  AssistantEnvelope,
  AssistantCard,
} from '@mynaga/shared';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imagePreviewUrl?: string;
  imageName?: string;
}

interface MessageProps {
  message: MessageType;
}

// Map UI language codes to TTS language codes
type TTSLanguage = 'eng' | 'fil' | 'bcl';
const languageToTTS: Record<string, TTSLanguage> = {
  en: 'eng', // UI uses 'en', TTS uses 'eng'
  fil: 'fil', // Same
  bcl: 'bcl', // Same
};

// Type guard for checking if content is an envelope
function parseEnvelope(content: string): AssistantEnvelope | null {
  try {
    const parsed = JSON.parse(content);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.text === 'string' &&
      Array.isArray(parsed.cards)
    ) {
      return parsed as AssistantEnvelope;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to check card types
function checkCardType(card: AssistantCard): {
  isMedication: boolean;
  isFacility: boolean;
  isRoute: boolean;
  isSchedule: boolean;
  isBooking: boolean;
  isPrescription: boolean;
  isMedicationPlan: boolean;
} {
  return {
    isMedication: card.cardType === 'medication',
    isFacility: card.cardType === 'facility',
    isRoute: card.cardType === 'route',
    isSchedule: card.cardType === 'schedule',
    isBooking: card.cardType === 'booking',
    isPrescription: card.cardType === 'prescription',
    isMedicationPlan: card.cardType === 'medication_plan',
  };
}

function AssistantCards({ cards }: { cards: AssistantCard[] }) {
  return (
    <div className="mt-3 space-y-2">
      {cards.map((card, index) => {
        const types = checkCardType(card);

        if (types.isMedication && card.cardType === 'medication') {
          return <MedicationCardUI key={index} card={card} />;
        }

        if (types.isFacility && card.cardType === 'facility') {
          return <FacilityCardUI key={index} card={card} />;
        }

        if (types.isRoute && card.cardType === 'route') {
          return <RouteMapCard key={index} card={card} />;
        }

        if (types.isSchedule && card.cardType === 'schedule') {
          return <ScheduleCardUI key={index} card={card} />;
        }

        if (types.isBooking && card.cardType === 'booking') {
          return <BookingCardUI key={index} card={card} />;
        }

        if (types.isPrescription && card.cardType === 'prescription') {
          return <PrescriptionCardUI key={index} card={card} />;
        }

        if (types.isMedicationPlan && card.cardType === 'medication_plan') {
          return <MedicationPlanCardUI key={index} card={card} />;
        }

        return null;
      })}
    </div>
  );
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const { language } = useLanguage();

  // Get TTS language code (map 'en' to 'eng')
  const ttsLanguage: TTSLanguage = languageToTTS[language] || 'bcl';

  // Parse content to check if it's a structured envelope
  const envelope = useMemo(() => {
    if (isUser) return null;
    return parseEnvelope(message.content);
  }, [message.content, isUser]);

  // Get text content for TTS and display
  const textContent = envelope ? envelope.text : message.content;

  return (
    <div className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}>
      <Avatar
        className={cn(
          'w-8 h-8 flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-gabay-orange-500 to-gabay-orange-600'
        )}
      >
        <AvatarFallback className="text-sm">{isUser ? '👤' : '🏥'}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-[85%] break-words',
          isUser
            ? 'inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-md'
            : 'block p-0' // assistant: NO bubble
        )}
      >
        {isUser ? (
          <div className="space-y-2">
            {message.imagePreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.imagePreviewUrl}
                alt={message.imageName || 'Attached image'}
                className="max-h-64 w-auto rounded-xl border"
              />
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div>
            {/* Safety banner for structured responses */}
            {envelope && envelope.safety && (
              <SafetyBanner safety={envelope.safety} />
            )}

            {/* Text content rendered as markdown */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-gabay-orange-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                {textContent}
              </ReactMarkdown>
            </div>

            {/* Render cards for structured responses */}
            {envelope && envelope.cards.length > 0 && (
              <AssistantCards cards={envelope.cards} />
            )}
          </div>
        )}
      </div>

      {/* Action buttons for assistant messages - always visible */}
      {!isUser && (
        <div className="flex flex-col gap-1">
          {/* TTS Button - Uses selected language */}
          <TTSButton text={textContent} language={ttsLanguage} />

          {/* Copy button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigator.clipboard.writeText(textContent)}
            title="Copy message"
          >
            <span className="text-xs">📋</span>
          </Button>
        </div>
      )}
    </div>
  );
}
