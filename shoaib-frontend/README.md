# Medical Appointment System - Frontend

This is the frontend application for the Medical Appointment System, a web application that allows patients to book appointments with doctors.

## Technology Stack

- **React**: Front-end library
- **TypeScript**: Type safety
- **React Router DOM**: Routing
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Context API**: State management

## Features

- User authentication and registration (patients and doctors)
- Role-based access control and protected routes
- Doctor dashboard with appointment management
- Patient dashboard with appointment booking
- Responsive design for all devices

## Pages

- **Authentication**: Login and registration forms
- **Doctor Dashboard**: View appointments, manage availability
- **Patient Dashboard**: Book appointments, view appointment history
- **Not Found**: 404 page

## Components

- **Header**: Navigation and user info
- **ProtectedRoute**: Route guard based on authentication and role
- **Auth context**: Authentication state management

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables (create a `.env` file):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. Run the development server:
   ```
   npm start
   ```

4. Build for production:
   ```
   npm run build
   ```

## Authentication Flow

The application uses JWT tokens for authentication:
- Access token: Short-lived token for API calls
- Refresh token: Long-lived token for obtaining new access tokens
- Tokens are stored in localStorage

## Backend Repository

The backend code for this application is available at: [Medical Appointment System Backend](https://github.com/VivekMalipatel/shoaib-backend)