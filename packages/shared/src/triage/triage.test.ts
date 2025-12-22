/**
 * Tests for the Triage Module
 */

import { describe, it, expect } from 'vitest';
import {
  detectSymptoms,
  detectRedFlags,
  determineUrgency,
  getMedicationCard,
  triageMessage,
  isHealthRelated,
} from './index';

describe('Triage Module', () => {
  describe('detectSymptoms', () => {
    it('should detect cough symptoms in English', () => {
      const results = detectSymptoms('I have a bad cough');
      const coughMatch = results.find((r) => r.symptom === 'cough');
      expect(coughMatch?.matched).toBe(true);
    });

    it('should detect cough symptoms in Filipino', () => {
      const results = detectSymptoms('May ubo ako');
      const coughMatch = results.find((r) => r.symptom === 'cough');
      expect(coughMatch?.matched).toBe(true);
    });

    it('should detect fever symptoms', () => {
      const results = detectSymptoms('I have a fever and feel hot');
      const feverMatch = results.find((r) => r.symptom === 'fever');
      expect(feverMatch?.matched).toBe(true);
    });

    it('should detect fever in Filipino', () => {
      const results = detectSymptoms('May lagnat ako');
      const feverMatch = results.find((r) => r.symptom === 'fever');
      expect(feverMatch?.matched).toBe(true);
    });

    it('should detect multiple symptoms', () => {
      const results = detectSymptoms('I have cough and fever');
      const coughMatch = results.find((r) => r.symptom === 'cough');
      const feverMatch = results.find((r) => r.symptom === 'fever');
      expect(coughMatch?.matched).toBe(true);
      expect(feverMatch?.matched).toBe(true);
    });

    it('should not detect symptoms in unrelated message', () => {
      const results = detectSymptoms('Hello, how are you?');
      const matchedSymptoms = results.filter((r) => r.matched);
      expect(matchedSymptoms.length).toBe(0);
    });
  });

  describe('detectRedFlags', () => {
    it('should detect blood in sputum as red flag', () => {
      const { flags, requiresER } = detectRedFlags(
        'I am coughing blood',
        ['cough']
      );
      expect(flags.length).toBeGreaterThan(0);
      expect(flags.some((f) => f.includes('Blood'))).toBe(true);
      expect(requiresER).toBe(true);
    });

    it('should detect difficulty breathing as red flag', () => {
      const { flags, requiresER } = detectRedFlags(
        'I have difficulty breathing with my cough',
        ['cough']
      );
      expect(flags.some((f) => f.includes('breathing'))).toBe(true);
      expect(requiresER).toBe(true);
    });

    it('should detect chest pain as red flag', () => {
      const { flags, requiresER } = detectRedFlags(
        'I have chest pain when I cough',
        ['cough']
      );
      expect(flags.some((f) => f.includes('Chest pain'))).toBe(true);
      expect(requiresER).toBe(true);
    });

    it('should detect pregnancy as red flag', () => {
      const { flags } = detectRedFlags('I am pregnant and have a cough', [
        'cough',
      ]);
      expect(flags.some((f) => f.includes('Pregnant'))).toBe(true);
    });

    it('should not detect red flags in simple cough', () => {
      const { flags, requiresER } = detectRedFlags(
        'I have a mild cough for 2 days',
        ['cough']
      );
      expect(flags.length).toBe(0);
      expect(requiresER).toBe(false);
    });
  });

  describe('determineUrgency', () => {
    it('should return ER for emergency cases', () => {
      const urgency = determineUrgency(['cough'], ['Difficulty breathing'], true);
      expect(urgency).toBe('er');
    });

    it('should return clinic for red flags without ER need', () => {
      const urgency = determineUrgency(
        ['cough'],
        ['Cough lasting more than 2 weeks'],
        false
      );
      expect(urgency).toBe('clinic');
    });

    it('should return self_care for simple symptoms', () => {
      const urgency = determineUrgency(['cough'], [], false);
      expect(urgency).toBe('self_care');
    });
  });

  describe('getMedicationCard', () => {
    it('should return medication card for cough', () => {
      const card = getMedicationCard(['cough']);
      expect(card).toBeDefined();
      expect(card?.cardType).toBe('medication');
      expect(card?.items.length).toBeGreaterThan(0);
    });

    it('should return medication card for fever', () => {
      const card = getMedicationCard(['fever']);
      expect(card).toBeDefined();
      expect(card?.items.some((i) => i.genericName.includes('Paracetamol'))).toBe(
        true
      );
    });

    it('should return undefined for unknown symptoms', () => {
      const card = getMedicationCard(['unknown_symptom']);
      expect(card).toBeUndefined();
    });

    it('should include disclaimer in medication card', () => {
      const card = getMedicationCard(['cough']);
      expect(card?.generalDisclaimer).toBeDefined();
      expect(card?.generalDisclaimer.length).toBeGreaterThan(0);
    });
  });

  describe('triageMessage', () => {
    it('should return complete triage result for cough', () => {
      const result = triageMessage('I have a cough');
      expect(result.detectedSymptoms).toContain('cough');
      expect(result.safety.urgency).toBe('self_care');
      expect(result.medicationCard).toBeDefined();
      expect(result.facilityType).toBe('clinic');
    });

    it('should return ER recommendation for emergency symptoms', () => {
      const result = triageMessage('I am coughing blood and have difficulty breathing');
      expect(result.safety.urgency).toBe('er');
      expect(result.safety.redFlags?.length).toBeGreaterThan(0);
      expect(result.facilityType).toBe('er');
      expect(result.medicationCard).toBeUndefined(); // No OTC for emergencies
    });

    it('should return no medication for ER cases', () => {
      const result = triageMessage('I have chest pain and shortness of breath');
      expect(result.medicationCard).toBeUndefined();
    });

    it('should handle non-health messages', () => {
      const result = triageMessage('Hello, nice weather today');
      expect(result.detectedSymptoms.length).toBe(0);
      expect(result.medicationCard).toBeUndefined();
      expect(result.facilityType).toBe('none');
    });
  });

  describe('isHealthRelated', () => {
    it('should return true for health-related English messages', () => {
      expect(isHealthRelated('I have a fever')).toBe(true);
      expect(isHealthRelated('My head hurts')).toBe(true);
      expect(isHealthRelated('I need medicine for cough')).toBe(true);
    });

    it('should return true for health-related Filipino messages', () => {
      expect(isHealthRelated('May sakit ako')).toBe(true);
      expect(isHealthRelated('Masakit ang ulo ko')).toBe(true);
      expect(isHealthRelated('May lagnat ako')).toBe(true);
    });

    it('should return false for non-health messages', () => {
      expect(isHealthRelated('Hello')).toBe(false);
      expect(isHealthRelated('What is the weather today?')).toBe(false);
      expect(isHealthRelated('Thank you')).toBe(false);
    });
  });
});
