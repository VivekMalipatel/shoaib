// Common types for the MediConnect application
// These replace the types previously defined in @shared/schema

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'doctor' | 'patient';
  specialization?: string;
  licenseNumber?: string;
  phone?: string;
  createdAt?: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  type: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  patientName?: string;
  doctorName?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  appointmentId?: number;
}

export interface Availability {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Form validation schemas
import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['doctor', 'patient']),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.string().min(1, 'Appointment type is required'),
  notes: z.string().optional(),
});

export const availabilitySchema = z.object({
  doctorId: z.number(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().default(true),
});

export type UserType = z.infer<typeof userSchema>;
export type LoginType = z.infer<typeof loginSchema>;
export type AppointmentType = z.infer<typeof appointmentSchema>;
export type AvailabilityType = z.infer<typeof availabilitySchema>;