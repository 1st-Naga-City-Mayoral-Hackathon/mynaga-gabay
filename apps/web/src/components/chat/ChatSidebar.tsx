'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Chat {
    id: string;
    title: string;
    createdAt: Date;
}

interface ChatSidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
    currentChatId?: string;
}

// Mock data - will be replaced with real data
const mockChats: Chat[] = [
    { id: '1', title: 'PhilHealth Coverage Question', createdAt: new Date() },
    { id: '2', title: 'Nearest Hospital in Naga', createdAt: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Paracetamol Dosage', createdAt: new Date(Date.now() - 172800000) },
];

export function ChatSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse, currentChatId }: ChatSidebarProps) {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                'fixed left-0 top-0 bottom-0 bg-card border-r border-border z-50',
                'transform transition-all duration-200 ease-out',
                isOpen ? 'translate-x-0' : '-translate-x-full',
                'md:translate-x-0 md:static md:z-0',
                isCollapsed ? 'md:w-16' : 'w-72'
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                        {!isCollapsed && (
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gabay-orange-500 to-gabay-orange-600 flex items-center justify-center">
                                    <span className="text-sm">🏥</span>
                                </div>
                                <span className="font-semibold text-foreground">Gabay</span>
                            </Link>
                        )}

                        {/* Collapse toggle - Desktop */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onToggleCollapse}
                                        className="hidden md:flex h-8 w-8"
                                    >
                                        <svg className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Close button - Mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="md:hidden"
                        >
                            ✕
                        </Button>
                    </div>

                    {/* New Chat Button */}
                    <div className="px-3">
                        {isCollapsed ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" className="w-10 h-10 bg-gabay-orange-600 hover:bg-gabay-orange-700 mx-auto">
                                            <span>✏️</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">New Chat</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Button className="w-full justify-start gap-2 bg-gabay-orange-600 hover:bg-gabay-orange-700">
                                <span>✏️</span>
                                New Chat
                            </Button>
                        )}
                    </div>

                    <Separator className="my-3" />

                    {/* Chat History */}
                    <ScrollArea className="flex-1 px-3">
                        <div className="space-y-1">
                            {!isCollapsed && (
                                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                                    Recent Chats
                                </p>
                            )}
                            {mockChats.map((chat) => (
                                isCollapsed ? (
                                    <TooltipProvider key={chat.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    className={cn(
                                                        'w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-colors',
                                                        'hover:bg-gabay-orange-100',
                                                        currentChatId === chat.id && 'bg-accent'
                                                    )}
                                                >
                                                    <span className="text-sm">💬</span>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">{chat.title}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <button
                                        key={chat.id}
                                        className={cn(
                                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors text-foreground',
                                            'hover:bg-accent',
                                            currentChatId === chat.id && 'bg-accent'
                                        )}
                                    >
                                        <div className="truncate font-medium">{chat.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {chat.createdAt.toLocaleDateString()}
                                        </div>
                                    </button>
                                )
                            ))}
                        </div>
                    </ScrollArea>

                    <Separator />

                    {/* Footer Links */}
                    <div className={cn("p-3 space-y-1", isCollapsed && "flex flex-col items-center")}>
                        {isCollapsed ? (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href="/facilities">
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <span>🏥</span>
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Health Facilities</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href="/medications">
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <span>💊</span>
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Medications</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href="/my-meds">
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <span>⏰</span>
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">My Medicines</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href="/philhealth">
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <span>📋</span>
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">PhilHealth</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        ) : (
                            <>
                                <Link href="/facilities">
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                                        <span>🏥</span> Health Facilities
                                    </Button>
                                </Link>
                                <Link href="/medications">
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                                        <span>💊</span> Medications
                                    </Button>
                                </Link>
                                <Link href="/my-meds">
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                                        <span>⏰</span> My Medicines
                                    </Button>
                                </Link>
                                <Link href="/philhealth">
                                    <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                                        <span>📋</span> PhilHealth
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
