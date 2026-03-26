import React, { useContext, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Switch, FormControlLabel,
    Card, CardContent, Divider, Button, Alert, Snackbar,
    Avatar, List, ListItem, ListItemIcon, ListItemText,
    alpha, Fade
} from '@mui/material';
import {
    Settings as SettingsIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    EventNote as EventNoteIcon,
    Grade as GradeIcon,
    Payment as PaymentIcon,
    Lock as LockIcon,
    Security as SecurityIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import SettingsContext from '../context/SettingsContext';
import { styled } from '@mui/material/styles';

const GlassPaper = styled(Paper)(({ theme }) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: theme.spacing(4),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.05)}`
}));

const AdminPanel = () => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [localSections, setLocalSections] = useState(settings.sections);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [saving, setSaving] = useState(false);

    const handleToggle = (section) => {
        setLocalSections({
            ...localSections,
            [section]: !localSections[section]
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const success = await updateSettings(localSections);
        setSaving(false);

        if (success) {
            setSnackbar({
                open: true,
                message: 'System settings updated successfully!',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Failed to update settings. Please try again.',
                severity: 'error'
            });
        }
    };

    const sectionConfig = [
        { key: 'students', label: 'Students Section', icon: <PeopleIcon color="primary" />, desc: 'Show/Hide student records and management' },
        { key: 'teachers', label: 'Teachers Section', icon: <SchoolIcon color="warning" />, desc: 'Show/Hide teacher profiles and recruitment' },
        { key: 'attendance', label: 'Attendance System', icon: <EventNoteIcon color="info" />, desc: 'Show/Hide QR scanning and records' },
        { key: 'grades', label: 'Grades & Reports', icon: <GradeIcon color="secondary" />, desc: 'Show/Hide student performance analytics' },
        { key: 'fees', label: 'Finance & Fees', icon: <PaymentIcon color="error" />, desc: 'Show/Hide fee records and payments' }
    ];

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', p: 3 }}>
                        <SecurityIcon fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>Admin Controls</Typography>
                        <Typography variant="h6" color="text.secondary">Master toggle for all application modules</Typography>
                    </Box>
                </Box>

                <GlassPaper>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon color="action" /> Section Visibility
                    </Typography>

                    <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                        Changes made here will affect the visibility of modules for all users in real-time.
                    </Alert>

                    <List>
                        {sectionConfig.map((section, index) => (
                            <React.Fragment key={section.key}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: alpha('#6366f1', 0.05) },
                                        transition: 'all 0.2s'
                                    }}
                                    secondaryAction={
                                        <Switch
                                            edge="end"
                                            checked={localSections[section.key]}
                                            onChange={() => handleToggle(section.key)}
                                            color="secondary"
                                        />
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 50 }}>
                                        <Avatar sx={{ bgcolor: alpha('#f4f4f4', 0.5) }}>
                                            {section.icon}
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={section.label}
                                        secondary={section.desc}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                </ListItem>
                                {index < sectionConfig.length - 1 && <Divider variant="inset" component="li" sx={{ opacity: 0.5 }} />}
                            </React.Fragment>
                        ))}
                    </List>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                borderRadius: 3,
                                px: 6,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </GlassPaper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Fade>
    );
};

export default AdminPanel;
