from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Appointment, Availability
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from datetime import datetime, date
import json

bp = Blueprint('main', __name__)

# Authentication routes
@bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'patient'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create access and refresh tokens with string ID
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        # Convert user.id to string to ensure compatibility with JWT
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
    
    return jsonify({'message': 'Invalid username or password'}), 401

@bp.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({'access_token': access_token}), 200

@bp.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
    # Convert string ID back to integer for database query
    user_id = int(current_user_id)
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@bp.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT tokens are stateless, so we can't invalidate them.
    # In a production app, you would use a token blacklist.
    return jsonify({'message': 'Successfully logged out'}), 200

# Doctor routes
@bp.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200

@bp.route('/api/doctors/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    availabilities = Availability.query.filter_by(doctor_id=doctor_id).all()
    return jsonify([availability.to_dict() for availability in availabilities]), 200

@bp.route('/api/doctors/<int:doctor_id>/availability', methods=['POST'])
@jwt_required()
def add_doctor_availability(doctor_id):
    current_user_id = get_jwt_identity()
    user_id = int(current_user_id)
    
    # Ensure the user is the doctor or an admin
    if user_id != doctor_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Check if availability already exists for this date
    existing = Availability.query.filter_by(
        doctor_id=doctor_id, 
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    ).first()
    
    if existing:
        # Update existing availability
        existing.time_slots = data['time_slots']
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    
    # Create new availability
    availability = Availability(
        doctor_id=doctor_id,
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time_slots=data['time_slots']
    )
    
    db.session.add(availability)
    db.session.commit()
    
    return jsonify(availability.to_dict()), 201

# Appointment routes
@bp.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()
    user_id = int(current_user_id)
    data = request.get_json()
    
    # Create new appointment
    appointment = Appointment(
        doctor_id=data['doctor_id'],
        patient_id=user_id,  # Patient creates the appointment
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time=data['time'],
        status='scheduled',
        appointment_type=data.get('appointment_type', 'Regular Checkup'),
        notes=data.get('notes', '')
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 201

@bp.route('/api/appointments/doctor', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    current_user_id = get_jwt_identity()
    user_id = int(current_user_id)
    
    # Ensure the user is a doctor
    user = User.query.get(user_id)
    if user.role != 'doctor':
        return jsonify({'message': 'Unauthorized'}), 403
    
    appointments = Appointment.query.filter_by(doctor_id=user_id).all()
    
    # Include patient details in the response
    result = []
    for appointment in appointments:
        app_dict = appointment.to_dict()
        patient = User.query.get(appointment.patient_id)
        app_dict['patient_name'] = f"{patient.first_name} {patient.last_name}"
        result.append(app_dict)
    
    return jsonify(result), 200

@bp.route('/api/appointments/patient', methods=['GET'])
@jwt_required()
def get_patient_appointments():
    current_user_id = get_jwt_identity()
    user_id = int(current_user_id)
    
    appointments = Appointment.query.filter_by(patient_id=user_id).all()
    
    # Include doctor details in the response
    result = []
    for appointment in appointments:
        app_dict = appointment.to_dict()
        doctor = User.query.get(appointment.doctor_id)
        app_dict['doctor_name'] = f"{doctor.first_name} {doctor.last_name}"
        result.append(app_dict)
    
    return jsonify(result), 200

@bp.route('/api/appointments/<int:appointment_id>', methods=['PATCH'])
@jwt_required()
def update_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    user_id = int(current_user_id)
    data = request.get_json()
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404
    
    # Check if the user is authorized to update this appointment
    if appointment.doctor_id != user_id and appointment.patient_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Update fields that were provided
    if 'status' in data:
        appointment.status = data['status']
    if 'date' in data:
        appointment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    if 'time' in data:
        appointment.time = data['time']
    if 'notes' in data:
        appointment.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 200

# Error handlers
@bp.app_errorhandler(404)
def not_found_error(error):
    return jsonify({'message': 'Not found'}), 404

@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'message': 'Internal server error'}), 500