import { users, appointments, availability, type User, type InsertUser, type Appointment, type InsertAppointment, type Availability, type InsertAvailability } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  getDoctors(): Promise<User[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  getAvailabilityByDoctor(doctorId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined>;
  sessionStore: any; // Use any for SessionStore type to avoid compatibility issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private availabilities: Map<number, Availability>;
  sessionStore: any; // Using any to avoid SessionStore compatibility issues
  currentUserId: number;
  currentAppointmentId: number;
  currentAvailabilityId: number;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.availabilities = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    this.currentUserId = 3; // Starting from 3 because we'll add 2 initial users
    this.currentAppointmentId = 1;
    this.currentAvailabilityId = 1;
    
    // Add some initial users for development/testing
    this.initializeUsers();
  }
  
  // Initialize some sample users
  private initializeUsers() {
    // Sample doctor
    const doctor: User = {
      id: 1,
      username: "doctor",
      password: "5dca0c112db692fbe981d74d8077cf0c51d0524a7cb347ed1e3b0ee68c8bf020.c6c70d41167847d3da30ff980e1b9057", // password: "doctor123"
      email: "doctor@example.com",
      fullName: "Dr. John Smith",
      role: "doctor",
      phone: "+1 (555) 123-4567",
      specialization: "Cardiology",
      licenseNumber: "MED123456",
      createdAt: new Date()
    };
    
    // Sample patient
    const patient: User = {
      id: 2,
      username: "patient",
      password: "1a191a3dc417bcae58f1eb8bad9ec5ed4886aae92b344c00dcf27ad09f6a5a84.96f1cd880a8451771acb01a9bd001f6b", // password: "patient123" 
      email: "patient@example.com",
      fullName: "Jane Doe",
      role: "patient",
      phone: "+1 (555) 987-6543",
      specialization: null,
      licenseNumber: null,
      createdAt: new Date()
    };
    
    this.users.set(doctor.id, doctor);
    this.users.set(patient.id, patient);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Create user with proper types for nullable fields
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName,
      role: insertUser.role,
      specialization: insertUser.specialization || null,
      licenseNumber: insertUser.licenseNumber || null,
      phone: insertUser.phone || null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async getDoctors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === 'doctor',
    );
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId,
    );
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId,
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const now = new Date();
    
    // Create appointment with proper types for all fields
    const appointment: Appointment = { 
      id,
      patientId: insertAppointment.patientId, 
      doctorId: insertAppointment.doctorId,
      date: insertAppointment.date,
      duration: insertAppointment.duration || 30, // Default 30 minutes
      type: insertAppointment.type,
      status: insertAppointment.status || "scheduled", // Default status
      notes: insertAppointment.notes || null,
      createdAt: now,
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getAvailabilityByDoctor(doctorId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(
      (availability) => availability.doctorId === doctorId,
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    
    // Create availability with proper types for all fields
    const availability: Availability = { 
      id,
      doctorId: insertAvailability.doctorId,
      dayOfWeek: insertAvailability.dayOfWeek,
      startTime: insertAvailability.startTime,
      endTime: insertAvailability.endTime,
      isAvailable: insertAvailability.isAvailable !== undefined ? insertAvailability.isAvailable : true
    };
    
    this.availabilities.set(id, availability);
    return availability;
  }

  async updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined> {
    const availability = this.availabilities.get(id);
    if (!availability) return undefined;
    
    const updatedAvailability = { ...availability, ...data };
    this.availabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }
}

export const storage = new MemStorage();
