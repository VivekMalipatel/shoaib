# Medical Appointment Backend API

A Flask-based backend API for a medical appointment management system.

## Features

- User authentication with JWT
- Role-based access control (doctors and patients)
- Appointment scheduling and management
- Doctor availability management
- PostgreSQL database integration

## API Endpoints

### Authentication

- POST `/api/register` - Register a new user
- POST `/api/login` - User login
- POST `/api/refresh` - Refresh access token
- GET `/api/user` - Get current user information
- POST `/api/logout` - User logout

### Doctors

- GET `/api/doctors` - Get all doctors
- GET `/api/doctors/<doctor_id>/availability` - Get a doctor's availability
- POST `/api/doctors/<doctor_id>/availability` - Add/update a doctor's availability

### Appointments

- POST `/api/appointments` - Create a new appointment
- GET `/api/appointments/doctor` - Get doctor's appointments
- GET `/api/appointments/patient` - Get patient's appointments
- PATCH `/api/appointments/<appointment_id>` - Update an appointment

## Setup and Installation

1. Clone the repository
2. Setup a Python virtual environment: `python -m venv venv`
3. Activate the environment:
   - On Windows: `venv\Scripts\activate`
   - On Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up your `.env` file with necessary environment variables
6. Initialize the database: 
   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```
7. Run the application: `python run.py`