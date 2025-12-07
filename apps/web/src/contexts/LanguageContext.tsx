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

        // Medications
        'medications.title': 'Medications',
        'medications.subtitle': 'Learn about medicines, dosage, and side effects',
        'medications.search': 'Search by generic or brand name...',
        'medications.filter.all': 'All Categories',
        'medications.card.uses': 'Common Uses',
        'medications.card.dosage': 'Dosage Forms',
        'medications.card.warnings': 'Warnings',
        'medications.card.generic': 'Generic Name',
        'medications.card.brand': 'Brand Names',
        'medications.card.bikol': 'In Bikol',

        // Facilities
        'facilities.title': 'Health Facilities',
        'facilities.subtitle': 'Find hospitals, clinics, and health centers in Naga City',
        'facilities.search': 'Search by name, address, or service...',
        'facilities.filter.all': 'All Types',
        'facilities.filter.hospital': 'Hospital',
        'facilities.filter.center': 'Health Center',
        'facilities.filter.pharmacy': 'Pharmacy',
        'facilities.filter.clinic': 'Clinic',
        'facilities.filter.lab': 'Laboratory',
        'facilities.card.services': 'Services',
        'facilities.card.hours': 'Hours',
        'facilities.card.phone': 'Phone',
        'facilities.card.accredited': 'PhilHealth Accredited',

        // Navigation
        'nav.home': 'Home',
        'nav.chat': 'Chat',
        'nav.about': 'About',
        'nav.facilities': 'Facilities',
        'nav.medications': 'Medications',
        'nav.philhealth': 'PhilHealth',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'nav.logout': 'Log out',

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

        // Dashboard
        'dashboard.subtitle': "I'm your health assistant. What would you like to do today?",
        'dashboard.startChat': 'Start New Chat',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.healthInfo': 'Health Information',
        'dashboard.healthOffice': 'Naga City Health Office',
        'dashboard.announcement': 'Free flu vaccination is now available at all Barangay Health Centers.',

        // Auth
        'auth.welcome': 'Welcome Back',
        'auth.create': 'Create Account',
        'auth.signin': 'Sign In',
        'auth.signup': 'Sign Up',
        'auth.join': 'Join MyNaga Gabay today',
        'auth.signInDesc': 'Sign in to continue to Gabay',
        'auth.guest': 'Continue as guest',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.name': 'Full Name',
        'auth.forgot': 'Forgot password?',
        'auth.or': 'or continue with',
        'auth.googleSignIn': 'Sign in with Google',
        'auth.googleSignUp': 'Sign up with Google',
        'auth.error.match': 'Passwords do not match',
        'auth.error.length': 'Password must be at least 8 characters',
        'auth.error.create': 'Failed to create account',
        'auth.error.invalid': 'Invalid email or password',
        'auth.success.create': 'Account created successfully! Please sign in.',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
    fil: {
        // Humanized Medications Translations
        'medications.title': 'Mga Gamot',
        'medications.subtitle': 'Alamin ang tungkol sa mga gamot, dosis, at side effects',
        'medications.search': 'Maghanap gamit ang generic o brand name...',
        'medications.filter.all': 'Lahat ng Kategorya',
        'medications.card.uses': 'Para saan ito?',
        'medications.card.dosage': 'Mga Anyo',
        'medications.card.warnings': 'Mga Paalala',
        'medications.card.generic': 'Generic Name',
        'medications.card.brand': 'Brand Names',
        'medications.card.bikol': 'Sa Bikol',

        // Humanized Facilities Translations
        'facilities.title': 'Mga Pasilidad Pangkalusugan',
        'facilities.subtitle': 'Hanapin ang mga ospital, klinika, at health center sa Naga City',
        'facilities.search': 'Maghanap gamit ang pangalan, address, o serbisyo...',
        'facilities.filter.all': 'Lahat ng Uri',
        'facilities.filter.hospital': 'Ospital',
        'facilities.filter.center': 'Health Center',
        'facilities.filter.pharmacy': 'Botika',
        'facilities.filter.clinic': 'Klinika',
        'facilities.filter.lab': 'Laboratoryo',
        'facilities.card.services': 'Mga Serbisyo',
        'facilities.card.hours': 'Oras',
        'facilities.card.phone': 'Telepono',
        'facilities.card.accredited': 'PhilHealth Accredited',

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
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'nav.logout': 'Log out',

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

        // Dashboard
        'dashboard.subtitle': "Ako ang iyong health assistant. Ano ang maitutulong ko ngayon?",
        'dashboard.startChat': 'Magsimula ng Chat',
        'dashboard.quickActions': 'Mabilis na Aksyon',
        'dashboard.healthInfo': 'Impormasyon sa Kalusugan',
        'dashboard.healthOffice': 'Naga City Health Office',
        'dashboard.announcement': 'May libreng bakuna kontra-trangkaso sa lahat ng Barangay Health Centers.',

        // Auth
        'auth.welcome': 'Maligayang Pagbabalik',
        'auth.create': 'Gumawa ng Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.join': 'Sumali sa MyNaga Gabay ngayon',
        'auth.signInDesc': 'Mag-sign in upang magpatuloy sa Gabay',
        'auth.guest': 'Magpatuloy bilang bisita',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Kumpirmahin ang Password',
        'auth.name': 'Buong Pangalan',
        'auth.forgot': 'Nakalimutan ang password?',
        'auth.or': 'o magpatuloy gamit ang',
        'auth.googleSignIn': 'Mag-sign in gamit ang Google',
        'auth.googleSignUp': 'Mag-sign up gamit an Google',
        'auth.error.match': 'Hindi magkatugma ang password',
        'auth.error.length': 'Dapat hindi bababa sa 8 karakter ang password',
        'auth.error.create': 'Nabigo sa paggawa ng account',
        'auth.error.invalid': 'Maling email o password',
        'auth.success.create': 'Matagumpay na nagawa ang account! Mangyaring mag-sign in.',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
    bcl: {
        // Humanized Medications Translations
        'medications.title': 'Mga Bulong',
        'medications.subtitle': 'Aramon an manungod sa mga bulong, dosis, asin side effects',
        'medications.search': 'Maghanap gamit an generic o brand name...',
        'medications.filter.all': 'Gabos na Klase',
        'medications.card.uses': 'Para saen ini?',
        'medications.card.dosage': 'Mga Porma',
        'medications.card.warnings': 'Mga Pagirumdom',
        'medications.card.generic': 'Generic Name',
        'medications.card.brand': 'Brand Names',
        'medications.card.bikol': 'Sa Bikol',

        // Humanized Facilities Translations
        'facilities.title': 'Mga Pasilidad nin Salud',
        'facilities.subtitle': 'Hanapon an mga ospital, klinika, asin health center sa Naga City',
        'facilities.search': 'Maghanap gamit an pangaran, address, o serbisyo...',
        'facilities.filter.all': 'Gabos na Klase',
        'facilities.filter.hospital': 'Ospital',
        'facilities.filter.center': 'Health Center',
        'facilities.filter.pharmacy': 'Botika',
        'facilities.filter.clinic': 'Klinika',
        'facilities.filter.lab': 'Laboratoryo',
        'facilities.card.services': 'Mga Serbisyo',
        'facilities.card.hours': 'Oras',
        'facilities.card.phone': 'Telepono',
        'facilities.card.accredited': 'PhilHealth Accredited',

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
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',
        'nav.logout': 'Mag-logout',

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

        // Dashboard
        'dashboard.subtitle': 'Ako an saimong health assistant. Ano an maitatabang ko ngunyan?',
        'dashboard.startChat': 'Magpuon nin Chat',
        'dashboard.quickActions': 'Daling Aksyon',
        'dashboard.healthInfo': 'Impormasyon sa Salud',
        'dashboard.healthOffice': 'Naga City Health Office',
        'dashboard.announcement': 'Igwang libreng bakuna kontra-trangkaso sa gabos na Barangay Health Centers.',

        // Auth
        'auth.welcome': 'Maogmang Pagbalik',
        'auth.create': 'Gumibo nin Account',
        'auth.signin': 'Mag-sign In',
        'auth.signup': 'Mag-sign Up',
        'auth.join': 'Mag-ayon sa MyNaga Gabay ngunyan',
        'auth.signInDesc': 'Mag-sign in tanganing magpadagos sa Gabay',
        'auth.guest': 'Magpadagos bilang bisita',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Kumpirmahon an Password',
        'auth.name': 'Bilog na Pangaran',
        'auth.forgot': 'Nalingawan an password?',
        'auth.or': 'o magpadagos gamit an',
        'auth.googleSignIn': 'Mag-sign in gamit an Google',
        'auth.googleSignUp': 'Mag-sign up gamit an Google',
        'auth.error.match': 'Dai nagtutugma an password',
        'auth.error.length': 'Kaipuhan na dai mababa sa 8 karakter an password',
        'auth.error.create': 'Dai nakagibo nin account',
        'auth.error.invalid': 'Sala an email o password',
        'auth.success.create': 'Matrayumpong nakagibo nin account! Paki-sign in.',

        // Languages
        'lang.en': 'English',
        'lang.fil': 'Filipino',
        'lang.bcl': 'Bikol',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fil');
    useEffect(() => {
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
