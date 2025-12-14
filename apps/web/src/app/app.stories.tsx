import type { Meta, StoryObj } from '@storybook/react';
import HomePage from './page'; // Adjust path to your page file
import { SessionProvider } from 'next-auth/react';
import { LanguageContext } from '@/contexts/LanguageContext'; // Adjust path
import React from 'react';

// --- Mocks ---

// 1. Mock Session Data
const mockSession = {
  user: {
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
  },
  expires: '2050-01-01T00:00:00.000Z',
};

// 2. Mock Translation Helper
// This mimics your useLanguage hook's 't' function
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    // Navigation & General
    'nav.chat': 'Chat',
    'nav.facilities': 'Facilities',
    'nav.medications': 'Medications',
    'nav.philhealth': 'PhilHealth',
    'nav.about': 'About Us',
    'auth.welcome': 'Welcome',
    'auth.signin': 'Sign In',
    
    // Dashboard
    'chat.description': 'Talk to our AI assistant',
    'dashboard.subtitle': 'Your personal health guide for Naga City.',
    'dashboard.startChat': 'Start Chat',
    'dashboard.quickActions': 'Quick Actions',
    'chat.recentChats': 'Recent Chats',
    'dashboard.healthInfo': 'Health Updates',
    'dashboard.healthOffice': 'City Health Office',
    'dashboard.announcement': 'Free flu vaccination drive starts tomorrow at Plaza Quezon.',
    
    // Landing
    'landing.badge': 'AI-Powered Health Assistant',
    'landing.hero.title': 'Your Health Companion in',
    'landing.hero.highlight': 'Naga City',
    'landing.hero.description': 'Access healthcare services, find medications, and get answers to your health questions instantly.',
    'landing.hero.signin': 'Get Started',
    'landing.features.title': 'What We Offer',
    'landing.trust.title': 'Trusted by Naguēnos',
    'landing.trust.description': 'Connecting citizens to vital healthcare services efficiently.',
    'landing.stats.facilities': 'Partner Facilities',
    'landing.stats.languages': 'Languages Supported',
    'landing.stats.available': 'Support Available',

    // Features
    'feature.facilities.title': 'Health Facilities',
    'feature.facilities.desc': 'Find nearby health centers',
    'feature.medications.title': 'Medicine Finder',
    'feature.medications.desc': 'Check medicine availability',
    'feature.philhealth.title': 'PhilHealth Guide',
    'feature.philhealth.desc': 'Guidance on benefits',
    'feature.voice.title': 'Voice Support',
    'feature.voice.desc': 'Speak naturally',
    'feature.scanner.title': 'Scanner',
    'feature.scanner.desc': 'Scan documents',
    'feature.ai.title': 'Smart AI',
    'feature.ai.desc': 'Intelligent assistance',
  };
  return translations[key] || key; // Fallback to key if missing
};

// 3. Mock Language Provider Wrapper
const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageContext.Provider
      value={{
        t: mockT,
        language: 'en',
        setLanguage: () => {},
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// --- Story Configuration ---

const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
    // Required for Next.js App Router mocking in Storybook
    nextjs: {
      appDirectory: true,
    },
  },
  // Wrap all stories with the Language Provider
  decorators: [
    (Story) => (
      <MockLanguageProvider>
        <Story />
      </MockLanguageProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HomePage>;

// --- Stories ---

/**
 * 1. Guest / Landing Page
 * Simulates a user who is not logged in.
 */
export const GuestLanding: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

/**
 * 2. Authenticated / Dashboard
 * Simulates a logged-in user with session data.
 */
export const UserDashboard: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
};

/**
 * 3. Loading State
 * Simulates the initial loading state (Skeleton).
 * Note: To force the loading state in NextAuth without a specialized addon,
 * we can create a mock provider that forces the status to 'loading'.
 */
const MockLoadingSessionProvider = ({ children }: { children: React.ReactNode }) => {
    // We can't easily override internal useSession hook state from outside without
    // mocking the module, but passing `loading` status via context if supported
    // or relying on the component's internal `mounted` state logic.
    
    // However, since your component also checks `!mounted`, 
    // we can simply rely on the default behavior or mock the hook return value if using Jest.
    // For Storybook visual testing, usually we export the Skeleton component separately.
    
    // *If you cannot export the Skeleton, this story might just render the Landing page*
    // *depending on how fast useEffect fires.*
    return (
        <SessionProvider session={null}>
            {children}
        </SessionProvider>
    )
}

export const LoadingSkeleton: Story = {
  render: () => {
    // If you export LandingPageSkeleton from your file, render it here directly:
    // return <LandingPageSkeleton />;
    
    // Otherwise, we rely on the component rendering. 
    return <HomePage />;
  },
  parameters: {
      // If using `storybook-addon-next-auth`
      nextAuth: {
          status: 'loading'
      }
  }
};