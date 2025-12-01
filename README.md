# NTRO VOTE - Voting System

A secure voting system with Spring Boot backend and React frontend.

## Features
- **User**: Login via Phone + OTP, View Elections, Vote (One per election).
- **Admin**: Login via Password, Create Elections, Manage Nominees, Live Results.
- **Security**: JWT Authentication, Unique Vote Constraint.

## Prerequisites
- Java 17+
- Node.js 18+
- MySQL Database

## Setup

### Database
1. Create a MySQL database named `ntrovote`.
2. Update `backend/src/main/resources/application.properties` with your MySQL credentials if different from `root` / empty password.

### Backend
1. Navigate to `backend` folder.
2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   (Or use your IDE to run `NtroVoteApplication.java`)
3. The backend runs on `http://localhost:8080`.
4. **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`

### Frontend
1. Navigate to `frontend` folder.
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Usage
1. **Admin**: Go to `/admin/login`. Login with default credentials. Create an election, add nominees (with images).
2. **User**: Go to `/login`. Enter any phone number. Check backend console for the OTP (mocked). Enter OTP to login.
3. **Voting**: Select an active election and cast your vote.

## API Endpoints
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /admin/login`
- `GET /elections/active`
- `POST /vote`
- `POST /elections/admin` (Create Election)
- `POST /elections/admin/{id}/nominees` (Add Nominee)
