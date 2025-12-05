import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'MyNaga Gabay - Bikolano Health Assistant',
    description: 'Voice-enabled health assistant for Naga City residents. Get health information in Bikol, Filipino, and English.',
    keywords: ['health', 'Naga City', 'Bikol', 'healthcare', 'assistant', 'PhilHealth'],
    authors: [{ name: 'MyNaga Gabay Team' }],
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fil">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
