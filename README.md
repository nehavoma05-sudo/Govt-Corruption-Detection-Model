# 🏛️ Government Corruption Detection & Monitoring System

<p align="center">
  <img src="screenshots/main_dashboard.png" alt="Main Dashboard" width="90%">
</p>

<p align="center">
  <a href="YOUR_VIDEO_DEMO_LINK">
    <img src="https://img.shields.io/badge/🎥%20Watch%20Project%20Demo-Click%20Here-red?style=for-the-badge">
  </a>
</p>

---

## 📌 Overview

The **Government Corruption Detection & Monitoring System** is an AI-powered web application designed to improve transparency in government infrastructure projects. The platform enables government officials, contractors, and inspection officers to manage projects, upload invoices, conduct inspections, and automatically calculate fraud risk scores based on project data.

The system continuously analyzes project activities, invoice patterns, inspection reports, payment history, and project progress to identify suspicious behavior and assist authorities in making informed decisions.

---

# ✨ Features

### 👤 Multi-Role Authentication

- Government Agent
- Contractor
- Inspection Officer
- Citizen

---

### 📂 Project Management

- Create Government Projects
- Manage Project Details
- Track Project Progress
- View Project Status

---

### 🧾 Invoice Management

- Upload Project Invoices
- Verify Invoice Details
- Store Invoice History
- Detect Invoice Irregularities

---

### 🔍 Inspection Management

- Add Inspection Reports
- Inspection Scheduling
- Upload Site Observations
- View Previous Inspections

---

### 💰 Payment Monitoring

- Track Payments
- Payment History
- Budget Utilization
- Cost Analysis

---

### 🤖 AI Fraud Detection

The AI model analyzes multiple parameters including:

- Invoice Amount
- Project Completion %
- Budget Utilization
- Number of Inspections
- Delayed Reports
- Payment Patterns
- Project Timeline
- Cost Deviations

The model generates a **Fraud Risk Score (0-100)** and classifies projects as:

- ✅ Low Risk
- ⚠ Medium Risk
- 🚨 High Risk

---

# 🏗️ System Architecture

```
                   React Frontend
                         │
                         │ REST APIs
                         ▼
                 FastAPI Backend Server
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
 Authentication     Fraud Detection    Project Services
      │                 Model               │
      └────────────────┼────────────────────┘
                       │
                       ▼
                   MySQL Database
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- HTML
- CSS
- JavaScript

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- JWT Authentication
- REST APIs

---

## Database

- MySQL

---

## Machine Learning

- Scikit-Learn
- Random Forest
- Joblib

---

# 🗂️ Database Modules

- Users
- Contractors
- Government Agents
- Projects
- Invoices
- Inspections
- Payments
- Reports
- Fraud Results

---

# 📊 Fraud Detection Workflow

```
Project Created
        │
        ▼
Invoice Uploaded
        │
        ▼
Inspection Completed
        │
        ▼
Project Reports Generated
        │
        ▼
AI Fraud Detection Model
        │
        ▼
Fraud Score Prediction
        │
        ▼
Stored in Database
        │
        ▼
Dashboard Visualization
```

---

# 📸 Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Government Agent Portal

![Government](screenshots/gov_agent.png)

---

## Contractor Portal

![Contractor](screenshots/contractor.png)

---

## Inspection Officer Portal

![Inspection](screenshots/inspection.png)

---

## Fraud Detection Dashboard

![Fraud](screenshots/fraud_dashboard.png)

---

# 🎥 Project Demo

> Upload your demo to YouTube or Google Drive and replace the link below.

**Video Demo:**  
https://YOUR_VIDEO_LINK_HERE

---

# 📁 Project Structure

```
Government-Corruption-Detection/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── database/
│   ├── schemas/
│   ├── utils/
│   ├── ml_models/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│
├── README.md
│
└── .env
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/government-corruption-detection.git
```

```bash
cd government-corruption-detection
```

---

## Backend Setup

```bash
cd backend
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start React

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_mysql_connection

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

GOV_AGENT_PASSWORD=your_password
```

---

# 📡 Main API Endpoints

## Authentication

```
POST /login
POST /register
```

---

## Projects

```
GET /projects
POST /projects
PUT /projects/{id}
DELETE /projects/{id}
```

---

## Invoices

```
POST /invoice/upload
GET /invoice/list
```

---

## Inspection

```
POST /inspection/add
GET /inspection/list
```

---

## Fraud Detection

```
POST /predict-fraud/{project_id}
GET /fraud-results
```

---

# 🚀 Future Improvements

- Live Government Tender Integration
- OCR-based Invoice Verification
- Real-time Fraud Alerts
- GIS Project Monitoring
- Email Notifications
- Analytics Dashboard
- AI-based Invoice Validation
- Mobile Application

---

# 👨‍💻 Contributors

- **Neha Voma**
- Backend Development
- Database Design
- AI Integration
- Fraud Detection Module

---

# ⭐ If you like this project

Give the repository a ⭐ on GitHub.

---

## 📜 License

This project is developed for educational and research purposes.
