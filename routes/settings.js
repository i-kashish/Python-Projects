const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// @route   GET api/settings
// @desc    Get system settings
// @access  Private
router.get('/', auth, getSettings);

// @route   PUT api/settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/', auth, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ msg: 'Not authorized' });
    }
    next();
}, updateSettings);

module.exports = router;
