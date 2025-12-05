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

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.about': 'About',
        'nav.facilities': 'Facilities',
        'nav.medications': 'Medications',
        'nav.philhealth': 'PhilHealth',

        // Landing Page
        'landing.badge': 'Now available for Naga City residents',
        'landing.hero.title': 'Your Health Assistant in',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Get health information, find nearby facilities, and understand your medications — all in Bikol, Filipino, or English.',
        'landing.hero.cta': 'Start Chat with Gabay',
        'landing.hero.signin': 'Sign In / Sign Up',
        'landing.features.title': 'What Gabay Can Help You With',
        'landing.trust.title': 'Built for Naga City',
        'landing.trust.description': 'Developed for the 1st Naga City Mayoral Hackathon to serve our Bikolano community with accessible health information in our native language.',
        'landing.stats.facilities': 'Health Facilities',
        'landing.stats.languages': 'Languages',
        'landing.stats.available': 'Available',

        // Features
        'feature.facilities.title': 'Find Health Facilities',
        'feature.facilities.desc': 'Locate hospitals, clinics, and barangay health centers in Naga City with contact info and directions.',
        'feature.medications.title': 'Medication Info',
        'feature.medications.desc': 'Learn about your medications, proper dosage, side effects, and drug interactions.',
        'feature.philhealth.title': 'PhilHealth Guide',
        'feature.philhealth.desc': 'Check coverage, understand requirements, and learn how to avail your benefits.',
        'feature.voice.title': 'Voice-First',
        'feature.voice.desc': 'Speak naturally in Bikol, Filipino, or English. Perfect for elderly and those who prefer speaking.',
        'feature.scanner.title': 'Prescription Scanner',
        'feature.scanner.desc': 'Take a photo of your prescription to understand what each medication is for.',
        'feature.ai.title': 'AI-Powered',
        'feature.ai.desc': 'Powered by advanced AI to give you accurate, helpful health information 24/7.',

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

        // Auth
        'auth.welcome': 'Welcome Back',
        'auth.create': 'Create Account',
        'auth.signin': 'Sign In',
        'auth.signup': 'Sign Up',
        'auth.guest': 'Continue as guest',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Full Name',
        'auth.forgot': 'Forgot password?',
        'auth.or': 'or continue with',

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

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.about': 'Tungkol',
        'nav.facilities': 'Pasilidad',
        'nav.medications': 'Gamot',
        'nav.philhealth': 'PhilHealth',

        // Landing Page
        'landing.badge': 'Ngayon ay available para sa mga residente ng Naga City',
        'landing.hero.title': 'Ang Iyong Katulong sa Kalusugan sa',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Kumuha ng impormasyon sa kalusugan, maghanap ng mga kalapit na pasilidad, at unawain ang iyong mga gamot — lahat sa Bikol, Filipino, o English.',
        'landing.hero.cta': 'Makipag-chat kay Gabay',
        'landing.hero.signin': 'Mag-sign In / Sign Up',
        'landing.features.title': 'Paano Makakatulong si Gabay',
        'landing.trust.title': 'Ginawa para sa Naga City',
        'landing.trust.description': 'Binuo para sa 1st Naga City Mayoral Hackathon upang magbigay ng accessible na impormasyon sa kalusugan sa ating sariling wika.',
        'landing.stats.facilities': 'Mga Pasilidad',
        'landing.stats.languages': 'Mga Wika',
        'landing.stats.available': 'Available',

        // Features
        'feature.facilities.title': 'Hanapin ang mga Pasilidad',
        'feature.facilities.desc': 'Hanapin ang mga ospital, klinika, at barangay health center sa Naga City.',
        'feature.medications.title': 'Impormasyon ng Gamot',
        'feature.medications.desc': 'Alamin ang tungkol sa iyong mga gamot, tamang dosage, side effects, at drug interactions.',
        'feature.philhealth.title': 'Gabay sa PhilHealth',
        'feature.philhealth.desc': 'Tingnan ang coverage, unawain ang requirements, at alamin kung paano makuha ang iyong benefits.',
        'feature.voice.title': 'Voice-First',
        'feature.voice.desc': 'Magsalita sa Bikol, Filipino, o English. Perpekto para sa matatanda.',
        'feature.scanner.title': 'Prescription Scanner',
        'feature.scanner.desc': 'Kumuha ng litrato ng iyong reseta para maintindihan ang bawat gamot.',
        'feature.ai.title': 'AI-Powered',
        'feature.ai.desc': 'Pinapagana ng advanced AI para magbigay ng accurate na impormasyon 24/7.',

        // Chat
        'chat.placeholder': 'Magtanong kay Gabay...',
        'chat.greeting': 'Kumusta! Ako si Gabay',
        'chat.description': 'Ang iyong Bikolano health assistant. Magtanong tungkol sa health facilities, gamot, PhilHealth coverage, o anumang tanong sa kalusugan.',
        'chat.newChat': 'Bagong Chat',
        'chat.recentChats': 'Kamakailang Chat',
        'chat.disclaimer': 'Maaaring magkamali si Gabay. Siguraduhing i-verify ang mahalagang impormasyon.',

        // Suggestions
        'suggestion.hospital': 'Hanapin ang pinakamalapit na ospital',
        'suggestion.philhealth': 'PhilHealth coverage',
        'suggestion.dosage': 'Dosage ng Paracetamol',

        // Auth
        'auth.welcome': 'Maligayang Pagbabalik',
        'auth.create': 'Gumawa ng Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.guest': 'Magpatuloy bilang bisita',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Buong Pangalan',
        'auth.forgot': 'Nakalimutan ang password?',
        'auth.or': 'o magpatuloy gamit ang',

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

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.about': 'Manungod',
        'nav.facilities': 'Mga Pasilidad',
        'nav.medications': 'Bulong',
        'nav.philhealth': 'PhilHealth',

        // Landing Page
        'landing.badge': 'Available na para sa mga residente nin Naga City',
        'landing.hero.title': 'An Saimong Katabang sa Salud sa',
        'landing.hero.highlight': 'Bikol',
        'landing.hero.description': 'Makakua nin impormasyon sa salud, maghanap nin mga harani na pasilidad, asin intindihon an saimong mga bulong — gabos sa Bikol, Filipino, o English.',
        'landing.hero.cta': 'Makipag-chat ki Gabay',
        'landing.hero.signin': 'Mag-sign In / Sign Up',
        'landing.features.title': 'Paano Makakatabang si Gabay',
        'landing.trust.title': 'Ginibo para sa Naga City',
        'landing.trust.description': 'Ginibo para sa 1st Naga City Mayoral Hackathon tanganing magtao nin accessible na impormasyon sa salud sa satong sadiring tataramon.',
        'landing.stats.facilities': 'Mga Pasilidad',
        'landing.stats.languages': 'Mga Tataramon',
        'landing.stats.available': 'Available',

        // Features
        'feature.facilities.title': 'Hanapon an mga Pasilidad',
        'feature.facilities.desc': 'Hanapon an mga ospital, klinika, asin barangay health center sa Naga City.',
        'feature.medications.title': 'Impormasyon nin Bulong',
        'feature.medications.desc': 'Aramon an manungod sa saimong mga bulong, tamang dosage, side effects, asin drug interactions.',
        'feature.philhealth.title': 'Gabay sa PhilHealth',
        'feature.philhealth.desc': 'Hilingon an coverage, intindihon an requirements, asin aramon kun paano makua an saimong benefits.',
        'feature.voice.title': 'Voice-First',
        'feature.voice.desc': 'Magtaram sa Bikol, Filipino, o English. Perpekto para sa mga gurang.',
        'feature.scanner.title': 'Prescription Scanner',
        'feature.scanner.desc': 'Magkua nin litrato kan saimong reseta tanganing maintindihan an kada bulong.',
        'feature.ai.title': 'AI-Powered',
        'feature.ai.desc': 'Pinapagana nin advanced AI tanganing magtao nin tama na impormasyon 24/7.',

        // Chat
        'chat.placeholder': 'Mag-hapot ki Gabay...',
        'chat.greeting': 'Kumusta! Ako si Gabay',
        'chat.description': 'An saimong Bikolano health assistant. Mag-hapot manungod sa health facilities, bulong, PhilHealth coverage, o arin man na hapot sa salud.',
        'chat.newChat': 'Bagong Chat',
        'chat.recentChats': 'Mga Nakaaging Chat',
        'chat.disclaimer': 'Pwedeng magkasala si Gabay. Siguraduhon na i-verify an importante na impormasyon.',

        // Suggestions
        'suggestion.hospital': 'Hanapon an pinakaharani na ospital',
        'suggestion.philhealth': 'PhilHealth coverage',
        'suggestion.dosage': 'Dosage nin Paracetamol',

        // Auth
        'auth.welcome': 'Maogmang Pagbalik',
        'auth.create': 'Gumibo nin Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.guest': 'Magpadagos bilang bisita',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.name': 'Bilog na Pangaran',
        'auth.forgot': 'Nalingawan an password?',
        'auth.or': 'o magpadagos gamit an',

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
