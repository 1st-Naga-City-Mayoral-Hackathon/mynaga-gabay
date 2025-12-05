import { PhilHealthCard } from '@/components/philhealth/PhilHealthCard';
import { PhilHealthChecklist } from '@/components/philhealth/PhilHealthChecklist';

const coverageTypes = [
    {
        title: 'Inpatient Care',
        description: 'Hospital confinement including room & board, medicines, labs, procedures, and professional fees. Coverage varies by case rate.',
        limit: 'Case rate based',
        icon: '🏥',
    },
    {
        title: 'Outpatient Care',
        description: 'Consultation, laboratory tests, and minor procedures without hospital admission.',
        limit: 'Per visit limit',
        icon: '🩺',
    },
    {
        title: 'Maternity Care',
        description: 'Prenatal to delivery care including normal delivery and cesarean section.',
        limit: 'NSD: ₱6,500 / CS: ₱19,000+',
        icon: '👶',
    },
    {
        title: 'Z-Benefits',
        description: 'Catastrophic illnesses like cancer, kidney failure requiring dialysis, and other high-cost conditions.',
        limit: 'Condition-specific packages',
        icon: '💉',
    },
];

const requirements = [
    { id: 'mdr', label: 'PhilHealth ID or MDR (Member Data Record)', description: 'Get from PhilHealth office or online' },
    { id: 'contributions', label: 'At least 3 contributions in last 12 months', description: 'Check your contribution status' },
    { id: 'accredited', label: 'Confinement in accredited facility', description: 'Ask if hospital is PhilHealth accredited' },
    { id: 'claim-form', label: 'Claim Form 1 (signed)', description: 'Available at hospital billing' },
    { id: 'soa', label: 'Statement of Account from hospital', description: 'Request from billing department' },
];

const howToSteps = [
    { id: 'step1', label: 'Ensure your PhilHealth is active', description: 'Check contributions online or at PhilHealth office' },
    { id: 'step2', label: 'Choose accredited hospital', description: 'Most major hospitals in Naga are accredited' },
    { id: 'step3', label: 'Present PhilHealth ID at admission', description: 'Or Member Data Record (MDR)' },
    { id: 'step4', label: 'Sign Claim Form 1', description: 'Hospital will provide this form' },
    { id: 'step5', label: 'Hospital processes deduction', description: 'Amount covered is automatically deducted from bill' },
    { id: 'step6', label: 'Pay remaining balance', description: 'If any, at discharge' },
];

export default function PhilHealthPage() {
    return (
        <main className="min-h-screen pb-24">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        📋 PhilHealth Coverage
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Understand your PhilHealth benefits and how to avail
                    </p>
                </div>

                {/* Coverage Types */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        Coverage Types
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {coverageTypes.map((coverage) => (
                            <PhilHealthCard key={coverage.title} coverage={coverage} />
                        ))}
                    </div>
                </section>

                {/* How to Avail */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        How to Avail
                    </h2>
                    <PhilHealthChecklist title="Step-by-Step Guide" items={howToSteps} />
                </section>

                {/* Requirements */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        Requirements Checklist
                    </h2>
                    <PhilHealthChecklist title="Documents Needed" items={requirements} />
                </section>

                {/* Contact Info */}
                <section>
                    <div className="glass-card p-4 bg-gabay-teal/5">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                            📍 PhilHealth Naga City Office
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                            2nd Floor, Naga City Hall Annex
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                            Hours: 8:00 AM - 5:00 PM (Mon-Fri)
                        </p>
                        <a
                            href="tel:(054)472-8888"
                            className="inline-block bg-gabay-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gabay-teal/90 transition-colors"
                        >
                            📞 Call (054) 472-8888
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}
