# Facial Recognition Attendance System

A secure facial recognition-based attendance system using Python, OpenCV, and the face_recognition library. The system detects faces via webcam, authenticates users through a login interface, and records attendance in an Excel file.

## Features

- **Login Authentication**
  - Secure login with password hashing
  - User registration functionality
  - Session management

- **Face Detection & Recognition**
  - Real-time face detection using OpenCV
  - Face recognition using the face_recognition library
  - Visual feedback with bounding boxes and names

- **Attendance Logging**
  - Automatic attendance recording in Excel format
  - Prevents duplicate entries for the same day
  - Attendance summary display

## Installation

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Add face images to the `known_faces` folder:
   - Each image should contain one clear face
   - Name the image file with the person's name (e.g., `John.jpg`)

## Usage

1. Run the attendance system:
   ```
   python attendance_system.py
   ```

2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

3. Register new users through the registration link on the login screen

4. Using the attendance system:
   - Click "Start Camera" to activate your webcam
   - Click "Start Recognition" to begin face recognition
   - Recognized faces will be labeled and attendance will be logged automatically
   - View attendance summary in the right panel
   - Click "Refresh" to update the attendance summary

## Project Structure

- `attendance_system.py` - Main application script
- `login.py` - Login authentication system
- `utils.py` - Helper functions for face encoding and Excel handling
- `known_faces/` - Directory for storing face images
- `attendance.xlsx` - Excel file for attendance records
- `users.json` - User credentials database (created on first run)

## Security Features

- Password hashing using bcrypt
- Session management with logout functionality
- Secure user authentication

## Requirements

- Python 3.6+
- OpenCV
- face_recognition
- numpy
- pandas
- openpyxl
- Pillow
- tkinter
- bcrypt