# 🎓 AttendSmart

### Automated Student Attendance Monitoring & Analytics System

<p align="center">

**Smart Attendance. Real-Time Insights. Better Academic Decisions.**

[![Go](https://img.shields.io/badge/Backend-Go-00ADD8?style=for-the-badge\&logo=go\&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge\&logo=artificial-intelligence\&logoColor=white)](#)
[![Status](https://img.shields.io/badge/Status-Under%20Development-orange?style=for-the-badge)](#)

</p>

---

## 🚀 Overview

**AttendSmart** is an intelligent, web-based attendance management and analytics platform designed specifically for colleges and educational institutions.

Traditional attendance systems often rely on manual processes that are time-consuming, error-prone, difficult to monitor, and vulnerable to proxy attendance.

AttendSmart aims to transform this process by combining:

* 📋 Digital attendance management
* 🤖 AI-powered attendance intelligence
* 📊 Real-time analytics
* 👨‍🎓 Student monitoring
* 👨‍🏫 Faculty management
* 🏫 Department-level administration
* 📈 Predictive insights
* 🔐 Secure role-based access

The goal is simple:

> **Automate attendance → Analyze student performance → Identify risks early → Enable better academic decisions.**

---

# ✨ Key Features

## 👨‍🎓 Student Management

Manage student information from a centralized platform.

* Add, update and remove students
* Student profiles
* Student ID management
* Department and semester mapping
* Subject enrollment
* Attendance history
* Individual attendance analytics

---

## 👨‍🏫 Faculty Management

Faculty members can manage their classes and attendance efficiently.

* Faculty dashboard
* Assigned subjects
* Class management
* Digital attendance
* Attendance history
* Student-wise attendance tracking
* Attendance reports

---

## 📝 Smart Attendance

Replace traditional paper-based attendance with a centralized digital system.

### Attendance workflow

```text
Faculty
   ↓
Select Class / Subject
   ↓
Select Students
   ↓
Mark Attendance
   ↓
Backend API
   ↓
PostgreSQL
   ↓
Real-Time Analytics
```

Attendance records can be securely stored and retrieved whenever required.

---

# 🤖 AI-Powered Attendance Intelligence

AttendSmart is designed to go beyond simply recording attendance.

The AI layer can analyze attendance patterns and generate meaningful insights.

### Possible AI capabilities

* 📉 Identify students with declining attendance
* ⚠️ Detect students at attendance risk
* 📊 Analyze attendance patterns
* 🔮 Predict possible shortage of attendance
* 🧠 Generate academic insights
* 🚨 Highlight unusual attendance behavior
* 📈 Provide personalized recommendations

### Example

Instead of simply showing:

> **Attendance: 68%**

AttendSmart can provide:

> ⚠️ **Attendance Risk Detected**
> Current attendance is 68%. Based on recent attendance patterns, the student may fall below the required attendance threshold if the current trend continues.

This turns raw attendance data into **actionable information**.

---

# 📊 Analytics Dashboard

AttendSmart provides dashboards designed for different users.

### Student Dashboard

```text
┌─────────────────────────────────────────┐
│           STUDENT DASHBOARD             │
├─────────────────────────────────────────┤
│ Overall Attendance        82%            │
│ Classes Attended          41             │
│ Classes Missed             9             │
│ Attendance Trend          ↗ Improving    │
├─────────────────────────────────────────┤
│ Subject Performance                      │
│                                         │
│ Mathematics              88%             │
│ Computer Science         91%             │
│ Physics                  76%             │
│ Electronics              69% ⚠️          │
└─────────────────────────────────────────┘
```

### Faculty Dashboard

* Today's classes
* Attendance marking
* Student attendance
* Subject statistics
* Attendance trends
* Low-attendance students

### Admin / HOD Dashboard

* Department statistics
* Faculty overview
* Student attendance
* Subject-wise analytics
* Attendance trends
* Risk identification
* Reports

---

# 🔐 Role-Based Access

AttendSmart follows a role-based architecture.

| Role          | Capabilities                                        |
| ------------- | --------------------------------------------------- |
| 👨‍🎓 Student | View attendance, analytics and personal records     |
| 👨‍🏫 Faculty | Take attendance, manage classes and view analytics  |
| 👨‍💼 HOD     | Monitor department-level attendance                 |
| 🛡️ Admin     | Manage users, departments, subjects and system data |

This ensures that users only access information relevant to their role.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      Go Backend     │
                    │       API Server    │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   PostgreSQL    │        │   AI Engine     │
        │    Database     │        │                 │
        └─────────────────┘        └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* JavaScript
* REST API integration
* Responsive UI

## Backend

* Go (Golang)
* RESTful APIs
* Authentication & authorization
* Business logic
* Database integration

## Database

* PostgreSQL
* Relational data model
* Attendance records
* Student records
* Faculty records
* Subjects
* Departments

## AI Layer

* Attendance pattern analysis
* Risk detection
* Predictive analytics
* Intelligent insights

---

# 📂 Project Structure

```text
AttendSmart/
│
├── backend/
│   ├── cmd/
│   ├── internal/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── faculty/
│   │   ├── attendance/
│   │   └── ...
│   ├── migrations/
│   └── go.mod
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── ai-engine/
│   ├── models/
│   ├── services/
│   └── ...
│
├── docs/
│
└── README.md
```

> The exact structure may evolve as the project develops.

---

# 🔄 How AttendSmart Works

### 1️⃣ User Authentication

Users log into the platform according to their role.

```text
Login
  ↓
Authentication
  ↓
Role Verification
  ↓
Dashboard
```

### 2️⃣ Attendance Recording

Faculty selects a class and records attendance.

```text
Faculty → Class → Subject → Students → Attendance
```

### 3️⃣ Data Storage

Attendance information is securely stored in PostgreSQL.

### 4️⃣ Analytics

The backend processes attendance information and provides statistics to the frontend.

### 5️⃣ AI Analysis

The AI engine analyzes historical attendance data to identify trends and potential risks.

### 6️⃣ Decision Support

Students and faculty receive useful insights instead of just raw attendance percentages.

---

# 📈 Example Analytics

AttendSmart can provide insights such as:

```text
Overall Attendance       78%

Attendance Trend         ↗ Improving

High Risk Students       12

Students Below 75%       18

Average Department       81%

Best Performing Subject  Computer Science
```

---

# 🎯 Problems We Solve

### ❌ Traditional System

* Manual attendance
* Paper-based records
* Human errors
* Difficult report generation
* No centralized analytics
* Proxy attendance
* Delayed identification of low attendance
* Limited visibility for administrators

### ✅ AttendSmart

* Digital attendance
* Centralized database
* Automated calculations
* Real-time analytics
* AI-powered insights
* Role-based access
* Attendance risk detection
* Easy reporting
* Student monitoring

---

# 🌟 Why AttendSmart?

AttendSmart isn't just an **attendance recording system**.

It is designed as an **academic attendance intelligence platform**.

```text
                RAW DATA
                   │
                   ▼
             ATTENDANCE
                   │
                   ▼
              ANALYTICS
                   │
                   ▼
             AI INSIGHTS
                   │
                   ▼
          EARLY INTERVENTION
                   │
                   ▼
        BETTER ACADEMIC OUTCOMES
```

---

# 🔮 Future Scope

The platform can be extended with:

* 📸 Face recognition attendance
* 📱 Mobile application
* 🔔 Automated attendance notifications
* 📧 Email alerts
* 📱 SMS notifications
* 🧠 Advanced predictive analytics
* 📊 Advanced institutional analytics
* 📄 Automated report generation
* 🗓️ Timetable integration
* 🔗 College ERP integration
* ☁️ Cloud deployment
* 🔒 Advanced security and audit logs

---

# 🧪 Development Status

AttendSmart is currently under active development.

### Current development focus

* [x] Project architecture
* [x] Go backend setup
* [x] PostgreSQL integration
* [x] Database migrations
* [x] React frontend setup
* [x] Authentication foundation
* [x] Student management
* [ ] Complete attendance module
* [ ] Advanced analytics
* [ ] AI integration
* [ ] Notification system
* [ ] Production deployment

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have the following installed:

* Go
* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Quant-Crafters/SMART-ATTANDANCE-TRACKER-AND-ANALYSIS.git

cd SMART-ATTANDANCE-TRACKER-AND-ANALYSIS
```

---

## 2. Start PostgreSQL

Create the required database:

```sql
CREATE DATABASE attendSmart;
```

Configure the database connection according to the backend environment configuration.

---

## 3. Start the Backend

```bash
cd backend

go mod download

go run ./cmd/server
```

The backend will run on:

```text
http://localhost:8080
```

---

## 4. Start the Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

The frontend will then be available through the Vite development server.

---

# 🔌 API Architecture

The frontend communicates with the Go backend through REST APIs.

Example:

```text
React UI
   │
   │ HTTP Request
   ▼
/api/students
   │
   ▼
Go Handler
   │
   ▼
Service Layer
   │
   ▼
Repository
   │
   ▼
PostgreSQL
```

This layered architecture makes the system easier to maintain, test and extend.

---

# 🧩 Core Modules

```text
AttendSmart
│
├── 🔐 Authentication
│
├── 👨‍🎓 Students
│
├── 👨‍🏫 Faculty
│
├── 🏫 Departments
│
├── 📚 Subjects
│
├── 📝 Attendance
│
├── 📊 Analytics
│
├── 🤖 AI Engine
│
├── 🔔 Notifications
│
└── 📄 Reports
```

---

# 🏆 Hackathon Vision

AttendSmart is built with the vision of solving a real-world problem faced by educational institutions.

Instead of treating attendance as a simple percentage, the platform aims to answer more meaningful questions:

> **Who is at risk?**

> **Why is attendance declining?**

> **Which students need attention?**

> **What trends are emerging?**

> **How can faculty intervene early?**

That is where **AttendSmart** moves from attendance management to **intelligent academic monitoring**.

---

# 👥 Team

### Quant Crafters

Built with ❤️ for innovation, automation and smarter education.

---

# 📜 License

This project is currently developed for educational, research and hackathon purposes.

---

<p align="center">

### 🎓 AttendSmart

**Automate Attendance. Analyze Performance. Act Early.**

⭐ If you find this project interesting, consider giving it a star!

</p>
