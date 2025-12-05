'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Chat {
    id: string;
    title: string;
    createdAt: Date;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatId?: string;
}

// Mock data - will be replaced with real data
const mockChats: Chat[] = [
    { id: '1', title: 'PhilHealth Coverage Question', createdAt: new Date() },
    { id: '2', title: 'Nearest Hospital in Naga', createdAt: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Paracetamol Dosage', createdAt: new Date(Date.now() - 172800000) },
];

export function ChatSidebar({ isOpen, onClose, currentChatId }: ChatSidebarProps) {
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
                'fixed left-0 top-0 bottom-0 w-72 bg-muted/50 backdrop-blur-xl border-r z-50',
                'transform transition-transform duration-200 ease-out',
                isOpen ? 'translate-x-0' : '-translate-x-full',
                'md:translate-x-0 md:static md:z-0'
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                <span className="text-sm">🏥</span>
                            </div>
                            <span className="font-semibold">Gabay</span>
                        </Link>
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
                        <Button className="w-full justify-start gap-2 bg-teal-600 hover:bg-teal-700">
                            <span>✏️</span>
                            New Chat
                        </Button>
                    </div>

                    <Separator className="my-3" />

                    {/* Chat History */}
                    <ScrollArea className="flex-1 px-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                                Recent Chats
                            </p>
                            {mockChats.map((chat) => (
                                <button
                                    key={chat.id}
                                    className={cn(
                                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                        'hover:bg-accent',
                                        currentChatId === chat.id && 'bg-accent'
                                    )}
                                >
                                    <div className="truncate">{chat.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {chat.createdAt.toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    <Separator />

                    {/* Footer Links */}
                    <div className="p-3 space-y-1">
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
                        <Link href="/philhealth">
                            <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                                <span>📋</span> PhilHealth
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
