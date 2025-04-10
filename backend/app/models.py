from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)  # Changed from password_hash to match schema
    full_name = db.Column(db.String(128), nullable=False)  # Changed to match schema
    role = db.Column(db.String(20), default='patient', nullable=False)  # 'doctor' or 'patient'
    specialization = db.Column(db.String(128))  # Added to match schema
    license_number = db.Column(db.String(128))  # Added to match schema
    phone = db.Column(db.String(20))  # Added to match schema
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationships
    doctor_appointments = db.relationship('Appointment', foreign_keys='Appointment.doctor_id', backref='doctor', lazy='dynamic')
    patient_appointments = db.relationship('Appointment', foreign_keys='Appointment.patient_id', backref='patient', lazy='dynamic')
    availabilities = db.relationship('Availability', backref='doctor', lazy='dynamic')
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'fullName': self.full_name,
            'role': self.role,
            'specialization': self.specialization,
            'licenseNumber': self.license_number,
            'phone': self.phone
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)  # Changed from Date to DateTime
    duration = db.Column(db.Integer, default=30, nullable=False)  # Added to match schema
    type = db.Column(db.String(50), nullable=False)  # Changed from appointment_type to match schema
    status = db.Column(db.String(20), default='scheduled')  # 'scheduled', 'completed', 'cancelled'
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patientId': self.patient_id,
            'doctorId': self.doctor_id,
            'date': self.date.isoformat(),
            'duration': self.duration,
            'type': self.type,
            'status': self.status,
            'notes': self.notes
        }

class Availability(db.Model):
    __tablename__ = 'availability'  # Changed to match schema
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # Changed from date to match schema
    start_time = db.Column(db.String(10), nullable=False)  # Changed from time_slots to match schema
    end_time = db.Column(db.String(10), nullable=False)  # Added to match schema
    is_available = db.Column(db.Boolean, default=True, nullable=False)  # Added to match schema
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctorId': self.doctor_id,
            'dayOfWeek': self.day_of_week,
            'startTime': self.start_time,
            'endTime': self.end_time,
            'isAvailable': self.is_available
        }