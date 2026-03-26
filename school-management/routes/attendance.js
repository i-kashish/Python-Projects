const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

// @route   GET /api/attendance
// @desc    Get all attendance records with filtering
// @access  Private
router.get('/', auth, attendanceController.getAttendance);

// @route   GET /api/attendance/:id
// @desc    Get attendance by ID
// @access  Private
router.get('/:id', auth, attendanceController.getAttendanceById);

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Private (Teachers and Admins)
router.post(
  '/',
  [
    auth,
    check('student', 'Student ID is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['present', 'absent', 'late']),
    check('class', 'Class is required').not().isEmpty(),
    check('subject', 'Subject is required').not().isEmpty()
  ],
  attendanceController.createAttendance
);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teachers and Admins)
router.put(
  '/:id',
  [
    auth,
    check('status', 'Status must be valid').optional().isIn(['present', 'absent', 'late'])
  ],
  attendanceController.updateAttendance
);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', auth, attendanceController.deleteAttendance);

// @route   POST /api/attendance/qr
// @desc    Mark attendance via QR code
// @access  Private (Students)
router.post(
  '/qr',
  [
    auth,
    check('qrCodeData', 'QR code data is required').not().isEmpty()
  ],
  attendanceController.markAttendanceViaQR
);

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', auth, attendanceController.getAttendanceStats);

// @route   GET /api/attendance/trend
// @desc    Get monthly attendance trend
// @access  Private
router.get('/trend', auth, attendanceController.getAttendanceTrend);

module.exports = router;