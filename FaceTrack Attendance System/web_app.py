import os
import json
import hashlib
import pandas as pd
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import openpyxl
from openpyxl import Workbook
import base64
import numpy as np
import cv2
from io import BytesIO
from utils import hash_password, verify_password

# Define file paths
USERS_FILE = 'users.json'
ATTENDANCE_FILE = 'attendance.xlsx'
STUDENTS_FILE = 'students.json'
KNOWN_FACES_DIR = 'known_faces'

# Create Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Ensure directories exist
if not os.path.exists('students'):
    os.makedirs('students')

# Ensure students.json exists
if not os.path.exists(STUDENTS_FILE):
    with open(STUDENTS_FILE, 'w') as f:
        json.dump({
            "1": "John Doe",
            "2": "Jane Smith",
            "3": "Michael Johnson"
        }, f)

# Ensure users.json exists with default admin user
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        # Default admin user with password 'admin'
        json.dump({
            'admin': hash_password('admin').decode('utf-8')
        }, f)

# Ensure known_faces directory exists
if not os.path.exists(KNOWN_FACES_DIR):
    os.makedirs(KNOWN_FACES_DIR)

# Ensure attendance.xlsx exists with headers
if not os.path.exists(ATTENDANCE_FILE):
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    if sheet is not None:
        sheet.append(["Name", "Date", "Time"])
    workbook.save(ATTENDANCE_FILE)

# Helper functions
def process_image(base64_image):
    # Remove the data URL prefix if present
    if ',' in base64_image:
        base64_image = base64_image.split(',')[1]
    
    # Decode base64 image
    image_data = base64.b64decode(base64_image)
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def get_student_name(student_id=None):
    try:
        with open(STUDENTS_FILE, 'r') as f:
            students = json.load(f)
            if student_id and student_id in students:
                return students[student_id]
            elif students:
                # Return a random student for demo purposes
                import random
                student_id = random.choice(list(students.keys()))
                return students[student_id]
    except Exception as e:
        print(f"Error getting student name: {e}")
    return None

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
        
        if username in users and verify_password(password, users[username].encode('utf-8')):
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
        
        if username in users:
            flash('Username already exists', 'error')
        else:
            users[username] = hash_password(password).decode('utf-8')
            with open(USERS_FILE, 'w') as f:
                json.dump(users, f)
            flash('Registration successful', 'success')
            return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/face_attendance')
def face_attendance():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    # Get recent attendance records
    attendance_records = []
    try:
        if os.path.exists(ATTENDANCE_FILE):
            df = pd.read_excel(ATTENDANCE_FILE)
            # Sort by date and time (most recent first)
            df = df.sort_values(by=['Date', 'Time'], ascending=[False, False])
            # Get the 10 most recent records
            recent_records = df.head(10).to_dict('records')
            attendance_records = recent_records
    except Exception as e:
        flash(f'Error loading attendance records: {str(e)}', 'error')
    
    return render_template('face_attendance.html', attendance_records=attendance_records, username=session['username'])

@app.route('/kiosk')
def kiosk():
    if 'username' not in session:
        return redirect(url_for('index'))
    students = {}
    present_names = set()
    try:
        if os.path.exists(STUDENTS_FILE):
            with open(STUDENTS_FILE, 'r') as f:
                students = json.load(f)
        today = datetime.now().strftime("%Y-%m-%d")
        if os.path.exists(ATTENDANCE_FILE):
            df = pd.read_excel(ATTENDANCE_FILE)
            today_df = df[df['Date'].astype(str) == today]
            present_names = set(today_df['Name'].astype(str).str.strip().tolist())
    except Exception as e:
        flash(f'Error loading kiosk data: {str(e)}', 'error')
    return render_template('kiosk.html', students=students, present_names=present_names, username=session['username'])


@app.route('/attendance')
def attendance():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    attendance_records = []
    absent_records = []
    
    try:
        # Load all students
        all_students = {}
        if os.path.exists(STUDENTS_FILE):
            with open(STUDENTS_FILE, 'r') as f:
                all_students = json.load(f)
        
        today = datetime.now().strftime("%Y-%m-%d")
        present_names = set()
        
        if os.path.exists(ATTENDANCE_FILE):
            df = pd.read_excel(ATTENDANCE_FILE)
            # Filter today's records
            today_df = df[df['Date'].astype(str) == today]
            records = today_df.to_dict('records')
            for r in records:
                r['student_id'] = r.get('Name', 'N/A')
                r['name'] = r.get('Name', 'N/A')
                r['time'] = r.get('Time', 'N/A')
                r['status'] = r.get('Status', 'Present')
                present_names.add(str(r['name']).strip())
            attendance_records = records
        
        # Build absent list from students not present today
        for sid, sname in all_students.items():
            if sname not in present_names:
                absent_records.append({'student_id': sid, 'name': sname})
                
    except Exception as e:
        flash(f'Error loading attendance: {str(e)}', 'error')
        
    return render_template('attendance.html', attendance_records=attendance_records, 
                           absent_records=absent_records, username=session['username'])


@app.route('/students')
def students():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    students_list = {}
    try:
        if os.path.exists(STUDENTS_FILE):
            with open(STUDENTS_FILE, 'r') as f:
                students_list = json.load(f)
    except Exception as e:
        flash(f'Error loading students: {str(e)}', 'error')
        
    # Map students for display
    student_records = []
    for sid, name in students_list.items():
        student_records.append({'id': sid, 'name': name})
        
    return render_template('students.html', students=student_records, username=session['username'])

@app.route('/export', methods=['GET', 'POST'])
def export():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        start_date = request.form.get('start_date')
        end_date = request.form.get('end_date')
        
        try:
            if os.path.exists(ATTENDANCE_FILE):
                df = pd.read_excel(ATTENDANCE_FILE)
                # Filter by date range
                df['Date'] = pd.to_datetime(df['Date'])
                mask = (df['Date'] >= start_date) & (df['Date'] <= end_date)
                filtered_df = df.loc[mask]
                
                export_path = 'students/attendance_export.csv'
                filtered_df.to_csv(export_path, index=False)
                return render_template('export.html', username=session['username'], download_link='/'+export_path)
            else:
                flash('No attendance records to export', 'error')
        except Exception as e:
            flash(f'Export error: {str(e)}', 'error')
            
    return render_template('export.html', username=session['username'])

@app.route('/students/attendance_export.csv')
def download_export():
    from flask import send_file
    return send_file('students/attendance_export.csv', as_attachment=True)

@app.route('/recognize_face', methods=['POST'])
def recognize_face():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'success': False, 'message': 'No image data provided'})
        
        # Process the image
        image_data = data['image']
        
        # In a real implementation, we would use face_recognition here
        # For now, we'll simulate recognition with student data
        
        # Get a random student for demonstration
        student_name = get_student_name()
        if student_name:
            return jsonify({
                'recognized': True,
                'name': student_name
            })
        else:
            return jsonify({
                'recognized': False,
                'message': 'No students registered in the system'
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/mark_attendance', methods=['GET', 'POST'])
def mark_attendance():
    if 'username' not in session:
        if request.is_json:
            return jsonify({'success': False, 'message': 'Not authenticated'})
        return redirect(url_for('index'))
    
    try:
        name = None
        if request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                name = data.get('name')
            else:
                name = request.form.get('student_id') # Template uses student_id field for name/ID
        
        if not name:
            if request.is_json:
                return jsonify({'success': False, 'message': 'No name/ID provided'})
            flash('No student identity provided', 'error')
            return redirect(url_for('attendance'))
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%I:%M %p")
        
        from datetime import time as dt_time
        current_time = now.time()
        
        if current_time < dt_time(7, 0):
            if request.is_json:
                return jsonify({'success': False, 'message': 'Attendance starts at 7:00 AM'})
            flash('Attendance starts at 7:00 AM', 'error')
            return redirect(url_for('attendance'))
            
        if current_time > dt_time(8, 30):
            if request.is_json:
                return jsonify({'success': False, 'message': 'Attendance closed after 8:30 AM'})
            flash('Attendance is closed for today', 'error')
            return redirect(url_for('attendance'))

        status_val = "Late" if current_time >= dt_time(8, 0) else "Present"
        
        # Check if attendance file exists
        if not os.path.exists(ATTENDANCE_FILE):
            wb = Workbook()
            ws = wb.active
            if ws is not None:
                ws.append(["Name", "Date", "Time", "Status"])
            wb.save(ATTENDANCE_FILE)
        
        # Read existing attendance data
        df = pd.read_excel(ATTENDANCE_FILE)
        
        # Check if person already marked attendance today
        same_day_records = df[(df["Name"].astype(str).str.strip() == name.strip()) & (df["Date"] == date)]
        if not same_day_records.empty:
            return jsonify({
                'success': False,
                'message': 'Attendance already marked for today'
            })
        
        # Add new attendance record
        new_record = pd.DataFrame({"Name": [name], "Date": [date], "Time": [time_str], "Status": [status_val]})
        df = pd.concat([df, new_record], ignore_index=True)
        
        # Save updated attendance data
        df.to_excel(ATTENDANCE_FILE, index=False)
        
        if request.is_json:
            return jsonify({
                'success': True,
                'name': name,
                'date': date,
                'time': time_str,
                'status': status_val,
                'message': 'Attendance marked successfully'
            })
        
        flash(f'Attendance marked for {name}', 'success')
        return redirect(url_for('attendance'))
        
    except Exception as e:
        if request.is_json:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
        flash(f'Error marking attendance: {str(e)}', 'error')
        return redirect(url_for('attendance'))

@app.route('/add_student', methods=['POST'])
def add_student():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    student_id = request.form.get('student_id')
    name = request.form.get('name')
    
    if student_id and name:
        try:
            with open(STUDENTS_FILE, 'r+') as f:
                students = json.load(f)
                students[student_id] = name
                f.seek(0)
                json.dump(students, f, indent=4)
                f.truncate()
            flash(f'Student {name} added successfully', 'success')
        except Exception as e:
            flash(f'Error adding student: {str(e)}', 'error')
    
    return redirect(url_for('students'))

@app.route('/edit_student', methods=['POST'])
def edit_student():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    student_id = request.form.get('student_id')
    name = request.form.get('name')
    
    if student_id and name:
        try:
            with open(STUDENTS_FILE, 'r+') as f:
                students = json.load(f)
                if student_id in students:
                    students[student_id] = name
                    f.seek(0)
                    json.dump(students, f, indent=4)
                    f.truncate()
                    flash(f'Student {student_id} updated', 'success')
                else:
                    flash('Student not found', 'error')
        except Exception as e:
            flash(f'Error editing student: {str(e)}', 'error')
            
    return redirect(url_for('students'))

@app.route('/delete_student/<id>')
def delete_student(id):
    if 'username' not in session:
        return redirect(url_for('index'))
    
    try:
        with open(STUDENTS_FILE, 'r+') as f:
            students = json.load(f)
            if id in students:
                name = students.pop(id)
                f.seek(0)
                json.dump(students, f, indent=4)
                f.truncate()
                flash(f'Student {name} deleted', 'success')
            else:
                flash('Student not found', 'error')
    except Exception as e:
        flash(f'Error deleting student: {str(e)}', 'error')
        
    return redirect(url_for('students'))

@app.route('/register_student')
def register_student():
    return redirect(url_for('students')) # Redirect to combined management page

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    # Initialize stats
    stats = {
        'total_students': 0,
        'total_attendance': 0,
        'attendance_today': 0,
        'attendance_rate': 0
    }
    
    # Chart data
    chart_data = {
        'labels': [],
        'attendance_counts': []
    }
    
    # Get total students
    try:
        with open(STUDENTS_FILE, 'r') as f:
            students = json.load(f)
            stats['total_students'] = len(students)
    except Exception as e:
        flash(f'Error loading students: {str(e)}', 'error')
    
    # Get attendance data
    try:
        if os.path.exists(ATTENDANCE_FILE):
            df = pd.read_excel(ATTENDANCE_FILE)
            stats['total_attendance'] = len(df)
            
            # Today's attendance
            today = datetime.now().strftime("%Y-%m-%d")
            today_df = df[df['Date'] == today]
            stats['attendance_today'] = len(today_df)
            
            # Attendance rate (if students exist)
            if stats['total_students'] > 0:
                stats['attendance_rate'] = round((stats['attendance_today'] / stats['total_students']) * 100)
            
            # Weekly data (Last 7 days)
            weekly_data = {'labels': [], 'counts': []}
            for i in range(6, -1, -1):
                target_date = datetime.now() - pd.Timedelta(days=i)
                date_label = target_date.strftime("%b %d")
                date_query = target_date.strftime("%Y-%m-%d")
                weekly_data['labels'].append(date_label)
                day_count = len(df[df['Date'] == date_query])
                weekly_data['counts'].append(day_count)
            
            # Monthly data (Last 30 days)
            monthly_data = {'labels': [], 'counts': []}
            for i in range(29, -1, -1):
                target_date = datetime.now() - pd.Timedelta(days=i)
                date_label = target_date.strftime("%b %d")
                date_query = target_date.strftime("%Y-%m-%d")
                monthly_data['labels'].append(date_label)
                day_count = len(df[df['Date'] == date_query])
                monthly_data['counts'].append(day_count)

            # Set default chart data to weekly
            chart_data = {
                'labels': weekly_data['labels'],
                'attendance_counts': weekly_data['counts']
            }
    except Exception as e:
        flash(f'Error processing attendance data: {str(e)}', 'error')
        weekly_data = {'labels': [], 'counts': []}
        monthly_data = {'labels': [], 'counts': []}
    
    # Calculate additional stats needed by the dashboard template
    total_students = stats['total_students']
    present_today = stats['attendance_today']
    
    # Compute late and on-time from today's records
    late_today = 0
    try:
        if os.path.exists(ATTENDANCE_FILE):
            df_tmp = pd.read_excel(ATTENDANCE_FILE)
            today = datetime.now().strftime("%Y-%m-%d")
            today_df = df_tmp[df_tmp['Date'].astype(str) == today]
            if 'Status' in today_df.columns:
                late_today = int((today_df['Status'].astype(str).str.lower() == 'late').sum())
    except:
        pass
    
    absent_today = total_students - present_today if total_students > 0 else 0
    
    present_percentage = round((present_today / total_students) * 100) if total_students > 0 else 0
    absent_percentage = round((absent_today / total_students) * 100) if total_students > 0 else 0
    avg_attendance = stats['attendance_rate']
    
    # Get current date for display
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Prepare data for dashboard.html
    recent_activity = []
    try:
        if os.path.exists(ATTENDANCE_FILE):
            df = pd.read_excel(ATTENDANCE_FILE)
            # Most recent 5
            last_5 = df.tail(5).to_dict('records')
            for r in last_5:
                recent_activity.append({
                    'student_id': r.get('Name', 'N/A'),
                    'name': r.get('Name', 'N/A'),
                    'status': str(r.get('Status', 'Present')).lower(),
                    'time': r.get('Time', 'N/A'),
                    'date': r.get('Date', 'N/A')
                })
    except:
        pass

    return render_template('dashboard.html', 
                          username=session['username'], 
                          stats=stats, 
                          chart_data=chart_data,
                          weekly_data=weekly_data,
                          monthly_data=monthly_data,
                          dates=chart_data['labels'],
                          attendance_counts=chart_data['attendance_counts'],
                          total_students=total_students,
                          present_today=present_today,
                          late_today=late_today,
                          absent_today=absent_today,
                          present_percentage=present_percentage,
                          absent_percentage=absent_percentage,
                          avg_attendance=avg_attendance,
                          current_date=current_date,
                          recent_activity=recent_activity)

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    print("Starting Face Attendance System...")
    print("Server will be available at: http://localhost:5001")
    try:
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")