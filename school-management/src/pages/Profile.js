import React, { useState, useContext } from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, Button, TextField,
  Tabs, Tab, Divider, Switch, FormControlLabel, Card, CardContent,
  IconButton, Alert, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    department: user?.department || '',
    class: user?.class || '',
    rollNumber: user?.rollNumber || '',
    parentName: user?.parentInfo?.name || '',
    parentContact: user?.parentInfo?.contactNumber || '',
    parentEmail: user?.parentInfo?.email || '',
    darkMode: user?.preferences?.theme === 'dark',
    emailNotifications: user?.preferences?.notifications?.email || false,
    smsNotifications: user?.preferences?.notifications?.sms || false
  });
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'darkMode' || name === 'emailNotifications' || name === 'smsNotifications') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      department: user?.department || '',
      class: user?.class || '',
      rollNumber: user?.rollNumber || '',
      parentName: user?.parentInfo?.name || '',
      parentContact: user?.parentInfo?.contactNumber || '',
      parentEmail: user?.parentInfo?.email || '',
      darkMode: user?.preferences?.theme === 'dark',
      emailNotifications: user?.preferences?.notifications?.email || false,
      smsNotifications: user?.preferences?.notifications?.sms || false
    });
    setError('');
    setSuccess(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const userData = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department,
        class: formData.class,
        rollNumber: formData.rollNumber,
        parentInfo: {
          name: formData.parentName,
          contactNumber: formData.parentContact,
          email: formData.parentEmail
        },
        preferences: {
          theme: formData.darkMode ? 'dark' : 'light',
          notifications: {
            email: formData.emailNotifications,
            sms: formData.smsNotifications
          }
        }
      };
      
      const result = await updateProfile(userData);
      
      if (result.success) {
        setSuccess(true);
        setEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Box sx={{ position: 'relative', mr: { xs: 0, sm: 4 }, mb: { xs: 3, sm: 0 } }}>
              <Avatar
                src={user?.profilePicture || '/static/images/avatar/1.jpg'}
                alt={user?.name}
                sx={{ width: 120, height: 120 }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper'
                }}
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="body2" color="primary" gutterBottom>
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'teacher' ? 'Teacher' : 'Student'}
              </Typography>
              
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Profile Tabs */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Personal Information" />
              <Tab label="Academic Details" />
              <Tab label="Settings" />
            </Tabs>
            
            {/* Personal Information Tab */}
            {tabValue === 0 && (
              <Box component="form" sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      disabled={true} // Email cannot be changed
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Parent/Guardian Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Parent/Guardian Name"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Parent/Guardian Contact"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Parent/Guardian Email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Academic Details Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Class/Grade"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Roll Number"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Academic Summary
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Attendance
                        </Typography>
                        <Typography variant="h3" color="primary" align="center">
                          85%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Overall Attendance Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          GPA
                        </Typography>
                        <Typography variant="h3" color="primary" align="center">
                          3.7
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Current Semester
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Rank
                        </Typography>
                        <Typography variant="h3" color="primary" align="center">
                          12
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          In Class of 45 Students
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Settings Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.darkMode}
                        onChange={handleChange}
                        name="darkMode"
                        disabled={!editing}
                      />
                    }
                    label="Dark Mode"
                  />
                </Paper>
                
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        name="emailNotifications"
                        disabled={!editing}
                      />
                    }
                    label="Email Notifications"
                  />
                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.smsNotifications}
                        onChange={handleChange}
                        name="smsNotifications"
                        disabled={!editing}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;