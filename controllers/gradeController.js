const Grade = require('../models/Grade');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all grades with filtering, pagination, and population
 * @route   GET /api/grades
 * @access  Private (Admin, Teacher, Student - with role-based filtering)
 */
exports.getAllGrades = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      student, 
      teacher,
      subject,
      class: className,
      examType,
      semester,
      academicYear,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      // Students can only see their own grades
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers can see grades they've submitted or for classes they teach
      filter.teacher = req.user._id;
    }
    
    // Apply additional filters if provided
    if (student && req.user.role !== 'student') filter.student = student;
    if (teacher && req.user.role === 'admin') filter.teacher = teacher;
    if (subject) filter.subject = subject;
    if (className) filter.class = className;
    if (examType) filter.examType = examType;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const grades = await Grade.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email');

    // Get total count for pagination
    const count = await Grade.countDocuments(filter);

    res.status(200).json({
      grades,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalGrades: count
    });
  } catch (error) {
    console.error('Error in getAllGrades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get a single grade by ID
 * @route   GET /api/grades/:id
 * @access  Private (Admin, Teacher, Student - with role-based access)
 */
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email');

    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    // Check if user has permission to view this grade
    if (req.user.role === 'student' && grade.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this grade' });
    }

    if (req.user.role === 'teacher' && grade.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this grade' });
    }

    res.status(200).json(grade);
  } catch (error) {
    console.error('Error in getGradeById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create a new grade record
 * @route   POST /api/grades
 * @access  Private (Admin, Teacher)
 */
exports.createGrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is authorized to create grades
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to create grade records' });
    }

    const {
      student,
      subject,
      class: className,
      examType,
      marks,
      totalMarks,
      semester,
      academicYear,
      feedback
    } = req.body;

    // Validate student exists
    const studentExists = await User.findOne({ _id: student, role: 'student' });
    if (!studentExists) {
      return res.status(400).json({ message: 'Student not found' });
    }

    // Calculate percentage and grade
    const percentage = (marks / totalMarks) * 100;
    const grade = calculateGrade(percentage);

    // Check if a grade record already exists for this student, subject, exam type, and semester
    const existingGrade = await Grade.findOne({
      student,
      subject,
      class: className,
      examType,
      semester,
      academicYear
    });

    if (existingGrade) {
      return res.status(400).json({ 
        message: 'A grade record already exists for this student, subject, exam type, and semester' 
      });
    }

    // Create new grade record
    const newGrade = new Grade({
      student,
      teacher: req.user._id, // Teacher who created the grade
      subject,
      class: className,
      examType,
      marks,
      totalMarks,
      percentage,
      grade,
      semester,
      academicYear,
      feedback
    });

    await newGrade.save();

    res.status(201).json(newGrade);
  } catch (error) {
    console.error('Error in createGrade:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update an existing grade record
 * @route   PUT /api/grades/:id
 * @access  Private (Admin, Teacher who created the grade)
 */
exports.updateGrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    // Check if user is authorized to update this grade
    if (req.user.role !== 'admin' && grade.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this grade record' });
    }

    const {
      subject,
      class: className,
      examType,
      marks,
      totalMarks,
      semester,
      academicYear,
      feedback
    } = req.body;

    // Calculate percentage and grade
    const percentage = (marks / totalMarks) * 100;
    const gradeValue = calculateGrade(percentage);

    // Update grade record
    grade.subject = subject || grade.subject;
    grade.class = className || grade.class;
    grade.examType = examType || grade.examType;
    grade.marks = marks || grade.marks;
    grade.totalMarks = totalMarks || grade.totalMarks;
    grade.percentage = percentage;
    grade.grade = gradeValue;
    grade.semester = semester || grade.semester;
    grade.academicYear = academicYear || grade.academicYear;
    grade.feedback = feedback || grade.feedback;
    grade.updatedAt = Date.now();

    await grade.save();

    res.status(200).json(grade);
  } catch (error) {
    console.error('Error in updateGrade:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a grade record
 * @route   DELETE /api/grades/:id
 * @access  Private (Admin, Teacher who created the grade)
 */
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    // Check if user is authorized to delete this grade
    if (req.user.role !== 'admin' && grade.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this grade record' });
    }

    await grade.remove();

    res.status(200).json({ message: 'Grade record deleted successfully' });
  } catch (error) {
    console.error('Error in deleteGrade:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get grade statistics
 * @route   GET /api/grades/statistics
 * @access  Private (Admin, Teacher)
 */
exports.getGradeStatistics = async (req, res) => {
  try {
    // Check if user is authorized to view statistics
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to view grade statistics' });
    }

    const { 
      class: className,
      subject,
      examType,
      semester,
      academicYear
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Apply filters if provided
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    // For teachers, only show statistics for grades they've submitted
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    // Get grade distribution
    const gradeDistribution = await Grade.aggregate([
      { $match: filter },
      { $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get average percentage by class
    const classPerfomance = await Grade.aggregate([
      { $match: filter },
      { $group: {
          _id: '$class',
          averagePercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get average percentage by subject
    const subjectPerformance = await Grade.aggregate([
      { $match: filter },
      { $group: {
          _id: '$subject',
          averagePercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performers
    const topPerformers = await Grade.aggregate([
      { $match: filter },
      { $group: {
          _id: '$student',
          averagePercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { averagePercentage: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      { $project: {
          _id: 1,
          studentName: '$studentInfo.name',
          studentClass: '$studentInfo.class',
          averagePercentage: 1,
          count: 1
        }
      }
    ]);

    // Get exam type performance
    const examTypePerformance = await Grade.aggregate([
      { $match: filter },
      { $group: {
          _id: '$examType',
          averagePercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get semester comparison if academicYear is provided
    let semesterComparison = [];
    if (academicYear) {
      semesterComparison = await Grade.aggregate([
        { 
          $match: { 
            ...filter,
            academicYear: academicYear
          } 
        },
        { $group: {
            _id: {
              class: '$class',
              semester: '$semester'
            },
            averagePercentage: { $avg: '$percentage' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.class': 1, '_id.semester': 1 } }
      ]);
    }

    // Get year-on-year comparison
    const yearComparison = await Grade.aggregate([
      { $match: { ...filter, subject: { $exists: true } } },
      { $group: {
          _id: {
            subject: '$subject',
            academicYear: '$academicYear'
          },
          averagePercentage: { $avg: '$percentage' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.subject': 1, '_id.academicYear': 1 } }
    ]);

    res.status(200).json({
      gradeDistribution,
      classPerfomance,
      subjectPerformance,
      topPerformers,
      examTypePerformance,
      semesterComparison,
      yearComparison
    });
  } catch (error) {
    console.error('Error in getGradeStatistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get student report card
 * @route   GET /api/grades/report/:studentId
 * @access  Private (Admin, Teacher, Student - with role-based access)
 */
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;

    // Check if user has permission to view this student's report
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    // Validate student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Build filter object
    const filter = {
      student: mongoose.Types.ObjectId(studentId)
    };
    
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    // Get all grades for the student
    const grades = await Grade.find(filter)
      .populate('teacher', 'name email')
      .sort({ subject: 1 });

    // Calculate overall statistics
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let gradePoints = 0;

    grades.forEach(grade => {
      totalMarksObtained += grade.marks;
      totalMaxMarks += grade.totalMarks;
      gradePoints += getGradePoint(grade.grade);
    });

    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const overallGrade = calculateGrade(overallPercentage);
    const gpa = grades.length > 0 ? gradePoints / grades.length : 0;

    // Get student rank if academicYear and semester are provided
    let rank = null;
    if (academicYear && semester) {
      const studentsRanking = await Grade.aggregate([
        { 
          $match: { 
            academicYear,
            semester
          } 
        },
        { $group: {
            _id: '$student',
            averagePercentage: { $avg: '$percentage' }
          }
        },
        { $sort: { averagePercentage: -1 } }
      ]);

      // Find the student's position in the ranking
      const studentIndex = studentsRanking.findIndex(item => 
        item._id.toString() === studentId
      );
      
      if (studentIndex !== -1) {
        rank = studentIndex + 1;
      }
    }

    res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        studentId: student.studentId
      },
      grades,
      summary: {
        totalSubjects: grades.length,
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
        overallGrade,
        gpa,
        rank
      },
      semester,
      academicYear
    });
  } catch (error) {
    console.error('Error in getStudentReport:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Helper function to calculate grade based on percentage
 */
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

/**
 * Helper function to get grade point for GPA calculation
 */
const getGradePoint = (grade) => {
  switch (grade) {
    case 'A+': return 4.0;
    case 'A': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'C+': return 2.7;
    case 'C': return 2.3;
    case 'D+': return 1.7;
    case 'D': return 1.3;
    case 'F': return 0.0;
    default: return 0.0;
  }
};