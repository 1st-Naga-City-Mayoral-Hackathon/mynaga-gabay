'use client';

import type { SupportedLanguage } from '@mynaga/shared';

interface LanguageSelectorProps {
    value: SupportedLanguage;
    onChange: (lang: SupportedLanguage) => void;
}

const languages = [
    { code: 'bcl' as SupportedLanguage, label: 'Bikol', flag: '🇵🇭' },
    { code: 'fil' as SupportedLanguage, label: 'Filipino', flag: '🇵🇭' },
    { code: 'en' as SupportedLanguage, label: 'English', flag: '🇺🇸' },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    return (
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => onChange(lang.code)}
                    className={`
            relative px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${value === lang.code
                            ? 'bg-white dark:bg-slate-700 text-gabay-teal shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-gabay-teal hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }
          `}
                >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
