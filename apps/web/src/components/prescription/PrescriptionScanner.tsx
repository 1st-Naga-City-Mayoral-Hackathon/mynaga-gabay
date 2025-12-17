'use client';

import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================
// Types
// ============================================

interface MedicationInfo {
    name: string;
    brand_detected: string | null;
    dosage: string;
    frequency: string;
    duration?: string;
    explanation: string;
    is_philhealth_covered: boolean;
    estimated_price_range?: string;
    confidence_score: number;
    needs_verification?: boolean;
}

interface DrugInteraction {
    drugs: string[];
    severity: 'low' | 'moderate' | 'high';
    description: string;
}

interface PrescriptionResult {
    success: boolean;
    language: string;
    medications: MedicationInfo[];
    interactions: DrugInteraction[];
    general_advice: string;
    medical_disclaimer: string;
    error?: string;
}

type ScanStatus =
    | 'idle'
    | 'enhancing'
    | 'reading'
    | 'analyzing'
    | 'complete'
    | 'error';

// ============================================
// MedicationCard Component
// ============================================

function MedicationCard({
    medication,
    onSpeak
}: {
    medication: MedicationInfo;
    onSpeak: (text: string) => void;
}) {
    const isLowConfidence = medication.confidence_score < 0.7;

    return (
        <div className={`
            glass-card p-4 mb-3 
            ${isLowConfidence ? 'border-2 border-yellow-400 dark:border-yellow-600' : ''}
        `}>
            {/* Confidence Warning */}
            {isLowConfidence && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-lg text-sm mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Low confidence - verify with pharmacist</span>
                </div>
            )}

            {/* Header: Name + PhilHealth Badge */}
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {medication.name}
                    </h3>
                    {medication.brand_detected && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Brand: {medication.brand_detected}
                        </p>
                    )}
                </div>

                {medication.is_philhealth_covered && (
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                        <span>🏥</span>
                        <span>PhilHealth</span>
                    </span>
                )}
            </div>

            {/* Dosage Info */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-500 dark:text-slate-400">Dosage:</span>
                    <span className="ml-1 font-medium text-slate-700 dark:text-slate-200">
                        {medication.dosage}
                    </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-500 dark:text-slate-400">Frequency:</span>
                    <span className="ml-1 font-medium text-slate-700 dark:text-slate-200">
                        {medication.frequency}
                    </span>
                </div>
            </div>

            {medication.duration && (
                <div className="text-sm mb-3 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                    <span className="ml-1 font-medium text-slate-700 dark:text-slate-200">
                        {medication.duration}
                    </span>
                </div>
            )}

            {/* Price Estimate */}
            {medication.estimated_price_range && (
                <p className="text-sm text-gabay-teal dark:text-gabay-teal-light mb-3 flex items-center gap-1">
                    <span>💰</span>
                    <span>Est. Price: {medication.estimated_price_range}</span>
                </p>
            )}

            {/* Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {medication.explanation}
                </p>
                <button
                    onClick={() => onSpeak(medication.explanation)}
                    className="mt-2 text-gabay-teal hover:text-gabay-teal-dark dark:text-gabay-teal-light text-sm flex items-center gap-1.5 transition-colors"
                >
                    <span>🔊</span>
                    <span>Listen</span>
                </button>
            </div>
        </div>
    );
}

// ============================================
// Status Messages
// ============================================

const STATUS_CONFIG: Record<ScanStatus, { message: string; icon: string }> = {
    idle: { message: '', icon: '' },
    enhancing: { message: 'Enhancing image quality...', icon: '🔧' },
    reading: { message: "Reading doctor's handwriting...", icon: '📝' },
    analyzing: { message: 'Checking PhilHealth coverage...', icon: '💊' },
    complete: { message: 'Analysis complete!', icon: '✅' },
    error: { message: 'Could not analyze prescription', icon: '❌' },
};

// ============================================
// Main Component
// ============================================

export function PrescriptionScanner() {
    const { language } = useLanguage();
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [results, setResults] = useState<PrescriptionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    // n8n webhook URL - configurable via env
    const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678';

    // Cleanup timers on unmount
    const clearTimers = useCallback(() => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current = [];
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResults(null);
                setError(null);
                setScanStatus('idle');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleAnalyze = async () => {
        if (!imageFile) return;

        setError(null);
        setResults(null);
        clearTimers();

        // Progressive status updates for latency masking
        setScanStatus('enhancing');
        timersRef.current.push(setTimeout(() => setScanStatus('reading'), 1500));
        timersRef.current.push(setTimeout(() => setScanStatus('analyzing'), 4000));

        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('language', language);

            const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/prescription`, {
                method: 'POST',
                body: formData,
            });

            clearTimers();

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data: PrescriptionResult = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            setResults(data);
            setScanStatus('complete');

        } catch (err) {
            clearTimers();
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to analyze prescription: ${errorMessage}`);
            setScanStatus('error');
        }
    };

    const handleReset = () => {
        clearTimers();
        setImage(null);
        setImageFile(null);
        setResults(null);
        setError(null);
        setScanStatus('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set language based on user preference
            const langMap: Record<string, string> = {
                'bcl': 'fil-PH', // Use Filipino as fallback for Bikol
                'fil': 'fil-PH',
                'eng': 'en-US'
            };
            utterance.lang = langMap[language] || 'fil-PH';
            utterance.rate = 0.9;

            window.speechSynthesis.speak(utterance);
        }
    };

    const isLoading = ['enhancing', 'reading', 'analyzing'].includes(scanStatus);
    const statusInfo = STATUS_CONFIG[scanStatus];

    return (
        <div className="glass-card p-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
            />

            {/* Upload Area */}
            {!image ? (
                <div
                    onClick={handleCapture}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-gabay-teal hover:bg-gabay-teal/5 transition-all"
                >
                    <div className="text-4xl mb-3">📸</div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Tap to take photo or upload
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        Take a clear photo of your prescription
                    </p>
                </div>
            ) : (
                <div>
                    {/* Image Preview */}
                    <div className="relative mb-4">
                        <img
                            src={image}
                            alt="Prescription preview"
                            className="w-full rounded-lg max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                        />
                        <button
                            onClick={handleReset}
                            disabled={isLoading}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Analyze Button */}
                    {!results && (
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className={`
                                w-full py-3 rounded-xl font-semibold transition-all
                                ${isLoading
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    : 'bg-gabay-teal text-white hover:bg-gabay-teal/90'
                                }
                            `}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>{statusInfo.icon} {statusInfo.message}</span>
                                </span>
                            ) : (
                                '🔍 Analyze Prescription'
                            )}
                        </button>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                                <span>❌</span>
                                <span>{error}</span>
                            </p>
                            <button
                                onClick={handleAnalyze}
                                className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                🔄 Try Again
                            </button>
                        </div>
                    )}

                    {/* Results Display */}
                    {results && results.success && (
                        <div className="space-y-4">
                            {/* Medications */}
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <span>💊</span>
                                    <span>Medications Found ({results.medications.length})</span>
                                </h3>
                                {results.medications.map((med, index) => (
                                    <MedicationCard
                                        key={index}
                                        medication={med}
                                        onSpeak={handleSpeak}
                                    />
                                ))}
                            </div>

                            {/* Drug Interactions Warning */}
                            {results.interactions && results.interactions.length > 0 && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>Potential Drug Interactions</span>
                                    </h4>
                                    {results.interactions.map((interaction, index) => (
                                        <div key={index} className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                                            <strong>{interaction.drugs.join(' + ')}</strong>
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${interaction.severity === 'high'
                                                    ? 'bg-red-200 text-red-800'
                                                    : interaction.severity === 'moderate'
                                                        ? 'bg-orange-200 text-orange-800'
                                                        : 'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                {interaction.severity}
                                            </span>
                                            <p className="mt-1">{interaction.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* General Advice */}
                            {results.general_advice && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <span>💡</span>
                                        <span>General Advice</span>
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {results.general_advice}
                                    </p>
                                </div>
                            )}

                            {/* Medical Disclaimer */}
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                    ⚕️ {results.medical_disclaimer}
                                </p>
                            </div>

                            {/* Scan Another Button */}
                            <button
                                onClick={handleReset}
                                className="w-full py-3 bg-gabay-teal text-white rounded-xl font-semibold hover:bg-gabay-teal/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📸</span>
                                <span>Scan Another Prescription</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
