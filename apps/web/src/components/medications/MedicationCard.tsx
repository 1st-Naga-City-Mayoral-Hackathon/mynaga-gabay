interface MedicationCardProps {
    medication: {
        id: string;
        genericName: string;
        brandNames: string[];
        category: string;
        description: string;
        dosageForms: string[];
        commonUses: string[];
        warnings: string[];
    };
}

export function MedicationCard({ medication }: MedicationCardProps) {
    return (
        <div className="glass-card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-lg">
                        {medication.genericName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {medication.brandNames.join(', ')}
                    </p>
                </div>
                <span className="text-xs bg-gabay-teal/10 text-gabay-teal px-2 py-1 rounded-full">
                    {medication.category}
                </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                {medication.description}
            </p>

            <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Common Uses
                </h4>
                <div className="flex flex-wrap gap-1">
                    {medication.commonUses.map((use) => (
                        <span
                            key={use}
                            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                        >
                            {use}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Available Forms
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {medication.dosageForms.join(', ')}
                </p>
            </div>

            {medication.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase mb-1">
                        ⚠️ Warnings
                    </h4>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                        {medication.warnings.map((warning, i) => (
                            <li key={i}>• {warning}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
