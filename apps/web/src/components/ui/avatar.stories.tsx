import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Use tailwind classes to change the size (e.g. h-12 w-12)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// 1. The Default Story (Loading a real image)
export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: '', // Default size is h-10 w-10
  },
};

// 2. The Fallback Story (Image fails or is missing)
export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// 3. Large Size (Overriding size with className)
export const Large: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: 'h-24 w-24', // Tailwind classes for larger size
  },
};

// 4. Small Size
export const Small: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    className: 'h-6 w-6 text-[10px]', // Adjusting text size for the fallback is often needed for small avatars
  },
};
