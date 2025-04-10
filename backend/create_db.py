"""
Database initialization script for Flask application.
This script creates the database tables if they don't exist yet.
"""
from app import create_app, db
from app.models import User, Appointment, Availability
from werkzeug.security import generate_password_hash
import json
from datetime import datetime, timedelta

app = create_app()

def create_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created.")

        # Check if we need to seed the database
        user_count = User.query.count()
        if user_count == 0:
            seed_db()

def seed_db():
    """Seed the database with sample data"""
    with app.app_context():
        print("Seeding database with sample data...")
        
        # Create sample doctors
        doctors = [
            {
                "username": "doctor",
                "email": "doctor@example.com",
                "password": "doctor123",
                "role": "doctor",
                "first_name": "John",
                "last_name": "Smith"
            },
            {
                "username": "drwilliams",
                "email": "williams@example.com",
                "password": "williams123",
                "role": "doctor",
                "first_name": "Sarah",
                "last_name": "Williams"
            },
            {
                "username": "drlee",
                "email": "lee@example.com",
                "password": "lee123",
                "role": "doctor",
                "first_name": "David",
                "last_name": "Lee"
            }
        ]
        
        # Create sample patients
        patients = [
            {
                "username": "patient",
                "email": "patient@example.com",
                "password": "patient123",
                "role": "patient",
                "first_name": "Jane",
                "last_name": "Doe"
            },
            {
                "username": "michaelj",
                "email": "michael@example.com",
                "password": "michael123",
                "role": "patient",
                "first_name": "Michael",
                "last_name": "Johnson"
            },
            {
                "username": "emilyr",
                "email": "emily@example.com",
                "password": "emily123",
                "role": "patient",
                "first_name": "Emily",
                "last_name": "Rodriguez"
            }
        ]
        
        created_doctors = []
        created_patients = []
        
        # Add doctors to db
        for doctor_data in doctors:
            doctor = User(
                username=doctor_data["username"],
                email=doctor_data["email"],
                role=doctor_data["role"],
                first_name=doctor_data["first_name"],
                last_name=doctor_data["last_name"]
            )
            doctor.set_password(doctor_data["password"])
            db.session.add(doctor)
            created_doctors.append(doctor)
            print(f"Created doctor: {doctor.first_name} {doctor.last_name}")
        
        # Add patients to db
        for patient_data in patients:
            patient = User(
                username=patient_data["username"],
                email=patient_data["email"],
                role=patient_data["role"],
                first_name=patient_data["first_name"],
                last_name=patient_data["last_name"]
            )
            patient.set_password(patient_data["password"])
            db.session.add(patient)
            created_patients.append(patient)
            print(f"Created patient: {patient.first_name} {patient.last_name}")
        
        # Commit users to get their IDs
        db.session.commit()
        
        # Create availabilities for doctors
        # First, generate time slots
        time_slots = []
        start_time = datetime.strptime("09:00", "%H:%M")
        end_time = datetime.strptime("17:00", "%H:%M")
        slot_duration = timedelta(minutes=30)
        
        current_time = start_time
        while current_time < end_time:
            time_slots.append(current_time.strftime("%H:%M"))
            current_time += slot_duration
        
        # Create availability for next 7 days for each doctor
        for doctor in created_doctors:
            for day_offset in range(7):
                date = (datetime.now() + timedelta(days=day_offset)).date()
                
                availability = Availability(
                    doctor_id=doctor.id,
                    date=date,
                    time_slots=time_slots
                )
                db.session.add(availability)
                print(f"Created availability for {doctor.first_name} {doctor.last_name} on {date}")
        
        # Create sample appointments
        for i, patient in enumerate(created_patients):
            for j, doctor in enumerate(created_doctors):
                # Create appointment with different dates
                date = (datetime.now() + timedelta(days=i+j+1)).date()
                time = "10:00" if j == 0 else ("14:00" if j == 1 else "16:00") 
                
                appointment = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    date=date,
                    time=time,
                    status="scheduled",
                    appointment_type="Regular Checkup",
                    notes=f"Appointment with Dr. {doctor.last_name} for {patient.first_name} {patient.last_name}"
                )
                db.session.add(appointment)
                print(f"Created appointment for {patient.first_name} with Dr. {doctor.last_name} on {date}")
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    create_db()