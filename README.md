# StudentHub ACET- Student Management System (Java Full Stack)

A lightweight, modern, and self-contained Student Management System built using a **Java Full Stack** architecture with **zero heavy frameworks** on the backend and **vanilla languages** on the frontend.

## Architecture & Technology Stack
- **Frontend**: Single-Page Application (SPA) designed with HTML5, CSS3 (using custom variables, sleek glassmorphic themes, responsive grids, and micro-animations), and modern JavaScript (Vanilla ES6).
- **Backend**: Built using Java SE's built-in HTTP Server (`com.sun.net.httpserver.HttpServer`) to serve REST APIs and host frontend static files.
- **Database**: H2 Database Engine (embedded file-based SQL, persistence to `./student_db`), which requires zero setup or server installations.
- **Database Connectivity**: Java Database Connectivity (JDBC) for executing CRUD queries.
- 
- ## 📊 Project Stats at a Glance

| Metric | Value |
|--------|-------|
| Architecture | Full-Stack (Java Backend + Vanilla JS Frontend) |
| Backend Framework | Java HttpServer (built-in) |
| Database | H2 Embedded |
| API Type | REST (GET, POST, PUT, DELETE) |
| Frontend Type | Single-Page Application (SPA) |
| CRUD Operations | Full (Create, Read, Update, Delete) |
| Real-time Features | ✅ Search, Filters, Charts, Stats |
| Security Features | SQL Injection Prevention, XSS Protection, Path Traversal Prevention |
| Theme Support | Dark/Light Mode with Persistence |
| Design Patterns | MVC, DAO, Repository, Configuration |
| Code Quality | Production-ready with error handling |
| Recent Fixes | 3 (JSON parsing, Email validation, Theme sync) |

---

- ## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
│  (HTML5 + CSS3 + Vanilla JavaScript)                    │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │ Students │ │Analytics │ │Settings  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  - Real-time Search & Filters                          │
│  - Charts.js for Analytics                             │
│  - Theme Toggle (Dark/Light)                           │
│  - Form Validations                                     │
└─────────────────────────────────────────────────────────┘
                         ↓ REST API
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                            │
│  (Java HttpServer)                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  StudentApiHandler (HTTP Request Handler)       │   │
│  │  - POST /api/students   (CREATE)               │   │
│  │  - GET /api/students    (READ)                 │   │
│  │  - PUT /api/students    (UPDATE)               │   │
│  │  - DELETE /api/students?id=X (DELETE)         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  StudentDAO (Data Access Object)                │   │
│  │  - addStudent()                                 │   │
│  │  - getAllStudents()                             │   │
│  │  - getStudentById()                             │   │
│  │  - updateStudent()                              │   │
│  │  - deleteStudent()                              │   │
│  │  - isRollNumberExists()                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓ JDBC
┌─────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  DatabaseConfig                                │   │
│  │  - Connection pooling setup                    │   │
│  │  - Database initialization                     │   │
│  │  - Auto-seeding sample data                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓ SQL
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  H2 Database (Embedded File-Based)              │   │
│  │                                                 │   │
│  │  students (table)                               │   │
│  │  ├─ id (PK, Auto-increment)                    │   │
│  │  ├─ name (VARCHAR)                              │   │
│  │  ├─ email (VARCHAR)                             │   │
│  │  ├─ roll_number (VARCHAR, UNIQUE)              │   │
│  │  ├─ course (VARCHAR)                            │   │
│  │  └─ grade (VARCHAR)                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```
## 🔑 Key Features Breakdown

### 1. Dashboard (Real-Time Statistics)
- **Total Enrolled:** Count of all students
- **Average Grade:** Weighted GPA calculation
- **Top Course:** Most popular course
- **Passing Rate:** Percentage of students not failing

### 2. Student Registry (CRUD Operations)
- **Add Student:** Form validation + database insert
- **Edit Student:** Update existing records
- **Delete Student:** Remove with confirmation
- **View All:** Paginated table view

### 3. Search & Filtering
- **Full-text Search:** Name, Roll, Email, Course
- **Course Filter:** Dropdown by course
- **Grade Filter:** Dropdown by grade
- **Live Updates:** Instant results

### 4. Analytics (Visual Reports)
- **Course Distribution:** Doughnut chart
- **Grade Distribution:** Bar chart
- **GPA by Course:** Line chart

### 5. Settings
- **Admin Profile:** Name and role customization
- **Theme Toggle:** Dark ↔ Light mode
- **Page Size:** Control table pagination
- **Database Reset:** Restore sample data

---





##📁 Project Structure
```
├── lib/                   # Holds downloaded H2 Database Driver JAR
├── src/                   # Backend Java source files
│   └── com/student/
│       ├── model/         # Student POJO model
│       ├── dao/           # JDBC Database Access Object (CRUD Operations)
│       ├── config/        # H2 Database configuration and seeding
│       ├── handler/       # HttpServer request handlers (REST API and Static Assets)
│       └── App.java       # Main entry point to launch server
├── web/                   # Frontend assets
│   ├── index.html         # Main dashboard layout structure
│   ├── style.css          # Color variables, transitions, animations
│   └── app.js             # State manager and AJAX fetch handlers
└── run.ps1                # PowerShell wrapper to compile and run
```
## 📚 Technologies Used

### Backend
- **Java 11+** - Main language
- **com.sun.net.httpserver** - HTTP server (JDK built-in)
- **JDBC** - Database connectivity
- **H2 Database** - Embedded SQL database

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with variables & animations
- **JavaScript ES6+** - Interactivity
- **Chart.js** - Charts library (CDN)
- **FontAwesome** - Icons (CDN)
- **Google Fonts** - Typography

### Tools
- **PowerShell** - Build automation script
- **Maven Central** - Dependency download

---

## How to Run the Project

### Prerequisites
- Java JDK installed
- VS Code or IntelliJ IDEA

### Steps to Run

1. Clone the repository:

git clone https://github.com/samarthwankhade06-glitch/Student-Management-System.git

2. Open the project in VS Code

3. Open Terminal

4. Run:

.\run.ps1

OR

run.bat

5. Wait until you see:

Backend Server successfully started!
Server running at http://localhost:8082

6. Open your browser and visit:

http://localhost:8082


