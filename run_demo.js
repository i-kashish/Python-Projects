const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Data storage files
const STUDENTS_FILE = path.join(__dirname, 'data', 'students.json');
const TEACHERS_FILE = path.join(__dirname, 'data', 'teachers.json');
const ATTENDANCE_FILE = path.join(__dirname, 'data', 'attendance.json');
const FEES_FILE = path.join(__dirname, 'data', 'fees.json');
const GRADES_FILE = path.join(__dirname, 'data', 'grades.json');
const TEACHER_ENTRIES_FILE = path.join(__dirname, 'data', 'teacher_entries.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  const defaultStudents = [
    { id: 'S001', name: 'John Doe', class: '10A', email: 'john.doe@example.com', phone: '+91-9876543210', address: 'Delhi', guardianName: 'Mr. Robert Doe', guardianPhone: '+91-9876543211', dateOfBirth: '2005-03-15', admissionDate: '2023-04-01' },
    { id: 'S002', name: 'Jane Smith', class: '10B', email: 'jane.smith@example.com', phone: '+91-9876543212', address: 'Mumbai', guardianName: 'Mrs. Mary Smith', guardianPhone: '+91-9876543213', dateOfBirth: '2005-07-22', admissionDate: '2023-04-01' },
    { id: 'S003', name: 'Bob Johnson', class: '9A', email: 'bob.johnson@example.com', phone: '+91-9876543214', address: 'Bangalore', guardianName: 'Mr. William Johnson', guardianPhone: '+91-9876543215', dateOfBirth: '2006-01-10', admissionDate: '2023-04-01' }
  ];

  const defaultTeachers = [
    { id: 'T001', name: 'Alice Williams', subject: 'Mathematics', email: 'alice.williams@example.com', phone: '+91-9876543220', address: 'Chennai', qualification: 'M.Sc Mathematics', experience: '8 years', salary: 75000, joiningDate: '2020-06-15', qrCode: 'TEACH001ALICE' },
    { id: 'T002', name: 'David Brown', subject: 'Science', email: 'david.brown@example.com', phone: '+91-9876543221', address: 'Kolkata', qualification: 'M.Sc Physics', experience: '12 years', salary: 85000, joiningDate: '2018-04-01', qrCode: 'TEACH002DAVID' }
  ];

  const defaultFees = [
    { id: 'F001', studentId: 'S001', studentName: 'John Doe', feeType: 'Tuition Fee', amount: 35000, dueDate: '2023-05-10', status: 'Paid', paymentDate: '2023-05-05' },
    { id: 'F002', studentId: 'S002', studentName: 'Jane Smith', feeType: 'Tuition Fee', amount: 35000, dueDate: '2023-05-10', status: 'Pending', paymentDate: null },
    { id: 'F003', studentId: 'S003', studentName: 'Bob Johnson', feeType: 'Library Fee', amount: 3500, dueDate: '2023-04-15', status: 'Overdue', paymentDate: null }
  ];

  const defaultGrades = [
    { id: 'G001', studentId: 'S001', studentName: 'John Doe', subject: 'Mathematics', exam: 'Mid Term', marks: 85, totalMarks: 100, grade: 'A', date: '2023-04-20' },
    { id: 'G002', studentId: 'S002', studentName: 'Jane Smith', subject: 'Mathematics', exam: 'Mid Term', marks: 92, totalMarks: 100, grade: 'A+', date: '2023-04-20' }
  ];

  const defaultAttendance = [
    { id: 'A001', studentId: 'S001', studentName: 'John Doe', class: '10A', date: '2023-05-15', status: 'Present', time: '08:30' },
    { id: 'A002', studentId: 'S002', studentName: 'Jane Smith', class: '10B', date: '2023-05-15', status: 'Present', time: '08:35' },
    { id: 'A003', studentId: 'S003', studentName: 'Bob Johnson', class: '9A', date: '2023-05-15', status: 'Late', time: '09:05' }
  ];

  const defaultTeacherEntries = [
    { id: 'TE001', teacherId: 'T001', teacherName: 'Alice Williams', date: '2023-05-15', entryTime: '07:45', exitTime: '15:30', status: 'Present' },
    { id: 'TE002', teacherId: 'T002', teacherName: 'David Brown', date: '2023-05-15', entryTime: '08:00', exitTime: '15:45', status: 'Present' }
  ];

  if (!fs.existsSync(STUDENTS_FILE)) {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(defaultStudents, null, 2));
  }
  if (!fs.existsSync(TEACHERS_FILE)) {
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(defaultTeachers, null, 2));
  }
  if (!fs.existsSync(FEES_FILE)) {
    fs.writeFileSync(FEES_FILE, JSON.stringify(defaultFees, null, 2));
  }
  if (!fs.existsSync(GRADES_FILE)) {
    fs.writeFileSync(GRADES_FILE, JSON.stringify(defaultGrades, null, 2));
  }
  if (!fs.existsSync(ATTENDANCE_FILE)) {
    fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(defaultAttendance, null, 2));
  }
  if (!fs.existsSync(TEACHER_ENTRIES_FILE)) {
    fs.writeFileSync(TEACHER_ENTRIES_FILE, JSON.stringify(defaultTeacherEntries, null, 2));
  }
};

// Initialize data files on startup
initializeDataFiles();

// Helper functions for data operations
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Generate unique ID
const generateId = (prefix) => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve the demo HTML page
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(demoHTML);
    return;
  }

  // Handle API requests
  if (pathname.startsWith('/api/')) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        handleApiRequest(req, res, pathname, method, data, parsedUrl.query);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Default response for other requests
  res.writeHead(404);
  res.end('Not found');
});

const handleApiRequest = (req, res, pathname, method, data, query) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Authentication
    if (pathname === '/api/auth/login' && method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        token: 'demo-token',
        user: {
          _id: '1',
          name: 'Admin User',
          email: data.email || 'admin@example.com',
          role: 'admin'
        }
      }));
      return;
    }

    // Students API
    if (pathname === '/api/students' && method === 'GET') {
      const students = readJsonFile(STUDENTS_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: students }));
      return;
    }

    if (pathname === '/api/students' && method === 'POST') {
      const students = readJsonFile(STUDENTS_FILE);
      const newStudent = {
        id: generateId('S'),
        ...data,
        admissionDate: new Date().toISOString().split('T')[0]
      };
      students.push(newStudent);
      writeJsonFile(STUDENTS_FILE, students);
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, data: newStudent }));
      return;
    }

    if (pathname.startsWith('/api/students/') && method === 'PUT') {
      const studentId = pathname.split('/')[3];
      const students = readJsonFile(STUDENTS_FILE);
      const index = students.findIndex(s => s.id === studentId);
      if (index !== -1) {
        students[index] = { ...students[index], ...data };
        writeJsonFile(STUDENTS_FILE, students);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: students[index] }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Student not found' }));
      }
      return;
    }

    if (pathname.startsWith('/api/students/') && method === 'DELETE') {
      const studentId = pathname.split('/')[3];
      const students = readJsonFile(STUDENTS_FILE);
      const filteredStudents = students.filter(s => s.id !== studentId);
      if (filteredStudents.length < students.length) {
        writeJsonFile(STUDENTS_FILE, filteredStudents);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Student deleted' }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Student not found' }));
      }
      return;
    }

    // Teachers API
    if (pathname === '/api/teachers' && method === 'GET') {
      const teachers = readJsonFile(TEACHERS_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: teachers }));
      return;
    }

    if (pathname === '/api/teachers' && method === 'POST') {
      const teachers = readJsonFile(TEACHERS_FILE);
      const newTeacher = {
        id: generateId('T'),
        ...data,
        qrCode: generateId('TEACH'),
        joiningDate: new Date().toISOString().split('T')[0]
      };
      teachers.push(newTeacher);
      writeJsonFile(TEACHERS_FILE, teachers);
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, data: newTeacher }));
      return;
    }

    if (pathname.startsWith('/api/teachers/') && method === 'PUT') {
      const teacherId = pathname.split('/')[3];
      const teachers = readJsonFile(TEACHERS_FILE);
      const index = teachers.findIndex(t => t.id === teacherId);
      if (index !== -1) {
        teachers[index] = { ...teachers[index], ...data };
        writeJsonFile(TEACHERS_FILE, teachers);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: teachers[index] }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Teacher not found' }));
      }
      return;
    }

    if (pathname.startsWith('/api/teachers/') && method === 'DELETE') {
      const teacherId = pathname.split('/')[3];
      const teachers = readJsonFile(TEACHERS_FILE);
      const filteredTeachers = teachers.filter(t => t.id !== teacherId);
      if (filteredTeachers.length < teachers.length) {
        writeJsonFile(TEACHERS_FILE, filteredTeachers);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Teacher deleted' }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Teacher not found' }));
      }
      return;
    }

    // Teacher Entry API (QR Code based)
    if (pathname === '/api/teacher-entries' && method === 'POST') {
      const { qrCode, action } = data; // action: 'entry' or 'exit'
      const teachers = readJsonFile(TEACHERS_FILE);
      const teacher = teachers.find(t => t.qrCode === qrCode);
      
      if (!teacher) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Invalid QR Code' }));
        return;
      }

      const entries = readJsonFile(TEACHER_ENTRIES_FILE);
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      let existingEntry = entries.find(e => e.teacherId === teacher.id && e.date === today);
      
      if (!existingEntry) {
        // Create new entry
        existingEntry = {
          id: generateId('TE'),
          teacherId: teacher.id,
          teacherName: teacher.name,
          date: today,
          entryTime: action === 'entry' ? currentTime : null,
          exitTime: action === 'exit' ? currentTime : null,
          status: action === 'entry' ? 'Present' : 'Absent'
        };
        entries.push(existingEntry);
      } else {
        // Update existing entry
        if (action === 'entry' && !existingEntry.entryTime) {
          existingEntry.entryTime = currentTime;
          existingEntry.status = 'Present';
        } else if (action === 'exit') {
          existingEntry.exitTime = currentTime;
        }
      }
      
      writeJsonFile(TEACHER_ENTRIES_FILE, entries);
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        data: existingEntry,
        teacher: teacher.name,
        action: action
      }));
      return;
    }

    // Get Teacher Entries
    if (pathname === '/api/teacher-entries' && method === 'GET') {
      const entries = readJsonFile(TEACHER_ENTRIES_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: entries }));
      return;
    }

    // Attendance API
    if (pathname === '/api/attendance' && method === 'GET') {
      const attendance = readJsonFile(ATTENDANCE_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: attendance }));
      return;
    }

    if (pathname === '/api/attendance' && method === 'POST') {
      const attendance = readJsonFile(ATTENDANCE_FILE);
      const newAttendance = {
        id: generateId('A'),
        ...data,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      attendance.push(newAttendance);
      writeJsonFile(ATTENDANCE_FILE, attendance);
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, data: newAttendance }));
      return;
    }

    // Fees API
    if (pathname === '/api/fees' && method === 'GET') {
      const fees = readJsonFile(FEES_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: fees }));
      return;
    }

    if (pathname === '/api/fees' && method === 'POST') {
      const fees = readJsonFile(FEES_FILE);
      const newFee = {
        id: generateId('F'),
        ...data,
        status: 'Pending',
        paymentDate: null
      };
      fees.push(newFee);
      writeJsonFile(FEES_FILE, fees);
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, data: newFee }));
      return;
    }

    if (pathname.startsWith('/api/fees/') && pathname.endsWith('/pay') && method === 'PUT') {
      const feeId = pathname.split('/')[3];
      const fees = readJsonFile(FEES_FILE);
      const index = fees.findIndex(f => f.id === feeId);
      if (index !== -1) {
        fees[index].status = 'Paid';
        fees[index].paymentDate = new Date().toISOString().split('T')[0];
        writeJsonFile(FEES_FILE, fees);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: fees[index] }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Fee record not found' }));
      }
      return;
    }

    // Grades API
    if (pathname === '/api/grades' && method === 'GET') {
      const grades = readJsonFile(GRADES_FILE);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: grades }));
      return;
    }

    if (pathname === '/api/grades' && method === 'POST') {
      const grades = readJsonFile(GRADES_FILE);
      const newGrade = {
        id: generateId('G'),
        ...data,
        date: new Date().toISOString().split('T')[0]
      };
      grades.push(newGrade);
      writeJsonFile(GRADES_FILE, grades);
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, data: newGrade }));
      return;
    }

    // Statistics API
    if (pathname === '/api/stats' && method === 'GET') {
      const students = readJsonFile(STUDENTS_FILE);
      const teachers = readJsonFile(TEACHERS_FILE);
      const attendance = readJsonFile(ATTENDANCE_FILE);
      const fees = readJsonFile(FEES_FILE);
      
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
      const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;
      
      const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
      const pendingRevenue = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
      
      const stats = {
        totalStudents: students.length,
        activeStudents: students.length, // Assuming all are active
        totalTeachers: teachers.length,
        activeTeachers: teachers.length,
        presentToday: presentCount,
        absentToday: absentCount,
        attendanceRate: students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0,
        totalRevenue,
        pendingRevenue,
        collectionRate: (totalRevenue + pendingRevenue) > 0 ? Math.round((totalRevenue / (totalRevenue + pendingRevenue)) * 100) : 0
      };
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: stats }));
      return;
    }

    // Default API response
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: 'API endpoint not implemented yet' }));
    
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
  }
};

// HTML Demo Page
const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School Management System - Enhanced Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        .floating-shapes {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 60px;
            height: 60px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 80px;
            height: 80px;
            top: 60%;
            right: 10%;
            animation-delay: 2s;
        }

        .shape:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 80%;
            left: 20%;
            animation-delay: 4s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            z-index: 2;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }

        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: slideDown 1s ease-out;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease-out;
        }

        .stat-card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.25);
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .navigation {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 40px;
        }

        .nav-btn {
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .nav-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .nav-btn.active {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .content-section {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        .section-title {
            color: white;
            font-size: 2.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .add-btn {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .data-table th {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .data-table td {
            padding: 15px;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            transition: background-color 0.3s ease;
        }

        .data-table tr:hover td {
            background-color: rgba(102, 126, 234, 0.1);
        }

        .action-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-weight: bold;
            margin: 0 5px;
            transition: all 0.3s ease;
        }

        .edit-btn {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
        }

        .delete-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .currency {
            color: #2ecc71;
            font-weight: bold;
        }

        .status {
            padding: 5px 12px;
            border-radius: 15px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }

        .status.paid {
            background: #2ecc71;
            color: white;
        }

        .status.pending {
            background: #f39c12;
            color: white;
        }

        .status.overdue {
            background: #e74c3c;
            color: white;
        }

        .qr-code {
            font-family: monospace;
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }

        .hidden {
            display: none !important;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 5% auto;
            padding: 30px;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .close {
            color: white;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close:hover {
            transform: scale(1.2);
        }

        .modal h2 {
            color: white;
            margin-bottom: 25px;
            text-align: center;
            font-size: 2em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: white;
            margin-bottom: 8px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .form-row {
            display: flex;
            gap: 15px;
        }

        .form-row .form-group {
            flex: 1;
        }

        .submit-btn {
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            width: 100%;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        .error-message {
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
        }

        .success-message {
            background: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .navigation {
                flex-direction: column;
            }
            
            .data-table {
                font-size: 14px;
            }
            
            .data-table th,
            .data-table td {
                padding: 10px 8px;
            }
            
            .form-row {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>

    <div class="container">
        <div class="header">
            <h1>🏫 School Management System</h1>
            <p>Advanced Demo with Persistent Storage & QR Code Integration</p>
        </div>

        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-number" id="totalStudents">0</div>
                <div>Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalTeachers">0</div>
                <div>Total Teachers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="attendanceRate">0%</div>
                <div>Attendance Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalRevenue">₹0</div>
                <div>Total Revenue</div>
            </div>
        </div>

        <div class="navigation">
            <button class="nav-btn active" onclick="showSection('students')">👨‍🎓 Students</button>
            <button class="nav-btn" onclick="showSection('teachers')">👩‍🏫 Teachers</button>
            <button class="nav-btn" onclick="showSection('attendance')">📅 Attendance</button>
            <button class="nav-btn" onclick="showSection('fees')">💰 Fees</button>
            <button class="nav-btn" onclick="showSection('grades')">📊 Grades</button>
            <button class="nav-btn" onclick="showSection('teacher-entries')">🔍 Teacher Entries</button>
        </div>

        <!-- Students Section -->
        <div id="students" class="content-section">
            <div class="section-header">
                <h2 class="section-title">Students</h2>
                <button class="add-btn" onclick="openStudentModal()">Add Student</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="studentsTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>

        <!-- Teachers Section -->
        <div id="teachers" class="content-section hidden">
            <div class="section-header">
                <h2 class="section-title">Teachers</h2>
                <button class="add-btn" onclick="openTeacherModal()">Add Teacher</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Salary</th>
                        <th>QR Code</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="teachersTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>

        <!-- Attendance Section -->
        <div id="attendance" class="content-section hidden">
            <div class="section-header">
                <h2 class="section-title">Student Attendance</h2>
                <button class="add-btn" onclick="markAttendance()">Mark Attendance</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody id="attendanceTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>

        <!-- Fees Section -->
        <div id="fees" class="content-section hidden">
            <div class="section-header">
                <h2 class="section-title">Fee Management</h2>
                <button class="add-btn" onclick="addFeeRecord()">Add Fee Record</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Fee Type</th>
                        <th>Amount (INR)</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="feesTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>

        <!-- Grades Section -->
        <div id="grades" class="content-section hidden">
            <div class="section-header">
                <h2 class="section-title">Academic Grades</h2>
                <button class="add-btn" onclick="addGrade()">Add Grade</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Subject</th>
                        <th>Exam</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody id="gradesTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>

        <!-- Teacher Entries Section -->
        <div id="teacher-entries" class="content-section hidden">
            <div class="section-header">
                <h2 class="section-title">Teacher Entry/Exit System</h2>
                <button class="add-btn" onclick="scanQRCode()">Scan QR Code</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Teacher Name</th>
                        <th>Date</th>
                        <th>Entry Time</th>
                        <th>Exit Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="teacherEntriesTableBody">
                    <!-- Dynamic content -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- Student Modal -->
    <div id="studentModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('studentModal')">&times;</span>
            <h2 id="studentModalTitle">Add New Student</h2>
            <div id="studentModalError" class="error-message" style="display: none;"></div>
            <div id="studentModalSuccess" class="success-message" style="display: none;"></div>
            <form id="studentForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="studentName">Full Name *</label>
                        <input type="text" id="studentName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="studentClass">Class *</label>
                        <input type="text" id="studentClass" name="class" required placeholder="e.g., 10A">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="studentEmail">Email *</label>
                        <input type="email" id="studentEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="studentPhone">Phone</label>
                        <input type="tel" id="studentPhone" name="phone" placeholder="+91-XXXXXXXXXX">
                    </div>
                </div>
                <div class="form-group">
                    <label for="studentAddress">Address</label>
                    <textarea id="studentAddress" name="address" rows="2" placeholder="Full address"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="guardianName">Guardian Name</label>
                        <input type="text" id="guardianName" name="guardianName">
                    </div>
                    <div class="form-group">
                        <label for="guardianPhone">Guardian Phone</label>
                        <input type="tel" id="guardianPhone" name="guardianPhone" placeholder="+91-XXXXXXXXXX">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="dateOfBirth">Date of Birth</label>
                        <input type="date" id="dateOfBirth" name="dateOfBirth">
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="studentSubmitBtn">Add Student</button>
            </form>
        </div>
    </div>

    <!-- Teacher Modal -->
    <div id="teacherModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('teacherModal')">&times;</span>
            <h2 id="teacherModalTitle">Add New Teacher</h2>
            <div id="teacherModalError" class="error-message" style="display: none;"></div>
            <div id="teacherModalSuccess" class="success-message" style="display: none;"></div>
            <form id="teacherForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="teacherName">Full Name *</label>
                        <input type="text" id="teacherName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="teacherSubject">Subject *</label>
                        <input type="text" id="teacherSubject" name="subject" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="teacherEmail">Email *</label>
                        <input type="email" id="teacherEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="teacherPhone">Phone</label>
                        <input type="tel" id="teacherPhone" name="phone" placeholder="+91-XXXXXXXXXX">
                    </div>
                </div>
                <div class="form-group">
                    <label for="teacherAddress">Address</label>
                    <textarea id="teacherAddress" name="address" rows="2" placeholder="Full address"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="teacherQualification">Qualification</label>
                        <input type="text" id="teacherQualification" name="qualification" placeholder="e.g., M.Sc Physics">
                    </div>
                    <div class="form-group">
                        <label for="teacherExperience">Experience</label>
                        <input type="text" id="teacherExperience" name="experience" placeholder="e.g., 5 years">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="teacherSalary">Monthly Salary (INR) *</label>
                        <input type="number" id="teacherSalary" name="salary" required placeholder="50000">
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="teacherSubmitBtn">Add Teacher</button>
            </form>
        </div>
    </div>

    <script>
        let currentEditingStudent = null;
        let currentEditingTeacher = null;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            loadStudents();
            loadTeachers();
            loadAttendance();
            loadFees();
            loadGrades();
            loadTeacherEntries();

            // Setup form event listeners
            document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
            document.getElementById('teacherForm').addEventListener('submit', handleTeacherSubmit);
        });

        // API Helper Functions
        async function apiCall(endpoint, method = 'GET', data = null) {
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                if (data) {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(endpoint, options);
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.error || 'API request failed');
                }
                
                return result;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }

        // Navigation Functions
        function showSection(sectionName) {
            // Hide all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.add('hidden'));

            // Remove active class from all nav buttons
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));

            // Show selected section
            document.getElementById(sectionName).classList.remove('hidden');

            // Add active class to clicked button
            event.target.classList.add('active');
        }

        // Modal Functions
        function openStudentModal(student = null) {
            const modal = document.getElementById('studentModal');
            const title = document.getElementById('studentModalTitle');
            const submitBtn = document.getElementById('studentSubmitBtn');
            const form = document.getElementById('studentForm');
            
            // Reset form and messages
            form.reset();
            hideMessage('studentModalError');
            hideMessage('studentModalSuccess');
            
            if (student) {
                // Edit mode
                currentEditingStudent = student;
                title.textContent = 'Edit Student';
                submitBtn.textContent = 'Update Student';
                
                // Populate form fields
                document.getElementById('studentName').value = student.name || '';
                document.getElementById('studentClass').value = student.class || '';
                document.getElementById('studentEmail').value = student.email || '';
                document.getElementById('studentPhone').value = student.phone || '';
                document.getElementById('studentAddress').value = student.address || '';
                document.getElementById('guardianName').value = student.guardianName || '';
                document.getElementById('guardianPhone').value = student.guardianPhone || '';
                document.getElementById('dateOfBirth').value = student.dateOfBirth || '';
            } else {
                // Add mode
                currentEditingStudent = null;
                title.textContent = 'Add New Student';
                submitBtn.textContent = 'Add Student';
            }
            
            modal.style.display = 'block';
        }

        function openTeacherModal(teacher = null) {
            const modal = document.getElementById('teacherModal');
            const title = document.getElementById('teacherModalTitle');
            const submitBtn = document.getElementById('teacherSubmitBtn');
            const form = document.getElementById('teacherForm');
            
            // Reset form and messages
            form.reset();
            hideMessage('teacherModalError');
            hideMessage('teacherModalSuccess');
            
            if (teacher) {
                // Edit mode
                currentEditingTeacher = teacher;
                title.textContent = 'Edit Teacher';
                submitBtn.textContent = 'Update Teacher';
                
                // Populate form fields
                document.getElementById('teacherName').value = teacher.name || '';
                document.getElementById('teacherSubject').value = teacher.subject || '';
                document.getElementById('teacherEmail').value = teacher.email || '';
                document.getElementById('teacherPhone').value = teacher.phone || '';
                document.getElementById('teacherAddress').value = teacher.address || '';
                document.getElementById('teacherQualification').value = teacher.qualification || '';
                document.getElementById('teacherExperience').value = teacher.experience || '';
                document.getElementById('teacherSalary').value = teacher.salary || '';
            } else {
                // Add mode
                currentEditingTeacher = null;
                title.textContent = 'Add New Teacher';
                submitBtn.textContent = 'Add Teacher';
            }
            
            modal.style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
            currentEditingStudent = null;
            currentEditingTeacher = null;
        }

        // Message Functions
        function showMessage(elementId, message, isError = false) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.style.display = 'block';
            
            // Auto-hide success messages after 3 seconds
            if (!isError) {
                setTimeout(() => {
                    hideMessage(elementId);
                }, 3000);
            }
        }

        function hideMessage(elementId) {
            document.getElementById(elementId).style.display = 'none';
        }

        // Form Submit Handlers
        async function handleStudentSubmit(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('studentSubmitBtn');
            const originalText = submitBtn.textContent;
            
            try {
                // Show loading state
                submitBtn.textContent = 'Processing...';
                submitBtn.classList.add('loading');
                
                // Collect form data
                const formData = new FormData(e.target);
                const studentData = {
                    name: formData.get('name'),
                    class: formData.get('class'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    guardianName: formData.get('guardianName'),
                    guardianPhone: formData.get('guardianPhone'),
                    dateOfBirth: formData.get('dateOfBirth')
                };
                
                // Validate required fields
                if (!studentData.name || !studentData.class || !studentData.email) {
                    throw new Error('Please fill in all required fields (Name, Class, Email)');
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(studentData.email)) {
                    throw new Error('Please enter a valid email address');
                }
                
                let result;
                if (currentEditingStudent) {
                    // Update existing student
                    result = await apiCall(`/api/students/${currentEditingStudent.id}`, 'PUT', studentData);
                    showMessage('studentModalSuccess', 'Student updated successfully!');
                } else {
                    // Add new student
                    result = await apiCall('/api/students', 'POST', studentData);
                    showMessage('studentModalSuccess', 'Student added successfully!');
                }
                
                // Reload students data
                await loadStudents();
                await loadStats();
                
                // Reset form after short delay
                setTimeout(() => {
                    if (!currentEditingStudent) {
                        e.target.reset();
                    }
                }, 1500);
                
            } catch (error) {
                showMessage('studentModalError', error.message, true);
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        }

        // Data Loading Functions
        async function loadStats() {
            try {
                const result = await apiCall('/api/stats');
                const stats = result.data;
                
                document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
                document.getElementById('totalTeachers').textContent = stats.totalTeachers || 0;
                document.getElementById('attendanceRate').textContent = `${stats.attendanceRate || 0}%`;
                document.getElementById('totalRevenue').textContent = `₹${formatCurrency(stats.totalRevenue || 0)}`;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadStudents() {
            try {
                const result = await apiCall('/api/students');
                const students = result.data || [];
                
                const tableBody = document.getElementById('studentsTableBody');
                tableBody.innerHTML = '';
                
                students.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.class}</td>
                        <td>${student.email}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editStudent('${student.id}')">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteStudent('${student.id}')">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading students:', error);
            }
        }

        async function loadTeachers() {
            try {
                const result = await apiCall('/api/teachers');
                const teachers = result.data || [];
                
                const tableBody = document.getElementById('teachersTableBody');
                tableBody.innerHTML = '';
                
                teachers.forEach(teacher => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${teacher.id}</td>
                        <td>${teacher.name}</td>
                        <td>${teacher.subject}</td>
                        <td class="currency">₹${formatCurrency(teacher.salary)}</td>
                        <td><span class="qr-code">${teacher.qrCode}</span></td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editTeacher('${teacher.id}')">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteTeacher('${teacher.id}')">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading teachers:', error);
            }
        }

        async function loadAttendance() {
            try {
                const result = await apiCall('/api/attendance');
                const attendance = result.data || [];
                
                const tableBody = document.getElementById('attendanceTableBody');
                tableBody.innerHTML = '';
                
                attendance.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.id}</td>
                        <td>${record.studentName}</td>
                        <td>${record.class}</td>
                        <td>${record.date}</td>
                        <td><span class="status ${record.status.toLowerCase()}">${record.status}</span></td>
                        <td>${record.time}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading attendance:', error);
            }
        }

        async function loadFees() {
            try {
                const result = await apiCall('/api/fees');
                const fees = result.data || [];
                
                const tableBody = document.getElementById('feesTableBody');
                tableBody.innerHTML = '';
                
                fees.forEach(fee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${fee.id}</td>
                        <td>${fee.studentName}</td>
                        <td>${fee.feeType}</td>
                        <td class="currency">₹${formatCurrency(fee.amount)}</td>
                        <td>${fee.dueDate}</td>
                        <td><span class="status ${fee.status.toLowerCase()}">${fee.status}</span></td>
                        <td>
                            ${fee.status === 'Pending' || fee.status === 'Overdue' ? 
                                `<button class="action-btn edit-btn" onclick="payFee('${fee.id}')">Pay Now</button>` : 
                                '<span style="color: #2ecc71;">✓ Paid</span>'
                            }
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading fees:', error);
            }
        }

        async function loadGrades() {
            try {
                const result = await apiCall('/api/grades');
                const grades = result.data || [];
                
                const tableBody = document.getElementById('gradesTableBody');
                tableBody.innerHTML = '';
                
                grades.forEach(grade => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${grade.id}</td>
                        <td>${grade.studentName}</td>
                        <td>${grade.subject}</td>
                        <td>${grade.exam}</td>
                        <td>${grade.marks}/${grade.totalMarks}</td>
                        <td><strong>${grade.grade}</strong></td>
                        <td>${grade.date}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading grades:', error);
            }
        }

        async function loadTeacherEntries() {
            try {
                const result = await apiCall('/api/teacher-entries');
                const entries = result.data || [];
                
                const tableBody = document.getElementById('teacherEntriesTableBody');
                tableBody.innerHTML = '';
                
                entries.forEach(entry => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${entry.id}</td>
                        <td>${entry.teacherName}</td>
                        <td>${entry.date}</td>
                        <td>${entry.entryTime || '-'}</td>
                        <td>${entry.exitTime || '-'}</td>
                        <td><span class="status ${entry.status.toLowerCase()}">${entry.status}</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading teacher entries:', error);
            }
        }

        // CRUD Functions
        async function editStudent(studentId) {
            try {
                const result = await apiCall('/api/students');
                const student = result.data.find(s => s.id === studentId);
                if (student) {
                    openStudentModal(student);
                }
            } catch (error) {
                alert('Error loading student data: ' + error.message);
            }
        }

        async function deleteStudent(studentId) {
            if (confirm('Are you sure you want to delete this student?')) {
                try {
                    await apiCall(`/api/students/${studentId}`, 'DELETE');
                    await loadStudents();
                    await loadStats();
                    alert('Student deleted successfully!');
                } catch (error) {
                    alert('Error deleting student: ' + error.message);
                }
            }
        }

        async function editTeacher(teacherId) {
            try {
                const result = await apiCall('/api/teachers');
                const teacher = result.data.find(t => t.id === teacherId);
                if (teacher) {
                    openTeacherModal(teacher);
                }
            } catch (error) {
                alert('Error loading teacher data: ' + error.message);
            }
        }

        async function deleteTeacher(teacherId) {
            if (confirm('Are you sure you want to delete this teacher?')) {
                try {
                    await apiCall(`/api/teachers/${teacherId}`, 'DELETE');
                    await loadTeachers();
                    await loadStats();
                    alert('Teacher deleted successfully!');
                } catch (error) {
                    alert('Error deleting teacher: ' + error.message);
                }
            }
        }

        async function payFee(feeId) {
            if (confirm('Process payment for this fee?')) {
                try {
                    await apiCall(`/api/fees/${feeId}/pay`, 'PUT');
                    await loadFees();
                    await loadStats();
                    alert('Payment processed successfully!');
                } catch (error) {
                    alert('Error processing payment: ' + error.message);
                }
            }
        }

        // Utility Functions
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-IN').format(amount);
        }

        // Placeholder functions for additional features
        function markAttendance() {
            alert('Attendance marking feature would be implemented here with QR code scanning.');
        }

        function addFeeRecord() {
            alert('Fee record addition feature would be implemented here.');
        }

        function addGrade() {
            alert('Grade addition feature would be implemented here.');
        }

        function scanQRCode() {
            const qrCode = prompt('Enter teacher QR code (or scan with camera):');
            if (qrCode) {
                const action = prompt('Enter action (entry/exit):');
                if (action === 'entry' || action === 'exit') {
                    processTeacherEntry(qrCode, action);
                } else {
                    alert('Invalid action. Please enter "entry" or "exit".');
                }
            }
        }

        async function processTeacherEntry(qrCode, action) {
            try {
                const result = await apiCall('/api/teacher-entries', 'POST', { qrCode, action });
                await loadTeacherEntries();
                alert(`${result.teacher} ${action} recorded successfully!`);
            } catch (error) {
                alert('Error processing teacher entry: ' + error.message);
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const studentModal = document.getElementById('studentModal');
            const teacherModal = document.getElementById('teacherModal');
            
            if (event.target === studentModal) {
                closeModal('studentModal');
            }
            if (event.target === teacherModal) {
                closeModal('teacherModal');
            }
        }
    </script>
</body>
</html>
`;

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 School Management System Demo Server Started!`);
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Open your browser and visit: http://localhost:${PORT}`);
    console.log(`\n✨ Features Available:`);
    console.log(`   • Student Management with Persistent Storage`);
    console.log(`   • Teacher Management with Salary Tracking`);
    console.log(`   • QR Code-based Teacher Entry System`);
    console.log(`   • Fee Management in Indian Rupees (INR)`);
    console.log(`   • Attendance and Grade Tracking`);
    console.log(`   • Modern UI with Animations & Effects`);
    console.log(`\n📁 Data stored in: ${path.join(__dirname, 'data')}`);
    console.log(`\n🛑 Press Ctrl+C to stop the server`);
});

        async function handleTeacherSubmit(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('teacherSubmitBtn');
            const originalText = submitBtn.textContent;
            
            try {
                // Show loading state
                submitBtn.textContent = 'Processing...';
                submitBtn.classList.add('loading');
                
                // Collect form data
                const formData = new FormData(e.target);
                const teacherData = {
                    name: formData.get('name'),
                    subject: formData.get('subject'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    qualification: formData.get('qualification'),
                    experience: formData.get('experience'),
                    salary: parseInt(formData.get('salary'))
                };
                
                // Validate required fields
                if (!teacherData.name || !teacherData.subject || !teacherData.email || !teacherData.salary) {
                    throw new Error('Please fill in all required fields (Name, Subject, Email, Salary)');
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(teacherData.email)) {
                    throw new Error('Please enter a valid email address');
                }
                
                // Validate salary
                if (isNaN(teacherData.salary) || teacherData.salary <= 0) {
                    throw new Error('Please enter a valid salary amount');
                }
                
                let result;
                if (currentEditingTeacher) {
                    // Update existing teacher
                    result = await apiCall(`/api/teachers/${currentEditingTeacher.id}`, 'PUT', teacherData);
                    showMessage('teacherModalSuccess', 'Teacher updated successfully!');
                } else {
                    // Add new teacher
                    result = await apiCall('/api/teachers', 'POST', teacherData);
                    showMessage('teacherModalSuccess', 'Teacher added successfully!');
                }
                
                // Reload teachers data
                await loadTeachers();
                await loadStats();
                
                // Reset form after short delay
                setTimeout(() => {
                    if (!currentEditingTeacher) {
                        e.target.reset();
                    }
                }, 1500);
                
            } catch (error) {
                showMessage('teacherModalError', error.message, true);
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        }

        // Quick Manual Entry Functions
        function quickAddStudent() {
            const name = document.getElementById('quickStudentName').value.trim();
            const className = document.getElementById('quickStudentClass').value.trim();
            const email = document.getElementById('quickStudentEmail').value.trim();
            
            if (!name || !className || !email) {
                alert('कृपया सभी आवश्यक फ़ील्ड भरें (नाम, कक्षा, ईमेल)');
                return;
            }
            
            // Populate main modal with this data and open it
            document.getElementById('studentName').value = name;
            document.getElementById('studentClass').value = className;
            document.getElementById('studentEmail').value = email;
            
            // Clear quick form
            document.getElementById('quickStudentName').value = '';
            document.getElementById('quickStudentClass').value = '';
            document.getElementById('quickStudentEmail').value = '';
            
            openStudentModal();
            showToast('Quick data filled! Complete the form and submit.', 'info');
        }
        
        function quickAddTeacher() {
            const name = document.getElementById('quickTeacherName').value.trim();
            const subject = document.getElementById('quickTeacherSubject').value.trim();
            const salary = document.getElementById('quickTeacherSalary').value.trim();
            
            if (!name || !subject || !salary) {
                alert('कृपया सभी आवश्यक फ़ील्ड भरें (नाम, विषय, वेतन)');
                return;
            }
            
            // Populate main modal with this data and open it
            document.getElementById('teacherName').value = name;
            document.getElementById('teacherSubject').value = subject;
            document.getElementById('teacherSalary').value = salary;
            document.getElementById('teacherEmail').value = name.toLowerCase().replace(/\s+/g, '.') + '@school.com';
            
            // Clear quick form
            document.getElementById('quickTeacherName').value = '';
            document.getElementById('quickTeacherSubject').value = '';
            document.getElementById('quickTeacherSalary').value = '';
            
            openTeacherModal();
            showToast('Quick data filled! Complete the form and submit.', 'info');
        }
        
        // Advanced Manual Entry Functions
        function addMultipleStudents() {
            const count = prompt('कितने students एक साथ add करना चाहते हैं?', '5');
            if (!count || isNaN(count) || count < 1 || count > 20) {
                alert('कृपया 1-20 के बीच एक valid number दें');
                return;
            }
            
            let studentsData = [];
            for (let i = 1; i <= parseInt(count); i++) {
                const name = prompt(`Student ${i} का नाम:`);
                if (!name) break;
                
                const className = prompt(`${name} की कक्षा:`);
                if (!className) break;
                
                const email = prompt(`${name} का email:`, `${name.toLowerCase().replace(/\s+/g, '.')}@student.com`);
                if (!email) break;
                
                studentsData.push({ name, class: className, email });
            }
            
            // Add all students
            if (studentsData.length > 0) {
                addBulkStudents(studentsData);
            }
        }
        
        function addMultipleTeachers() {
            const count = prompt('कितने teachers एक साथ add करना चाहते हैं?', '3');
            if (!count || isNaN(count) || count < 1 || count > 10) {
                alert('कृपया 1-10 के बीच एक valid number दें');
                return;
            }
            
            let teachersData = [];
            for (let i = 1; i <= parseInt(count); i++) {
                const name = prompt(`Teacher ${i} का नाम:`);
                if (!name) break;
                
                const subject = prompt(`${name} का विषय:`);
                if (!subject) break;
                
                const salary = prompt(`${name} की salary (INR):`, '50000');
                if (!salary || isNaN(salary)) break;
                
                const email = prompt(`${name} का email:`, `${name.toLowerCase().replace(/\s+/g, '.')}@school.com`);
                if (!email) break;
                
                teachersData.push({ name, subject, salary: parseInt(salary), email });
            }
            
            // Add all teachers
            if (teachersData.length > 0) {
                addBulkTeachers(teachersData);
            }
        }
        
        async function addBulkStudents(studentsData) {
            let successCount = 0;
            let errorCount = 0;
            
            for (const studentData of studentsData) {
                try {
                    await apiCall('/api/students', 'POST', studentData);
                    successCount++;
                } catch (error) {
                    console.error('Error adding student:', error);
                    errorCount++;
                }
            }
            
            showToast(`${successCount} students added successfully! ${errorCount > 0 ? errorCount + ' failed.' : ''}`, 'success');
            await loadStudents();
            await loadStats();
            updateDataSummary();
        }
        
        async function addBulkTeachers(teachersData) {
            let successCount = 0;
            let errorCount = 0;
            
            for (const teacherData of teachersData) {
                try {
                    await apiCall('/api/teachers', 'POST', teacherData);
                    successCount++;
                } catch (error) {
                    console.error('Error adding teacher:', error);
                    errorCount++;
                }
            }
            
            showToast(`${successCount} teachers added successfully! ${errorCount > 0 ? errorCount + ' failed.' : ''}`, 'success');
            await loadTeachers();
            await loadStats();
            updateDataSummary();
        }
        
        function importSampleData() {
            if (!confirm('यह sample students और teachers का data add करेगा। Continue करें?')) {
                return;
            }
            
            const sampleStudents = [
                { name: 'राहुल शर्मा', class: '10A', email: 'rahul.sharma@student.com', phone: '+91-9876543210' },
                { name: 'प्रिया गुप्ता', class: '10B', email: 'priya.gupta@student.com', phone: '+91-9876543211' },
                { name: 'अमित कुमार', class: '9A', email: 'amit.kumar@student.com', phone: '+91-9876543212' },
                { name: 'स्नेहा सिंह', class: '9B', email: 'sneha.singh@student.com', phone: '+91-9876543213' },
                { name: 'विकास यादव', class: '8A', email: 'vikas.yadav@student.com', phone: '+91-9876543214' }
            ];
            
            const sampleTeachers = [
                { name: 'डॉ. अनिल वर्मा', subject: 'गणित', email: 'anil.verma@school.com', salary: 75000 },
                { name: 'सुनीता देवी', subject: 'हिंदी', email: 'sunita.devi@school.com', salary: 65000 },
                { name: 'राजेश कुमार', subject: 'विज्ञान', email: 'rajesh.kumar@school.com', salary: 70000 }
            ];
            
            addBulkStudents(sampleStudents);
            setTimeout(() => addBulkTeachers(sampleTeachers), 1000);
        }
        
        async function clearAllData() {
            if (!confirm('यह सभी data को delete कर देगा! क्या आप sure हैं?')) {
                return;
            }
            
            if (!confirm('Last warning: सभी students और teachers का data permanently delete हो जाएगा!')) {
                return;
            }
            
            try {
                // This would need API endpoints to clear all data
                showToast('Data clearing feature would be implemented with proper API endpoints', 'info');
                // For now, just reload the page
                // location.reload();
            } catch (error) {
                showToast('Error clearing data: ' + error.message, 'error');
            }
        }
        
        async function showAllStoredData() {
            try {
                const [studentsResult, teachersResult] = await Promise.all([
                    apiCall('/api/students'),
                    apiCall('/api/teachers')
                ]);
                
                const students = studentsResult.data || [];
                const teachers = teachersResult.data || [];
                
                let dataText = `📊 STORED DATA SUMMARY\n\n`;
                dataText += `👨‍🎓 STUDENTS (${students.length}):` + '\n';
                students.forEach((s, i) => {
                    dataText += `${i+1}. ${s.name} - Class: ${s.class} - Email: ${s.email}` + '\n';
                });
                
                dataText += `\n👩‍🏫 TEACHERS (${teachers.length}):` + '\n';
                teachers.forEach((t, i) => {
                    dataText += `${i+1}. ${t.name} - Subject: ${t.subject} - Salary: ₹${formatCurrency(t.salary)}` + '\n';
                });
                
                alert(dataText);
                updateDataSummary();
                
            } catch (error) {
                showToast('Error loading data: ' + error.message, 'error');
            }
        }
        
        function updateDataSummary() {
            apiCall('/api/students').then(result => {
                const students = result.data || [];
                document.getElementById('summaryStudents').textContent = students.length;
                
                return apiCall('/api/teachers');
            }).then(result => {
                const teachers = result.data || [];
                document.getElementById('summaryTeachers').textContent = teachers.length;
                
                const total = parseInt(document.getElementById('summaryStudents').textContent) + teachers.length;
                document.getElementById('summaryTotal').textContent = total;
            }).catch(error => {
                console.error('Error updating summary:', error);
            });
        }
        
        // Toast notification system
        function showToast(message, type = 'info') {
            // Create toast container if it doesn't exist
            let toastContainer = document.getElementById('toastContainer');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toastContainer';
                toastContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 2000;
                    max-width: 350px;
                `;
                document.body.appendChild(toastContainer);
            }
            
            // Create toast element
            const toast = document.createElement('div');
            toast.style.cssText = `
                background: ${type === 'success' ? 'linear-gradient(45deg, #2ecc71, #27ae60)' : 
                           type === 'error' ? 'linear-gradient(45deg, #e74c3c, #c0392b)' : 
                           'linear-gradient(45deg, #3498db, #2980b9)'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                margin-bottom: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transform: translateX(100%);
                transition: all 0.3s ease;
                font-weight: bold;
                border: 1px solid rgba(255,255,255,0.2);
                font-size: 14px;
                line-height: 1.4;
            `;
            toast.textContent = message;
            
            toastContainer.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 4 seconds
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        }
        
        // Keyboard shortcuts for manual entry
        document.addEventListener('keydown', function(e) {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const studentModal = document.getElementById('studentModal');
                const teacherModal = document.getElementById('teacherModal');
                if (studentModal.style.display === 'block') {
                    closeModal('studentModal');
                }
                if (teacherModal.style.display === 'block') {
                    closeModal('teacherModal');
                }
            }
            
            // Ctrl+Shift+S for quick student entry
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                showSection('manual-entry');
                document.getElementById('quickStudentName').focus();
            }
            
            // Ctrl+Shift+T for quick teacher entry
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                showSection('manual-entry');
                document.getElementById('quickTeacherName').focus();
            }
            
            // Ctrl+S to open student modal
            if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                openStudentModal();
            }
            
            // Ctrl+T to open teacher modal
            if (e.ctrlKey && e.key === 't' && !e.shiftKey) {
                e.preventDefault();
                openTeacherModal();
            }
        });
        
        // Initialize data summary on page load
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(updateDataSummary, 1000);
        });