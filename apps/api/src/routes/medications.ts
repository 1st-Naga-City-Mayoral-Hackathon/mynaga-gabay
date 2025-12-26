import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireInternalAuth, type AuthenticatedRequest } from '../middleware/internalAuth';
import { userRateLimit } from '../middleware/rateLimit';

export const medicationsRouter = Router();

// Per-user limit: 120 requests/min for med management
const medsRateLimit = userRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'Too many medication requests. Please wait a moment.',
});

medicationsRouter.use(requireInternalAuth, medsRateLimit);

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

medicationsRouter.get('/courses', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const includeInactive = (req.query.includeInactive as string | undefined) === '1';

  const courses = await prisma.medicationCourse.findMany({
    where: { userId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ success: true, data: courses });
});

medicationsRouter.post('/courses', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const {
    medicationName,
    strength,
    form,
    instructions,
    scheduleTimes,
    timezone,
    prn,
    startDate,
    endDate,
  } = req.body as Record<string, unknown>;

  if (typeof medicationName !== 'string' || !medicationName.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'medicationName is required' },
    });
  }

  if (typeof instructions !== 'string' || !instructions.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'instructions is required' },
    });
  }

  const times =
    Array.isArray(scheduleTimes) && scheduleTimes.every((t) => typeof t === 'string')
      ? (scheduleTimes as string[])
      : [];

  const created = await prisma.medicationCourse.create({
    data: {
      userId,
      medicationName: medicationName.trim(),
      strength: typeof strength === 'string' ? strength : undefined,
      form: typeof form === 'string' ? form : undefined,
      instructions: instructions.trim(),
      scheduleTimes: times,
      timezone: typeof timezone === 'string' && timezone ? timezone : 'Asia/Manila',
      prn: typeof prn === 'boolean' ? prn : false,
      startDate: typeof startDate === 'string' ? new Date(startDate) : undefined,
      endDate: typeof endDate === 'string' ? new Date(endDate) : undefined,
    },
  });

  return res.status(201).json({ success: true, data: created });
});

medicationsRouter.patch('/courses/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;

  const existing = await prisma.medicationCourse.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Medication course not found' },
    });
  }

  const patch = req.body as Record<string, unknown>;

  const times =
    Array.isArray(patch.scheduleTimes) && patch.scheduleTimes.every((t) => typeof t === 'string')
      ? (patch.scheduleTimes as string[])
      : undefined;

  const updated = await prisma.medicationCourse.update({
    where: { id },
    data: {
      medicationName: typeof patch.medicationName === 'string' ? patch.medicationName : undefined,
      strength: typeof patch.strength === 'string' ? patch.strength : undefined,
      form: typeof patch.form === 'string' ? patch.form : undefined,
      instructions: typeof patch.instructions === 'string' ? patch.instructions : undefined,
      scheduleTimes: times,
      timezone: typeof patch.timezone === 'string' ? patch.timezone : undefined,
      prn: typeof patch.prn === 'boolean' ? patch.prn : undefined,
      startDate: typeof patch.startDate === 'string' ? new Date(patch.startDate) : undefined,
      endDate: typeof patch.endDate === 'string' ? new Date(patch.endDate) : undefined,
      isActive: typeof patch.isActive === 'boolean' ? patch.isActive : undefined,
    },
  });

  return res.json({ success: true, data: updated });
});

medicationsRouter.delete('/courses/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;

  const existing = await prisma.medicationCourse.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Medication course not found' },
    });
  }

  await prisma.medicationCourse.update({ where: { id }, data: { isActive: false } });
  return res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

medicationsRouter.get('/reminders', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;

  const reminders = await prisma.medicationReminder.findMany({
    where: { course: { userId, isActive: true } },
    include: { course: true },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ success: true, data: reminders });
});

medicationsRouter.post('/reminders', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { courseId, timesOfDay, timezone, enabled } = req.body as Record<string, unknown>;

  if (typeof courseId !== 'string' || !courseId) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'courseId is required' },
    });
  }

  const course = await prisma.medicationCourse.findFirst({ where: { id: courseId, userId } });
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Medication course not found' },
    });
  }

  const times =
    Array.isArray(timesOfDay) && timesOfDay.every((t) => typeof t === 'string')
      ? (timesOfDay as string[])
      : course.scheduleTimes;

  const reminder = await prisma.medicationReminder.create({
    data: {
      courseId,
      enabled: typeof enabled === 'boolean' ? enabled : true,
      timesOfDay: times,
      timezone: typeof timezone === 'string' && timezone ? timezone : course.timezone,
      channel: 'local_notification',
    },
  });

  return res.status(201).json({ success: true, data: reminder });
});

medicationsRouter.patch('/reminders/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;
  const patch = req.body as Record<string, unknown>;

  const existing = await prisma.medicationReminder.findFirst({
    where: { id, course: { userId } },
    include: { course: true },
  });
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Reminder not found' },
    });
  }

  const times =
    Array.isArray(patch.timesOfDay) && patch.timesOfDay.every((t) => typeof t === 'string')
      ? (patch.timesOfDay as string[])
      : undefined;

  const updated = await prisma.medicationReminder.update({
    where: { id },
    data: {
      enabled: typeof patch.enabled === 'boolean' ? patch.enabled : undefined,
      timezone: typeof patch.timezone === 'string' ? patch.timezone : undefined,
      timesOfDay: times,
    },
  });

  return res.json({ success: true, data: updated });
});

medicationsRouter.delete('/reminders/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;

  const existing = await prisma.medicationReminder.findFirst({
    where: { id, course: { userId } },
  });
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Reminder not found' },
    });
  }

  await prisma.medicationReminder.delete({ where: { id } });
  return res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Intake events
// ---------------------------------------------------------------------------

medicationsRouter.get('/intake', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const courseId = req.query.courseId as string | undefined;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const where: Record<string, unknown> = {
    course: { userId },
  };

  if (courseId) {
    where.courseId = courseId;
  }

  if (from || to) {
    where.scheduledAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const events = await prisma.intakeEvent.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
  });

  return res.json({ success: true, data: events });
});

medicationsRouter.post('/intake', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const { courseId, scheduledAt, status, takenAt, source } = req.body as Record<string, unknown>;

  if (typeof courseId !== 'string' || !courseId) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'courseId is required' },
    });
  }
  if (typeof scheduledAt !== 'string' || !scheduledAt) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'scheduledAt is required (ISO datetime)' },
    });
  }
  if (status !== 'taken' && status !== 'missed' && status !== 'skipped') {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'status must be taken|missed|skipped' },
    });
  }

  const course = await prisma.medicationCourse.findFirst({ where: { id: courseId, userId } });
  if (!course) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Medication course not found' },
    });
  }

  const event = await prisma.intakeEvent.upsert({
    where: { courseId_scheduledAt: { courseId, scheduledAt: new Date(scheduledAt) } },
    update: {
      status,
      takenAt: typeof takenAt === 'string' ? new Date(takenAt) : status === 'taken' ? new Date() : null,
      source: source === 'mobile' ? 'mobile' : 'web',
    },
    create: {
      courseId,
      scheduledAt: new Date(scheduledAt),
      status,
      takenAt: typeof takenAt === 'string' ? new Date(takenAt) : status === 'taken' ? new Date() : null,
      source: source === 'mobile' ? 'mobile' : 'web',
    },
  });

  return res.status(201).json({ success: true, data: event });
});


