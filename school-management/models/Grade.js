const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project'],
    required: true
  },
  marks: {
    obtained: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String
  },
  semester: {
    type: String
  },
  academicYear: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

// Calculate percentage and grade before saving
GradeSchema.pre('save', function(next) {
  this.percentage = (this.marks.obtained / this.marks.total) * 100;
  
  // Assign letter grade based on percentage
  if (this.percentage >= 90) {
    this.grade = 'A+';
  } else if (this.percentage >= 80) {
    this.grade = 'A';
  } else if (this.percentage >= 70) {
    this.grade = 'B';
  } else if (this.percentage >= 60) {
    this.grade = 'C';
  } else if (this.percentage >= 50) {
    this.grade = 'D';
  } else {
    this.grade = 'F';
  }
  
  next();
});

// Indexes for faster queries
GradeSchema.index({ student: 1, subject: 1, academicYear: 1 });
GradeSchema.index({ class: 1, subject: 1, examType: 1 });

module.exports = mongoose.model('Grade', GradeSchema);