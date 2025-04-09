import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertAppointmentSchema, insertAvailabilitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all doctors
  app.get("/api/doctors", async (req, res, next) => {
    try {
      const doctors = await storage.getDoctors();
      const sanitizedDoctors = doctors.map(({ password, ...doctor }) => doctor);
      res.json(sanitizedDoctors);
    } catch (err) {
      next(err);
    }
  });

  // Get appointments by doctor
  app.get("/api/doctors/:id/appointments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const doctorId = parseInt(req.params.id);
      
      // Check if the user is the doctor or an admin
      if (req.user.id !== doctorId && req.user.role !== "doctor") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  // Get appointments by patient
  app.get("/api/patients/:id/appointments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const patientId = parseInt(req.params.id);
      
      // Check if the user is the patient
      if (req.user.id !== patientId && req.user.role !== "doctor") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request data
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check if the user is the patient or a doctor
      if (req.user.role !== "patient" && req.user.role !== "doctor") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // If user is patient, ensure they're creating their own appointment
      if (req.user.role === "patient" && req.user.id !== validatedData.patientId) {
        return res.status(403).json({ message: "You can only book appointments for yourself" });
      }
      
      // Create the appointment
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const appointmentId = parseInt(req.params.id);
      
      // Get existing appointment
      const appointments = Array.from(await storage.getAppointmentsByDoctor(req.user.id))
        .concat(await storage.getAppointmentsByPatient(req.user.id));
      const appointment = appointments.find(a => a.id === appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Update the appointment
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (err) {
      next(err);
    }
  });

  // Get availability by doctor
  app.get("/api/doctors/:id/availability", async (req, res, next) => {
    try {
      const doctorId = parseInt(req.params.id);
      const availability = await storage.getAvailabilityByDoctor(doctorId);
      res.json(availability);
    } catch (err) {
      next(err);
    }
  });

  // Create availability
  app.post("/api/availability", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request data
      const validatedData = insertAvailabilitySchema.parse(req.body);
      
      // Check if the user is a doctor
      if (req.user.role !== "doctor") {
        return res.status(403).json({ message: "Only doctors can set availability" });
      }
      
      // Check if the doctor is setting their own availability
      if (req.user.id !== validatedData.doctorId) {
        return res.status(403).json({ message: "You can only set your own availability" });
      }
      
      // Create the availability
      const availability = await storage.createAvailability(validatedData);
      res.status(201).json(availability);
    } catch (err) {
      next(err);
    }
  });

  // Update availability
  app.patch("/api/availability/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const availabilityId = parseInt(req.params.id);
      
      // Check if the user is a doctor
      if (req.user.role !== "doctor") {
        return res.status(403).json({ message: "Only doctors can update availability" });
      }
      
      // Update the availability
      const updatedAvailability = await storage.updateAvailability(availabilityId, req.body);
      if (!updatedAvailability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      
      // Check if the doctor is updating their own availability
      if (req.user.id !== updatedAvailability.doctorId) {
        return res.status(403).json({ message: "You can only update your own availability" });
      }
      
      res.json(updatedAvailability);
    } catch (err) {
      next(err);
    }
  });

  // Special route for handling root requests
  app.get('/', (req, res, next) => {
    // Let the static file middleware handle it
    next();
  });
  
  // Direct routes to appropriate dashboards
  app.get('/doctor-dashboard', (req, res) => {
    res.redirect('/doctor-dashboard.html');
  });
  
  app.get('/patient-dashboard', (req, res) => {
    res.redirect('/patient-dashboard.html');
  });
  
  // Redirect auth route to HTML version
  app.get('/auth', (req, res) => {
    res.redirect('/auth.html');
  });

  const httpServer = createServer(app);

  return httpServer;
}
