export const SUPPORTED_LANGUAGES = ['en', 'fil', 'bcl'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    en: 'English',
    fil: 'Filipino',
    bcl: 'Bikol',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'fil';

export const LANGUAGE_GREETINGS: Record<SupportedLanguage, string> = {
    en: 'Hello! I am Gabay, your health assistant. How can I help you today?',
    fil: 'Kamusta! Ako si Gabay, ang iyong katulong sa kalusugan. Paano kita matutulungan ngayon?',
    bcl: 'Kumusta! Ako si Gabay, an saimong katabang sa salud. Paano taka matabangan ngunyan?',
};
