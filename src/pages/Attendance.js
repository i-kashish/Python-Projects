import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent,
  Button, TextField, InputAdornment, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  CircularProgress, Alert, Avatar, Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCode as QrCodeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import QRCode from 'qrcode.react';

const ALL_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  '11th Science', '11th Commerce', '11th Arts',
  '12th Science', '12th Commerce', '12th Arts'
];

const ALL_SUBJECTS = [
  'English', 'Hindi', 'Sanskrit', 'Mathematics', 'EVS',
  'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Political Science', 'Economics',
  'Accountancy', 'Business Studies', 'Computer Science',
  'Informatics Practices', 'Fine Arts', 'Physical Education',
  'Music', 'General Knowledge'
];

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openMarkDialog, setOpenMarkDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [markFormData, setMarkFormData] = useState({
    status: 'present',
    checkInTime: format(new Date(), 'HH:mm:ss'),
    checkOutTime: '',
    subject: '',
    notes: ''
  });

  // Fetch attendance data from backend
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.class = filterClass;
      if (filterSubject) params.subject = filterSubject;
      if (selectedDate) params.date = format(selectedDate, 'yyyy-MM-dd');
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get('/api/attendance', { params });
      const data = res.data;
      const records = Array.isArray(data) ? data
        : Array.isArray(data?.records) ? data.records
          : Array.isArray(data?.attendance) ? data.attendance
            : [];
      setAttendanceData(records);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for manual attendance
  const fetchStudents = async () => {
    try {
      const params = { role: 'student', limit: 100 };
      if (filterClass) params.class = filterClass;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get('/api/users', { params });
      setStudents(res.data.users || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  // Fetch data when filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, [searchTerm, filterClass, filterSubject, selectedDate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // In a real implementation, this would fetch attendance data for the selected date
  };

  const handleFilterClass = (e) => {
    setFilterClass(e.target.value);
  };

  const handleFilterSubject = (e) => {
    setFilterSubject(e.target.value);
  };

  const handleOpenQRDialog = () => {
    const qrData = {
      class: filterClass || ALL_CLASSES[0],
      subject: filterSubject || ALL_SUBJECTS[0],
      date: format(selectedDate, 'yyyy-MM-dd'),
      token: Math.random().toString(36).substring(2, 15)
    };

    setQrValue(JSON.stringify(qrData));
    setOpenQRDialog(true);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
  };

  const handleOpenMarkDialog = (record = null) => {
    if (record && (record.student || record.studentName)) {
      // It's an existing attendance record
      setEditingAttendanceId(record._id || record.id || record.attendanceId);
      setSelectedStudent(record.student || { _id: record.studentId, name: record.studentName });
      setMarkFormData({
        status: record.status || 'present',
        checkInTime: record.checkInTime || format(new Date(), 'HH:mm:ss'),
        checkOutTime: record.checkOutTime || '',
        subject: record.subject || filterSubject || '',
        notes: record.notes || ''
      });
    } else {
      // It's a new attendance or a simple student object
      setEditingAttendanceId(null);
      setSelectedStudent(record);
      setMarkFormData({
        status: 'present',
        checkInTime: format(new Date(), 'HH:mm:ss'),
        checkOutTime: '',
        subject: filterSubject || '',
        notes: ''
      });
    }
    setOpenMarkDialog(true);
  };

  const handleCloseMarkDialog = () => {
    setOpenMarkDialog(false);
    setError('');
    setSuccess(false);
  };

  const handleMarkFormChange = (e) => {
    const { name, value } = e.target;
    setMarkFormData({
      ...markFormData,
      [name]: value
    });
  };

  const handleMarkAttendance = async () => {
    if (!selectedStudent) {
      setError('Please select a student to mark attendance');
      return;
    }
    if (!markFormData.subject && !filterSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        student: selectedStudent._id || selectedStudent.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: markFormData.status,
        class: filterClass || selectedStudent.class || '',
        subject: markFormData.subject || filterSubject || '',
        checkInTime: markFormData.checkInTime,
        checkOutTime: markFormData.checkOutTime,
        notes: markFormData.notes
      };

      if (editingAttendanceId) {
        await axios.put(`/api/attendance/${editingAttendanceId}`, payload);
      } else {
        await axios.post('/api/attendance', payload);
      }

      setSuccess(true);
      setSuccessMsg('Attendance marked successfully!');
      fetchAttendance();

      setTimeout(() => {
        handleCloseMarkDialog();
      }, 1000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAttendance = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    alert('Attendance data would be exported here');
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Mark Attendance" />
          <Tab label="Attendance Records" />
          <Tab label="Reports & Analytics" />
        </Tabs>

        {/* Mark Attendance Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      QR Code Attendance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Generate a QR code for students to scan and mark their attendance automatically.
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Class</InputLabel>
                          <Select
                            value={filterClass}
                            onChange={handleFilterClass}
                            label="Class"
                          >
                            <MenuItem value="">All Classes</MenuItem>
                            {ALL_CLASSES.map(cls => (
                              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Subject</InputLabel>
                          <Select
                            value={filterSubject}
                            onChange={handleFilterSubject}
                            label="Subject"
                          >
                            <MenuItem value="">All Subjects</MenuItem>
                            {ALL_SUBJECTS.map(subj => (
                              <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      startIcon={<QrCodeIcon />}
                      onClick={handleOpenQRDialog}
                      fullWidth
                    >
                      Generate QR Code
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Manual Attendance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Mark attendance manually for individual students or bulk update.
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          placeholder="Search student by name"
                          value={searchTerm}
                          onChange={handleSearch}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Class</InputLabel>
                          <Select
                            value={filterClass}
                            onChange={handleFilterClass}
                            label="Class"
                          >
                            <MenuItem value="">All Classes</MenuItem>
                            {ALL_CLASSES.map(cls => (
                              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenMarkDialog()}
                      fullWidth
                    >
                      Mark Attendance
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Today's Attendance Summary
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportAttendance}
                      >
                        Export
                      </Button>
                    </Box>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Check-In</TableCell>
                            <TableCell>Check-Out</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendanceData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.studentName || record.student?.name || 'Unknown'}</TableCell>
                                <TableCell>{record.class}</TableCell>
                                <TableCell>{record.subject}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    color={getAttendanceStatusColor(record.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{record.checkInTime || '-'}</TableCell>
                                <TableCell>{record.checkOutTime || '-'}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenMarkDialog(record)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          {attendanceData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <Typography variant="body1" sx={{ py: 2 }}>
                                  No attendance records found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={attendanceData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Attendance Records Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        placeholder="Search student"
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={filterClass}
                          onChange={handleFilterClass}
                          label="Class"
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {ALL_CLASSES.map(cls => (
                            <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Subject</InputLabel>
                        <Select
                          value={filterSubject}
                          onChange={handleFilterSubject}
                          label="Subject"
                        >
                          <MenuItem value="">All Subjects</MenuItem>
                          {ALL_SUBJECTS.map(subj => (
                            <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportAttendance}
                        fullWidth
                      >
                        Export
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Check-In</TableCell>
                        <TableCell>Check-Out</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.studentName || record.student?.name || 'Unknown'}</TableCell>
                            <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{record.class}</TableCell>
                            <TableCell>{record.subject}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                color={getAttendanceStatusColor(record.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{record.checkInTime || '-'}</TableCell>
                            <TableCell>{record.checkOutTime || '-'}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenMarkDialog(record)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      {attendanceData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              No attendance records found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={attendanceData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Reports & Analytics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attendance Overview
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">85%</Typography>
                        <Typography variant="body2">Present</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">10%</Typography>
                        <Typography variant="body2">Late</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">5%</Typography>
                        <Typography variant="body2">Absent</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Overall attendance for {format(selectedDate, 'MMMM yyyy')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Attendance
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      {ALL_CLASSES.slice(0, 5).map((cls, index) => (
                        <Box key={cls} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{cls}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {90 - index * 3}%
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: '100%',
                              backgroundColor: 'grey.300',
                              borderRadius: 1,
                              height: 8
                            }}
                          >
                            <Box
                              sx={{
                                width: `${90 - index * 3}%`,
                                backgroundColor: 90 - index * 3 > 85 ? 'success.main' :
                                  90 - index * 3 > 75 ? 'warning.main' : 'error.main',
                                borderRadius: 1,
                                height: 8
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Low Attendance Alert
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      {[
                        { name: 'Michael Johnson', class: '10B', attendance: 65 },
                        { name: 'Sarah Parker', class: '11A', attendance: 70 },
                        { name: 'James Wilson', class: '12B', attendance: 72 }
                      ].map((student, index) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2 }}>
                            <Avatar sx={{ bgcolor: 'error.main' }}>
                              {student.name.charAt(0)}
                            </Avatar>
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">{student.name}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Class: {student.class}
                              </Typography>
                              <Chip
                                label={`${student.attendance}%`}
                                color="error"
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Button variant="outlined" fullWidth>
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Attendance Trend
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', mt: 3 }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                        const height = 70 + Math.random() * 20;
                        return (
                          <Box key={month} sx={{ textAlign: 'center' }}>
                            <Box
                              sx={{
                                height: `${height}%`,
                                width: 40,
                                backgroundColor: height > 85 ? 'success.main' :
                                  height > 75 ? 'warning.main' : 'error.main',
                                borderRadius: 1,
                                mb: 1
                              }}
                            />
                            <Typography variant="body2">{month}</Typography>
                            <Typography variant="caption">{Math.round(height)}%</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* QR Code Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog}>
        <DialogTitle>Attendance QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <QRCode value={qrValue} size={256} level="H" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Scan this QR code to mark your attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Valid for: {filterClass || 'All Classes'} | {filterSubject || 'All Subjects'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {format(selectedDate, 'dd MMMM yyyy')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRDialog}>Close</Button>
          <Button variant="contained">Download QR</Button>
        </DialogActions>
      </Dialog>

      {/* Mark Attendance Dialog */}
      <Dialog open={openMarkDialog} onClose={handleCloseMarkDialog}>
        <DialogTitle>
          {selectedStudent ? `Update Attendance: ${selectedStudent.studentName || selectedStudent.student?.name || selectedStudent.name || 'Student'}` : 'Mark Attendance'}
        </DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Attendance marked successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudent?._id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s._id === e.target.value);
                    setSelectedStudent(student || null);
                  }}
                  label="Select Student"
                >
                  {students.length === 0 ? (
                    <MenuItem disabled value="">
                      No students found. Add students first.
                    </MenuItem>
                  ) : (
                    students.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name} {s.class ? `(${s.class})` : ''} {s.rollNumber ? `- ${s.rollNumber}` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={markFormData.status}
                  onChange={handleMarkFormChange}
                  label="Status"
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={markFormData.subject || filterSubject || ''}
                  onChange={handleMarkFormChange}
                  label="Subject"
                >
                  {ALL_SUBJECTS.map(subj => (
                    <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-In Time"
                name="checkInTime"
                type="time"
                value={markFormData.checkInTime ? markFormData.checkInTime.split(':').slice(0, 2).join(':') : ''}
                onChange={handleMarkFormChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                disabled={markFormData.status === 'absent'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-Out Time"
                name="checkOutTime"
                type="time"
                value={markFormData.checkOutTime ? markFormData.checkOutTime.split(':').slice(0, 2).join(':') : ''}
                onChange={handleMarkFormChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                disabled={markFormData.status === 'absent'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={markFormData.notes}
                onChange={handleMarkFormChange}
                placeholder="Add any additional notes here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarkDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkAttendance}
            disabled={loading || !selectedStudent}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance;