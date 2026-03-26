const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['tuition', 'library', 'transportation', 'hostel', 'examination', 'other'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'partial'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'other']
  },
  transactionId: {
    type: String
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number
  },
  receiptNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Calculate remaining amount before saving
FeeSchema.pre('save', function(next) {
  this.remainingAmount = this.amount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    if (new Date() > this.dueDate) {
      this.status = 'overdue';
    } else {
      this.status = 'pending';
    }
  } else if (this.paidAmount < this.amount) {
    this.status = 'partial';
  } else if (this.paidAmount >= this.amount) {
    this.status = 'paid';
    this.remainingAmount = 0;
  }
  
  next();
});

// Indexes for faster queries
FeeSchema.index({ student: 1, academicYear: 1 });
FeeSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Fee', FeeSchema);