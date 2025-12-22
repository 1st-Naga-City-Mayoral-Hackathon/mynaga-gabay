'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { ScheduleSlot } from '@mynaga/shared';
import { LogIn, Calendar, User, Phone, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ScheduleSlot | null;
  doctorId: string;
  doctorName?: string;
  facilityId: string;
  facilityName?: string;
  onBookingComplete?: (appointmentId: string) => void;
}

type BookingState = 'idle' | 'loading' | 'success' | 'error';

export function BookingModal({
  open,
  onOpenChange,
  slot,
  doctorId,
  doctorName,
  facilityId,
  facilityName,
  onBookingComplete,
}: BookingModalProps) {
  const { data: session, status } = useSession();
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingState, setBookingState] = useState<BookingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Pre-fill name from session
  useState(() => {
    if (session?.user?.name && !patientName) {
      setPatientName(session.user.name);
    }
  });

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slot || !patientName.trim()) return;

    setBookingState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          facilityId,
          slotStart: slot.startTime,
          slotEnd: slot.endTime,
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Booking failed');
      }

      setAppointmentId(result.data.appointmentId);
      setBookingState('success');
      onBookingComplete?.(result.data.appointmentId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to book appointment');
      setBookingState('error');
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setBookingState('idle');
    setErrorMessage('');
    setNotes('');
    setPatientPhone('');
    onOpenChange(false);
  };

  const formatSlotDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={handleClose}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gabay-orange-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not authenticated - show sign-in prompt
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={handleClose}>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to book an appointment. Your booking history will be saved to your account.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gabay-orange-100 dark:bg-gabay-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-gabay-orange-600" />
              </div>

              {slot && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-medium">{doctorName || 'Doctor'}</p>
                  <p className="text-muted-foreground">{facilityName}</p>
                  <p className="text-gabay-orange-600 mt-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatSlotDateTime(slot.startTime)}
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                After signing in, you&apos;ll return here to complete your booking.
              </p>
            </div>
          </DialogBody>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button asChild className="w-full sm:w-auto bg-gabay-orange hover:bg-gabay-orange-700">
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Book
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state
  if (bookingState === 'success') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={handleClose}>
          <DialogBody>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Appointment Booked!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your appointment has been confirmed.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-left">
                <p className="font-medium">{doctorName || 'Doctor'}</p>
                <p className="text-muted-foreground">{facilityName}</p>
                {slot && (
                  <p className="text-gabay-orange-600 mt-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatSlotDateTime(slot.startTime)}
                  </p>
                )}
                {appointmentId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ref: {appointmentId.slice(0, 8)}
                  </p>
                )}
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-200">
                Please arrive 15 minutes early. Bring a valid ID and any relevant medical records.
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full bg-gabay-orange hover:bg-gabay-orange-700">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Booking form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Complete the details below to book your appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {/* Appointment summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="font-medium">{doctorName || 'Doctor'}</p>
              <p className="text-muted-foreground">{facilityName}</p>
              {slot && (
                <p className="text-gabay-orange-600 mt-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formatSlotDateTime(slot.startTime)}
                </p>
              )}
            </div>

            {/* Patient name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Patient Name *
              </label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                required
                disabled={bookingState === 'loading'}
              />
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number (optional)
              </label>
              <Input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="e.g., 09XX XXX XXXX"
                disabled={bookingState === 'loading'}
              />
            </div>

            {/* Notes (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes (optional)
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information"
                disabled={bookingState === 'loading'}
              />
            </div>

            {/* Error message */}
            {bookingState === 'error' && errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bookingState === 'loading'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gabay-orange hover:bg-gabay-orange-700"
              disabled={bookingState === 'loading' || !patientName.trim()}
            >
              {bookingState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
