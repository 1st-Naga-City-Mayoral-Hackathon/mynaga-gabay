/**
 * Bikol Language Enhancer
 * TypeScript port of key BikolTranslator functions for language detection
 * and response enhancement with Bikol health terminology.
 */

import * as fs from 'fs';
import * as path from 'path';

export type Language = 'bikol' | 'tagalog' | 'english' | 'unknown';

// Common Bikol words for language detection
const BIKOL_MARKERS = new Set([
    'saen', 'haen', 'tabi', 'maray', 'aldaw', 'dai', 'iyo', 'ano',
    'siisay', 'nuarin', 'pano', 'tano', 'pira', 'siya', 'sinda',
    'kamo', 'kami', 'kita', 'ini', 'idto', 'kaipuhan', 'igwa',
    'yaon', 'mayo', 'bago', 'pagkatapos', 'asin', 'pero', 'kun',
    'ta', 'ngonyan', 'duman', 'digdi', 'mabalos', 'kumusta'
]);

const TAGALOG_MARKERS = new Set([
    'saan', 'nasaan', 'mabuti', 'araw', 'hindi', 'oo', 'sino',
    'kailan', 'paano', 'bakit', 'ilan', 'sila', 'kayo', 'tayo',
    'ito', 'iyon', 'kailangan', 'mayroon', 'wala', 'bago',
    'pagkatapos', 'at', 'pero', 'kung', 'ngayon', 'doon', 'dito',
    'salamat', 'kamusta', 'gusto', 'pwede', 'dapat', 'po', 'ang', 'ng', 'mga', 'sa', 'na'
]);

const ENGLISH_MARKERS = new Set([
    'the', 'is', 'are', 'what', 'where', 'when', 'how', 'why',
    'can', 'do', 'does', 'have', 'has', 'need', 'want', 'please',
    'help', 'find', 'get', 'take', 'go', 'hospital', 'medicine',
    'doctor', 'emergency', 'pharmacy', 'clinic'
]);

// Health terms with Bikol translations
const HEALTH_TERM_ENHANCEMENTS: [string, string][] = [
    ['headache', 'kulog nin payo'],
    ['fever', 'kalintura'],
    ['cough', 'ubo'],
    ['cold', 'sipon'],
    ['stomachache', 'kulog nin tulak'],
    ['diarrhea', 'kurso'],
    ['hospital', 'ospital'],
    ['pharmacy', 'botica'],
    ['medicine', 'bulong'],
    ['doctor', 'doktor'],
    ['nurse', 'nars'],
    ['pain', 'kulog'],
    ['dizziness', 'lipong'],
];

interface TranslationMappings {
    bikol_to_filipino?: Record<string, string>;
    bikol_to_english?: Record<string, string>;
    filipino_to_bikol?: Record<string, string>;
    english_to_bikol?: Record<string, string>;
}

export class BikolEnhancer {
    private mappings: TranslationMappings = {};

    constructor(mappingsPath?: string) {
        if (mappingsPath) {
            this.loadMappings(mappingsPath);
        }
    }

    /**
     * Load translation mappings from JSON file
     */
    loadMappings(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                this.mappings = JSON.parse(content);
            }
        } catch (error) {
            console.warn('Failed to load Bikol mappings:', error);
        }
    }

    /**
     * Detect the language of input text
     */
    detectLanguage(text: string): Language {
        if (!text || text.trim().length === 0) {
            return 'unknown';
        }

        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordSet = new Set(words);

        // Count matches for each language
        let bikolScore = 0;
        let tagalogScore = 0;
        let englishScore = 0;

        for (const word of wordSet) {
            if (BIKOL_MARKERS.has(word)) bikolScore += 2;
            if (TAGALOG_MARKERS.has(word)) tagalogScore += 2;
            if (ENGLISH_MARKERS.has(word)) englishScore += 2;

            // Check translation dictionaries
            if (this.mappings.bikol_to_filipino?.[word]) bikolScore += 1;
            if (this.mappings.filipino_to_bikol?.[word]) tagalogScore += 1;
        }

        // Determine language based on scores
        if (bikolScore > 0 && bikolScore >= tagalogScore && bikolScore >= englishScore) {
            return 'bikol';
        }
        if (tagalogScore > englishScore && tagalogScore > 0) {
            return 'tagalog';
        }
        if (englishScore > 0) {
            return 'english';
        }

        return 'unknown';
    }

    /**
     * Enhance an English response with Bikol health terminology
     * Adds Bikol terms in parentheses after English terms.
     * 
     * Example: "Take medicine for fever" -> "Take medicine (bulong) for fever (kalintura)"
     */
    enhanceWithBikolTerms(response: string): string {
        let result = response;

        for (const [english, bikol] of HEALTH_TERM_ENHANCEMENTS) {
            // Case-insensitive replacement, only if not already enhanced
            const pattern = new RegExp(`\\b${english}\\b(?!\\s*\\()`, 'gi');
            result = result.replace(pattern, `${english} (${bikol})`);
        }

        return result;
    }

    /**
     * Get Bikol equivalent for a health term
     */
    getBikolTerm(englishTerm: string): string | undefined {
        const term = HEALTH_TERM_ENHANCEMENTS.find(
            ([eng]) => eng.toLowerCase() === englishTerm.toLowerCase()
        );
        return term?.[1];
    }

    /**
     * Translate a single word from English to Bikol
     */
    translateToBikol(word: string): string | undefined {
        return this.mappings.english_to_bikol?.[word.toLowerCase()];
    }

    /**
     * Translate a single word from Bikol to Filipino
     */
    translateToFilipino(word: string): string | undefined {
        return this.mappings.bikol_to_filipino?.[word.toLowerCase()];
    }
}

/**
 * Create BikolEnhancer with default mappings path
 */
export function createBikolEnhancer(): BikolEnhancer {
    // Try to find mappings in various locations
    const possiblePaths = [
        path.join(__dirname, '../../../../data/knowledge-base/bikol-phrases/translation_mappings.json'),
        path.join(__dirname, '../../../data/knowledge-base/bikol-phrases/translation_mappings.json'),
        path.join(process.cwd(), 'data/knowledge-base/bikol-phrases/translation_mappings.json'),
    ];

    const enhancer = new BikolEnhancer();

    for (const mappingPath of possiblePaths) {
        if (fs.existsSync(mappingPath)) {
            enhancer.loadMappings(mappingPath);
            break;
        }
    }

    return enhancer;
}
