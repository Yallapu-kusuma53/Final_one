🅿️ Smart Parking Slot Booking System

A full-stack Smart Parking Slot Booking System that allows users to book parking slots, track parking duration, and simulate payments, with an admin panel for managing locations, slots, and bookings.

✨ Features
👤 User Features

User registration & secure login (JWT-based authentication)

Profile management

Browse parking locations and available slots

Book parking slots with vehicle details

Real-time parking timer (check-in & check-out)

Automatic duration calculation

Dynamic parking fee calculation

View booking history (Active / Completed / Cancelled)

🔧 Admin Features

Add and manage parking locations

Create, update, and delete parking slots

Enable / disable slots (maintenance mode)

View all user bookings

Monitor slot occupancy

Track revenue and usage statistics

🛠️ Technologies Used
Frontend

React 18

Vite

Tailwind CSS

React Router

Axios

Backend

Java 17

Spring Boot 3

Spring Security (JWT Authentication)

Spring Data JPA

Hibernate

MySQL

Maven

📦 Installation & Setup
Prerequisites

Java 17+

Maven

MySQL

Node.js (for frontend)

🔹 Backend Setup (Spring Boot)

Clone the repository

git clone https://github.com/yourusername/smart-parking-system.git
cd smart-parking-system/backend


Configure database & secrets
Edit application.properties (use environment variables for secrets):

spring.datasource.url=jdbc:mysql://localhost:3306/parkease_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000


Run backend

mvn spring-boot:run


Backend runs on:

http://localhost:5001

🔹 Frontend Setup (React)
cd ../frontend
npm install
npm run dev


Frontend runs on:

http://localhost:5173

🔌 API Endpoints (Backend)
Authentication

POST /api/auth/register – Register user

POST /api/auth/login – Login user

GET /api/auth/profile – Get user profile

Parking Locations

GET /api/locations – Get all locations

POST /api/locations – Add location (Admin)

PUT /api/locations/{id} – Update location

DELETE /api/locations/{id} – Delete location

Parking Slots

GET /api/slots – Get all slots

GET /api/slots/location/{locationId} – Slots by location

POST /api/slots – Create slot (Admin)

Bookings

POST /api/bookings – Create booking

GET /api/bookings/user – User bookings

POST /api/bookings/{id}/complete – Complete booking

POST /api/bookings/{id}/cancel – Cancel booking

📊 Database Schema (MySQL)

Users

Parking Locations

Parking Slots

Vehicles

Bookings

Database structure is defined in schema.sql

🔒 Security

JWT-based authentication

Password encryption using BCrypt

Stateless session management

Role-based access (USER / ADMIN)

🚀 Future Enhancements

Online payment gateway integration

QR code scanning for check-in

Analytics dashboard

Mobile app support

Email / SMS notifications
