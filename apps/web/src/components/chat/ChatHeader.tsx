'use client';

import { Button } from '@/components/ui/button';
// Removed: import { ThemeToggle } from '@/components/ThemeToggle';
// Removed: import { LanguageSelector } from '@/components/LanguageSelector';

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Menu Button - Mobile */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-sm">🏥</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-foreground">Gabay</h1>
            <p className="text-xs text-muted-foreground">Your health assistant</p>
          </div>
        </div>
      </div>

      {/* The right-side controls are now empty, but the flex container remains */}
      <div className="flex items-center gap-1">{/* Controls removed */}</div>
    </header>
  );
}
