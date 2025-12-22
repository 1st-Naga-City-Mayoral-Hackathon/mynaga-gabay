/**
 * Tests for Assistant Types and Type Guards
 */

import { describe, it, expect } from 'vitest';
import {
  isAssistantEnvelope,
  isMedicationCard,
  isFacilityCard,
  isRouteCard,
  isScheduleCard,
  isBookingCard,
  type AssistantEnvelope,
  type MedicationCard,
  type FacilityCard,
  type RouteCard,
  type ScheduleCard,
  type BookingCard,
} from './assistant';

describe('Type Guards', () => {
  describe('isAssistantEnvelope', () => {
    it('should return true for valid envelope', () => {
      const envelope: AssistantEnvelope = {
        text: 'Hello, I can help you.',
        language: 'english',
        safety: { urgency: 'self_care' },
        cards: [],
      };
      expect(isAssistantEnvelope(envelope)).toBe(true);
    });

    it('should return true for envelope with cards', () => {
      const envelope: AssistantEnvelope = {
        text: 'Here is some information.',
        language: 'tagalog',
        safety: { disclaimer: 'This is general info only.' },
        cards: [
          {
            cardType: 'medication',
            title: 'OTC Options',
            items: [],
            generalDisclaimer: 'Consult a doctor.',
          },
        ],
      };
      expect(isAssistantEnvelope(envelope)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isAssistantEnvelope(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAssistantEnvelope(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isAssistantEnvelope('Hello')).toBe(false);
    });

    it('should return false for object missing text', () => {
      expect(
        isAssistantEnvelope({
          language: 'english',
          safety: {},
          cards: [],
        })
      ).toBe(false);
    });

    it('should return false for object missing cards', () => {
      expect(
        isAssistantEnvelope({
          text: 'Hello',
          language: 'english',
          safety: {},
        })
      ).toBe(false);
    });
  });

  describe('isMedicationCard', () => {
    it('should return true for medication card', () => {
      const card: MedicationCard = {
        cardType: 'medication',
        title: 'OTC Options',
        items: [
          {
            genericName: 'Paracetamol',
            why: 'For fever',
            howToUseGeneral: 'Take as directed',
            cautions: ['Do not exceed dose'],
            avoidIf: ['Liver disease'],
            whenToSeeDoctor: 'If symptoms persist',
          },
        ],
        generalDisclaimer: 'Consult a doctor.',
      };
      expect(isMedicationCard(card)).toBe(true);
    });

    it('should return false for other card types', () => {
      const card: FacilityCard = {
        cardType: 'facility',
        facilityId: '123',
        name: 'Hospital',
        address: '123 Street',
      };
      expect(isMedicationCard(card)).toBe(false);
    });
  });

  describe('isFacilityCard', () => {
    it('should return true for facility card', () => {
      const card: FacilityCard = {
        cardType: 'facility',
        facilityId: '123',
        name: 'Bicol Medical Center',
        address: 'Naga City',
        lat: 13.6218,
        lng: 123.1948,
      };
      expect(isFacilityCard(card)).toBe(true);
    });

    it('should return false for other card types', () => {
      const card: MedicationCard = {
        cardType: 'medication',
        title: 'OTC',
        items: [],
        generalDisclaimer: '',
      };
      expect(isFacilityCard(card)).toBe(false);
    });
  });

  describe('isRouteCard', () => {
    it('should return true for route card', () => {
      const card: RouteCard = {
        cardType: 'route',
        from: { lat: 13.62, lng: 123.19 },
        to: { lat: 13.63, lng: 123.20 },
        geojsonLine: { type: 'LineString', coordinates: [] },
        distanceMeters: 1000,
        durationSeconds: 300,
        steps: [],
        profile: 'driving',
      };
      expect(isRouteCard(card)).toBe(true);
    });
  });

  describe('isScheduleCard', () => {
    it('should return true for schedule card', () => {
      const card: ScheduleCard = {
        cardType: 'schedule',
        facilityId: '123',
        humanSummary: '5 slots available',
        slots: [
          {
            slotId: 's1',
            startTime: '2024-01-15T09:00:00Z',
            endTime: '2024-01-15T09:30:00Z',
            available: true,
          },
        ],
      };
      expect(isScheduleCard(card)).toBe(true);
    });
  });

  describe('isBookingCard', () => {
    it('should return true for booking card', () => {
      const card: BookingCard = {
        cardType: 'booking',
        doctorId: 'd1',
        facilityId: 'f1',
        status: 'booked',
        appointmentId: 'a1',
      };
      expect(isBookingCard(card)).toBe(true);
    });

    it('should work for all booking statuses', () => {
      const statuses: BookingCard['status'][] = [
        'proposed',
        'booked',
        'failed',
        'cancelled',
      ];

      for (const status of statuses) {
        const card: BookingCard = {
          cardType: 'booking',
          doctorId: 'd1',
          facilityId: 'f1',
          status,
        };
        expect(isBookingCard(card)).toBe(true);
      }
    });
  });
});

describe('Type Structures', () => {
  it('should allow minimal AssistantEnvelope', () => {
    const envelope: AssistantEnvelope = {
      text: 'Hello',
      language: 'english',
      safety: {},
      cards: [],
    };
    expect(envelope.text).toBe('Hello');
    expect(envelope.cards.length).toBe(0);
  });

  it('should allow full AssistantEnvelope with all card types', () => {
    const envelope: AssistantEnvelope = {
      text: 'Here is your information.',
      language: 'bikol',
      safety: {
        disclaimer: 'General info only',
        redFlags: ['Fever over 39°C'],
        urgency: 'clinic',
      },
      cards: [
        {
          cardType: 'medication',
          title: 'OTC Options',
          items: [],
          generalDisclaimer: 'Consult doctor',
        },
        {
          cardType: 'facility',
          facilityId: 'f1',
          name: 'Hospital',
          address: 'Address',
        },
        {
          cardType: 'route',
          from: { lat: 0, lng: 0 },
          to: { lat: 1, lng: 1 },
          geojsonLine: { type: 'LineString', coordinates: [] },
          distanceMeters: 100,
          durationSeconds: 60,
          steps: [],
          profile: 'walking',
        },
        {
          cardType: 'schedule',
          facilityId: 'f1',
          humanSummary: 'Available',
          slots: [],
        },
        {
          cardType: 'booking',
          doctorId: 'd1',
          facilityId: 'f1',
          status: 'proposed',
        },
      ],
      sessionId: 'session123',
      timestamp: new Date().toISOString(),
    };

    expect(envelope.cards.length).toBe(5);
    expect(envelope.safety.urgency).toBe('clinic');
  });
});
