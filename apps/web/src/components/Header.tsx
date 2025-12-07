'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { UserNav } from './UserNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { t } = useLanguage();

    const navLinks = [
        { href: '/chat', label: t('nav.chat'), icon: '💬' },
        { href: '/facilities', label: t('nav.facilities'), icon: '🏥' },
        { href: '/medications', label: t('nav.medications'), icon: '💊' },
        { href: '/philhealth', label: t('nav.philhealth'), icon: '📋' },
        { href: '/about', label: t('nav.about'), icon: 'ℹ️' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Gradient border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative h-10 w-10">
                                <Image
                                    src="/logo.png?v=2"
                                    alt="MyNaga Gabay"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-foreground">
                                    {t('app.name')}
                                </h1>
                                <p className="text-[10px] text-muted-foreground -mt-0.5">
                                    {t('app.tagline')}
                                </p>
                            </div>
                        </Link>


                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        pathname === link.href
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-1">
                            {/* Status Badge */}
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    {t('status.online')}
                                </span>
                            </div>

                            {/* Language Selector */}
                            <LanguageSelector />

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* User Nav (Desktop + Mobile) */}
                            <div className="hidden md:block">
                                <UserNav />
                            </div>

                            {/* Mobile Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {navLinks.map((link) => (
                                        <DropdownMenuItem key={link.href} asChild>
                                            <Link href={link.href} className="flex items-center gap-2">
                                                <span>{link.icon}</span>
                                                {link.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    {session ? (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="flex items-center gap-2">
                                                    <span>👤</span>
                                                    {t('nav.profile')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => signOut()}
                                            >
                                                <span>🚪</span>
                                                {t('nav.logout')}
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem asChild>
                                            <Link href="/login" className="flex items-center gap-2">
                                                <span>👤</span>
                                                {t('auth.signin')}
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
