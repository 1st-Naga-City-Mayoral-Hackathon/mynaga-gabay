import { useState } from 'react';
import type { MedicationPlanCard } from '@mynaga/shared';

export function MedicationPlanCardUI({ card }: { card: MedicationPlanCard }) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function saveToMyMeds() {
    try {
      setSaveState('saving');
      setErrorMsg(null);

      // Create courses + reminders for non-PRN items (best-effort)
      for (const item of card.items) {
        const createCourseResp = await fetch('/api/medications/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicationName: item.medicationName,
            strength: item.strength,
            form: item.form,
            instructions: item.scheduleSummary,
            scheduleTimes: item.timesOfDay || [],
            prn: Boolean(item.prn),
            startDate: item.startDate,
            endDate: item.endDate,
            timezone: 'Asia/Manila',
          }),
        });
        const createCourseJson = await createCourseResp.json();
        if (!createCourseResp.ok || !createCourseJson?.success) {
          throw new Error(createCourseJson?.error?.message || 'Failed to save medication');
        }
        const courseId = createCourseJson.data?.id as string | undefined;
        if (courseId && item.timesOfDay && item.timesOfDay.length > 0 && !item.prn) {
          await fetch('/api/medications/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId,
              timesOfDay: item.timesOfDay,
              timezone: 'Asia/Manila',
              enabled: true,
            }),
          });
        }
      }

      setSaveState('saved');
    } catch (e) {
      setSaveState('error');
      setErrorMsg(e instanceof Error ? e.message : 'Failed to save');
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-background">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{card.title || 'Medication plan'}</div>
          <div className="text-xs text-muted-foreground">
            Source: {card.source}
            {card.needsVerification ? ' • Needs verification' : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg border hover:bg-accent disabled:opacity-50"
            disabled={saveState === 'saving' || saveState === 'saved'}
            onClick={saveToMyMeds}
            title="Save to My Medicines"
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {card.items.map((item, idx) => (
          <div key={idx} className="rounded-lg border p-3">
            <div className="text-sm font-medium">
              {idx + 1}. {item.medicationName}
              {item.strength ? ` ${item.strength}` : ''}
              {item.form ? ` ${item.form}` : ''}
            </div>
            <div className="text-sm">{item.scheduleSummary}</div>
            {item.timesOfDay && item.timesOfDay.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Times: {item.timesOfDay.join(', ')}
              </div>
            )}
            {(item.startDate || item.endDate || item.durationDays) && (
              <div className="text-xs text-muted-foreground mt-1">
                {item.startDate ? `Start: ${item.startDate}` : ''}
                {item.endDate ? `${item.startDate ? ' • ' : ''}End: ${item.endDate}` : ''}
                {item.durationDays ? `${item.startDate || item.endDate ? ' • ' : ''}${item.durationDays} days` : ''}
              </div>
            )}
            {item.needsVerification && (
              <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Please verify this before setting reminders.
              </div>
            )}
          </div>
        ))}
      </div>

      {saveState === 'error' && errorMsg && (
        <div className="mt-3 text-xs text-destructive">{errorMsg}</div>
      )}
    </div>
  );
}


