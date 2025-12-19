'use client';

import { useState } from 'react';

interface ChecklistItem {
    id: string;
    label: string;
    description?: string;
}

interface PhilHealthChecklistProps {
    title: string;
    items: ChecklistItem[];
}

export function PhilHealthChecklist({ title, items }: PhilHealthChecklistProps) {
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const checkedCount = Object.values(checked).filter(Boolean).length;
    const progress = (checkedCount / items.length) * 100;

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                    {title}
                </h3>
                <span className="text-sm text-gabay-orange">
                    {checkedCount}/{items.length}
                </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                <div
                    className="bg-gabay-orange h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className="flex items-start gap-3 cursor-pointer group"
                    >
                        <input
                            type="checkbox"
                            checked={checked[item.id] || false}
                            onChange={() => toggleItem(item.id)}
                            className="mt-1 w-5 h-5 rounded border-slate-300 text-gabay-orange focus:ring-gabay-orange"
                        />
                        <div>
                            <p className={`text-sm font-medium ${checked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                {item.label}
                            </p>
                            {item.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
