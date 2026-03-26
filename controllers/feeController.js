const Fee = require('../models/Fee');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all fees with filtering, pagination, and population
exports.getAllFees = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      class: className,
      feeType,
      status,
      semester,
      academicYear,
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (studentId) filter.studentId = studentId;
    if (className) filter.class = className;
    if (feeType) filter.feeType = feeType;
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    // Handle student name search (search in User model)
    if (studentName) {
      const students = await User.find({
        role: 'student',
        name: { $regex: studentName, $options: 'i' }
      }).select('_id');
      
      filter.studentId = { $in: students.map(student => student._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const fees = await Fee.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('studentId', 'name email class')
      .populate('createdBy', 'name role');

    // Get total count for pagination
    const totalFees = await Fee.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: fees.length,
      total: totalFees,
      totalPages: Math.ceil(totalFees / parseInt(limit)),
      currentPage: parseInt(page),
      fees
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error.message
    });
  }
};

// Get a single fee by ID
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('studentId', 'name email class')
      .populate('createdBy', 'name role');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      fee
    });
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee record',
      error: error.message
    });
  }
};

// Create a new fee record
exports.createFee = async (req, res) => {
  try {
    // Only admin and staff can create fee records
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create fee records'
      });
    }

    const {
      studentId,
      class: className,
      feeType,
      amount,
      dueDate,
      status,
      semester,
      academicYear
    } = req.body;

    // Validate required fields
    if (!studentId || !className || !feeType || !amount || !dueDate || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if a fee record already exists for this student, fee type, semester, and academic year
    const existingFee = await Fee.findOne({
      studentId,
      feeType,
      semester,
      academicYear
    });

    if (existingFee) {
      return res.status(400).json({
        success: false,
        message: 'A fee record already exists for this student, fee type, semester, and academic year'
      });
    }

    // Create new fee record
    const newFee = new Fee({
      studentId,
      class: className,
      feeType,
      amount,
      dueDate,
      status: status || 'pending',
      semester,
      academicYear,
      createdBy: req.user.id
    });

    await newFee.save();

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      fee: newFee
    });
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee record',
      error: error.message
    });
  }
};

// Update an existing fee record
exports.updateFee = async (req, res) => {
  try {
    // Only admin and staff can update fee records
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update fee records'
      });
    }

    const feeId = req.params.id;
    const updateData = req.body;

    // Find fee record
    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Update fee record
    const updatedFee = await Fee.findByIdAndUpdate(
      feeId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email class');

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      fee: updatedFee
    });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fee record',
      error: error.message
    });
  }
};

// Delete a fee record
exports.deleteFee = async (req, res) => {
  try {
    // Only admin can delete fee records
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete fee records'
      });
    }

    const feeId = req.params.id;

    // Find and delete fee record
    const fee = await Fee.findByIdAndDelete(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee record',
      error: error.message
    });
  }
};

// Process a payment for a fee
exports.processPayment = async (req, res) => {
  try {
    const feeId = req.params.id;
    const { paymentMethod, paymentDate, transactionId, amount } = req.body;

    // Validate required fields
    if (!paymentMethod || !paymentDate || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required payment details'
      });
    }

    // Find fee record
    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Check if fee is already paid
    if (fee.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fee has already been paid'
      });
    }

    // Update fee with payment information
    fee.status = 'paid';
    fee.paymentDate = paymentDate;
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId || `TXN${Date.now()}`;
    fee.paidAmount = amount;
    fee.updatedBy = req.user.id;

    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      fee
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Get fee statistics
exports.getFeeStatistics = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;

    // Build match object for aggregation
    const match = {};
    if (academicYear) match.academicYear = academicYear;
    if (semester) match.semester = semester;

    // Calculate total fees, collected amount, and pending amount
    const statistics = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$amount' },
          collectedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          totalRecords: { $sum: 1 },
          paidRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
            }
          },
          pendingRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          overdueRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Calculate fee collection by type
    const feeTypeStats = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$feeType',
          totalAmount: { $sum: '$amount' },
          collectedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Calculate fee collection by class
    const classStats = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$class',
          totalAmount: { $sum: '$amount' },
          collectedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get monthly collection trend
    const monthlyTrend = await Fee.aggregate([
      {
        $match: {
          ...match,
          status: 'paid',
          paymentDate: { $exists: true }
        }
      },
      {
        $project: {
          amount: 1,
          month: { $month: { $toDate: '$paymentDate' } },
          year: { $year: { $toDate: '$paymentDate' } }
        }
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalCollected: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          totalCollected: 1,
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.status(200).json({
      success: true,
      statistics: statistics.length > 0 ? statistics[0] : {
        totalFees: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        totalRecords: 0,
        paidRecords: 0,
        pendingRecords: 0,
        overdueRecords: 0
      },
      feeTypeStats,
      classStats,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching fee statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee statistics',
      error: error.message
    });
  }
};

// Get student fee summary
exports.getStudentFeeSummary = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { academicYear } = req.query;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build match object for aggregation
    const match = { studentId: mongoose.Types.ObjectId(studentId) };
    if (academicYear) match.academicYear = academicYear;

    // Get fee summary
    const feeSummary = await Fee.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$amount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0]
            }
          },
          totalRecords: { $sum: 1 },
          paidRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
            }
          },
          pendingRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          overdueRecords: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get fee details
    const feeDetails = await Fee.find(match)
      .sort({ dueDate: -1 })
      .populate('createdBy', 'name role');

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: student.class
      },
      summary: feeSummary.length > 0 ? feeSummary[0] : {
        totalFees: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalRecords: 0,
        paidRecords: 0,
        pendingRecords: 0,
        overdueRecords: 0
      },
      feeDetails
    });
  } catch (error) {
    console.error('Error fetching student fee summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student fee summary',
      error: error.message
    });
  }
};

// Generate fee receipt
exports.generateFeeReceipt = async (req, res) => {
  try {
    const feeId = req.params.id;

    // Find fee record
    const fee = await Fee.findById(feeId)
      .populate('studentId', 'name email class')
      .populate('createdBy', 'name role');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Check if fee is paid
    if (fee.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate receipt for unpaid fee'
      });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCPT-${fee._id.toString().substring(0, 8).toUpperCase()}`,
      date: new Date().toISOString(),
      student: {
        id: fee.studentId._id,
        name: fee.studentId.name,
        email: fee.studentId.email,
        class: fee.studentId.class
      },
      fee: {
        id: fee._id,
        feeType: fee.feeType,
        amount: fee.amount,
        dueDate: fee.dueDate,
        paymentDate: fee.paymentDate,
        paymentMethod: fee.paymentMethod,
        transactionId: fee.transactionId,
        semester: fee.semester,
        academicYear: fee.academicYear
      },
      school: {
        name: 'School Management System',
        address: '123 Education Street, Knowledge City',
        phone: '+1-234-567-8900',
        email: 'info@schoolmanagementsystem.com'
      }
    };

    res.status(200).json({
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Error generating fee receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating fee receipt',
      error: error.message
    });
  }
};

// Check for overdue fees and update status
exports.updateOverdueFees = async (req, res) => {
  try {
    // Only admin can run this operation
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this operation'
      });
    }

    const today = new Date();
    
    // Find all pending fees with due date before today
    const result = await Fee.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: today }
      },
      {
        $set: {
          status: 'overdue',
          updatedBy: req.user.id
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Overdue fees updated successfully',
      updatedCount: result.nModified
    });
  } catch (error) {
    console.error('Error updating overdue fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating overdue fees',
      error: error.message
    });
  }
};