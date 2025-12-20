'use client';

import { ReactNode } from 'react';

interface PhilHealthCardProps {
    coverage: {
        title: string;
        description: string;
        limit: string;
        icon: ReactNode;
    };
    isExpanded?: boolean;
    renderIcon?: ReactNode;
}

export function PhilHealthCard({ coverage, isExpanded = false, renderIcon }: PhilHealthCardProps) {
    return (
        <div
            className="glass-card p-4 cursor-pointer hover:shadow-lg transition-all"
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{coverage.icon}</span>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                        {coverage.title}
                    </h3>
                    <p className="text-sm text-gabay-orange font-medium">
                        {coverage.limit}
                    </p>
                </div>
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    {renderIcon ?? '▼'}
                </span>
            </div>

            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {coverage.description}
                    </p>
                </div>
            )}
        </div>
    );
}
