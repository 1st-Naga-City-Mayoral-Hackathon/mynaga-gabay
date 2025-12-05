import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '@mynaga/shared';

interface LanguageSelectorProps {
    value: SupportedLanguage;
    onChange: (lang: SupportedLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    return (
        <div className="flex gap-2 p-1 rounded-xl bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm">
            {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    onClick={() => onChange(lang)}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${value === lang
                            ? 'bg-gradient-to-r from-gabay-teal to-gabay-blue text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-white/30'
                        }
          `}
                >
                    {LANGUAGE_NAMES[lang]}
                </button>
            ))}
        </div>
    );
}
