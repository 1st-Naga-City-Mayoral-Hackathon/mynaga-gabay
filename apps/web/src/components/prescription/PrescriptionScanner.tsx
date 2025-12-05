'use client';

import { useState, useRef } from 'react';

export function PrescriptionScanner() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResults(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        // Simulate analysis - will be replaced with actual API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setResults('Analysis complete! This prescription contains:\n\n• Paracetamol 500mg - For fever and pain\n• Amoxicillin 500mg - Antibiotic for infection\n• Vitamin B Complex\n\n⚠️ Please consult a healthcare professional for proper guidance.');
        setIsAnalyzing(false);
    };

    const handleReset = () => {
        setImage(null);
        setResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                    <div className="relative mb-4">
                        <img
                            src={image}
                            alt="Prescription preview"
                            className="w-full rounded-lg max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                        />
                        <button
                            onClick={handleReset}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {!results && (
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`
                w-full py-3 rounded-xl font-semibold transition-all
                ${isAnalyzing
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : 'bg-gabay-teal text-white hover:bg-gabay-teal/90'
                                }
              `}
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                '🔍 Analyze Prescription'
                            )}
                        </button>
                    )}

                    {results && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                                ✅ Analysis Results
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-line">
                                {results}
                            </p>
                            <button
                                onClick={handleReset}
                                className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                📸 Scan Another
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
