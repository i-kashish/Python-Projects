import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent,
  Button, TextField, InputAdornment, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  CircularProgress, Alert, Divider, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import AuthContext from '../context/AuthContext';

// Mock data for demonstration
const MOCK_FEES_DATA = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    class: '10A',
    feeType: 'Tuition Fee',
    amount: 5000,
    dueDate: '2023-07-15',
    status: 'paid',
    paymentDate: '2023-07-10',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN123456',
    academicYear: '2023-2024',
    semester: '1st'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Jane Smith',
    class: '10A',
    feeType: 'Library Fee',
    amount: 1000,
    dueDate: '2023-07-15',
    status: 'paid',
    paymentDate: '2023-07-12',
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN789012',
    academicYear: '2023-2024',
    semester: '1st'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Michael Johnson',
    class: '10B',
    feeType: 'Tuition Fee',
    amount: 5000,
    dueDate: '2023-07-15',
    status: 'pending',
    paymentDate: null,
    paymentMethod: null,
    transactionId: null,
    academicYear: '2023-2024',
    semester: '1st'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Emily Williams',
    class: '10B',
    feeType: 'Examination Fee',
    amount: 2000,
    dueDate: '2023-07-20',
    status: 'overdue',
    paymentDate: null,
    paymentMethod: null,
    transactionId: null,
    academicYear: '2023-2024',
    semester: '1st'
  },
  {
    id: '5',
    studentId: '5',
    studentName: 'David Brown',
    class: '10C',
    feeType: 'Sports Fee',
    amount: 1500,
    dueDate: '2023-07-25',
    status: 'paid',
    paymentDate: '2023-07-20',
    paymentMethod: 'Cash',
    transactionId: 'TXN345678',
    academicYear: '2023-2024',
    semester: '1st'
  }
];

const MOCK_CLASSES = ['10A', '10B', '10C', '11A', '11B', '12A', '12B'];
const MOCK_FEE_TYPES = ['Tuition Fee', 'Library Fee', 'Examination Fee', 'Sports Fee', 'Transportation Fee', 'Hostel Fee'];
const MOCK_PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'UPI', 'PayPal'];
const MOCK_SEMESTERS = ['1st', '2nd'];
const MOCK_ACADEMIC_YEARS = ['2022-2023', '2023-2024', '2024-2025'];

const Fees = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterFeeType, setFilterFeeType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [feesData, setFeesData] = useState(MOCK_FEES_DATA);
  const [openFeeDialog, setOpenFeeDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [feeFormData, setFeeFormData] = useState({
    studentId: '',
    studentName: '',
    class: '',
    feeType: '',
    amount: '',
    dueDate: null,
    status: 'pending',
    semester: '',
    academicYear: ''
  });
  const [paymentFormData, setPaymentFormData] = useState({
    paymentMethod: '',
    paymentDate: new Date(),
    transactionId: '',
    amount: ''
  });

  // Filter fees data based on search term and filters
  useEffect(() => {
    let filteredData = MOCK_FEES_DATA.filter(record => 
      (record.studentName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterClass === '' || record.class === filterClass) &&
      (filterFeeType === '' || record.feeType === filterFeeType) &&
      (filterStatus === '' || record.status === filterStatus) &&
      (filterSemester === '' || record.semester === filterSemester) &&
      (filterAcademicYear === '' || record.academicYear === filterAcademicYear)
    );
    
    setFeesData(filteredData);
    setPage(0);
  }, [searchTerm, filterClass, filterFeeType, filterStatus, filterSemester, filterAcademicYear]);

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

  const handleFilterClass = (e) => {
    setFilterClass(e.target.value);
  };

  const handleFilterFeeType = (e) => {
    setFilterFeeType(e.target.value);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleFilterSemester = (e) => {
    setFilterSemester(e.target.value);
  };

  const handleFilterAcademicYear = (e) => {
    setFilterAcademicYear(e.target.value);
  };

  const handleOpenFeeDialog = (fee = null) => {
    if (fee) {
      setSelectedFee(fee);
      setFeeFormData({
        studentId: fee.studentId,
        studentName: fee.studentName,
        class: fee.class,
        feeType: fee.feeType,
        amount: fee.amount,
        dueDate: new Date(fee.dueDate),
        status: fee.status,
        semester: fee.semester,
        academicYear: fee.academicYear
      });
    } else {
      setSelectedFee(null);
      setFeeFormData({
        studentId: '',
        studentName: '',
        class: '',
        feeType: '',
        amount: '',
        dueDate: new Date(),
        status: 'pending',
        semester: '',
        academicYear: ''
      });
    }
    setOpenFeeDialog(true);
  };

  const handleCloseFeeDialog = () => {
    setOpenFeeDialog(false);
    setError('');
    setSuccess(false);
  };

  const handleOpenPaymentDialog = (fee) => {
    setSelectedFee(fee);
    setPaymentFormData({
      paymentMethod: '',
      paymentDate: new Date(),
      transactionId: '',
      amount: fee.amount
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setError('');
    setSuccess(false);
  };

  const handleFeeFormChange = (e) => {
    const { name, value } = e.target;
    setFeeFormData({
      ...feeFormData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFeeFormData({
      ...feeFormData,
      dueDate: date
    });
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({
      ...paymentFormData,
      [name]: value
    });
  };

  const handlePaymentDateChange = (date) => {
    setPaymentFormData({
      ...paymentFormData,
      paymentDate: date
    });
  };

  const handleSaveFee = () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate form data
    if (!feeFormData.studentName || !feeFormData.class || !feeFormData.feeType || 
        !feeFormData.amount || !feeFormData.dueDate || !feeFormData.semester || 
        !feeFormData.academicYear) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      try {
        if (selectedFee) {
          // Update existing fee record
          const updatedData = feesData.map(record => 
            record.id === selectedFee.id 
              ? { 
                  ...record, 
                  ...feeFormData,
                  dueDate: format(feeFormData.dueDate, 'yyyy-MM-dd')
                } 
              : record
          );
          setFeesData(updatedData);
        } else {
          // Add new fee record
          const newFee = {
            id: Math.random().toString(36).substring(2, 9),
            ...feeFormData,
            dueDate: format(feeFormData.dueDate, 'yyyy-MM-dd'),
            paymentDate: null,
            paymentMethod: null,
            transactionId: null
          };
          setFeesData([newFee, ...feesData]);
        }
        
        setSuccess(true);
        setLoading(false);
        
        // Close dialog after a short delay
        setTimeout(() => {
          handleCloseFeeDialog();
        }, 1500);
      } catch (err) {
        setError('An error occurred while saving fee');
        setLoading(false);
      }
    }, 1000);
  };

  const handleMakePayment = () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate form data
    if (!paymentFormData.paymentMethod || !paymentFormData.paymentDate || !paymentFormData.amount) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update fee record with payment information
        const updatedData = feesData.map(record => 
          record.id === selectedFee.id 
            ? { 
                ...record, 
                status: 'paid',
                paymentDate: format(paymentFormData.paymentDate, 'yyyy-MM-dd'),
                paymentMethod: paymentFormData.paymentMethod,
                transactionId: paymentFormData.transactionId || `TXN${Math.random().toString(36).substring(2, 8).toUpperCase()}`
              } 
            : record
        );
        setFeesData(updatedData);
        
        setSuccess(true);
        setLoading(false);
        
        // Close dialog after a short delay
        setTimeout(() => {
          handleClosePaymentDialog();
        }, 1500);
      } catch (err) {
        setError('An error occurred while processing payment');
        setLoading(false);
      }
    }, 1000);
  };

  const handleDeleteFee = (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      // Simulate API call
      setFeesData(feesData.filter(record => record.id !== id));
    }
  };

  const handleExportFees = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    alert('Fees data would be exported here');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate total fees, collected amount, and pending amount
  const calculateSummary = () => {
    let totalFees = 0;
    let collectedAmount = 0;
    let pendingAmount = 0;
    
    feesData.forEach(fee => {
      totalFees += fee.amount;
      if (fee.status === 'paid') {
        collectedAmount += fee.amount;
      } else {
        pendingAmount += fee.amount;
      }
    });
    
    return { totalFees, collectedAmount, pendingAmount };
  };

  const summary = calculateSummary();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Fee Records" />
          <Tab label="Payment" />
          <Tab label="Reports" />
        </Tabs>
        
        {/* Fee Records Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <TextField
                placeholder="Search student"
                value={searchTerm}
                onChange={handleSearch}
                sx={{ width: '40%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
              
              {(user?.role === 'admin') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenFeeDialog()}
                >
                  Add Fee
                </Button>
              )}
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={filterClass}
                    onChange={handleFilterClass}
                    label="Class"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {MOCK_CLASSES.map(cls => (
                      <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fee Type</InputLabel>
                  <Select
                    value={filterFeeType}
                    onChange={handleFilterFeeType}
                    label="Fee Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {MOCK_FEE_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterStatus}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={filterSemester}
                    onChange={handleFilterSemester}
                    label="Semester"
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {MOCK_SEMESTERS.map(sem => (
                      <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={filterAcademicYear}
                    onChange={handleFilterAcademicYear}
                    label="Academic Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {MOCK_ACADEMIC_YEARS.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportFees}
                  fullWidth
                >
                  Export
                </Button>
              </Grid>
            </Grid>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Fee Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feesData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.class}</TableCell>
                        <TableCell>{record.feeType}</TableCell>
                        <TableCell align="right">₹{record.amount.toLocaleString()}</TableCell>
                        <TableCell>{record.dueDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.paymentDate || '-'}</TableCell>
                        <TableCell>{record.paymentMethod || '-'}</TableCell>
                        <TableCell align="center">
                          {(user?.role === 'admin') && (
                            <>
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenFeeDialog(record)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteFee(record.id)}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {record.status !== 'paid' && (
                            <IconButton
                              color="success"
                              onClick={() => handleOpenPaymentDialog(record)}
                              size="small"
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {feesData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No fee records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={feesData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        )}
        
        {/* Payment Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Make Payment
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Student ID"
                          placeholder="Enter student ID"
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button 
                          variant="contained" 
                          sx={{ mt: 3 }}
                        >
                          Find Student
                        </Button>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Pending Fees
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Fee Type</TableCell>
                              <TableCell>Due Date</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="center">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feesData
                              .filter(fee => fee.status !== 'paid')
                              .slice(0, 3)
                              .map((fee) => (
                                <TableRow key={fee.id}>
                                  <TableCell>{fee.feeType}</TableCell>
                                  <TableCell>{fee.dueDate}</TableCell>
                                  <TableCell align="right">₹{fee.amount.toLocaleString()}</TableCell>
                                  <TableCell align="center">
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleOpenPaymentDialog(fee)}
                                    >
                                      Pay Now
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            {feesData.filter(fee => fee.status !== 'paid').length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" sx={{ py: 1 }}>
                                    No pending fees found
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Methods
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">Credit/Debit Card</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">Bank Transfer</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">Cash Payment</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">UPI Payment</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Transactions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {feesData
                      .filter(fee => fee.status === 'paid')
                      .slice(0, 3)
                      .map((fee) => (
                        <Box key={fee.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{fee.feeType}</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ₹{fee.amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {fee.paymentDate} • {fee.paymentMethod}
                            </Typography>
                            <Chip
                              label="Paid"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Divider sx={{ mt: 1 }} />
                        </Box>
                      ))}
                    
                    {feesData.filter(fee => fee.status === 'paid').length === 0 && (
                      <Typography variant="body2" sx={{ py: 1 }}>
                        No recent transactions found
                      </Typography>
                    )}
                    
                    <Button
                      variant="text"
                      endIcon={<HistoryIcon />}
                      sx={{ mt: 1 }}
                      fullWidth
                    >
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Reports Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AttachMoneyIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Total Fees</Typography>
                        <Typography variant="h4">₹{summary.totalFees.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Academic Year:</Typography>
                      <Typography variant="body2">2023-2024</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PaymentIcon color="success" sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Collected</Typography>
                        <Typography variant="h4">₹{summary.collectedAmount.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Collection Rate:</Typography>
                      <Typography variant="body2">
                        {summary.totalFees > 0 
                          ? `${((summary.collectedAmount / summary.totalFees) * 100).toFixed(1)}%` 
                          : '0%'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MoneyOffIcon color="error" sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Pending</Typography>
                        <Typography variant="h4">₹{summary.pendingAmount.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Pending Rate:</Typography>
                      <Typography variant="body2">
                        {summary.totalFees > 0 
                          ? `${((summary.pendingAmount / summary.totalFees) * 100).toFixed(1)}%` 
                          : '0%'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Fee Collection by Type
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ my: 2 }}>
                      {MOCK_FEE_TYPES.map((type, index) => {
                        const totalAmount = feesData
                          .filter(fee => fee.feeType === type)
                          .reduce((sum, fee) => sum + fee.amount, 0);
                        
                        const collectedAmount = feesData
                          .filter(fee => fee.feeType === type && fee.status === 'paid')
                          .reduce((sum, fee) => sum + fee.amount, 0);
                        
                        const percentage = totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;
                        
                        return (
                          <Box key={type} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{type}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ₹{totalAmount.toLocaleString()} (₹{collectedAmount.toLocaleString()} collected)
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
                                  width: `${percentage}%`,
                                  backgroundColor: percentage > 80 ? 'success.main' : 
                                                  percentage > 50 ? 'warning.main' : 'error.main',
                                  borderRadius: 1,
                                  height: 8
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Fee Collection by Class
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ my: 2 }}>
                      {MOCK_CLASSES.slice(0, 5).map((cls, index) => {
                        const totalAmount = feesData
                          .filter(fee => fee.class === cls)
                          .reduce((sum, fee) => sum + fee.amount, 0);
                        
                        const collectedAmount = feesData
                          .filter(fee => fee.class === cls && fee.status === 'paid')
                          .reduce((sum, fee) => sum + fee.amount, 0);
                        
                        const percentage = totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;
                        
                        return (
                          <Box key={cls} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Class {cls}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {percentage.toFixed(1)}%
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
                                  width: `${percentage}%`,
                                  backgroundColor: percentage > 80 ? 'success.main' : 
                                                  percentage > 50 ? 'warning.main' : 'error.main',
                                  borderRadius: 1,
                                  height: 8
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Collection Trend
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', mt: 3 }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                        const height = 30 + Math.random() * 70;
                        return (
                          <Box key={month} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                              sx={{
                                height: `${height}%`,
                                width: 20,
                                backgroundColor: index === 6 ? 'primary.main' : 'primary.light',
                                borderRadius: 1,
                                mb: 1
                              }}
                            />
                            <Typography variant="caption">{month}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportFees}
                    sx={{ mx: 1 }}
                  >
                    Download Full Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    sx={{ mx: 1 }}
                  >
                    Generate Fee Receipt
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Add/Edit Fee Dialog */}
      <Dialog open={openFeeDialog} onClose={handleCloseFeeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFee ? 'Edit Fee Record' : 'Add New Fee Record'}
        </DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Fee record saved successfully!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Name"
                name="studentName"
                value={feeFormData.studentName}
                onChange={handleFeeFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={feeFormData.studentId}
                onChange={handleFeeFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  name="class"
                  value={feeFormData.class}
                  onChange={handleFeeFormChange}
                  label="Class"
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {MOCK_CLASSES.map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Fee Type</InputLabel>
                <Select
                  name="feeType"
                  value={feeFormData.feeType}
                  onChange={handleFeeFormChange}
                  label="Fee Type"
                >
                  <MenuItem value="">Select Fee Type</MenuItem>
                  {MOCK_FEE_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={feeFormData.amount}
                onChange={handleFeeFormChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={feeFormData.dueDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={feeFormData.semester}
                  onChange={handleFeeFormChange}
                  label="Semester"
                >
                  <MenuItem value="">Select Semester</MenuItem>
                  {MOCK_SEMESTERS.map(sem => (
                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  name="academicYear"
                  value={feeFormData.academicYear}
                  onChange={handleFeeFormChange}
                  label="Academic Year"
                >
                  <MenuItem value="">Select Academic Year</MenuItem>
                  {MOCK_ACADEMIC_YEARS.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={feeFormData.status}
                  onChange={handleFeeFormChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeeDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveFee}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Make Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Make Payment
        </DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment processed successfully!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {selectedFee && (
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Student:</Typography>
                  <Typography variant="body1">{selectedFee.studentName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Class:</Typography>
                  <Typography variant="body1">{selectedFee.class}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Fee Type:</Typography>
                  <Typography variant="body1">{selectedFee.feeType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                  <Typography variant="body1">{selectedFee.dueDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Amount Due:</Typography>
                  <Typography variant="h6" color="error">₹{selectedFee.amount.toLocaleString()}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={paymentFormData.paymentMethod}
                  onChange={handlePaymentFormChange}
                  label="Payment Method"
                >
                  <MenuItem value="">Select Payment Method</MenuItem>
                  {MOCK_PAYMENT_METHODS.map(method => (
                    <MenuItem key={method} value={method}>{method}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Payment Date"
                  value={paymentFormData.paymentDate}
                  onChange={handlePaymentDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction ID"
                name="transactionId"
                value={paymentFormData.transactionId}
                onChange={handlePaymentFormChange}
                placeholder="Optional"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={paymentFormData.amount}
                onChange={handlePaymentFormChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleMakePayment}
            disabled={loading}
            color="success"
          >
            {loading ? <CircularProgress size={24} /> : 'Process Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees;