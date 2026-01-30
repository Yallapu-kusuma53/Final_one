# 🅿️ Smart Parking Slot Booking System

A full-stack **Smart Parking Slot Booking System** that allows users to book parking slots, track parking duration, and simulate payments, with an admin panel for managing locations, slots, and bookings.

---

## ✨ Features

### 👤 User Features
- User registration and secure login (JWT-based authentication)
- Profile management
- Browse parking locations and available slots
- Book parking slots with vehicle details
- Real-time parking timer (check-in and check-out)
- Automatic parking duration calculation
- Dynamic parking fee calculation
- View booking history (Active / Completed / Cancelled)

---

### 🔧 Admin Features
- Add and manage parking locations
- Create, update, and delete parking slots
- Enable or disable slots (maintenance mode)
- View all user bookings
- Monitor real-time slot occupancy
- Track revenue and usage statistics

---

## 🛠️ Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Java 17
- Spring Boot 3
- Spring Security (JWT Authentication)
- Spring Data JPA
- Hibernate
- MySQL
- Maven

---

## 📦 Installation & Setup

### Prerequisites
- Java 17 or higher
- Maven
- MySQL
- Node.js (for frontend)

---

### 🔹 Backend Setup (Spring Boot)

```bash
git clone https://github.com/yourusername/smart-parking-system.git
cd smart-parking-system/backend
```

Edit `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/parkease_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
```

Run backend:
```bash
mvn spring-boot:run
```

Backend runs on:
```
http://localhost:5001
```

---

### 🔹 Frontend Setup (React)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile`

### Parking Locations
- GET `/api/locations`
- POST `/api/locations`
- PUT `/api/locations/{id}`
- DELETE `/api/locations/{id}`

### Parking Slots
- GET `/api/slots`
- GET `/api/slots/location/{locationId}`
- POST `/api/slots`

### Bookings
- POST `/api/bookings`
- GET `/api/bookings/user`
- POST `/api/bookings/{id}/complete`
- POST `/api/bookings/{id}/cancel`

---

## 📊 Database Schema
- Users
- Parking Locations
- Parking Slots
- Vehicles
- Bookings

Defined in `schema.sql`.

---

## 🔒 Security
- JWT-based authentication
- BCrypt password encryption
- Stateless session management
- Role-based access (USER / ADMIN)

---

## 🚀 Future Enhancements
- Online payment integration
- QR code check-in
- Analytics dashboard
- Mobile app
- Email/SMS notifications

---

## 👩‍💻 Author
**Yallapu Kusuma**  
Java Full Stack Developer  
Spring Boot | React | MySQL
