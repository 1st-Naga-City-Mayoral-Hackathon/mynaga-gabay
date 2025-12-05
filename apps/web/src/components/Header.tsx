'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Gradient border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <span className="text-xl">🏥</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">
                                    MyNaga <span className="text-teal-600 dark:text-teal-400">Gabay</span>
                                </h1>
                                <p className="text-[10px] text-muted-foreground -mt-0.5">
                                    Your Health Assistant
                                </p>
                            </div>
                        </Link>

                        {/* Right Side */}
                        <div className="flex items-center gap-1">
                            {/* Status Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Online
                                </span>
                            </div>

                            {/* Language Selector */}
                            <LanguageSelector />

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
