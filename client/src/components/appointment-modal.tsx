import { useState, useEffect } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentType, TimeSlot } from "@/types";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TimeSlotPicker } from "./time-slot-picker";

// Form schema
const appointmentFormSchema = z.object({
  type: z.string({ required_error: "Please select an appointment type" }),
  date: z.string({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AppointmentFormValues) => void;
  doctorId?: number;
  doctorName?: string;
  availableSlots: TimeSlot[];
}

export function AppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  doctorId,
  doctorName,
  availableSlots,
}: AppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      type: AppointmentType.REGULAR_CHECKUP,
      date: selectedDate,
      time: "",
      notes: "",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: AppointmentType.REGULAR_CHECKUP,
        date: selectedDate,
        time: "",
        notes: "",
      });
    }
  }, [isOpen, form, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    form.setValue("date", e.target.value);
    form.setValue("time", ""); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    form.setValue("time", time);
  };

  const onSubmit = (data: AppointmentFormValues) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
              <Calendar className="h-6 w-6 text-primary-500" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle className="text-lg leading-6 font-medium text-neutral-800">
                Book an Appointment
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-neutral-600">
                {doctorName
                  ? `Please select your preferred date and time to book your appointment with Dr. ${doctorName}.`
                  : "Please select your preferred date and time to book your appointment."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AppointmentType.REGULAR_CHECKUP}>
                        Regular Checkup
                      </SelectItem>
                      <SelectItem value={AppointmentType.FOLLOW_UP}>
                        Follow-up Visit
                      </SelectItem>
                      <SelectItem value={AppointmentType.CONSULTATION}>
                        New Consultation
                      </SelectItem>
                      <SelectItem value={AppointmentType.URGENT_CARE}>
                        Urgent Care
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={handleDateChange}
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Time Slots</FormLabel>
                  <TimeSlotPicker
                    availableSlots={availableSlots}
                    selectedTime={field.value}
                    onSelectTime={handleTimeSelect}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your symptoms or reason for the visit..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
