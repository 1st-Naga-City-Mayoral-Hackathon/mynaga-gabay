import Link from 'next/link';

const actions = [
    {
        href: '/facilities',
        icon: '🏥',
        label: 'Find Hospital',
        sublabel: 'Nearby facilities',
        color: 'from-blue-500 to-blue-600',
    },
    {
        href: '/philhealth',
        icon: '📋',
        label: 'PhilHealth',
        sublabel: 'Check coverage',
        color: 'from-green-500 to-green-600',
    },
    {
        href: '/medications',
        icon: '💊',
        label: 'Medications',
        sublabel: 'Drug info',
        color: 'from-purple-500 to-purple-600',
    },
];

export function QuickActions() {
    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            {actions.map((action) => (
                <Link
                    key={action.href}
                    href={action.href}
                    className="group"
                >
                    <div className={`
            bg-gradient-to-br ${action.color} 
            rounded-2xl p-4 text-white text-center
            transform transition-all duration-200
            group-hover:scale-105 group-hover:shadow-lg
          `}>
                        <div className="text-2xl mb-1">{action.icon}</div>
                        <div className="text-sm font-semibold">{action.label}</div>
                        <div className="text-xs opacity-80">{action.sublabel}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
