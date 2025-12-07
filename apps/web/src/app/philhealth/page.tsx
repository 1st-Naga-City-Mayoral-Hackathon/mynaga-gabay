'use client';

import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { PhilHealthCard } from '@/components/philhealth/PhilHealthCard';
import { PhilHealthChecklist } from '@/components/philhealth/PhilHealthChecklist';

export default function PhilHealthPage() {
    const { t } = useLanguage();

    const coverageTypes = [
        {
            title: t('philhealth.inpatient.title'),
            description: t('philhealth.inpatient.desc'),
            limit: t('philhealth.inpatient.limit'),
            icon: '🏥',
        },
        {
            title: t('philhealth.outpatient.title'),
            description: t('philhealth.outpatient.desc'),
            limit: t('philhealth.outpatient.limit'),
            icon: '🩺',
        },
        {
            title: t('philhealth.maternity.title'),
            description: t('philhealth.maternity.desc'),
            limit: t('philhealth.maternity.limit'),
            icon: '👶',
        },
        {
            title: t('philhealth.zbenefit.title'),
            description: t('philhealth.zbenefit.desc'),
            limit: t('philhealth.zbenefit.limit'),
            icon: '💉',
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        📋 {t('philhealth.page.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('philhealth.page.subtitle')}
                    </p>
                </div>

                {/* Coverage Types */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {t('philhealth.types.title')}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {coverageTypes.map((coverage) => (
                            <PhilHealthCard key={coverage.title} coverage={coverage} />
                        ))}
                    </div>
                </section>

                {/* How to Avail */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {t('philhealth.how.title')}
                    </h2>
                    <PhilHealthChecklist title={t('philhealth.steps.title')} items={howToSteps} />
                </section>

                {/* Requirements */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {t('philhealth.req.title')}
                    </h2>
                    <PhilHealthChecklist title={t('philhealth.req.list.title')} items={requirements} />
                </section>

                {/* Contact Info */}
                <section>
                    <div className="glass-card p-6 bg-teal-50/50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    📍 {t('philhealth.office')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {t('philhealth.office.addr')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('philhealth.office.hours')}
                                </p>
                            </div>
                            <a
                                href="tel:(054)472-8888"
                                className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                📞 {t('philhealth.call')}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
