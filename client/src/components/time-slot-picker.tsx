import { useState } from "react";
import { TimeSlot } from "@/types";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  availableSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export function TimeSlotPicker({
  availableSlots,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  // Filter out only available slots
  const slots = availableSlots.filter((slot) => slot.isAvailable);

  if (slots.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-neutral-600">
          No available time slots for the selected date.
        </p>
        <p className="text-sm text-neutral-600 mt-1">
          Please select a different date.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-1 grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot.time}
          type="button"
          variant={selectedTime === slot.time ? "default" : "outline"}
          className={`p-2 text-xs font-medium ${
            selectedTime === slot.time
              ? "bg-primary-500 text-white"
              : "hover:bg-primary-50"
          }`}
          onClick={() => onSelectTime(slot.time)}
        >
          {slot.time}
        </Button>
      ))}
    </div>
  );
}
