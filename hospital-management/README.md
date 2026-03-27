# 🏥 Digital Hospital Management System (Streamlit v3.0)

A professional, high-performance, and aesthetically pleasing Hospital Management System built with **Python**, **Streamlit**, and **SQLite**. This application represents a full modernization of the original Tkinter-based system, featuring a responsive web interface, real-time analytics, and advanced reporting.
🚀 **Live App:**  
👉 [Click here to open]( https://hospital-management-o05p.onrender.com)
---

## ✨ Key Features

### 🚀 Modern Dashboard (Home)
- **Real-time Metrics**: Instantly view Total Patients, Active Doctors, and Today's Appointments.
- **Interactive UI**: Premium hover effects and scaling animations on feature cards.
- **Theme Support**: Seamlessly toggle between **Neon Dark Mode** and **Sleek Light Mode**.

### 👥 Patient & Doctor Management
- **Full CRUD Operations**: Add, search, update, and delete patient/doctor records.
- **Search Engine**: Robust filtering by Name, ID, Disease, or Specialty.
- **Admin Security**: Updates and deletions are protected by a secure admin login.

### 📅 Appointment System
- **Intelligent Booking**: Assign patients to doctors with specific dates.
- **Schedule Tracker**: View all upcoming appointments in an aesthetic, themed table.

### 💳 Financial & Billing Suite
- **Comprehensive Billing**: Generate detailed patient bills with consultation, medicine, and room charges.
- **Realized Profit Tracking**: Compare **Paid Revenue** against **Paid Salaries** to see actual liquid profit.
- **Payment Status**: Track "Paid" vs "Unpaid" status with various methods (Cash, Online, etc.).

### 📊 Advanced Reporting
- **Daily/Monthly Logs**: Generate full logs of admissions and appointments for any date range.
- **CSV Export**: Download any report or patient list as a CSV file for external use.

---

## 🛠️ Technical Stack
- **Frontend**: [Streamlit](https://streamlit.io/) (Web Framework)
- **Data Handling**: [Pandas](https://pandas.pydata.org/) (Data Analysis)
- **Database**: [SQLite](https://www.sqlite.org/) (Local Relational DB)
- **Styling**: Custom CSS injection for premium Glassmorphism and Neon effects.

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd "Digital hospital system"
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**:
   ```bash
   streamlit run app.py
   ```

---

## 🔐 Admin Access
To perform sensitive actions (Update/Delete):
- **Username**: Admin
- **Password**: `admin123` *(Enter in the sidebar to unlock management features)*

---

## 📂 Project Structure
```
Digital-hospital-system/
├── app.py              # Main Entry Point (Streamlit app)
├── st_components.py    # UI Modules & Dashboard Logic
├── database.py         # Database initialization & Migration logic
├── hospital.db         # SQLite Database (Auto-generated)
├── requirements.txt    # Project Dependencies
└── README.md           # This document
```

---

## 📝 Implementation Notes
- The system automatically handles **Database Migrations** (e.g., updating old schemas without data loss).
- All financial transactions are displayed in **Indian Rupees (₹)**.
- Input validation and robust error handling are integrated across all forms.

---

## ⚖️ License
This project is open-source and available under the **MIT License**.
