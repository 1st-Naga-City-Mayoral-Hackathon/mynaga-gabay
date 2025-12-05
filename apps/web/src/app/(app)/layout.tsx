import { Navigation } from '@/components/Navigation';
import '../globals.css';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Navigation />
        </>
    );
}
