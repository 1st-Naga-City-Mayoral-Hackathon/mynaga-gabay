import type { Meta, StoryObj } from '@storybook/react';
import { ChatHeader } from './ChatHeader';

// --- Mock Component for Button ---
const MockButton = ({ children, onClick, className, variant, size }: any) => (
  <button
    onClick={onClick}
    // Simplified styling for Storybook display
    className={`p-2 rounded ${className} ${variant === 'ghost' ? 'text-gray-600 hover:bg-gray-100' : 'bg-blue-500 text-white'}`}
  >
    {children || 'Button'}
  </button>
);
// ---------------------------------

const MockChatHeader = (props: React.ComponentProps<typeof ChatHeader>) => {
  // This re-implements the component's structure using the Mock Button
  // and excludes the removed components.
  const { onMenuClick } = props;
  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        {/* Menu Button - Mobile */}
        <MockButton variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </MockButton>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-sm">🏥</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-gray-900">Gabay</h1>
            <p className="text-xs text-gray-500">Your health assistant</p>
          </div>
        </div>
      </div>

      {/* Right side is empty */}
      <div className="flex items-center gap-1">{/* No controls here */}</div>
    </header>
  );
};

// Metadata for the component story
const meta: Meta<typeof ChatHeader> = {
  title: 'Layout/ChatHeader',
  component: MockChatHeader, // Use the mock component for isolation
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Ensure the header spans the full width of the preview
  },
  argTypes: {
    onMenuClick: {
      action: 'menu clicked',
      description: 'Callback function for the mobile menu button.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChatHeader>;

/**
 * The default state of the `ChatHeader` component, with only the logo/title and the mobile menu button.
 */
export const Default: Story = {
  args: {
    onMenuClick: () => console.log('Menu Clicked'),
  },
};

/**
 * State simulating a mobile view, where the menu button is visible.
 */
export const MobileView: Story = {
  name: 'Mobile View (Menu Button Visible)',
  args: {
    onMenuClick: () => console.log('Menu Clicked in Mobile View'),
  },
  parameters: {
    // Suggest a mobile viewport size for viewing this story
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
