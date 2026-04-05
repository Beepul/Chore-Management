# Full-Stack CRUD Application with DevOps Practices

This project is developed as part of the **IFN636: Software Life Cycle Management** assessment. It is a full-stack CRUD web application built using modern web technologies and deployed using DevOps practices.

The application includes a backend API, frontend user interface, authentication and authorisation, GitHub version control workflow, and CI/CD pipeline integration.

---

## Project Overview

This system allows users to interact with a full-stack web application that supports core CRUD (Create, Read, Update, Delete) operations. It also includes secure authentication and deployment practices.

The purpose of this project is to demonstrate understanding of:

- Backend development
- Frontend development
- Authentication and authorisation
- Git branching strategy
- CI/CD workflow setup
- Cloud deployment using AWS EC2

---

## Tech Stack

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### DevOps / Deployment
- GitHub
- GitHub Actions
- AWS EC2
- PM2

---

## Features

- User registration and login
- Secure authentication and authorisation
- CRUD operations
- Frontend and backend integration
- REST API handling
- GitHub branching workflow
- CI/CD pipeline using GitHub Actions
- Deployment on AWS EC2

---

## Project Structure

```bash
project-root/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tests/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
