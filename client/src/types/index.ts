import { User, Appointment, Availability } from "@shared/schema";

export interface AppointmentWithNames extends Appointment {
  doctorName?: string;
  patientName?: string;
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum AppointmentType {
  REGULAR_CHECKUP = "regular-checkup",
  FOLLOW_UP = "follow-up",
  CONSULTATION = "consultation",
  URGENT_CARE = "urgent-care"
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  appointmentId?: number;
}

export interface DayAvailability {
  date: Date;
  dayOfWeek: number;
  slots: TimeSlot[];
}

export interface DoctorWithAvailability extends User {
  availability?: Availability[];
}
