import { handlers } from '@/lib/auth';

// NextAuth + credentials (bcrypt) must run on Node.js, not Edge
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
