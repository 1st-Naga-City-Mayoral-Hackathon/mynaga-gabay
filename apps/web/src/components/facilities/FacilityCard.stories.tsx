import type { Meta, StoryObj } from '@storybook/react';
import { FacilityCard } from './FacilityCard';
// You might need to adjust this import based on your actual project structure
import type { HealthFacility } from '@mynaga/shared';

// Create a base mock object to reuse
const baseFacility: HealthFacility = {
  id: '1',
  name: 'Naga City Hospital',
  type: 'hospital',
  address: 'Peñafrancia Avenue, Naga City',
  barangay: 'Peñafrancia',
  city: 'Naga City',
  phone: '(054) 473-1234',
  hours: '24/7',
  services: ['Emergency', 'Outpatient', 'Laboratory', 'X-Ray'],
  latitude: 13.6, // Assuming these exist in your type
  longitude: 123.2,
};

const meta: Meta<typeof FacilityCard> = {
  title: 'Facilities/FacilityCard',
  component: FacilityCard,
  tags: ['autodocs'],
    decorators: [
    (Story) => (
      <div className="max-w-sm p-4 bg-slate-50 dark:bg-slate-900">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FacilityCard>;

export const Hospital: Story = {
  args: {
    facility: baseFacility,
  },
};

export const Clinic: Story = {
  args: {
    facility: {
      ...baseFacility,
      id: '2',
      name: 'St. John Clinic',
      type: 'clinic',
      hours: '8:00 AM - 5:00 PM',
      services: ['General Checkup', 'Pediatrics'],
    },
  },
};

export const Pharmacy: Story = {
  args: {
    facility: {
      ...baseFacility,
      id: '3',
      name: 'Mercury Drug',
      type: 'pharmacy',
      services: ['Medicine', 'Vaccines'],
    },
  },
};

export const HealthCenter: Story = {
  args: {
    facility: {
      ...baseFacility,
      id: '4',
      name: 'Barangay Health Center',
      type: 'health_center',
    },
  },
};

export const ManyServices: Story = {
  args: {
    facility: {
      ...baseFacility,
      services: [
        'Emergency',
        'Outpatient',
        'Laboratory',
        'X-Ray',
        'Ultrasound',
        'Pharmacy',
        'Dental',
        'OB-GYN',
      ],
    },
  },
};

export const NoPhone: Story = {
  args: {
    facility: {
      ...baseFacility,
      phone: undefined, // Should hide the "Call" button
    },
  },
};