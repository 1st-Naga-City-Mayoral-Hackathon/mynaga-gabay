'use client';

import { useState } from 'react';
import type { ScheduleCard, ScheduleSlot } from '@mynaga/shared';
import { Calendar, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingModal } from '../BookingModal';

interface ScheduleCardUIProps {
  card: ScheduleCard;
  onSelectSlot?: (slot: ScheduleSlot) => void;
  onBookingComplete?: (appointmentId: string) => void;
}

function formatSlotTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatSlotDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupSlotsByDate(
  slots: ScheduleSlot[]
): Record<string, ScheduleSlot[]> {
  const groups: Record<string, ScheduleSlot[]> = {};

  for (const slot of slots) {
    const dateKey = formatSlotDate(slot.startTime);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(slot);
  }

  return groups;
}

export function ScheduleCardUI({ card, onSelectSlot, onBookingComplete }: ScheduleCardUIProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableSlots = card.slots.filter((s) => s.available);
  const slotsByDate = groupSlotsByDate(availableSlots);
  const dateKeys = Object.keys(slotsByDate);

  // Show only first 2 dates by default
  const visibleDates = expanded ? dateKeys : dateKeys.slice(0, 2);

  const handleSlotClick = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
    onSelectSlot?.(slot);
  };

  const handleBookingComplete = (appointmentId: string) => {
    onBookingComplete?.(appointmentId);
    // Mark the slot as no longer available in UI
    setSelectedSlot(null);
  };

  return (
    <div className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm my-3">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-gabay-orange-500" />
        <h4 className="font-semibold text-sm">Available Appointments</h4>
      </div>

      {card.doctorName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="w-4 h-4" />
          <span>
            {card.doctorName}
            {card.facilityName && ` at ${card.facilityName}`}
          </span>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">{card.humanSummary}</p>

      {availableSlots.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground py-4">
          No available slots at this time. Please check back later.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleDates.map((dateKey) => (
            <div key={dateKey}>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {dateKey}
              </p>
              <div className="flex flex-wrap gap-2">
                {slotsByDate[dateKey].map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => handleSlotClick(slot)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedSlot?.slotId === slot.slotId
                        ? 'bg-gabay-orange-500 text-white border-gabay-orange-500'
                        : 'bg-white dark:bg-gray-700 hover:border-gabay-orange-300 hover:bg-gabay-orange-50 dark:hover:bg-gabay-orange-900/20'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatSlotTime(slot.startTime)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {dateKeys.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gabay-orange-600"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show More Dates ({dateKeys.length - 2} more)
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        slot={selectedSlot}
        doctorId={card.doctorId || ''}
        doctorName={card.doctorName}
        facilityId={card.facilityId || ''}
        facilityName={card.facilityName}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}
