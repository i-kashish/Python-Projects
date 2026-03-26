const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all attendance records with filtering options
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { 
      studentId, 
      date, 
      startDate, 
      endDate, 
      status, 
      class: className, 
      subject,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    
    // Date filtering
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);
      
      filter.date = {
        $gte: dateObj,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const attendance = await Attendance.find(filter)
      .populate('student', 'name email')
      .populate('marker', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Attendance.countDocuments(filter);
    
    res.json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'name email')
      .populate('marker', 'name');
    
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private
exports.createAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      student, 
      date, 
      status, 
      class: className, 
      subject, 
      checkInTime, 
      checkOutTime, 
      qrCodeData,
      notes 
    } = req.body;

    // Verify student exists
    const studentExists = await User.findById(student);
    if (!studentExists || studentExists.role !== 'student') {
      return res.status(400).json({ msg: 'Invalid student ID' });
    }

    // Check if attendance already exists for this student on this date and subject
    const existingAttendance = await Attendance.findOne({
      student,
      date: new Date(date),
      subject,
      class: className
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: 'Attendance record already exists for this student, date, and subject' });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      student,
      date: new Date(date),
      status,
      class: className,
      subject,
      checkInTime,
      checkOutTime,
      qrCodeData,
      notes,
      marker: req.user.id // The teacher/admin marking attendance
    });

    const attendance = await newAttendance.save();
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      status, 
      checkInTime, 
      checkOutTime, 
      notes 
    } = req.body;

    // Find attendance record
    let attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }

    // Update fields
    if (status) attendance.status = status;
    if (checkInTime) attendance.checkInTime = checkInTime;
    if (checkOutTime) attendance.checkOutTime = checkOutTime;
    if (notes) attendance.notes = notes;
    
    // Update marker and timestamp
    attendance.marker = req.user.id;
    attendance.updatedAt = Date.now();

    await attendance.save();
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete attendance records' });
    }
    
    await attendance.remove();
    
    res.json({ msg: 'Attendance record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Mark attendance via QR code
// @route   POST /api/attendance/qr
// @access  Private (Students)
exports.markAttendanceViaQR = async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    
    if (!qrCodeData) {
      return res.status(400).json({ msg: 'QR code data is required' });
    }
    
    // Parse QR code data
    let qrData;
    try {
      qrData = JSON.parse(qrCodeData);
    } catch (err) {
      return res.status(400).json({ msg: 'Invalid QR code data' });
    }
    
    const { class: className, subject, date, token } = qrData;
    
    if (!className || !subject || !date || !token) {
      return res.status(400).json({ msg: 'Invalid QR code data format' });
    }
    
    // Verify token validity (in a real app, you'd verify against stored tokens)
    // For demo purposes, we'll just check if it exists
    if (!token) {
      return res.status(400).json({ msg: 'Invalid or expired QR code' });
    }
    
    // Check if student already marked attendance
    const existingAttendance = await Attendance.findOne({
      student: req.user.id,
      date: new Date(date),
      subject,
      class: className
    });
    
    if (existingAttendance) {
      return res.status(400).json({ msg: 'Attendance already marked for this class' });
    }
    
    // Create new attendance record
    const newAttendance = new Attendance({
      student: req.user.id,
      date: new Date(date),
      status: 'present',
      class: className,
      subject,
      checkInTime: new Date().toTimeString().split(' ')[0],
      qrCodeData,
      marker: req.user.id // Self-marked via QR
    });
    
    const attendance = await newAttendance.save();
    
    res.json({
      success: true,
      attendance,
      msg: 'Attendance marked successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const { 
      studentId, 
      startDate, 
      endDate, 
      class: className 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (studentId) filter.student = studentId;
    if (className) filter.class = className;
    
    // Date filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get total attendance count
    const totalCount = await Attendance.countDocuments(filter);
    
    // Get present count
    const presentCount = await Attendance.countDocuments({
      ...filter,
      status: 'present'
    });
    
    // Get absent count
    const absentCount = await Attendance.countDocuments({
      ...filter,
      status: 'absent'
    });
    
    // Get late count
    const lateCount = await Attendance.countDocuments({
      ...filter,
      status: 'late'
    });
    
    // Calculate percentages
    const presentPercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
    const absentPercentage = totalCount > 0 ? (absentCount / totalCount) * 100 : 0;
    const latePercentage = totalCount > 0 ? (lateCount / totalCount) * 100 : 0;
    
    // Get class-wise attendance if no specific class is provided
    let classStats = [];
    if (!className) {
      const classes = await Attendance.distinct('class', filter);
      
      for (const cls of classes) {
        const classFilter = { ...filter, class: cls };
        const classTotal = await Attendance.countDocuments(classFilter);
        const classPresent = await Attendance.countDocuments({
          ...classFilter,
          status: 'present'
        });
        
        classStats.push({
          class: cls,
          total: classTotal,
          present: classPresent,
          percentage: classTotal > 0 ? (classPresent / classTotal) * 100 : 0
        });
      }
      
      // Sort by percentage in descending order
      classStats.sort((a, b) => b.percentage - a.percentage);
    }
    
    // Get students with low attendance (below 75%)
    const lowAttendanceStudents = [];
    
    if (!studentId) {
      const students = await Attendance.distinct('student', filter);
      
      for (const student of students) {
        const studentFilter = { ...filter, student };
        const studentTotal = await Attendance.countDocuments(studentFilter);
        const studentPresent = await Attendance.countDocuments({
          ...studentFilter,
          status: 'present'
        });
        
        const attendancePercentage = studentTotal > 0 ? (studentPresent / studentTotal) * 100 : 0;
        
        if (attendancePercentage < 75 && studentTotal >= 5) {
          const studentData = await User.findById(student, 'name email');
          
          if (studentData) {
            lowAttendanceStudents.push({
              student: studentData,
              total: studentTotal,
              present: studentPresent,
              percentage: attendancePercentage
            });
          }
        }
      }
      
      // Sort by percentage in ascending order
      lowAttendanceStudents.sort((a, b) => a.percentage - b.percentage);
    }
    
    res.json({
      overview: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        presentPercentage,
        absentPercentage,
        latePercentage
      },
      classStats,
      lowAttendanceStudents: lowAttendanceStudents.slice(0, 5) // Return top 5 only
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get monthly attendance trend
// @route   GET /api/attendance/trend
// @access  Private
exports.getAttendanceTrend = async (req, res) => {
  try {
    const { 
      studentId, 
      year = new Date().getFullYear(), 
      class: className 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (studentId) filter.student = studentId;
    if (className) filter.class = className;
    
    // Array to hold monthly data
    const monthlyData = [];
    
    // Get data for each month
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const monthFilter = {
        ...filter,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      const totalCount = await Attendance.countDocuments(monthFilter);
      const presentCount = await Attendance.countDocuments({
        ...monthFilter,
        status: 'present'
      });
      
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      
      monthlyData.push({
        month: startDate.toLocaleString('default', { month: 'short' }),
        total: totalCount,
        present: presentCount,
        percentage
      });
    }
    
    res.json(monthlyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};