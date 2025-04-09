from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Appointment, Availability
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime

bp = Blueprint('api', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    # Check required fields
    if not all(k in data for k in ('username', 'email', 'password', 'role')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    if not all(k in data for k in ('username', 'password')):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user is None or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    
    return jsonify({
        'access_token': access_token
    }), 200

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@bp.route('/logout', methods=['POST'])
def logout():
    # JWT is stateless so there's no server-side logout
    # The frontend should remove the tokens
    return jsonify({'message': 'Logout successful'}), 200

@bp.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200

@bp.route('/doctors/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    availabilities = Availability.query.filter_by(doctor_id=doctor_id).all()
    return jsonify([a.to_dict() for a in availabilities]), 200

@bp.route('/doctors/<int:doctor_id>/availability', methods=['POST'])
@jwt_required()
def add_doctor_availability(doctor_id):
    # Verify the doctor is adding their own availability
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    
    if not user or user.role != 'doctor' or user.id != doctor_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json() or {}
    
    if not all(k in data for k in ('date', 'time_slots')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Convert date string to date object
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Check if availability already exists for this date
    existing = Availability.query.filter_by(doctor_id=doctor_id, date=date).first()
    
    if existing:
        # Update existing availability
        existing.time_slots = data['time_slots']
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    else:
        # Create new availability
        availability = Availability(
            doctor_id=doctor_id,
            date=date,
            time_slots=data['time_slots']
        )
        db.session.add(availability)
        db.session.commit()
        return jsonify(availability.to_dict()), 201

@bp.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    identity = get_jwt_identity()
    patient = User.query.get(int(identity))
    
    if not patient:
        return jsonify({'error': 'User not found'}), 404
    
    if patient.role != 'patient':
        return jsonify({'error': 'Only patients can book appointments'}), 403
    
    data = request.get_json() or {}
    
    if not all(k in data for k in ('doctor_id', 'date', 'time', 'appointment_type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate doctor exists
    doctor = User.query.get(data['doctor_id'])
    if not doctor or doctor.role != 'doctor':
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Convert date string to date object
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Check if the time slot is available for this doctor
    availability = Availability.query.filter_by(doctor_id=data['doctor_id'], date=date).first()
    
    if not availability or data['time'] not in availability.time_slots:
        return jsonify({'error': 'Selected time slot is not available'}), 400
    
    # Check if the time slot is already booked
    existing_appointment = Appointment.query.filter_by(
        doctor_id=data['doctor_id'],
        date=date,
        time=data['time'],
        status='scheduled'
    ).first()
    
    if existing_appointment:
        return jsonify({'error': 'This time slot is already booked'}), 400
    
    # Create new appointment
    appointment = Appointment(
        doctor_id=data['doctor_id'],
        patient_id=patient.id,
        date=date,
        time=data['time'],
        appointment_type=data['appointment_type'],
        notes=data.get('notes', '')
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 201

@bp.route('/appointments/doctor', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    identity = get_jwt_identity()
    doctor = User.query.get(int(identity))
    
    if not doctor or doctor.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    appointments = Appointment.query.filter_by(doctor_id=doctor.id).all()
    
    # Include patient name in response
    results = []
    for appointment in appointments:
        data = appointment.to_dict()
        patient = User.query.get(appointment.patient_id)
        data['patient_name'] = f"{patient.first_name} {patient.last_name}" if patient else "Unknown"
        results.append(data)
    
    return jsonify(results), 200

@bp.route('/appointments/patient', methods=['GET'])
@jwt_required()
def get_patient_appointments():
    identity = get_jwt_identity()
    patient = User.query.get(int(identity))
    
    if not patient or patient.role != 'patient':
        return jsonify({'error': 'Unauthorized'}), 403
    
    appointments = Appointment.query.filter_by(patient_id=patient.id).all()
    
    # Include doctor name in response
    results = []
    for appointment in appointments:
        data = appointment.to_dict()
        doctor = User.query.get(appointment.doctor_id)
        data['doctor_name'] = f"{doctor.first_name} {doctor.last_name}" if doctor else "Unknown"
        results.append(data)
    
    return jsonify(results), 200

@bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Check permissions - only the doctor or patient involved can update
    if user.id != appointment.doctor_id and user.id != appointment.patient_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json() or {}
    
    # Update fields
    if 'status' in data:
        appointment.status = data['status']
    
    if 'notes' in data:
        appointment.notes = data['notes']
    
    # Only allow rescheduling if status is still "scheduled"
    if appointment.status == 'scheduled':
        if 'date' in data:
            try:
                appointment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if 'time' in data:
            appointment.time = data['time']
        
        if 'appointment_type' in data:
            appointment.appointment_type = data['appointment_type']
    
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 200