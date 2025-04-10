const { pool } = require('./server/db');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function seedDatabase() {
  try {
    console.log('Seeding database with test users...');
    
    // Create doctor user
    const doctorPass = await hashPassword('doctor123');
    const doctorResult = await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, specialization, license_number, phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['doctor', doctorPass, 'doctor@example.com', 'Dr. John Smith', 'doctor', 'Cardiology', 'MED12345', '555-123-4567', new Date()]
    );
    const doctorId = doctorResult.rows[0].id;
    
    // Create patient user
    const patientPass = await hashPassword('patient123');
    const patientResult = await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['patient', patientPass, 'patient@example.com', 'Jane Doe', 'patient', '555-987-6543', new Date()]
    );
    const patientId = patientResult.rows[0].id;
    
    // Add availability for doctor
    const days = [1, 3, 5]; // Monday, Wednesday, Friday
    for (const day of days) {
      await pool.query(
        `INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3, $4, $5)`,
        [doctorId, day, '09:00', '17:00', true]
      );
    }
    
    // Add a sample appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, duration, type, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [patientId, doctorId, tomorrow, 30, 'Consultation', 'scheduled', 'Initial consultation', new Date()]
    );
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
