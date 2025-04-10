#!/bin/bash

echo "Creating database schema..."

# Run SQL commands directly
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE << 'EOF'
-- Create enum type
DO $$ 
BEGIN 
  CREATE TYPE user_role AS ENUM ('doctor', 'patient'); 
EXCEPTION 
  WHEN duplicate_object THEN NULL; 
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id),
  doctor_id INTEGER NOT NULL REFERENCES users(id),
  date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES users(id),
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insert test users (with pre-hashed passwords)
INSERT INTO users (username, password, email, full_name, role, specialization, license_number, phone, created_at)
VALUES 
  ('doctor', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec.salt', 'doctor@example.com', 'Dr. John Smith', 'doctor', 'Cardiology', 'MED12345', '555-123-4567', NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, email, full_name, role, phone, created_at)
VALUES 
  ('patient', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec.salt', 'patient@example.com', 'Jane Doe', 'patient', '555-987-6543', NOW())
ON CONFLICT (username) DO NOTHING;

-- Add availability for doctor
DO $$ 
DECLARE 
  doctor_id INTEGER; 
  patient_id INTEGER;
  tomorrow TIMESTAMP;
BEGIN 
  SELECT id INTO doctor_id FROM users WHERE username = 'doctor'; 
  SELECT id INTO patient_id FROM users WHERE username = 'patient';
  
  INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available)
  VALUES 
    (doctor_id, 1, '09:00', '12:00', TRUE),
    (doctor_id, 1, '14:00', '17:00', TRUE),
    (doctor_id, 3, '10:00', '15:00', TRUE),
    (doctor_id, 5, '09:00', '13:00', TRUE)
  ON CONFLICT DO NOTHING;
  
  tomorrow := NOW() + INTERVAL '1 day';
  tomorrow := date_trunc('day', tomorrow) + INTERVAL '10 hour';
  
  INSERT INTO appointments (patient_id, doctor_id, date, duration, type, status, notes, created_at)
  VALUES 
    (patient_id, doctor_id, tomorrow, 30, 'Consultation', 'scheduled', 'Initial consultation', NOW())
  ON CONFLICT DO NOTHING;
END $$;
EOF

echo "Database setup complete!"