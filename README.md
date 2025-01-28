# School Management System API (Axion-based)

## 1. Project Overview

This School Management System provides:

- RBAC (Role-Based Access Control) with JWT tokens  
- CRUD operations for Schools, Classrooms, Students  
- Capacity/Resource management for classrooms  
- Enrollment & Transfer logic for students  
- User management for login and role assignment (superadmin/schooladmin)  

**Tech Stack**  
- Node.js + Express (using Axion’s dynamic route pattern)  
- MongoDB + Mongoose  
- JSON Web Tokens (JWT) + Bcrypt (for auth)  
- Jest + Supertest (for testing)  
- Rate limiting (express-rate-limit) + Helmet (basic security)  

## 2. API Endpoint Specifications

All requests are made to paths like:
```
POST /api/:moduleName/:fnName
```
The following modules are defined:

- user (createUser, login)
- school (createSchool, listSchools, getSchool, updateSchool, deleteSchool)
- classroom (createClassroom, listClassrooms, getClassroom, updateClassroom, deleteClassroom, enrollStudentInClassroom [optional])
- student (createStudent, listStudents, getStudent, updateStudent, deleteStudent, transferStudent)

## Authorization Header
Axion’s approach uses a token header for JWT, rather than Authorization. Example:

```
token: <JWT_STRING>
```

## 3. Request/Response Formats
Below is a detailed breakdown of each endpoint, including sample request body and response.

Note: Some endpoints require a superadmin token, while others allow a schooladmin token for their assigned schoolId.

### 3.1. User Endpoints
A) Create User
- Method: POST
- URL: /api/user/createUser
- Role Required: superadmin

Request Body:
```
{
  "username": "some_admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "schooladmin",
  "schoolId": "64bbf1b0e3f..."
}
```
(If role = schooladmin, pass schoolId; otherwise omit for superadmin)

Sample Response (Success):
```
{
  "ok": true,
  "data": {
    "user": {
      "_id": "64bbfcd2...",
      "username": "some_admin",
      "email": "admin@example.com",
      "role": "schooladmin",
      "schoolId": "64bbf1b0e3f..."
    },
    "token": "LONG_JWT_TOKEN"
  }
}
```
Sample Response (Error):

```
{
  "ok": false,
  "code": 403,
  "errors": "Forbidden - only superadmin can create user"
}
```

B) Login
- Method: POST
- URL: /api/user/login

Request Body:

    {
    "email": "john@mac.com",
    "password": "123456"
    }

Sample Response (Success):
```
{
  "ok": true,
  "data": {
    "token": "LONG_JWT_TOKEN",
    "user": {
      "_id": "64bbfcd2...",
      "username": "john_admin",
      "role": "superadmin",
      "schoolId": null
    }
  }
}
```

Sample Response (Error):
```
{
  "ok": false,
  "code": 401,
  "errors": "Invalid credentials"
}
```

### 3.2. School Endpoints (Superadmin only)

A) Create School
- Method: POST
- URL: /api/school/createSchool
- Role Required: superadmin

Request Body:
```
{
  "name": "Global High",
  "address": "1234 Main St",
  "phone": "555-1234",
  "principal": "Jane Doe"
}
```

Response (Success):
```
{
  "ok": true,
  "data": {
    "_id": "64bbfcd2...",
    "name": "Global High",
    "address": "1234 Main St",
    ...
  }
}
```

B) List Schools
- Method: GET
- URL: /api/school/listSchools
- Role Required: superadmin

Response:
```
{
  "ok": true,
  "data": [
    {
      "_id": "64bbfcd2...",
      "name": "Global High",
      ...
    }
  ]
}
```
C) Get School
- Method: GET
- URL: /api/school/getSchool
- Role Required: superadmin

Request Body:
```
{
  "schoolId": "64bbfcd2..."
}
```

Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bbfcd2...",
    "name": "Global High",
    ...
  }
}
```

D) Update School
- Method: PUT
- URL: /api/school/updateSchool
- Role Required: superadmin

Request Body:
```
{
  "schoolId": "64bbfcd2...",
  "phone": "555-9999",
  "staffCount": 50
}
```

Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bbfcd2...",
    "name": "Global High",
    "phone": "555-9999",
    "staffCount": 50,
    ...
  }
}
```

E) Delete School
- Method: DELETE
- URL: /api/school/deleteSchool
- Role Required: superadmin

Request Body:
```
{
  "schoolId": "64bbfcd2..."
}
```
Response:
```
{
  "ok": true,
  "data": {
    "message": "School 'Global High' deleted."
  }
}
```
### 3.3. Classroom Endpoints (Superadmin or Schooladmin for that school)

A) Create Classroom
- Method: POST
- URL: /api/classroom/createClassroom

Request Body:
```
{
  "schoolId": "64bbfe12...",
  "name": "Physics Lab",
  "capacity": 40,
  "isLab": true,
  "resources": ["Projector", "Microscope"]
}
```
Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc0e34...",
    "schoolId": "64bbfe12...",
    "name": "Physics Lab",
    "capacity": 40,
    "isLab": true,
    "resources": ["Projector", "Microscope"]
  }
}
```

B) List Classrooms
- Method: GET
- URL: /api/classroom/listClassrooms

Request Body:
```
{
  "schoolId": "64bbfe12..."
}
```

Response:
```
{
  "ok": true,
  "data": [
    {
      "_id": "64bc0e34...",
      "name": "Physics Lab",
      ...
    }
  ]
}
```

C) Get Classroom
- Method: GET
- URL: /api/classroom/getClassroom

Request Body:
```
{
  "classroomId": "64bc0e34...",
  "schoolId": "64bbfe12..."
}
```

Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc0e34...",
    "name": "Physics Lab",
    ...
  }
}
```

D) Update Classroom
- Method: PUT
- URL: /api/classroom/updateClassroom

Request Body:
```
{
  "classroomId": "64bc0e34...",
  "schoolId": "64bbfe12...",
  "capacity": 45
}
```

Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc0e34...",
    "capacity": 45,
    ...
  }
}
```

E) Delete Classroom
- Method: DELETE
- URL: /api/classroom/deleteClassroom
- Request Body:

```
{
  "classroomId": "64bc0e34...",
  "schoolId": "64bbfe12..."
}
```

Response:
```
{
  "ok": true,
  "data": {
    "message": "Classroom 'Physics Lab' deleted."
  }
}
```

F) Enroll Student in Classroom (Optional)
Method: POST
URL: /api/classroom/enrollStudentInClassroom
Request Body:
```
{
  "classroomId": "64bc0e34...",
  "schoolId": "64bbfe12...",
  "studentId": "64bbfedc..."
}
```

Response:
```
{
  "ok": true,
  "data": {
    "message": "Student enrolled in classroom 'Physics Lab'."
  }
}
```

### 3.4. Student Endpoints (Superadmin or matching schooladmin)
A) Create Student
- Method: POST
- URL: /api/student/createStudent

Request Body:

```
{
  "schoolId": "64bbfe12...",
  "firstName": "Alice",
  "lastName": "Doe",
  "email": "alice@abc.com",
  "gradeLevel": "10th"
}
```
Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc2f00...",
    "schoolId": "64bbfe12...",
    "firstName": "Alice",
    "lastName": "Doe",
    ...
  }
}
```

B) List Students
- Method: GET
- URL: /api/student/listStudents

Request Body:
```
{
  "schoolId": "64bbfe12..."
}
```

Response:
```
{
  "ok": true,
  "data": [
    {
      "_id": "64bc2f00...",
      "firstName": "Alice",
      ...
    }
  ]
}
```
C) Get Student
- Method: GET
- URL: /api/student/getStudent
Request Body:
```
{
  "studentId": "64bc2f00...",
  "schoolId": "64bbfe12..."
}
```

Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc2f00...",
    "firstName": "Alice",
    ...
  }
}
```
D) Update Student
- Method: PUT
- URL: /api/student/updateStudent
Request Body:
```
{
  "studentId": "64bc2f00...",
  "schoolId": "64bbfe12...",
  "phone": "555-9999"
}
```
Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc2f00...",
    "phone": "555-9999",
    ...
  }
}
```
E) Delete Student
- Method: DELETE
- URL: /api/student/deleteStudent

Request Body:
```
{
  "studentId": "64bc2f00...",
  "schoolId": "64bbfe12..."
}
```
Response:
```
{
  "ok": true,
  "data": {
    "message": "Student 'Alice Doe' deleted"
  }
}
```
F) Transfer Student (superadmin only)
- Method: PATCH
- URL: /api/student/transferStudent
Request Body:
```
{
  "studentId": "64bc2f00...",
  "newSchoolId": "64bbfe98..."
}
```
Response:
```
{
  "ok": true,
  "data": {
    "_id": "64bc2f00...",
    "schoolId": "64bbfe98...",
    "enrollmentStatus": "transferred",
    ...
  }
}
```

## 4. Authentication Flow

1. **Login**  
   `POST /api/user/login` with the known credentials:
   - **Username:** `superadmin`
   - **Email:** `john@mac.com`
   - **Password:** `123456`

2. **Get the Token**  
   Retrieve the JWT token from the login response.

3. **Set Token**  
   Include the token in your request headers for subsequent API calls:


4. **RBAC Checks**  
Role-Based Access Control (RBAC) verifies your role in the JWT payload:

- **superadmin**: Can perform all actions.
- **schooladmin**: Limited to operations within their `schoolId`, such as `createClassroom`, `createStudent`, etc.

## 5. Error Codes and Handling

| Code | Meaning                             | Example                                     |
|------|-------------------------------------|---------------------------------------------|
| 400  | Bad Request / Validation Failed     | Missing required field                      |
| 401  | Unauthorized                        | No token or invalid token                   |
| 403  | Forbidden                           | Token is valid but role or school mismatch  |
| 404  | Not Found                           | School/Classroom/Student doesn’t exist      |
| 429  | Too Many Requests (rate-limiting)   | Rate limit triggered                        |

Error Response example:

```
{
  "ok": false,
  "code": 403,
  "errors": "Forbidden - only superadmin can create user"
}
```

Success Response example:
```
{
  "ok": true,
  "data": {
    // relevant object or message
  }
}
```
## 6. Test Cases and Results
We use Jest + Supertest. The tests are located in the test/ folder. Key test files:

    test/01_user.test.js:

- Logs in as superadmin (john@mac.com / 123456)
- Creates a new schooladmin user
- Checks invalid logins
```
test/02_school.test.js:
```
- Creates a school
- Lists all schools
- Gets a specific school
- Updates and deletes the school
```
test/03_classroom.test.js:
```
- Creates a classroom, lists, gets, updates, and deletes it
- (Optional) Enrolls a student to check capacity logic
```
test/04_student.test.js:
```

- Creates a student
- Lists, gets, updates, and deletes a student
- Transfers a student to another school (superadmin only)

### Running Tests
Ensure your server is running (npm start) or that your axion app can be imported in the tests.

### Run:
```
npm test
```
**Results:** The test suites will show passed or failed endpoints. If properly configured, you’ll see something like:
```
PASS  test/01_user.test.js
PASS  test/02_school.test.js
PASS  test/03_classroom.test.js
PASS  test/04_student.test.js
```

## 7. Deployment Instructions
### 7.1. Local Environment
**Clone the repository:**
```
git clone <YOUR_REPO_URL>
cd axion-school-api
```

**Install dependencies:**
```
npm install
```

**Environment Variables: Create a .env file:**

```
ENV=development
MONGO_URI=mongodb://localhost:27017/axion_school
LONG_TOKEN_SECRET=someLongSecret
SHORT_TOKEN_SECRET=someShortSecret
NACL_SECRET=someNaclSecret
USER_PORT=3000
SERVICE_NAME=school-api
```

**Seed or ensure a superadmin user exists with:**
```
Email: john@mac.com
Password: 123456 
```

**Run the application:**

```
npm start
```

or
```
node index.js
```

### 7.2. Production Deployment
**Hosting (e.g., Heroku, Render, AWS).**

Set environment variables (like MONGO_URI) in your hosting config.

Launch by running 

    npm start.

Make sure you have a superadmin user in the production DB.
Use the domain you configured (e.g., https://your-app.onrender.com/api/user/login) to test.
