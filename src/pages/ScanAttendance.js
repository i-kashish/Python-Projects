import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  useTheme
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import AuthContext from '../context/AuthContext';
import QRScanner from '../components/QRScanner';

// Mock data for demonstration
const MOCK_RECENT_ATTENDANCE = [
  {
    id: '1',
    date: '2023-06-01',
    class: '10A',
    subject: 'Mathematics',
    status: 'present',
    checkInTime: '08:30:00'
  },
  {
    id: '2',
    date: '2023-05-31',
    class: '10A',
    subject: 'Physics',
    status: 'present',
    checkInTime: '08:35:00'
  },
  {
    id: '3',
    date: '2023-05-30',
    class: '10A',
    subject: 'Chemistry',
    status: 'late',
    checkInTime: '09:15:00'
  }
];

const ScanAttendance = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [showScanner, setShowScanner] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState(MOCK_RECENT_ATTENDANCE);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState('');
  const [lastScanned, setLastScanned] = useState(null);

  const handleScanSuccess = (data) => {
    setScanSuccess(true);
    setScanError('');
    setShowScanner(false);
    
    // Parse QR data
    const qrData = JSON.parse(data.attendance.date);
    
    // Add to recent attendance
    const newAttendance = {
      id: Math.random().toString(36).substring(2, 9),
      date: data.attendance.date,
      class: data.attendance.class,
      subject: data.attendance.subject,
      status: data.attendance.status,
      checkInTime: data.attendance.checkInTime
    };
    
    setLastScanned(newAttendance);
    setRecentAttendance([newAttendance, ...recentAttendance.slice(0, 4)]);
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setScanSuccess(false);
    }, 5000);
  };

  const handleScanError = (error) => {
    setScanError(error);
    setScanSuccess(false);
    setShowScanner(false);
    
    // Reset error message after 5 seconds
    setTimeout(() => {
      setScanError('');
    }, 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return theme.palette.success.main;
      case 'absent':
        return theme.palette.error.main;
      case 'late':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Attendance Scanner
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {user?.name || 'Student'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email || 'student@example.com'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Class: {user?.profile?.class || '10A'} | Roll No: {user?.profile?.rollNumber || '101'}
            </Typography>
          </Box>
          
          {scanSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Attendance marked successfully!
            </Alert>
          )}
          
          {scanError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {scanError}
            </Alert>
          )}
          
          {lastScanned && (
            <Card variant="outlined" sx={{ mb: 3, bgcolor: theme.palette.success.light }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Last Scanned
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">
                      {lastScanned.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Class: {lastScanned.class}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" sx={{ color: getStatusColor(lastScanned.status) }}>
                      {lastScanned.status.charAt(0).toUpperCase() + lastScanned.status.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lastScanned.checkInTime}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {showScanner ? (
            <QRScanner 
              onSuccess={handleScanSuccess}
              onError={handleScanError}
            />
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCodeIcon />}
              onClick={() => setShowScanner(true)}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Scan QR Code
            </Button>
          )}
        </Paper>
      </Box>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Recent Attendance
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {recentAttendance.map((record) => (
            <ListItem key={record.id} divider>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary={record.subject}
                secondary={`Class: ${record.class} | ${format(new Date(record.date), 'dd MMM yyyy')}`}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body2" sx={{ color: getStatusColor(record.status) }}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                  <Typography variant="caption">
                    {record.checkInTime}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
          
          {recentAttendance.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No recent attendance records"
                secondary="Scan a QR code to mark your attendance"
              />
            </ListItem>
          )}
        </List>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
          >
            View All Attendance
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ScanAttendance;