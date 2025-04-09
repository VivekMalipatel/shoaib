# MediConnect - Medical Appointment Management System

A comprehensive web application for managing medical appointments between doctors and patients.

## Features

### For Doctors
- View and manage appointments
- Set availability with an interactive calendar
- Manage patient records
- Accept or cancel appointments

### For Patients
- Browse available doctors
- Book appointments with preferred doctors
- View and manage personal appointments
- Access medical records

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: In-memory database with Drizzle ORM
- **Authentication**: Passport.js with session-based authentication

## Project Structure

- `/client`: Frontend code and assets
  - `/public`: Static HTML pages and assets
  - `/src`: React components and TypeScript code
- `/server`: Backend API and server code
- `/shared`: Shared types and schemas

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/mediconnect.git
cd mediconnect
```

2. Install dependencies
```bash
npm install
```

3. Start the application
```bash
npm run dev
```

4. Access the application at `http://localhost:5000`

### Default Credentials

- **Doctor Account**:
  - Username: doctor
  - Password: password

- **Patient Account**:
  - Username: patient
  - Password: password

## Future Enhancements

- Integration with real-time notification system
- Telemedicine video consultation features
- Medical record sharing functionality
- Integration with external payment systems
- Mobile app development

## License

This project is licensed under the MIT License - see the LICENSE file for details.