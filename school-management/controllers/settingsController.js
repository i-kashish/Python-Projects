const SystemSettings = require('../models/SystemSettings');

// Get system settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();

        if (!settings) {
            // Create default settings if none exist
            settings = new SystemSettings({
                sections: {
                    students: true,
                    teachers: true,
                    attendance: true,
                    grades: true,
                    fees: true
                }
            });
            await settings.save();
        }

        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update system settings
exports.updateSettings = async (req, res) => {
    const { sections } = req.body;

    try {
        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings({ sections });
        } else {
            settings.sections = sections;
            settings.lastUpdated = Date.now();
            settings.updatedBy = req.user.id;
        }

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
