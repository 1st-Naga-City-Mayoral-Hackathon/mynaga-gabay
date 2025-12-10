'use client';

import React, { useEffect, useRef } from 'react';

interface JarvisVisualizerProps {
    state: 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';
    audioLevel?: number;
}

interface Particle {
    x: number;
    y: number;
    z: number;
    size: number;
    ring: number; // 0 = sphere, 1+ = ring number
}

export function JarvisVisualizer({ state, audioLevel = 0 }: JarvisVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef(0);

    // Use refs to track current state for animation loop
    const stateRef = useRef(state);
    const audioLevelRef = useRef(audioLevel);

    // Update refs when props change
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        audioLevelRef.current = audioLevel;
    }, [audioLevel]);

    // Initialize particles
    useEffect(() => {
        const particles: Particle[] = [];

        // Sphere particles (core globe)
        const sphereCount = 150;
        for (let i = 0; i < sphereCount; i++) {
            // Fibonacci sphere distribution
            const phi = Math.acos(1 - 2 * (i + 0.5) / sphereCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const radius = 60;
            particles.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
                size: 1 + Math.random() * 1.5,
                ring: 0,
            });
        }

        // Ring 1 particles (inner ring - tilted)
        const ring1Count = 80;
        for (let i = 0; i < ring1Count; i++) {
            const angle = (i / ring1Count) * Math.PI * 2;
            const radius = 75 + Math.random() * 5;
            const tilt = 0.3;
            particles.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle) * Math.cos(tilt),
                z: radius * Math.sin(angle) * Math.sin(tilt),
                size: 0.8 + Math.random(),
                ring: 1,
            });
        }

        // Ring 2 particles (outer ring - different tilt)
        const ring2Count = 100;
        for (let i = 0; i < ring2Count; i++) {
            const angle = (i / ring2Count) * Math.PI * 2;
            const radius = 95 + Math.random() * 8;
            const tilt = -0.5;
            particles.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle) * Math.cos(tilt),
                z: radius * Math.sin(angle) * Math.sin(tilt),
                size: 0.6 + Math.random() * 0.8,
                ring: 2,
            });
        }

        particlesRef.current = particles;
    }, []);

    // Animation loop - runs once, reads state from refs
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const animate = () => {
            timeRef.current += 0.016;
            const time = timeRef.current;

            // Read current state from refs
            const currentState = stateRef.current;
            const currentAudioLevel = audioLevelRef.current;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Get animation parameters based on current state
            const rotationSpeed = currentState === 'idle' ? 0.3 :
                currentState === 'processing' ? 2.0 :
                    currentState === 'speaking' ? 1.2 :
                        currentState === 'listening' ? 0.8 : 0.5;

            const pulseAmount = currentState === 'idle' ? 0.03 :
                currentState === 'speaking' ? 0.15 + currentAudioLevel * 0.2 :
                    currentState === 'listening' ? 0.08 + currentAudioLevel * 0.15 :
                        0.1;

            // Sort particles by z for proper depth rendering
            const sortedParticles = [...particlesRef.current].map(p => {
                // Rotate around Y axis
                const rotY = time * rotationSpeed;
                const cos = Math.cos(rotY);
                const sin = Math.sin(rotY);

                // Apply rotation
                let x = p.x * cos - p.z * sin;
                let z = p.x * sin + p.z * cos;
                let y = p.y;

                // Additional rotation for rings
                if (p.ring === 1) {
                    const rotX = time * rotationSpeed * 0.7;
                    const cosX = Math.cos(rotX);
                    const sinX = Math.sin(rotX);
                    const newY = y * cosX - z * sinX;
                    z = y * sinX + z * cosX;
                    y = newY;
                } else if (p.ring === 2) {
                    const rotX = time * rotationSpeed * 0.5;
                    const cosX = Math.cos(rotX);
                    const sinX = Math.sin(rotX);
                    const newY = y * cosX - z * sinX;
                    z = y * sinX + z * cosX;
                    y = newY;
                }

                // Pulsing effect - stronger when speaking
                const pulseFreq = currentState === 'speaking' ? 5 : 3;
                const pulse = 1 + Math.sin(time * pulseFreq + p.x * 0.1) * pulseAmount;
                x *= pulse;
                y *= pulse;
                z *= pulse;

                return { ...p, x, y, z };
            }).sort((a, b) => a.z - b.z);

            // Draw particles
            sortedParticles.forEach(p => {
                // Perspective projection
                const scale = 300 / (300 + p.z);
                const screenX = centerX + p.x * scale;
                const screenY = centerY + p.y * scale;

                // Size based on depth and state
                const sizeMultiplier = currentState === 'speaking' ? 1.5 :
                    currentState === 'listening' ? 1.3 : 1;
                const size = p.size * scale * sizeMultiplier;

                // Opacity based on depth
                const depthOpacity = 0.3 + (p.z + 100) / 200 * 0.7;
                const stateOpacity = currentState === 'idle' ? 0.6 : 1;
                const opacity = Math.min(1, depthOpacity * stateOpacity);

                // Color based on state
                let color: string;
                if (currentState === 'processing') {
                    color = `rgba(251, 191, 36, ${opacity})`;
                } else if (currentState === 'speaking') {
                    color = `rgba(0, 255, 200, ${opacity})`;
                } else {
                    color = `rgba(0, 255, 247, ${opacity})`;
                }

                // Draw glow
                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, size * 4
                );
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'rgba(0, 255, 247, 0)');

                ctx.beginPath();
                ctx.arc(screenX, screenY, size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw particle core
                ctx.beginPath();
                ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

            // Center glow - stronger when active
            const centerGlowSize = currentState === 'idle' ? 30 :
                currentState === 'speaking' ? 50 + currentAudioLevel * 20 : 40;
            const centerGlow = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, centerGlowSize
            );
            const centerOpacity = currentState === 'idle' ? 0.1 :
                currentState === 'speaking' ? 0.4 : 0.25;
            centerGlow.addColorStop(0, `rgba(0, 255, 247, ${centerOpacity})`);
            centerGlow.addColorStop(1, 'rgba(0, 255, 247, 0)');
            ctx.beginPath();
            ctx.arc(centerX, centerY, centerGlowSize, 0, Math.PI * 2);
            ctx.fillStyle = centerGlow;
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []); // Empty deps - animation runs continuously

    return (
        <canvas
            ref={canvasRef}
            width={250}
            height={250}
            className="w-full h-full"
            style={{ maxWidth: '250px', maxHeight: '250px' }}
        />
    );
}

export default JarvisVisualizer;
