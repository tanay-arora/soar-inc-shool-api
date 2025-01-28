# School Management System API (Axion-Based)

## 1. Project Overview

Welcome to the **School Management System** built on the [axion](https://github.com/qantra-io/axion) project template. This API provides:

- **Role-Based Access Control** (RBAC) with JWT (superadmin vs. schooladmin)
- **CRUD** operations for Schools, Classrooms, Students
- **Capacity & Resource** management for Classrooms
- **Student** enrollment and transfer logic
- **User** management for login & token generation

### Technologies

- **Node.js** (JavaScript)
- **Express** (Axion’s dynamic routing pattern)
- **MongoDB** via Mongoose
- **JSON Web Token** (JWT) for authentication
- **Bcrypt** for password hashing
- **Jest + Supertest** for testing
- **express-rate-limit** & **helmet** for security

---

## 2. API Documentation

Below is a summary of endpoints. The API uses a **dynamic route** format: 

HTTP_VERB /api/:moduleName/:fnName


### 2.1. **User** Module

- **POST /api/user/login**
  - Body: `{ email, password }`
  - Returns JWT token if valid.

- **POST /api/user/createUser**
  - Superadmin only
  - Body: `{ username, email, password, role, schoolId? }`
  - Returns newly created user + token.

### 2.2. **School** Module (superadmin only)

- **POST /api/school/createSchool**
- **GET /api/school/listSchools**
- **GET /api/school/getSchool**
- **PUT /api/school/updateSchool**
- **DELETE /api/school/deleteSchool**

### 2.3. **Classroom** Module (superadmin or matching schooladmin)

- **POST /api/classroom/createClassroom**
- **GET /api/classroom/listClassrooms**
- **GET /api/classroom/getClassroom**
- **PUT /api/classroom/updateClassroom**
- **DELETE /api/classroom/deleteClassroom**
- **POST /api/classroom/enrollStudentInClassroom** (optional capacity example)

### 2.4. **Student** Module (superadmin or matching schooladmin)

- **POST /api/student/createStudent**
- **GET /api/student/listStudents**
- **GET /api/student/getStudent**
- **PUT /api/student/updateStudent**
- **DELETE /api/student/deleteStudent**
- **PATCH /api/student/transferStudent** (superadmin only)

---

## 3. Database Schema & Diagram

### 3.1. **Models** (Mongoose)

1. **User**: `{ username, email, password, role, schoolId? }`
2. **School**: `{ name, address, phone, principal, staffCount, ... }`
3. **Classroom**: `{ name, capacity, resources, schoolId }`
4. **Student**: `{ firstName, lastName, email, schoolId, guardians, enrollmentStatus, ... }`

### 3.2. **ER Diagram**



---

## 4. Setup & Deployment Instructions

### 4.1. **Local Setup**

1. **Clone** the project:
   ```
   git clone https://github.com/tanay-arora/soar-inc-shool-api
   cd axion-school-api
   npm install
   ```

2. create a .env:
    ```
    ENV=development
    MONGO_URI=mongodb://localhost:27017/axion_school
    LONG_TOKEN_SECRET=someLongSecret
    SHORT_TOKEN_SECRET=someShortSecret
    NACL_SECRET=someNaclSecret
    USER_PORT=3000
    SERVICE_NAME=school-api
    ```
3. Run the server:
    ```
    npm start
    ```

4.2. Deployment
Heroku / Render / AWS:
Set environment variables in the hosting platform.
Deploy code via Git or Docker.
Run npm start or node index.js or pm2.

5. Testing & Test Cases
We use Jest + Supertest in test/ directory. Run:


npm run test
5.1. Test Summary
User Tests (01_user.test.js)
Logs in as superadmin (john@mac.com / 123456)
Creates a schooladmin user
Invalid credentials scenarios
School Tests (02_school.test.js)
Create, List, Get, Update, Delete schools (superadmin only)
Classroom Tests (03_classroom.test.js)
Create, List, Get, Update, Delete classrooms
Optional student enrollment in a classroom
Student Tests (04_student.test.js)
Create, List, Get, Update, Delete students
Transfer student (superadmin only)
See the test/ folder for complete details and sample outputs.

6. Authentication Flow
Login: POST /api/user/login => returns token.
Use token in token header for all subsequent requests:
http

token: <JWT_TOKEN_HERE>
RBAC checks role:
superadmin => full system access
schooladmin => limited to their schoolId
7. Error Codes & Handling
401 Unauthorized: Missing/invalid token
403 Forbidden: Valid token but lacking the required role or school matching
400 Bad Request: Validation errors or missing fields
404 Not Found: Entity not found
429 Too Many Requests: Rate limiter triggered
The dynamic route wraps responses in:


{
  "ok": true/false,
  "data": {...} or "errors": "some error"
}



