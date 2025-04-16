# FuelUp - Fuel Delivery Service

A web application for ordering fuel delivery services with user authentication and order tracking.

## Features

- User authentication (signup, login, logout)
- Protected routes (only authenticated users can access certain pages)
- Fuel ordering system
- Order tracking
- User dashboard

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd fuelup
```

2. Install backend dependencies:
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fuelup
JWT_SECRET=your-super-secret-key-change-this-in-production
```

## Running the Application

1. Start MongoDB:
```
mongod
```

2. Start the backend server:
```
cd backend
npm run dev
```

3. Access the application:
Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
fuelup/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │   
│   ├── models/
│   │   └── User.js
│   │   
│   ├── routes/
│   │   └── auth.js
│   │   
│   ├── .env
│   │   
│   ├── package.json
│   │   
│   └── server.js
├── pages/
│   ├── script/
│   │   ├── auth.js
│   │   └── script.js
│   │   
│   ├── style/
│   │   ├── auth.css
│   │   └── styles.css
│   │   
│   ├── 404.html
│   │   
│   ├── dashboard.html
│   │   
│   ├── fuel-order.html
│   │   
│   ├── index.html
│   │   
│   ├── signin.html
│   │   
│   └── trackorder.html
└── README.md
```

## Authentication Flow

1. Users can access the homepage (index.html) without authentication
2. To access protected pages (dashboard, fuel-order, trackorder), users must sign in
3. After successful login/signup, users are redirected to the dashboard
4. The authentication token is stored in an HTTP-only cookie for security

## API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/logout` - Logout user

## License

This project is licensed under the MIT License. 