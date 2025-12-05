'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatHeaderProps {
    onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
    return (
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                {/* Menu Button - Mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="md:hidden"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </Button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <span className="text-sm">🏥</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm">Gabay</h1>
                        <p className="text-xs text-muted-foreground">Your health assistant</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Language Selector */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs">
                                🇵🇭 Filipino
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Change language</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Settings */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>
    );
}
