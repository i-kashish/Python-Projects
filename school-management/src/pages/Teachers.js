import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, TextField, InputAdornment,
  IconButton, Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Select, FormControl, InputLabel,
  Alert, Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Teachers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = React.useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogError, setDialogError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    subjects: [],
    contactNumber: '',
    joinDate: ''
  });

  // Fetch teachers from backend
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users', {
        params: {
          role: 'teacher',
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      setTeachers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to fetch teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterDepartment = (e) => {
    setFilterDepartment(e.target.value);
    // Note: Backend doesn't currently support department filtering specifically in getUsers,
    // but the search query can include it if needed or we can add it to the backend.
    setPage(0);
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setSelectedTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId || '',
        department: teacher.department || '',
        subjects: teacher.subjects || [],
        contactNumber: teacher.contactNumber || '',
        joinDate: teacher.joinDate ? new Date(teacher.joinDate).toISOString().split('T')[0] : ''
      });
    } else {
      setSelectedTeacher(null);
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        subjects: [],
        contactNumber: '',
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubjectsChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      subjects: typeof value === 'string' ? value.split(',').map(s => s.trim()) : value
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      setDialogError('Name and Email are required fields.');
      return;
    }
    setLoading(true);
    setDialogError('');
    try {
      const dataToSubmit = {
        ...formData,
        role: 'teacher',
        password: 'password123'
      };
      if (selectedTeacher) {
        await axios.put(`/api/users/${selectedTeacher._id}`, dataToSubmit);
      } else {
        await axios.post('/api/users', dataToSubmit);
      }
      setSuccessMsg(selectedTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!');
      fetchTeachers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving teacher:', err);
      const errorMsg = err.response?.data?.msg
        || err.response?.data?.message
        || (err.response?.status === 401 ? 'Session expired. Please log out and log in again.' : '')
        || 'Failed to save teacher. Please try again.';
      setDialogError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/users/${id}`);
        fetchTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError('Failed to delete teacher. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  // Predefined departments for the form
  const departments = [
    'Pre-Primary', 'Primary', 'Middle School', 'Secondary School',
    'Senior Secondary (Science)', 'Senior Secondary (Commerce)', 'Senior Secondary (Arts)',
    'English', 'Languages', 'Mathematics', 'Science', 'Social Sciences',
    'Computer Science', 'Physical Education', 'Arts & Music'
  ];

  // Predefined subjects for the form
  const allSubjects = [
    'English', 'Hindi', 'Sanskrit', 'Mathematics', 'EVS', 'Science', 'Social Studies',
    'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science',
    'Economics', 'Accountancy', 'Business Studies', 'Computer Science', 'Informatics Practices',
    'Fine Arts', 'Physical Education', 'Music', 'General Knowledge'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teachers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Teacher
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or employee ID"
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={handleFilterDepartment}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Teacher</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Loading teachers...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    {error || 'No teachers found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={teacher.profilePicture}
                        alt={teacher.name}
                        sx={{ mr: 2 }}
                      >
                        {teacher.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{teacher.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {teacher.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{teacher.employeeId}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {teacher.subjects?.map((subject, index) => (
                        <Chip
                          key={index}
                          label={subject}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{teacher.contactNumber}</TableCell>
                  <TableCell>{teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewProfile(teacher._id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenDialog(teacher)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(teacher._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDialogError('')}>
              {dialogError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  label="Department"
                  required
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleSubjectsChange}
                  label="Subjects"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {allSubjects.map(subject => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Join Date"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTeacher ? 'Update' : 'Add'}
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

export default Teachers;