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
  - Backend: Express.js, Drizzle ORM
  - Database: PostgreSQL

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
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication logic
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema and types
└── backend/                # Legacy Python Flask backend (optional)
```

## Running Locally

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Setup

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/mediconnect.git
   cd mediconnect
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/mediconnect
   SESSION_SECRET=your-secret-key
   PORT=5000
   ```

4. **Initialize the database**
   ```
   # Option 1: Using the setup script (recommended)
   chmod +x setup-db.sh
   ./setup-db.sh
   
   # Option 2: Using drizzle directly
   npm run db:push
   ```

5. **Start the development server**
   ```
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:5000`

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
- `POST /api/register` - Create a new user account
- `POST /api/login` - Authenticate a user
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the current authenticated user

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id/appointments` - Get a doctor's appointments
- `GET /api/doctors/:id/availability` - Get a doctor's availability

### Patient Endpoints
- `GET /api/patients/:id/appointments` - Get a patient's appointments

### Appointment Endpoints
- `POST /api/appointments` - Create a new appointment
- `PATCH /api/appointments/:id` - Update an appointment

### Availability Endpoints
- `POST /api/availability` - Create/update doctor availability
- `PATCH /api/availability/:id` - Update availability

## License

This project is licensed under the MIT License - see the LICENSE file for details.