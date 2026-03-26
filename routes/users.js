const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin)
router.get('/', auth, userController.getUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, userController.getUserById);

// @route   POST api/users
// @desc    Create a new user
// @access  Private (Admin)
router.post('/', auth, userController.createUser);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private (Admin or Self)
router.put('/:id', auth, userController.updateUser);

// @route   PUT api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile/update', auth, userController.updateProfile);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', auth, userController.deleteUser);

// @route   POST api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', auth, userController.uploadProfilePicture);

// @route   POST api/users/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', auth, userController.changePassword);

module.exports = router;