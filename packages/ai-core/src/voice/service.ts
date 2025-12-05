/**
 * Voice service for speech-to-text and text-to-speech
 * MVP: Uses Web Speech API on client side
 * Future: Server-side with Whisper API or ElevenLabs
 */
export class VoiceService {
    /**
     * Convert speech audio to text
     * TODO: Implement server-side STT with Whisper
     */
    async speechToText(audioBuffer: ArrayBuffer): Promise<string> {
        console.warn('Server-side STT not implemented. Use Web Speech API on client.');
        return '';
    }

    /**
     * Convert text to speech audio
     * TODO: Implement with ElevenLabs or similar TTS API
     */
    async textToSpeech(text: string, language: string = 'fil'): Promise<ArrayBuffer> {
        console.warn('Server-side TTS not implemented. Use Web Speech API on client.');
        return new ArrayBuffer(0);
    }

    /**
     * Detect language of text
     * Uses simple heuristics for now
     */
    detectLanguage(text: string): 'en' | 'fil' | 'bcl' {
        const lowerText = text.toLowerCase();

        // Common Bikol words
        const bikolMarkers = ['dae', 'mayo', 'digdi', 'tabi', 'harong', 'sarong', 'ngunyan'];
        if (bikolMarkers.some((word) => lowerText.includes(word))) {
            return 'bcl';
        }

        // Common Filipino words  
        const filipinoMarkers = ['ang', 'mga', 'ako', 'ikaw', 'siya', 'namin', 'kami'];
        if (filipinoMarkers.some((word) => lowerText.includes(word))) {
            return 'fil';
        }

        return 'en';
    }
}
