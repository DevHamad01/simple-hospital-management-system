# 🏥 Simple Hospital Management System

A **simple web-based Hospital Management System (HMS)** developed as an **academic and demonstration project**.
This system is designed to manage basic hospital operations using **HTML, CSS, and Vanilla JavaScript**, with **LocalStorage** used for data persistence.

The project focuses on **clarity, simplicity, and complete functionality**, without using any backend server or database.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access

* Login system with username and password
* Role-based dashboards for:

  * Admin
  * Doctor
  * Receptionist
  * Patient

### 🧍 Patient Management (Receptionist)

* Register new patients
* View, update, and search patient records
* Store basic medical history

### 👨‍⚕️ Doctor Management (Admin)

* Add, edit, and view doctors
* Manage doctor specialization
* Track doctor availability (Available / Not Available)

### 📅 Appointment Scheduling (Receptionist)

* Book appointments for patients
* Only available doctors can be selected
* Appointment status tracking (Pending / Completed)

### 🩺 Doctor Consultation (Doctor)

* View assigned appointments
* Enter diagnosis and prescription
* Save consultation history linked to patient records

### 📄 Discharge Summary

* Generate simple discharge summaries
* Includes patient info, diagnosis, treatment, and doctor remarks
* View and download discharge summary

### 💰 Billing System

* Generate patient invoices
* Consultation fee and basic charges
* Invoice linked with patient record
* Print / download invoice

### 📊 Reports (Admin)

* Daily and monthly reports
* Number of patients
* Appointments summary
* Billing summary

### 🔮 Future Scope

* SMS and Email appointment reminders (mentioned only)

---

## 🛠️ Technology Stack

* HTML5
* CSS3
* JavaScript (Vanilla)
* Browser LocalStorage (for data persistence)

---

## 📁 Project Structure

```
/hms
 ├── index.html
 ├── styles.css
 ├── app.js
 ├── data.js
 ├── auth.js
 ├── dashboards.js
 ├── patient-management.js
 ├── doctor-management.js
 ├── appointment-scheduling.js
 ├── consultation.js
 ├── discharge-summary.js
 ├── billing.js
 ├── reports.js
 └── utils.js
```

---

## ▶️ How to Run the Project

1. Download or clone the repository
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox)
3. Use demo login credentials to access the system

---

## 🔑 Demo Login Credentials

| Role         | Username      | Password   |
| ------------ | ------------- | ---------- |
| Admin        | admin         | admin123   |
| Doctor       | doctor1       | doctor123  |
| Receptionist | receptionist1 | recep123   |
| Patient      | patient1      | patient123 |

---

## ⚠️ Important Note

This project uses **LocalStorage**, which means:

* Data is stored only in the browser
* Clearing browser data will remove all records
* No backend or database is used

This system is intended **only for academic, learning, and prototype purposes**.
For real-world hospital usage, a backend server and database would be required.

---

## 🎯 Project Purpose

* Practice frontend web development
* Understand hospital workflow
* Implement role-based systems
* Build a complete CRUD-based web application

---

## 📌 License

This project is created for **educational purposes** only.
