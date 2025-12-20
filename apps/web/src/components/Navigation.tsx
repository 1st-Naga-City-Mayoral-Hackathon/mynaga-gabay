'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Chat', icon: 'chat', emoji: '💬' },
    { href: '/facilities', label: 'Facilities', icon: 'hospital', emoji: '🏥' },
    { href: '/medications', label: 'Meds', icon: 'pill', emoji: '💊' },
    { href: '/philhealth', label: 'PhilHealth', icon: 'shield', emoji: '📋' },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gabay-orange-100/30 to-transparent" />

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto px-4">
                    <div className="flex justify-around py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all group"
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-gabay-orange-50 to-gabay-orange-500" />
                                    )}

                                    <div className={`
                    text-xl transition-transform duration-200
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                                        {item.emoji}
                                    </div>
                                    <span className={`
                    text-[10px] font-medium transition-colors
                    ${isActive
                                            ? 'text-gabay-orange-500'
                                            : 'text-slate-500 group-hover:text-gabay-orange-500'
                                        }
                  `}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Home indicator for iOS */}
                <div className="pb-safe flex justify-center pb-1">
                    <div className="w-32 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
            </div>
        </nav>
    );
}
