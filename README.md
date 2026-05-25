# StudentHub - Student Management System (Java Full Stack)

A lightweight, modern, and self-contained Student Management System built using a **Java Full Stack** architecture with **zero heavy frameworks** on the backend and **vanilla languages** on the frontend.

## Architecture & Technology Stack
- **Frontend**: Single-Page Application (SPA) designed with HTML5, CSS3 (using custom variables, sleek glassmorphic themes, responsive grids, and micro-animations), and modern JavaScript (Vanilla ES6).
- **Backend**: Built using Java SE's built-in HTTP Server (`com.sun.net.httpserver.HttpServer`) to serve REST APIs and host frontend static files.
- **Database**: H2 Database Engine (embedded file-based SQL, persistence to `./student_db`), which requires zero setup or server installations.
- **Database Connectivity**: Java Database Connectivity (JDBC) for executing CRUD queries.
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



## Key Features
- **Stat Dashboard**: Computes real-time statistics (Total Enrolled, Course Distribution, Grade average mapping, and student passing rates).
- **Interactive Registry Table**: Responsive data grid with custom badges indicating grade ranks.
- **Real-time Live Filters**: Full-text searching and dynamic category filters (by Course and by Grade).
- **Form Validations**: Advanced client-side form checking (regex checks for emails, empty checks) and backend constraint validation (uniqueness check on Roll Number).
- **Theme Engine**: Seamless toggle between sleek dark mode and warm light mode with browser persistent storage.
- **Toast Notifications**: Interactive status notifications on successful record insertions, updates, and errors.

## Project Structure
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

## Running the Project
The project contains an automated PowerShell script (`run.ps1`) to boot the application in seconds on Windows.

### Steps:
1. Open PowerShell in the project directory.
2. Run the script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run.ps1
   ```
3. The script will:
   - Create directories if they do not exist.
   - Automatically download the H2 Database Driver jar from Maven Central.
   - Compile all Java files into the `bin/` folder.
   - Launch the server at **`http://localhost:8080`**.
4. Open your web browser and go to: **[http://localhost:8080](http://localhost:8080)**

## Database Customization
By default, the backend will auto-seed sample student data into H2 if the registry is completely empty. The data is stored locally in the file `student_db.mv.db` in this folder, ensuring your additions and edits are saved across server restarts.
