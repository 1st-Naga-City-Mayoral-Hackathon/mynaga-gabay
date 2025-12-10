import { Chat } from '@/components/chat';

export default function ChatPage() {
    // Don't pass language prop - let Chat use the language from context
    return <Chat />;
}
