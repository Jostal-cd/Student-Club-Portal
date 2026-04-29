# Student Club Portal Setup Guide

## Requirements
- Node.js (v16+ recommended)
- MongoDB running locally on port 27017 or a valid MongoDB URI in `.env`
- IDE (VS Code recommended)

## Architecture Overview
This application uses a Node.js/Express backend communicating with a Vite React frontend.
- **Backend API Endpoints**: `/api/events`, `/api/auth/login`, `/api/auth/signup`, `/api/events/:id/visibility`
- **Frontend App**: Lives inside the `client` directory and runs on port 5173 default during dev.

## Setup Steps

### 1. Database Seeding & Startup
Ensure mongodb is running.
Start the Node backend in terminal 1:
```bash
npm install
node seed.js  # Optional: Set up demo events & users
npm start
```
The node backend runs on `localhost:3000`.

### 2. Frontend Development Server
In a new terminal, run the React application:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` to see the portal.

## Expected Auth Credentials (Default Dev Seed)
The following are available in the local DB for testing role-based dashboard mappings:

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `password123` |
| **Faculty (CS)** | `club_faculty` | `password123` |
| **Club (GDSC)** | `gdsc_club` | `password123` |
| **Club (STUCCo)** | `stucco_club` | `password123` |

## Recent Features Implementated
- **Authentication**: JWT based token logins with robust strength validation during Signup.
- **Admin Dashboard**: Located at `/dashboard-admin` for toggling event visibility across the portal.
- **Modern UI**: Implemented comprehensive React component structure mapping CSS-in-JS and purple gradient themes across `Home.jsx` and auth views.
- **Calendar View**: Embedded `react-calendar` integration tracking real-time server events directly on the homepage.
