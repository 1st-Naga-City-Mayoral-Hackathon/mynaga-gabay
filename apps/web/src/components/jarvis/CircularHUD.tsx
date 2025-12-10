'use client';

import React from 'react';

interface CircularHUDProps {
    state: 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';
    audioLevel?: number;
    children?: React.ReactNode;
}

export function CircularHUD({ state, audioLevel = 0, children }: CircularHUDProps) {
    // Animation classes based on state
    const getAnimationClass = () => {
        switch (state) {
            case 'listening':
                return 'animate-pulse-fast';
            case 'processing':
                return 'animate-spin-slow';
            case 'speaking':
                return 'animate-pulse';
            case 'connecting':
                return 'animate-pulse';
            default:
                return '';
        }
    };

    // Glow intensity based on audio level
    const glowIntensity = state === 'listening' ? 20 + audioLevel * 40 : 20;

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer rotating ring */}
            <div
                className={`absolute w-80 h-80 rounded-full border border-cyan-500/30 ${state === 'processing' ? 'animate-spin-slow' : ''}`}
                style={{
                    boxShadow: `0 0 ${glowIntensity}px rgba(0, 255, 247, 0.3)`,
                }}
            >
                {/* Arc segments */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(0, 255, 247, 0.2)"
                        strokeWidth="0.5"
                        strokeDasharray="10 5"
                    />
                </svg>
            </div>

            {/* Middle ring with arcs */}
            <div
                className={`absolute w-64 h-64 rounded-full ${state !== 'idle' ? 'animate-reverse-spin' : ''}`}
            >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Top arc */}
                    <path
                        d="M 20 50 A 30 30 0 0 1 80 50"
                        fill="none"
                        stroke="rgba(0, 255, 247, 0.6)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        className={state === 'speaking' ? 'animate-pulse' : ''}
                    />
                    {/* Bottom arc */}
                    <path
                        d="M 80 50 A 30 30 0 0 1 20 50"
                        fill="none"
                        stroke="rgba(0, 255, 247, 0.4)"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                    />
                    {/* Accent lines */}
                    <line x1="10" y1="50" x2="15" y2="50" stroke="rgba(0, 255, 247, 0.5)" strokeWidth="0.5" />
                    <line x1="85" y1="50" x2="90" y2="50" stroke="rgba(0, 255, 247, 0.5)" strokeWidth="0.5" />
                    <line x1="50" y1="10" x2="50" y2="15" stroke="rgba(0, 255, 247, 0.5)" strokeWidth="0.5" />
                    <line x1="50" y1="85" x2="50" y2="90" stroke="rgba(0, 255, 247, 0.5)" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Inner core container */}
            <div
                className={`relative w-52 h-52 rounded-full bg-gradient-to-br from-gray-900/90 to-black/95 border border-cyan-500/40 flex items-center justify-center ${getAnimationClass()}`}
                style={{
                    boxShadow: `
                        0 0 ${glowIntensity}px rgba(0, 255, 247, 0.4),
                        inset 0 0 30px rgba(0, 255, 247, 0.1)
                    `,
                }}
            >
                {/* Hexagonal pattern overlay */}
                <div
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{
                        background: `repeating-linear-gradient(
                            60deg,
                            transparent,
                            transparent 10px,
                            rgba(0, 255, 247, 0.1) 10px,
                            rgba(0, 255, 247, 0.1) 11px
                        )`,
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>

            {/* Decorative corner brackets */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            </div>

            {/* Orbiting particles */}
            {state !== 'idle' && (
                <>
                    <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-orbit opacity-60" style={{ animationDelay: '0s' }} />
                    <div className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full animate-orbit opacity-40" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute w-1 h-1 bg-cyan-500 rounded-full animate-orbit opacity-80" style={{ animationDelay: '1s' }} />
                </>
            )}
        </div>
    );
}

export default CircularHUD;
