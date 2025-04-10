#!/bin/bash

# Create migrations directory if it doesn't exist
mkdir -p migrations

# Run SQL commands directly against the database
psql $DATABASE_URL << EOF
-- Drop tables if they exist
DROP TABLE IF EXISTS "availability";
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS "user_role";

-- Create enum type
CREATE TYPE "user_role" AS ENUM ('doctor', 'patient');

-- Create users table
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "full_name" TEXT NOT NULL,
  "role" user_role NOT NULL,
  "specialization" TEXT,
  "license_number" TEXT,
  "phone" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE "appointments" (
  "id" SERIAL PRIMARY KEY,
  "patient_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "date" TIMESTAMP NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 30,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create availability table
CREATE TABLE "availability" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "day_of_week" INTEGER NOT NULL,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insert default users
INSERT INTO "users" ("username", "password", "email", "full_name", "role", "specialization", "license_number", "phone")
VALUES 
  ('doctor', '$2b$10$jYJvx8aQfKJH0fBGxw.YiOJcXYwVLjr.L6hOGkLFXH3dMIZRCxfEK', 'doctor@example.com', 'Dr. John Smith', 'doctor', 'Cardiology', 'MED12345', '555-123-4567'),
  ('patient', '$2b$10$jYJvx8aQfKJH0fBGxw.YiOJcXYwVLjr.L6hOGkLFXH3dMIZRCxfEK', 'patient@example.com', 'Jane Doe', 'patient', NULL, NULL, '555-987-6543');

-- Insert some example availability for the doctor
INSERT INTO "availability" ("doctor_id", "day_of_week", "start_time", "end_time")
VALUES 
  (1, 1, '09:00', '12:00'),
  (1, 1, '14:00', '17:00'),
  (1, 3, '10:00', '15:00'),
  (1, 5, '09:00', '13:00');

EOF

echo "Database setup complete!"