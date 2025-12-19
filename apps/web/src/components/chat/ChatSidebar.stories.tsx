import type { Meta, StoryObj } from '@storybook/react';
import { ChatSidebar } from './ChatSidebar';
import { useState } from 'react';

const meta = {
  title: 'Layout/ChatSidebar',
  component: ChatSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main navigation sidebar for the Gabay application. Handles both desktop (collapsible) and mobile (drawer) states.',
      },
    },
  },
  // Add a decorator to simulate the page layout context
  decorators: [
    (Story) => (
      <div className="flex min-h-screen w-full bg-gray-100">
        {/* Render the Sidebar */}
        <Story />
        
        {/* Mock Main Content Area to visualize layout relationship */}
        <main className="flex-1 p-8 space-y-4 overflow-auto">
            <div className="h-12 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 w-full bg-white rounded shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Main Content Area</h1>
                <p className="text-gray-600">This area represents the rest of the application to demonstrate how the sidebar sits alongside content.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-gabay-orange-100 rounded" />
                <div className="h-24 bg-gabay-orange-100 rounded" />
                <div className="h-24 bg-gabay-orange-100 rounded" />
            </div>
        </main>
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls visibility on mobile devices',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Controls expanded/collapsed state on desktop',
    },
    currentChatId: {
      control: 'select',
      options: ['1', '2', '3', undefined],
      description: 'ID of the currently active chat',
    },
  },
  args: {
    // Replace fn() with simple functions
    onClose: () => console.log('onClose clicked'),
    onToggleCollapse: () => console.log('onToggleCollapse clicked'),
  },
} satisfies Meta<typeof ChatSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default State (Desktop Expanded)
export const Default: Story = {
  args: {
    isOpen: true,
    isCollapsed: false,
    currentChatId: '1',
  },
};

// 2. Desktop Collapsed
export const Collapsed: Story = {
  args: {
    isOpen: true,
    isCollapsed: true,
    currentChatId: '1',
  },
};

// 3. Mobile View (Closed by default)
export const MobileClosed: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    isOpen: false, // Hidden on mobile initially
    isCollapsed: false,
  },
};

// 4. Mobile View (Open/Drawer active)
export const MobileOpen: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    isOpen: true, // Drawer slide-in active
    isCollapsed: false,
  },
};

// 5. Interactive Mode
// Uses useArgs to allow the buttons in the UI to actually update the Storybook state
// 5. Interactive Mode
// Uses local state so you can test the toggle buttons without extra dependencies
export const Interactive: Story = {
    render: function Render(args) {
      const [isCollapsed, setIsCollapsed] = useState(args.isCollapsed);
      const [isOpen, setIsOpen] = useState(args.isOpen);
  
      const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
      };
  
      const handleClose = () => {
        setIsOpen(!isOpen);
      };
  
      return (
        <ChatSidebar
          {...args}
          isCollapsed={isCollapsed}
          isOpen={isOpen}
          onToggleCollapse={handleToggleCollapse}
          onClose={handleClose}
        />
      );
    },
    args: {
      isOpen: true,
      isCollapsed: false,
      currentChatId: '2',
    },
  };