'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fil' | 'bcl';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Header
        'app.name': 'MyNaga Gabay',
        'app.tagline': 'Your Health Assistant',
        'status.online': 'Online',

        // Chat
        'chat.placeholder': 'Ask Gabay anything...',
        'chat.greeting': 'Hello! I am Gabay',
        'chat.description': 'Your Bikolano health assistant. Ask me about health facilities, medications, PhilHealth coverage, or any health questions.',
        'chat.newChat': 'New Chat',
        'chat.recentChats': 'Recent Chats',
        'chat.disclaimer': 'Gabay can make mistakes. Consider verifying important health information.',

        // Suggestions
        'suggestion.hospital': 'Find nearest hospital',
        'suggestion.philhealth': 'PhilHealth coverage',
        'suggestion.dosage': 'Paracetamol dosage',

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.facilities': 'Facilities',
        'nav.medications': 'Medications',
        'nav.philhealth': 'PhilHealth',

        // Landing
        'landing.hero.title': 'Your Health Assistant in',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Get health information, find nearby facilities, and understand your medications — all in Bikol, Filipino, or English.',
        'landing.hero.cta': 'Start Chat with Gabay',
        'landing.hero.signin': 'Sign In / Sign Up',
        'landing.features.title': 'What Gabay Can Help You With',

        // Auth
        'auth.welcome': 'Welcome Back',
        'auth.create': 'Create Account',
        'auth.signin': 'Sign In',
        'auth.signup': 'Sign Up',
        'auth.guest': 'Continue as guest',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
    fil: {
        // Header
        'app.name': 'MyNaga Gabay',
        'app.tagline': 'Ang Iyong Katulong sa Kalusugan',
        'status.online': 'Online',

        // Chat
        'chat.placeholder': 'Magtanong kay Gabay...',
        'chat.greeting': 'Kumusta! Ako si Gabay',
        'chat.description': 'Ang iyong Bikolano health assistant. Magtanong tungkol sa health facilities, gamot, PhilHealth coverage, o anumang tanong sa kalusugan.',
        'chat.newChat': 'Bagong Chat',
        'chat.recentChats': 'Kamakailang Chat',
        'chat.disclaimer': 'Maaaring magkamali si Gabay. Siguraduhing i-verify ang mahalagang impormasyon sa kalusugan.',

        // Suggestions
        'suggestion.hospital': 'Hanapin ang pinakamalapit na ospital',
        'suggestion.philhealth': 'PhilHealth coverage',
        'suggestion.dosage': 'Dosage ng Paracetamol',

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.facilities': 'Pasilidad',
        'nav.medications': 'Gamot',
        'nav.philhealth': 'PhilHealth',

        // Landing
        'landing.hero.title': 'Ang Iyong Katulong sa Kalusugan sa',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Kumuha ng impormasyon sa kalusugan, maghanap ng mga kalapit na pasilidad, at unawain ang iyong mga gamot — lahat sa Bikol, Filipino, o English.',
        'landing.hero.cta': 'Makipag-chat kay Gabay',
        'landing.hero.signin': 'Mag-sign In / Sign Up',
        'landing.features.title': 'Paano Makakatulong si Gabay',

        // Auth
        'auth.welcome': 'Maligayang Pagbabalik',
        'auth.create': 'Gumawa ng Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.guest': 'Magpatuloy bilang bisita',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
    bcl: {
        // Header
        'app.name': 'MyNaga Gabay',
        'app.tagline': 'An Saimong Katabang sa Salud',
        'status.online': 'Online',

        // Chat
        'chat.placeholder': 'Mag-hapot sa Gabay...',
        'chat.greeting': 'Kumusta! Ako si Gabay',
        'chat.description': 'An saimong Bikolano health assistant. Mag-hapot manungod sa health facilities, bulong, PhilHealth coverage, o arin man na hapot sa salud.',
        'chat.newChat': 'Bagong Chat',
        'chat.recentChats': 'Mga Nakaaging Chat',
        'chat.disclaimer': 'Pwedeng magkasala si Gabay. Siguraduhon na i-verify an importante na impormasyon sa salud.',

        // Suggestions
        'suggestion.hospital': 'Hanapon an pinakaharani na ospital',
        'suggestion.philhealth': 'PhilHealth coverage',
        'suggestion.dosage': 'Dosage nin Paracetamol',

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.facilities': 'Pasilidad',
        'nav.medications': 'Bulong',
        'nav.philhealth': 'PhilHealth',

        // Landing
        'landing.hero.title': 'An Saimong Katabang sa Salud sa',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Makakua nin impormasyon sa salud, maghanap nin mga harani na pasilidad, asin intindihon an saimong mga bulong — gabos sa Bikol, Filipino, o English.',
        'landing.hero.cta': 'Makipag-chat ki Gabay',
        'landing.hero.signin': 'Mag-sign In / Sign Up',
        'landing.features.title': 'Paano Makakatabang si Gabay',

        // Auth
        'auth.welcome': 'Maogmang Pagbalik',
        'auth.create': 'Gumibo nin Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.guest': 'Magpadagos bilang bisita',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fil');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('gabay-language') as Language;
        if (saved && ['en', 'fil', 'bcl'].includes(saved)) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('gabay-language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
