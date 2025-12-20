import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';
import { SessionProvider } from 'next-auth/react';
// Import the Context object directly (ensure it is exported in languagecontext.tsx)
import { LanguageContext } from '@/contexts/LanguageContext';

// --- Mocks ---

// 1. Mock Language Provider
// We create a lightweight provider that mimics your real one but with simple data
const MockLanguageProvider = ({
  children,
  lang = 'en',
}: {
  children: React.ReactNode;
  lang?: string;
}) => {
  const mockContextValue = {
    language: lang as any,
    setLanguage: () => {},
    t: (key: string) => {
      // Simple lookup map for the most common keys used in Header
      // This prevents us from needing to copy the huge translation object
      const map: Record<string, string> = {
        'nav.chat': 'Chat',
        'nav.facilities': 'Facilities',
        'nav.medications': 'Medications',
        'nav.philhealth': 'PhilHealth',
        'nav.about': 'About',
        'app.name': 'MyNaga Gabay',
        'app.tagline': 'Your Healthcare Companion',
        'status.online': 'Online',
        'nav.profile': 'Profile',
        'nav.logout': 'Logout',
        'auth.signin': 'Sign In',
      };
      return map[key] || key;
    },
  };

  return (
    // @ts-ignore - Ignoring strict type checks for the mock to keep it simple
    <LanguageContext.Provider value={mockContextValue}>{children}</LanguageContext.Provider>
  );
};

// --- Meta Configuration ---

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Headers should stretch across the screen
    nextjs: {
      appDirectory: true, // Tells Storybook to mock Next.js App Router hooks
    },
  },
  // Apply the MockLanguageProvider to all stories in this file
  decorators: [
    (Story) => (
      <MockLanguageProvider>
        <div className="min-h-[300px] bg-background">
          {/* Added height so dropdowns don't get cut off in the canvas */}
          <Story />
        </div>
      </MockLanguageProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

// --- Stories ---

// 1. Guest User (Not Logged In)
export const Guest: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

// 2. Logged In User
export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            name: 'Juan Dela Cruz',
            email: 'juan@example.com',
            image: 'https://github.com/shadcn.png',
          },
          expires: '9999-12-31T23:59:59.999Z',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
};

// 3. Active Page State (Simulating being on the "/chat" route)
export const ActivePage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/chat', // This tells the component which link to highlight
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

// 4. Mobile View
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1', // Sets the preview window to mobile size
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};
