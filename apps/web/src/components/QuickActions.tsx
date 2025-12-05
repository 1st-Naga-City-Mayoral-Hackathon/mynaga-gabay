import Link from 'next/link';

const actions = [
    {
        href: '/facilities',
        icon: '🏥',
        label: 'Find Hospital',
        sublabel: 'Nearby facilities',
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/25',
    },
    {
        href: '/philhealth',
        icon: '📋',
        label: 'PhilHealth',
        sublabel: 'Check coverage',
        gradient: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/25',
    },
    {
        href: '/medications',
        icon: '💊',
        label: 'Medications',
        sublabel: 'Drug info',
        gradient: 'from-violet-500 to-violet-600',
        shadow: 'shadow-violet-500/25',
    },
];

export function QuickActions() {
    return (
        <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group"
                    >
                        <div className={`
              relative overflow-hidden
              bg-gradient-to-br ${action.gradient} 
              rounded-2xl p-4 text-white text-center
              shadow-lg ${action.shadow}
              hover:shadow-xl
              transform transition-all duration-200
              group-hover:scale-[1.02] group-active:scale-[0.98]
            `}>
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </div>
                                <div className="text-sm font-semibold">{action.label}</div>
                                <div className="text-[10px] opacity-80">{action.sublabel}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
