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