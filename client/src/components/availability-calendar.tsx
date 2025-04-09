import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayAvailability, TimeSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AvailabilityCalendarProps {
  availability: DayAvailability[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onSaveAvailability: (date: Date, slots: TimeSlot[]) => void;
}

export function AvailabilityCalendar({ 
  availability, 
  selectedDate, 
  onDateSelect, 
  onSaveAvailability 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Get availability for a specific date
  const getDayAvailability = (date: Date) => {
    return availability.find(
      (day) => day.date.toDateString() === date.toDateString()
    );
  };

  // Handle date click
  const handleDateClick = (day: Date) => {
    onDateSelect(day);
    
    // Get availability for the selected day
    const dayAvailability = getDayAvailability(day);
    if (dayAvailability) {
      setSelectedTimeSlots(dayAvailability.slots);
    } else {
      // Initialize with empty slots
      setSelectedTimeSlots([]);
    }
  };

  // Handle time slot toggle
  const toggleTimeSlot = (time: string) => {
    setSelectedTimeSlots((prev) => {
      const slotIndex = prev.findIndex((slot) => slot.time === time);
      if (slotIndex >= 0) {
        const updatedSlots = [...prev];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          isAvailable: !updatedSlots[slotIndex].isAvailable,
        };
        return updatedSlots;
      } else {
        return [...prev, { time, isAvailable: true }];
      }
    });
  };

  // Handle save
  const handleSave = () => {
    if (selectedDate) {
      onSaveAvailability(selectedDate, selectedTimeSlots);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h4 className="text-lg font-medium text-neutral-800">
            {format(currentMonth, "MMMM yyyy")}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          <div className="text-xs font-medium text-neutral-600">Sun</div>
          <div className="text-xs font-medium text-neutral-600">Mon</div>
          <div className="text-xs font-medium text-neutral-600">Tue</div>
          <div className="text-xs font-medium text-neutral-600">Wed</div>
          <div className="text-xs font-medium text-neutral-600">Thu</div>
          <div className="text-xs font-medium text-neutral-600">Fri</div>
          <div className="text-xs font-medium text-neutral-600">Sat</div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-12 flex justify-center items-center text-neutral-400"></div>
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
            const dayAvailability = getDayAvailability(day);
            
            // Check if the day has any available slots
            const hasAvailableSlots = dayAvailability?.slots.some((slot) => slot.isAvailable);
            
            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? "default" : "outline"}
                className={`h-12 ${
                  !isSameMonth(day, currentMonth) ? "text-neutral-400" : ""
                } ${isCurrentDay ? "bg-primary-50 border-primary-500" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, "d")}
              </Button>
            );
          })}
        </div>

        {/* Time Slots for Selected Day */}
        {selectedDate && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-neutral-800 mb-4">
              Available Time Slots for {format(selectedDate, "MMMM d, yyyy")}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Generate time slots from 9 AM to 5 PM */}
              {[
                "9:00 AM", "9:30 AM", 
                "10:00 AM", "10:30 AM", 
                "11:00 AM", "11:30 AM",
                "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", 
                "2:00 PM", "2:30 PM", 
                "3:00 PM", "3:30 PM",
                "4:00 PM", "4:30 PM",
              ].map((time) => {
                const slot = selectedTimeSlots.find((s) => s.time === time);
                const isAvailable = slot ? slot.isAvailable : false;
                const isBooked = slot && !slot.isAvailable && slot.appointmentId;
                
                return (
                  <div
                    key={time}
                    className={`border rounded-md p-2 text-sm flex justify-between items-center ${
                      isAvailable
                        ? "bg-green-50 border-green-500"
                        : isBooked
                        ? "bg-red-50 border-red-500"
                        : "bg-gray-50 border-gray-300"
                    }`}
                    onClick={() => !isBooked && toggleTimeSlot(time)}
                  >
                    <span>{time}</span>
                    {isAvailable ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Available
                      </Badge>
                    ) : isBooked ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Booked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave}>
                Save Availability
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
