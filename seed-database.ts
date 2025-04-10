import { storage } from './server/storage';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from './server/db';
import { users, appointments, availability } from './shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function clearDatabase() {
  console.log("Clearing existing data...");
  
  try {
    // Delete data in reverse order of dependencies
    await db.delete(appointments);
    await db.delete(availability);
    await db.delete(users);
    
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

async function createUsers() {
  console.log("Creating sample users...");
  
  // Sample doctors
  const doctors = [
    {
      username: "doctor",
      password: await hashPassword("doctor123"),
      email: "doctor@example.com",
      fullName: "Dr. John Smith",
      role: "doctor" as const,
      specialization: "Cardiology",
      licenseNumber: "MED123456",
      phone: "+1 (555) 123-4567"
    },
    {
      username: "drwilliams",
      password: await hashPassword("williams123"),
      email: "williams@example.com",
      fullName: "Dr. Sarah Williams",
      role: "doctor" as const,
      specialization: "Neurology",
      licenseNumber: "MED789012",
      phone: "+1 (555) 234-5678"
    },
    {
      username: "drlee",
      password: await hashPassword("lee123"),
      email: "lee@example.com",
      fullName: "Dr. David Lee",
      role: "doctor" as const,
      specialization: "Pediatrics",
      licenseNumber: "MED345678",
      phone: "+1 (555) 345-6789"
    }
  ];

  // Sample patients
  const patients = [
    {
      username: "patient",
      password: await hashPassword("patient123"),
      email: "patient@example.com",
      fullName: "Jane Doe",
      role: "patient" as const,
      phone: "+1 (555) 987-6543"
    },
    {
      username: "michaelj",
      password: await hashPassword("michael123"),
      email: "michael@example.com",
      fullName: "Michael Johnson",
      role: "patient" as const,
      phone: "+1 (555) 876-5432"
    },
    {
      username: "emilyr",
      password: await hashPassword("emily123"),
      email: "emily@example.com",
      fullName: "Emily Rodriguez",
      role: "patient" as const,
      phone: "+1 (555) 765-4321"
    }
  ];

  const createdDoctors = [];
  const createdPatients = [];

  // Insert doctors
  for (const doctor of doctors) {
    try {
      const createdDoctor = await storage.createUser(doctor);
      createdDoctors.push(createdDoctor);
      console.log(`Created doctor: ${doctor.fullName}`);
    } catch (error) {
      console.error(`Error creating doctor ${doctor.fullName}:`, error);
    }
  }

  // Insert patients
  for (const patient of patients) {
    try {
      const createdPatient = await storage.createUser(patient);
      createdPatients.push(createdPatient);
      console.log(`Created patient: ${patient.fullName}`);
    } catch (error) {
      console.error(`Error creating patient ${patient.fullName}:`, error);
    }
  }

  return { doctors: createdDoctors, patients: createdPatients };
}

async function createAvailabilities(doctors: any[]) {
  console.log("Creating doctor availabilities...");
  
  for (const doctor of doctors) {
    // Create availability for each day of the week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // Morning slot
      await storage.createAvailability({
        doctorId: doctor.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "12:00",
        isAvailable: true
      });
      
      // Afternoon slot
      await storage.createAvailability({
        doctorId: doctor.id,
        dayOfWeek,
        startTime: "13:00",
        endTime: "17:00",
        isAvailable: true
      });
    }
    console.log(`Created availability slots for doctor: ${doctor.fullName}`);
  }
}

async function createAppointments(doctors: any[], patients: any[]) {
  console.log("Creating sample appointments...");
  
  // Get the current date and create appointments in the future
  const currentDate = new Date();
  
  // Create some appointments for each patient with different doctors
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    
    for (let j = 0; j < doctors.length; j++) {
      const doctor = doctors[j];
      const appointmentDate = new Date(currentDate);
      
      // Add different days for different appointments
      appointmentDate.setDate(currentDate.getDate() + i + j + 1);
      
      // Set the appointment time
      appointmentDate.setHours(10 + j, 0, 0, 0);
      
      const appointment = {
        patientId: patient.id,
        doctorId: doctor.id,
        date: appointmentDate,
        duration: 30,
        type: `Regular checkup`,
        status: "scheduled",
        notes: `Appointment with ${doctor.fullName} for ${patient.fullName}`
      };
      
      try {
        const createdAppointment = await storage.createAppointment(appointment);
        console.log(`Created appointment for ${patient.fullName} with ${doctor.fullName} on ${appointmentDate.toLocaleDateString()}`);
      } catch (error) {
        console.error(`Error creating appointment:`, error);
      }
    }
  }
}

async function seedDatabase() {
  try {
    // Check if we already have data
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      const proceed = process.argv.includes('--force');
      
      if (!proceed) {
        console.log("Database already contains data. Use --force to override existing data.");
        return;
      }
      
      // Clear existing data if forced
      await clearDatabase();
    }
    
    // Create sample data
    const { doctors, patients } = await createUsers();
    await createAvailabilities(doctors);
    await createAppointments(doctors, patients);
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();