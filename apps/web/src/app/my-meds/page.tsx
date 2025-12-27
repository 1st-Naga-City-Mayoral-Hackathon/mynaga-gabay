'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';

type MedicationCourse = {
  id: string;
  medicationName: string;
  strength?: string | null;
  form?: string | null;
  instructions: string;
  scheduleTimes: string[];
  timezone: string;
  prn: boolean;
  isActive: boolean;
};

type IntakeEvent = {
  id: string;
  courseId: string;
  scheduledAt: string;
  takenAt?: string | null;
  status: 'taken' | 'missed' | 'skipped';
  source: 'web' | 'mobile';
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toScheduledIso(timeHHMM: string) {
  const date = todayIsoDate();
  return new Date(`${date}T${timeHHMM}:00`).toISOString();
}

export default function MyMedsPage() {
  const [courses, setCourses] = useState<MedicationCourse[]>([]);
  const [events, setEvents] = useState<IntakeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = todayIsoDate();

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const coursesResp = await fetch('/api/medications/courses');
      const coursesJson = await coursesResp.json();
      if (!coursesResp.ok || !coursesJson?.success) {
        throw new Error(coursesJson?.error?.message || 'Failed to load medication courses');
      }
      const list = (coursesJson.data || []) as MedicationCourse[];
      setCourses(list);

      const from = new Date(`${today}T00:00:00`).toISOString();
      const to = new Date(`${today}T23:59:59`).toISOString();
      const eventsResp = await fetch(`/api/medications/intake?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const eventsJson = await eventsResp.json();
      if (!eventsResp.ok || !eventsJson?.success) {
        throw new Error(eventsJson?.error?.message || 'Failed to load intake events');
      }
      setEvents((eventsJson.data || []) as IntakeEvent[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventsByKey = useMemo(() => {
    const map = new Map<string, IntakeEvent>();
    for (const ev of events) {
      map.set(`${ev.courseId}:${ev.scheduledAt}`, ev);
    }
    return map;
  }, [events]);

  async function mark(courseId: string, scheduledAt: string, status: 'taken' | 'missed' | 'skipped') {
    await fetch('/api/medications/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, scheduledAt, status, source: 'web' }),
    });
    await refresh();
  }

  // Browser notifications (best-effort while tab is open)
  async function enableBrowserReminders() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Simple periodic checker while this page is open
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const keyTime = `${hh}:${mm}`;

      for (const c of courses) {
        if (!c.isActive || c.prn) continue;
        if (!c.scheduleTimes?.includes(keyTime)) continue;
        const scheduledAt = toScheduledIso(keyTime);
        const existing = eventsByKey.get(`${c.id}:${scheduledAt}`);
        if (existing?.status === 'taken') continue;
        new Notification('Medicine reminder', {
          body: `${c.medicationName}${c.strength ? ` ${c.strength}` : ''}${c.form ? ` ${c.form}` : ''} — ${c.instructions}`,
        });
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [courses, eventsByKey]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">My Medicines</h1>
            <p className="text-muted-foreground">Track your medication plan and mark doses taken.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm"
              onClick={enableBrowserReminders}
              title="Enable browser notifications (works while this tab is open)"
            >
              Enable reminders
            </button>
            <button
              className="px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

        {courses.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">No saved medicines yet. Use the chat “Save” button on a Medication Plan.</div>
        )}

        <div className="space-y-4">
          {courses.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">
                    {c.medicationName}
                    {c.strength ? ` ${c.strength}` : ''}
                    {c.form ? ` ${c.form}` : ''}
                  </div>
                  <div className="text-sm text-muted-foreground">{c.instructions}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.prn ? 'PRN (as needed)' : `Times: ${(c.scheduleTimes || []).join(', ') || '—'}`} • {today}
                  </div>
                </div>
              </div>

              {!c.prn && c.scheduleTimes?.length > 0 && (
                <div className="mt-4 grid sm:grid-cols-3 gap-2">
                  {c.scheduleTimes.map((t) => {
                    const scheduledAt = toScheduledIso(t);
                    const ev = eventsByKey.get(`${c.id}:${scheduledAt}`);
                    return (
                      <div key={t} className="rounded-lg border p-3">
                        <div className="text-sm font-medium">{t}</div>
                        <div className="text-xs text-muted-foreground">
                          Status: {ev ? ev.status : 'pending'}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="text-xs px-2 py-1 rounded border hover:bg-accent"
                            onClick={() => mark(c.id, scheduledAt, 'taken')}
                          >
                            Taken
                          </button>
                          <button
                            className="text-xs px-2 py-1 rounded border hover:bg-accent"
                            onClick={() => mark(c.id, scheduledAt, 'missed')}
                          >
                            Missed
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}



