from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User, Appointment, Availability
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)
from datetime import datetime

bp = Blueprint('api', __name__)

# Create a separate blueprint for availability routes
availability_routes = Blueprint('availability', __name__)
bp.register_blueprint(availability_routes)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    # Check required fields
    if not all(k in data for k in ('username', 'email', 'password', 'role', 'fullName')):
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
        full_name=data['fullName'],
        specialization=data.get('specialization', ''),
        license_number=data.get('licenseNumber', ''),
        phone=data.get('phone', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Set session cookie
    session['user_id'] = user.id
    
    # Create response with user data and tokens
    user_data = user.to_dict()
    response_data = {
        **user_data,
        'access_token': access_token,
        'refresh_token': refresh_token
    }
    
    # Set JWT cookies
    resp = jsonify(response_data)
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    
    return resp, 201

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
    
    # Set session cookie
    session['user_id'] = user.id
    
    # Create response with user data and tokens
    user_data = user.to_dict()
    response_data = {
        **user_data,
        'access_token': access_token,
        'refresh_token': refresh_token
    }
    
    # Set JWT cookies
    resp = jsonify(response_data)
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    
    return resp, 200

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
    # Clear session
    session.clear()
    
    # Clear JWT cookies
    resp = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(resp)
    
    return resp, 200

@bp.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200

@availability_routes.route('/doctors/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    availabilities = Availability.query.filter_by(doctor_id=doctor_id).all()
    return jsonify([a.to_dict() for a in availabilities]), 200

@availability_routes.route('/doctors/<int:doctor_id>/availability', methods=['POST'])
def add_doctor_availability(doctor_id):
    # Get user from session instead of JWT
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
        
    user = User.query.get(user_id)
    
    if not user or user.role != 'doctor' or user.id != doctor_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json() or {}
    
    if not all(k in data for k in ('dayOfWeek', 'startTime', 'endTime', 'isAvailable')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # If date is provided, we're dealing with a specific date availability
    specific_date = None
    if 'date' in data and data['date']:
        try:
            specific_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Check if availability already exists for this specific date
        existing = Availability.query.filter_by(
            doctor_id=doctor_id, 
            date=specific_date
        ).first()
    else:
        # Check if availability already exists for this day of week
        existing = Availability.query.filter_by(
            doctor_id=doctor_id, 
            day_of_week=data['dayOfWeek'],
            date=None  # No specific date
        ).first()
    
    if existing:
        # Update existing availability
        existing.start_time = data['startTime']
        existing.end_time = data['endTime']
        existing.is_available = data['isAvailable']
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    else:
        # Create new availability
        availability = Availability(
            doctor_id=doctor_id,
            day_of_week=data['dayOfWeek'],
            date=specific_date,
            start_time=data['startTime'],
            end_time=data['endTime'],
            is_available=data['isAvailable']
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
    
    if not all(k in data for k in ('doctorId', 'date', 'type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate doctor exists
    doctor = User.query.get(data['doctorId'])
    if not doctor or doctor.role != 'doctor':
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Convert date string to datetime object
    try:
        appointment_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format'}), 400
    
    # Create new appointment
    appointment = Appointment(
        doctor_id=data['doctorId'],
        patient_id=patient.id,
        date=appointment_date,
        duration=data.get('duration', 30),
        type=data['type'],
        status='scheduled',
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
        data['patientName'] = patient.full_name if patient else "Unknown"
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
        data['doctorName'] = doctor.full_name if doctor else "Unknown"
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
                appointment.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use ISO format'}), 400
        
        if 'duration' in data:
            appointment.duration = data['duration']
        
        if 'type' in data:
            appointment.type = data['type']
    
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 200