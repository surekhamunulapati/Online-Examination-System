# Online Examination System

## 📌 Project Overview

The **Online Examination System** is a web-based application developed to conduct examinations online. It allows examiners to create and manage exams and enables candidates to view available exams and participate in online examinations.

The project is designed to simplify the examination process by reducing manual work and providing a user-friendly platform for conducting assessments.

## 🚀 Features

### Examiner

* Register and login securely
* Create online examinations
* Add examination details
* Manage examination questions
* View and manage available exams

### Candidate

* Register and login
* View available examinations
* Attend online examinations
* Submit answers
* View examination results

## 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript
* React.js

### Backend

* Java
* Spring Boot
* Spring Data JPA

### Database

* MySQL

### Tools

* IntelliJ IDEA / Eclipse
* VS Code
* Postman
* MySQL Workbench
* Maven
* Git & GitHub

## 🏗️ Project Architecture

```text
React.js Frontend
        |
        | REST API
        ↓
Spring Boot Backend
        |
        | JPA
        ↓
     MySQL Database
```

## 📂 Project Structure

```text
Online-Examination-System/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
└── README.md
```

## 🔑 Main Modules

### Authentication Module

Provides registration and login functionality for both examiners and candidates.

```text
POST /api/auth/register
POST /api/auth/login
```

### Examiner Module

Allows examiners to create and manage examinations.

```text
POST /api/examiner/create-exam
```

### Candidate Module

Allows candidates to view available examinations.

```text
GET /api/candidate/available-exams
```

## ⚙️ How to Run the Project

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Online-Examination-System
```

### 2. Configure MySQL

Create a MySQL database:

```sql
CREATE DATABASE online_exam;
```

Update the database configuration in the Spring Boot `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/online_exam
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. Run the Backend

```bash
mvn spring-boot:run
```

The backend will start on:

```text
http://localhost:8080
```

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The React application will normally be available at:

```text
http://localhost:5173
```

## 🧪 API Testing

APIs can be tested using **Postman** or **Swagger UI**.

```text
POST /api/auth/register
POST /api/auth/login
POST /api/examiner/create-exam
GET  /api/candidate/available-exams
```

## 📸 Application Screens

Add screenshots of your application here.

```text
screenshots/
├── login.png
├── registration.png
├── examiner-dashboard.png
├── create-exam.png
├── candidate-dashboard.png
└── available-exams.png
```

## 🎯 Future Enhancements

* Timer-based examinations
* Automatic result calculation
* Exam history
* Role-based authorization
* Email notifications
* Admin dashboard
* Question bank management
* Performance analytics

## 👩‍💻 Author

**T. Surekha**

Java Full Stack Developer

### Skills Used

`Java` `Spring Boot` `React.js` `MySQL` `JPA` `HTML` `CSS` `JavaScript` `Git` `GitHub`
