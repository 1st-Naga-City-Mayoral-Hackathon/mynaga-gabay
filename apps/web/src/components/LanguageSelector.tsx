'use client';

import { useEffect, useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
    { code: 'bcl', name: 'Bikol', flag: '🏝️' },
];

export function LanguageSelector() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return placeholder during SSR
    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                <span>🇵🇭</span>
                <span className="hidden sm:inline">Filipino</span>
            </Button>
        );
    }

    return <LanguageSelectorClient />;
}

function LanguageSelectorClient() {
    const { language, setLanguage, t } = useLanguage();
    const current = languages.find((l) => l.code === language) || languages[1];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                    <span>{current.flag}</span>
                    <span className="hidden sm:inline">{t(`lang.${language}`)}</span>
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={language === lang.code ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                        {language === lang.code && (
                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
