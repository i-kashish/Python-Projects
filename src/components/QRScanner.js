import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const QRScanner = ({ onSuccess, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, token } = useContext(AuthContext);

  const handleScan = async (data) => {
    if (data && !scannedData) {
      setScannedData(data);
      setScanning(false);
      
      try {
        // Validate QR data format
        const qrData = JSON.parse(data);
        if (!qrData.class || !qrData.subject || !qrData.date || !qrData.token) {
          throw new Error('Invalid QR code format');
        }
        
        // Process the scanned QR code
        await processAttendance(data);
      } catch (err) {
        setError('Invalid QR code format. Please try again.');
        if (onError) onError(err.message);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera. Please check permissions and try again.');
    if (onError) onError(err.message);
  };

  const processAttendance = async (qrCodeData) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // In a real implementation, this would call the backend API
      // For demo purposes, we'll simulate a successful API call
      
      // Uncomment this in a real implementation
      /*
      const response = await axios.post(
        '/api/attendance/qr',
        { qrCodeData },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      */
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const qrData = JSON.parse(qrCodeData);
      const mockResponse = {
        success: true,
        attendance: {
          student: user.id,
          date: qrData.date,
          status: 'present',
          class: qrData.class,
          subject: qrData.subject,
          checkInTime: new Date().toTimeString().split(' ')[0]
        },
        msg: 'Attendance marked successfully'
      };
      
      setSuccess(true);
      setLoading(false);
      
      if (onSuccess) onSuccess(mockResponse);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to mark attendance. Please try again.');
      setLoading(false);
      if (onError) onError(err.message);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError('');
    setSuccess(false);
    setScanning(true);
  };

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
      {!scanning && !scannedData && (
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => setScanning(true)}
            fullWidth
          >
            Scan QR Code
          </Button>
        </Box>
      )}
      
      {scanning && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scan Attendance QR Code
          </Typography>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (result) {
                  handleScan(result?.text);
                }
                if (error) {
                  console.info(error);
                }
              }}
              style={{ width: '100%' }}
            />
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => setScanning(false)}
            fullWidth
          >
            Cancel
          </Button>
        </Paper>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Attendance marked successfully!
        </Alert>
      )}
      
      {scannedData && !scanning && !loading && (
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={resetScanner}
            fullWidth
          >
            Scan Another QR Code
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QRScanner;