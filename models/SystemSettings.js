const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
    sections: {
        students: { type: Boolean, default: true },
        teachers: { type: Boolean, default: true },
        attendance: { type: Boolean, default: true },
        grades: { type: Boolean, default: true },
        fees: { type: Boolean, default: true }
    },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
