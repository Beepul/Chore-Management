# Chore Master – Household Chore Management System

## IFN636 Assignment 1.2

Chore Master is a full-stack MERN web application designed to help households manage chores, members, and task assignments efficiently. The system provides separate functionalities for household admins and members, allowing better organization, responsibility tracking, and collaboration within a household.

---

## Project Overview

This project was developed as part of **IFN636 Assignment 1.2**.  
The aim of the system is to provide a digital solution for managing household chores by allowing users to:

- Create and manage a household
- Invite and manage members
- Assign chores to members
- Track chore status and completion
- Organize chores into parent and sub-chore structures
- Provide different access levels for admin and member users

The system follows a **MERN stack architecture**:

- **MongoDB** – Database
- **Express.js** – Backend framework
- **React.js** – Frontend framework
- **Node.js** – Runtime environment

---

## Features

### Authentication
- User registration
- User login
- Protected routes for authenticated users

### Household Management
- Create household
- Join and manage household membership
- Role-based access (Admin / Member)

### Chore Management
- Create chores
- Update chores
- Delete chores
- Assign chores to members
- Create sub-chores under parent chores
- View chore details
- Update chore status

### Member Management
- Invite members to household
- View all household members
- Manage household membership

### Dashboard
- Separate dashboard views for:
  - Admin
  - Member
  - New user without household

### Settings
- User settings page
- Household related settings

---

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Testing
- Mocha
- Chai
- Sinon

### DevOps / Deployment
- GitHub
- GitHub Actions (CI/CD)
- PM2
- AWS EC2
- Nginx

---

## Project Structure

```bash
choremanagement/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── test/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
```

---

## Getting Started (Setup Guide)

Follow the steps below to run this project locally after cloning the repository.

---

### Step 1: Clone the Repository

git clone <your-repository-url>
cd choremanagement

---

### Step 2: Install Dependencies

From the root folder, run: 
``` bash
npm run install-all
```
This installs dependencies for:
- Root project
- Backend
- Frontend

---

### Step 3: Configure Environment Variables

Create a .env file inside the backend folder.
``` bash
backend/.env
```
Add the following:
``` bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### Step 4: Start the Application

From the root folder, run:
``` bash
npm run dev
```
This will start:
- Backend server
- Frontend React app

---

### Step 5: Open in Browser

Frontend: http://localhost:3000
Backend: http://localhost:5001

---

### Step 6: Run Tests

To run backend test cases:
```bash
cd backend
npm test
```

---

### Step 7: Build for Production
To check if the project is ready for deployment:
npm run build

---

## Notes
- Make sure MongoDB is running locally or use MongoDB Atlas.
- Ensure .env file is properly configured before running the backend.
- If any port is already in use, change it in .env.