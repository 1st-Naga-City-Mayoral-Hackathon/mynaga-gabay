'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { PhilHealthCard } from '@/components/philhealth/PhilHealthCard';
import { PhilHealthChecklist } from '@/components/philhealth/PhilHealthChecklist';
import {
    MapPin,
    ClipboardList,
    Hospital,
    Stethoscope,
    Baby,
    Syringe,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

export default function PhilHealthPage() {
    const { t } = useLanguage();
    
    // State for main sections
    const [expandedSections, setExpandedSections] = useState({
        coverage: true,
        howTo: true,
        requirements: true,
    });

    // State for individual coverage cards
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
        'Inpatient Care': false,
        'Outpatient Care': false,
        'Maternity Care': false,
        'Z-Benefits': false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleCard = (title: string) => {
        setExpandedCards((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const coverageTypes = [
        {
            title: t('philhealth.inpatient.title'), // "Inpatient Care"
            description: t('philhealth.inpatient.desc'),
            limit: t('philhealth.inpatient.limit'),
            icon: <Hospital className="w-6 h-6 text-gabay-orange-600" />,
        },
        {
            title: t('philhealth.outpatient.title'), // "Outpatient Care"
            description: t('philhealth.outpatient.desc'),
            limit: t('philhealth.outpatient.limit'),
            icon: <Stethoscope className="w-6 h-6 text-gabay-orange-600" />,
        },
        {
            title: t('philhealth.maternity.title'), // "Maternity Care"
            description: t('philhealth.maternity.desc'),
            limit: t('philhealth.maternity.limit'),
            icon: <Baby className="w-6 h-6 text-gabay-orange-600" />,
        },
        {
            title: t('philhealth.zbenefit.title'), // "Z-Benefits"
            description: t('philhealth.zbenefit.desc'),
            limit: t('philhealth.zbenefit.limit'),
            icon: <Syringe className="w-6 h-6 text-gabay-orange-600" />,
        },
    ];

    const howToSteps = [
        { id: 'step1', label: t('philhealth.step1.label'), description: t('philhealth.step1.desc') },
        { id: 'step2', label: t('philhealth.step2.label'), description: t('philhealth.step2.desc') },
        { id: 'step3', label: t('philhealth.step3.label'), description: t('philhealth.step3.desc') },
        { id: 'step4', label: t('philhealth.step4.label'), description: t('philhealth.step4.desc') },
        { id: 'step5', label: t('philhealth.step5.label'), description: t('philhealth.step5.desc') },
        { id: 'step6', label: t('philhealth.step6.label'), description: t('philhealth.step6.desc') },
    ];

    const requirements = [
        { id: 'mdr', label: t('philhealth.req.mdr'), description: t('philhealth.req.mdr.desc') },
        { id: 'contributions', label: t('philhealth.req.contrib'), description: t('philhealth.req.contrib.desc') },
        { id: 'accredited', label: t('philhealth.req.accredited'), description: t('philhealth.req.accredited.desc') },
        { id: 'claim-form', label: t('philhealth.req.claim'), description: t('philhealth.req.claim.desc') },
        { id: 'soa', label: t('philhealth.req.soa'), description: t('philhealth.req.soa.desc') },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <ClipboardList className="w-7 h-7 text-gabay-orange-600" />
                        {t('philhealth.page.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('philhealth.page.subtitle')}
                    </p>
                </div>

                {/* Coverage Types Section */}
                <section className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <button 
                        onClick={() => toggleSection('coverage')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <h2 className="text-xl font-semibold text-foreground">
                            {t('philhealth.types.title')}
                        </h2>
                        {expandedSections.coverage ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {expandedSections.coverage && (
                        <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            {coverageTypes.map((coverage) => (
                                <div key={coverage.title} className="flex flex-col">
                                    <button
                                        onClick={() => toggleCard(coverage.title)}
                                        className="w-full text-left transition-all"
                                    >
                                        <PhilHealthCard
                                            coverage={coverage}
                                            isExpanded={expandedCards[coverage.title]}
                                            // Pass the chevron icon as a prop if your PhilHealthCard supports it
                                            renderIcon={expandedCards[coverage.title] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* How to Avail Section */}
                <section className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <button 
                        onClick={() => toggleSection('howTo')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <h2 className="text-xl font-semibold text-foreground">
                            {t('philhealth.how.title')}
                        </h2>
                        {expandedSections.howTo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.howTo && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <PhilHealthChecklist title={t('philhealth.steps.title')} items={howToSteps} />
                        </div>
                    )}
                </section>

                {/* Requirements Section */}
                <section className="mb-10">
                    <button 
                        onClick={() => toggleSection('requirements')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <h2 className="text-xl font-semibold text-foreground">
                            {t('philhealth.req.title')}
                        </h2>
                        {expandedSections.requirements ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.requirements && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <PhilHealthChecklist title={t('philhealth.req.list.title')} items={requirements} />
                        </div>
                    )}
                </section>

                {/* Contact Info */}
                <section>
                    <div className="glass-card p-6 bg-gabay-orange-50 dark:bg-teal-900/20 border-gabay-orange-100 dark:border-teal-800 rounded-2xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gabay-orange-600" />
                                    {t('philhealth.office')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-1">{t('philhealth.office.addr')}</p>
                                <p className="text-sm text-muted-foreground">{t('philhealth.office.hours')}</p>
                            </div>
                            <a
                                href="tel:(054)472-8888"
                                className="inline-flex items-center justify-center bg-gabay-orange-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gabay-orange-700 transition-colors shadow-sm"
                            >
                                {t('philhealth.call')}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}