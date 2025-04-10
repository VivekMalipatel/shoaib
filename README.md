# MediConnect - Doctor-Patient Appointment Management System

MediConnect is a full-stack application for managing doctor-patient appointments, allowing doctors to manage their availability and patients to book appointments.

## Features

- **Role-based Authentication System**
  - Separate workflows for doctors and patients
  - Secure password hashing with sessions

- **Doctor Dashboard**
  - View upcoming and past appointments
  - Set and manage availability by day and time
  - View appointment statistics

- **Patient Dashboard**
  - Book appointments with available doctors
  - View upcoming and past appointments
  - Explore available doctors

- **Tech Stack**
  - Frontend: React, TypeScript, TailwindCSS, shadcn/ui
  - Backend: Flask, SQLAlchemy
  - Database: SQLite (development), PostgreSQL (production)

## Screenshots

- Login/Registration Screen
- Doctor Dashboard
- Patient Dashboard
- Appointment Booking Interface

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
└── backend/                # Python Flask backend
    ├── app/                # Flask application code
    │   ├── models.py       # Database models
    │   └── routes.py       # API routes
    ├── migrations/         # Database migrations
    └── run.py              # Server entry point
```

## Running Locally

### Prerequisites

- Node.js (v16+)
- Python 3.7+
- SQLite or PostgreSQL database

### Setup

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/mediconnect.git
   cd mediconnect
   ```

2. **Install frontend dependencies**
   ```
   npm install
   ```

3. **Install backend dependencies**
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory with the following content:
   ```
   DATABASE_URL=sqlite:///app.db
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key
   ```

5. **Initialize the database**
   ```
   python backend/create_db.py
   ```

6. **Start the development servers**
   ```
   # Option 1: Start both frontend and backend with a single command
   ./start-both.sh
   
   # Option 2: Start them separately
   # Terminal 1 - Start Flask backend
   ./start-flask.sh
   
   # Terminal 2 - Start Vite frontend
   npm run dev
   ```

7. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

## Test Accounts

The application comes with pre-configured test accounts:

- **Doctor:**
  - Username: doctor
  - Password: doctor123

- **Patient:**
  - Username: patient
  - Password: patient123

## API Documentation

### Authentication Endpoints
- `POST /api/login` - Authenticate a user
- `POST /api/register` - Create a new user account
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the current authenticated user

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id/appointments` - Get a doctor's appointments
- `GET /api/doctors/:id/availability` - Get a doctor's availability

### Patient Endpoints
- `GET /api/appointments/patient` - Get a patient's appointments

### Appointment Endpoints
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment

### Availability Endpoints
- `POST /api/doctors/:id/availability` - Create/update doctor availability

## License

This project is licensed under the MIT License - see the LICENSE file for details.