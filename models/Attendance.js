const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  qrCodeData: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);