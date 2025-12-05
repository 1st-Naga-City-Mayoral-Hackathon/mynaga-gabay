'use client';

import Link from 'next/link';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Gradient border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gabay-teal/50 to-transparent" />

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gabay-teal to-teal-500 flex items-center justify-center shadow-lg shadow-gabay-teal/25 group-hover:shadow-gabay-teal/40 transition-shadow">
                                    <span className="text-xl">🏥</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                                    MyNaga <span className="text-gabay-teal">Gabay</span>
                                </h1>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
                                    Your Health Assistant
                                </p>
                            </div>
                        </Link>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Online
                                </span>
                            </div>

                            {/* Settings/Menu Button */}
                            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
