# Smart Parking Slot Booking System

A modern, full-stack parking slot booking application built with React, Vite, and Tailwind CSS.

## 📁 Project Structure

```
smart-parking-system/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── BookingForm.jsx      (optional - for future use)
│   │   ├── Navbar.jsx            (optional - for future use)
│   │   ├── SlotCard.jsx          (optional - for future use)
│   │   └── SlotGrid.jsx          (optional - for future use)
│   ├── pages/
│   │   ├── RegisterPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── BookingPage.jsx
│   ├── services/
│   │   └── BookingService.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
```

## 🚀 Features

### 1. **User Authentication**
- User registration with validation
- Secure login system
- Session management with localStorage

### 2. **Smart Slot Finder**
- Date-based availability search
- Real-time slot availability checking
- 20 parking slots across 2 zones (Zone A & Zone B)
- Floor-wise organization

### 3. **Booking Management**
- Vehicle registration and type selection
- Dynamic pricing based on vehicle type:
  - Bike/Scooter: ₹50/day
  - Car: ₹100/day
  - SUV: ₹150/day
- Date range selection
- Real-time price calculation
- Booking confirmation with details

### 4. **Booking History & Management** 🆕
- View all bookings with detailed information
- Filter bookings by status (All, Active, Completed, Cancelled)
- Search bookings by vehicle number or slot name
- Booking statistics dashboard
- Cancel upcoming/active bookings
- Booking status tracking:
  - **Upcoming**: Future bookings
  - **Active/Ongoing**: Current bookings
  - **Completed**: Past bookings
  - **Cancelled**: Cancelled bookings
- Total spending tracker

### 5. **User Dashboard**
- Quick access to booking history
- Search available slots
- User profile display
- Logout functionality

## 🛠️ Technologies Used

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Data Persistence**: localStorage

## 📦 Installation

1. **Clone or create the project directory**
   ```bash
   mkdir smart-parking-system
   cd smart-parking-system
   ```

2. **Initialize npm and install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Flow

1. **Register**: Create a new account with your details
2. **Login**: Access your account with email and password
3. **Search Slots**: Select check-in and check-out dates
4. **Select Slot**: Click on any available parking slot
5. **Book**: Enter vehicle details and confirm booking
6. **View Bookings**: Access "My Bookings" to see all your reservations
7. **Manage Bookings**: Filter, search, and cancel bookings as needed
8. **Track History**: View completed and cancelled bookings

## 🗂️ File Descriptions

### **Services**
- `BookingService.js`: Handles all backend logic including user authentication, slot management, and booking operations

### **Pages**
- `RegisterPage.jsx`: User registration interface
- `LoginPage.jsx`: User login interface
- `Dashboard.jsx`: Main dashboard showing available slots
- `BookingPage.jsx`: Booking form with vehicle details and payment
- `BookingHistoryPage.jsx`: Complete booking history with filters and search

### **Components**
- `Navbar.jsx`: Reusable navigation bar component
- `SlotCard.jsx`: Individual slot card component

### **Configuration**
- `vite.config.js`: Vite configuration
- `tailwind.config.js`: Tailwind CSS customization
- `postcss.config.js`: PostCSS configuration

## 🎨 Design Features

- Gradient backgrounds
- Smooth animations and transitions
- Responsive grid layouts
- Hover effects on interactive elements
- Modern card-based UI
- Icon-based visual communication
- Form validation with error messages

## 📊 Data Structure

### User Object
```javascript
{
  id: timestamp,
  fullName: string,
  email: string,
  phone: string,
  password: string,
  createdAt: ISO_date
}
```

### Slot Object
```javascript
{
  id: number,
  name: string,
  zone: string,
  available: boolean,
  floor: number
}
```

### Booking Object
```javascript
{
  id: timestamp,
  userId: number,
  slotId: number,
  slotName: string,
  vehicleNumber: string,
  vehicleType: string,
  startDate: string,
  endDate: string,
  amount: number,
  createdAt: ISO_date,
  cancelled: boolean,
  cancelledAt: ISO_date
}
```

## 🔐 Security Notes

- Passwords are stored in plain text (for demo purposes only)
- In production, use proper authentication (JWT, OAuth)
- Implement password hashing (bcrypt)
- Use secure backend API
- Add HTTPS in production

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] QR code for booking confirmation
- [ ] Admin panel for slot management
- [ ] Real-time slot updates using WebSockets
- [ ] Advanced analytics and reports
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Refund management system
- [ ] Review and rating system
- [ ] Parking slot images
- [ ] Map integration for slot location

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Known Issues

- Data is stored in localStorage (clears on browser cache clear)
- No server-side validation
- Single user session only
- No password recovery option

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Developer

Built with ❤️ using React and Tailwind CSS

---

**Happy Parking! 🚗✨**