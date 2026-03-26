const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const gradeController = require('../controllers/gradeController');
const auth = require('../middleware/auth');

// @route   GET /api/grades
// @desc    Get all grades with filtering and pagination
// @access  Private (Admin, Teacher, Student - with role-based filtering)
router.get('/', auth, gradeController.getAllGrades);

// @route   GET /api/grades/statistics
// @desc    Get grade statistics
// @access  Private (Admin, Teacher)
router.get('/statistics', auth, gradeController.getGradeStatistics);

// @route   GET /api/grades/report/:studentId
// @desc    Get student report card
// @access  Private (Admin, Teacher, Student - with role-based access)
router.get('/report/:studentId', auth, gradeController.getStudentReport);

// @route   GET /api/grades/:id
// @desc    Get a single grade by ID
// @access  Private (Admin, Teacher, Student - with role-based access)
router.get('/:id', auth, gradeController.getGradeById);

// @route   POST /api/grades
// @desc    Create a new grade record
// @access  Private (Admin, Teacher)
router.post(
  '/',
  [
    auth,
    [
      check('student', 'Student ID is required').not().isEmpty(),
      check('subject', 'Subject is required').not().isEmpty(),
      check('class', 'Class is required').not().isEmpty(),
      check('examType', 'Exam type is required').not().isEmpty(),
      check('marks', 'Marks are required').isNumeric(),
      check('totalMarks', 'Total marks are required').isNumeric(),
      check('semester', 'Semester is required').not().isEmpty(),
      check('academicYear', 'Academic year is required').not().isEmpty()
    ]
  ],
  gradeController.createGrade
);

// @route   PUT /api/grades/:id
// @desc    Update an existing grade record
// @access  Private (Admin, Teacher who created the grade)
router.put(
  '/:id',
  [
    auth,
    [
      check('subject', 'Subject is required').not().isEmpty(),
      check('class', 'Class is required').not().isEmpty(),
      check('examType', 'Exam type is required').not().isEmpty(),
      check('marks', 'Marks are required').isNumeric(),
      check('totalMarks', 'Total marks are required').isNumeric(),
      check('semester', 'Semester is required').not().isEmpty(),
      check('academicYear', 'Academic year is required').not().isEmpty()
    ]
  ],
  gradeController.updateGrade
);

// @route   DELETE /api/grades/:id
// @desc    Delete a grade record
// @access  Private (Admin, Teacher who created the grade)
router.delete('/:id', auth, gradeController.deleteGrade);

module.exports = router;