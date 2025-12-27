/**
 * Audit Logging Service
 *
 * Logs security-relevant actions for compliance and abuse detection.
 * Sensitive data (like raw GPS coordinates) is not stored.
 */

import { Request } from 'express';
import prisma from '../lib/prisma';
import type { AuditAction, Prisma } from '@prisma/client';

interface AuditLogOptions {
  userId: string;
  action: AuditAction;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}

/**
 * Mask IP address for privacy (keep first two octets)
 */
function maskIpAddress(ip: string | undefined): string | null {
  if (!ip) return null;

  // Handle IPv6-mapped IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4: mask last two octets
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }

  // IPv6: mask last half
  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length > 4) {
    return ipv6Parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
  }

  return null;
}

/**
 * Truncate user agent for storage
 */
function truncateUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent) return null;
  return userAgent.substring(0, 200);
}

/**
 * Log an audit event
 */
export async function logAudit(options: AuditLogOptions): Promise<void> {
  const { userId, action, resourceId, metadata, req } = options;

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceId,
        metadata: metadata
          ? (sanitizeMetadata(metadata) as Prisma.InputJsonValue)
          : undefined,
        ipAddress: maskIpAddress(req?.ip),
        userAgent: truncateUserAgent(req?.headers['user-agent'] as string),
      },
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('[AuditLog] Failed to log audit event:', error);
  }
}

/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...metadata };

  // Remove raw GPS coordinates
  delete sanitized.lat;
  delete sanitized.lng;
  delete sanitized.latitude;
  delete sanitized.longitude;
  delete sanitized.location;
  delete sanitized.coordinates;

  // Remove phone numbers (but keep presence flag)
  if (sanitized.patientPhone) {
    sanitized.hasPhone = true;
    delete sanitized.patientPhone;
  }

  return sanitized;
}

/**
 * Log appointment creation
 */
export async function logAppointmentCreated(
  userId: string,
  appointmentId: string,
  metadata: Record<string, unknown>,
  req?: Request
): Promise<void> {
  await logAudit({
    userId,
    action: 'appointment_created',
    resourceId: appointmentId,
    metadata: {
      doctorId: metadata.doctorId,
      facilityId: metadata.facilityId,
      slotStart: metadata.slotStart,
    },
    req,
  });
}

/**
 * Log appointment cancellation
 */
export async function logAppointmentCancelled(
  userId: string,
  appointmentId: string,
  req?: Request
): Promise<void> {
  await logAudit({
    userId,
    action: 'appointment_cancelled',
    resourceId: appointmentId,
    req,
  });
}

/**
 * Log appointment viewed
 */
export async function logAppointmentViewed(
  userId: string,
  appointmentId: string | null,
  req?: Request
): Promise<void> {
  await logAudit({
    userId,
    action: 'appointment_viewed',
    resourceId: appointmentId || undefined,
    req,
  });
}

/**
 * Log route request (without coordinates)
 */
export async function logRouteRequested(
  userId: string | undefined,
  metadata: { profile: string; distanceMeters?: number },
  req?: Request
): Promise<void> {
  await logAudit({
    userId: userId || 'anonymous',
    action: 'route_requested',
    metadata,
    req,
  });
}

/**
 * Log authentication failure
 */
export async function logAuthFailed(
  reason: string,
  req?: Request
): Promise<void> {
  await logAudit({
    userId: 'anonymous',
    action: 'auth_failed',
    metadata: { reason },
    req,
  });
}
