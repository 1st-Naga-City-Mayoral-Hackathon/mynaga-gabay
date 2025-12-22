'use client';

import type { BookingCard } from '@mynaga/shared';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface BookingCardUIProps {
  card: BookingCard;
}

function formatSlotDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getStatusConfig(status: BookingCard['status']) {
  switch (status) {
    case 'booked':
      return {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        label: 'Appointment Confirmed',
      };
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
        label: 'Appointment Cancelled',
      };
    case 'failed':
      return {
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        label: 'Booking Failed',
      };
    case 'proposed':
    default:
      return {
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        label: 'Pending Confirmation',
      };
  }
}

export function BookingCardUI({ card }: BookingCardUIProps) {
  const statusConfig = getStatusConfig(card.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`border rounded-xl p-4 ${statusConfig.bgColor} my-3`}
    >
      <div className="flex items-center gap-2 mb-3">
        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
        <h4 className={`font-semibold text-sm ${statusConfig.color}`}>
          {statusConfig.label}
        </h4>
      </div>

      <div className="space-y-2 text-sm">
        {card.doctorName && (
          <p>
            <span className="text-muted-foreground">Doctor:</span>{' '}
            <span className="font-medium">{card.doctorName}</span>
          </p>
        )}

        {card.facilityName && (
          <p>
            <span className="text-muted-foreground">Facility:</span>{' '}
            <span className="font-medium">{card.facilityName}</span>
          </p>
        )}

        {card.selectedSlot && (
          <p>
            <span className="text-muted-foreground">Time:</span>{' '}
            <span className="font-medium">
              {formatSlotDateTime(card.selectedSlot.startTime)}
            </span>
          </p>
        )}

        {card.appointmentId && card.status === 'booked' && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            Appointment ID: {card.appointmentId.slice(0, 8)}...
          </p>
        )}

        {card.errorMessage && card.status === 'failed' && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Error: {card.errorMessage}
          </p>
        )}
      </div>

      {card.status === 'booked' && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-800 dark:text-green-200">
          Please arrive 15 minutes before your scheduled appointment. Bring a
          valid ID and any relevant medical records.
        </div>
      )}
    </div>
  );
}
