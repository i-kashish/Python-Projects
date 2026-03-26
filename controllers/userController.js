const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users with pagination and filtering
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Search by name or email if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create new user
exports.createUser = async (req, res) => {
  console.log('--- CREATE USER DEBUG ---');
  console.log('Headers:', req.headers['content-type']);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('-------------------------');
  const {
    name,
    email,
    password,
    role,
    contactNumber,
    address,
    dateOfBirth,
    department,
    class: uClass,
    rollNumber,
    employeeId,
    subjects,
    parentInfo,
    preferences
  } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'student',
      contactNumber,
      address,
      dateOfBirth,
      department,
      class: uClass,
      rollNumber,
      employeeId,
      subjects,
      parentInfo,
      preferences
    });

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(201).json({
      msg: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const {
    name,
    contactNumber,
    address,
    dateOfBirth,
    department,
    class: userClass,
    rollNumber,
    employeeId,
    subjects,
    parentInfo,
    preferences
  } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (contactNumber) userFields.contactNumber = contactNumber;
  if (address) userFields.address = address;
  if (dateOfBirth) userFields.dateOfBirth = dateOfBirth;
  if (department) userFields.department = department;
  if (userClass) userFields.class = userClass;
  if (rollNumber) userFields.rollNumber = rollNumber;
  if (employeeId) userFields.employeeId = employeeId;
  if (subjects) userFields.subjects = subjects;
  if (parentInfo) userFields.parentInfo = parentInfo;
  if (preferences) userFields.preferences = preferences;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user has permission to update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update fields
    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (department) user.department = department;
    if (userClass) user.class = userClass;
    if (rollNumber) user.rollNumber = rollNumber;
    if (employeeId) user.employeeId = employeeId;
    if (subjects) user.subjects = subjects;
    if (parentInfo) user.parentInfo = parentInfo;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update user profile (for current user)
exports.updateProfile = async (req, res) => {
  const {
    name,
    contactNumber,
    address,
    dateOfBirth,
    department,
    class: userClass,
    rollNumber,
    employeeId,
    subjects,
    parentInfo,
    preferences
  } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (department) user.department = department;
    if (userClass) user.class = userClass;
    if (rollNumber) user.rollNumber = rollNumber;
    if (employeeId) user.employeeId = employeeId;
    if (subjects) user.subjects = subjects;
    if (parentInfo) user.parentInfo = parentInfo;
    if (preferences) user.preferences = preferences;

    await user.save();

    // Return user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await User.findByIdAndRemove(req.params.id);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    // In a real implementation, this would handle file upload
    // For now, we'll just update the profilePicture field with a URL
    const profilePicture = req.body.profilePicture;

    if (!profilePicture) {
      return res.status(400).json({ msg: 'Please provide a profile picture URL' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};