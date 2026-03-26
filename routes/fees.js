const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feeController = require('../controllers/feeController');

// Get all fees with filtering and pagination
router.get('/', auth, feeController.getAllFees);

// Get a single fee by ID
router.get('/:id', auth, feeController.getFeeById);

// Create a new fee record (admin and teacher only)
router.post('/', auth, feeController.createFee);

// Update an existing fee record (admin and teacher only)
router.put('/:id', auth, feeController.updateFee);

// Delete a fee record (admin only)
router.delete('/:id', auth, feeController.deleteFee);

// Process a payment for a fee
router.post('/:id/payment', auth, feeController.processPayment);

// Get fee statistics
router.get('/statistics/summary', auth, feeController.getFeeStatistics);

// Get student fee summary
router.get('/student/:studentId', auth, feeController.getStudentFeeSummary);

// Generate fee receipt
router.get('/:id/receipt', auth, feeController.generateFeeReceipt);

// Check for overdue fees and update status (admin only)
router.post('/update-overdue', auth, feeController.updateOverdueFees);

module.exports = router;