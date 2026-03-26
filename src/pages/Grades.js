import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Card, CardContent,
  Button, TextField, InputAdornment, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  CircularProgress, Alert, Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import AuthContext from '../context/AuthContext';

// Mock data for demonstration
const MOCK_GRADES_DATA = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Mathematics',
    class: '10A',
    examType: 'Mid-Term',
    marks: 85,
    totalMarks: 100,
    percentage: 85,
    grade: 'A',
    semester: '1st',
    academicYear: '2023-2024',
    submissionDate: '2023-05-15',
    feedback: 'Good performance in algebra, needs improvement in geometry.'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Jane Smith',
    subject: 'Physics',
    class: '10A',
    examType: 'Mid-Term',
    marks: 92,
    totalMarks: 100,
    percentage: 92,
    grade: 'A+',
    semester: '1st',
    academicYear: '2023-2024',
    submissionDate: '2023-05-15',
    feedback: 'Excellent understanding of concepts and problem-solving skills.'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Michael Johnson',
    subject: 'Chemistry',
    class: '10B',
    examType: 'Mid-Term',
    marks: 78,
    totalMarks: 100,
    percentage: 78,
    grade: 'B+',
    semester: '1st',
    academicYear: '2023-2024',
    submissionDate: '2023-05-16',
    feedback: 'Good theoretical knowledge, needs more practice with equations.'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Emily Williams',
    subject: 'Biology',
    class: '10B',
    examType: 'Mid-Term',
    marks: 88,
    totalMarks: 100,
    percentage: 88,
    grade: 'A',
    semester: '1st',
    academicYear: '2023-2024',
    submissionDate: '2023-05-16',
    feedback: 'Excellent work on the practical components.'
  },
  {
    id: '5',
    studentId: '5',
    studentName: 'David Brown',
    subject: 'English',
    class: '10C',
    examType: 'Mid-Term',
    marks: 72,
    totalMarks: 100,
    percentage: 72,
    grade: 'B',
    semester: '1st',
    academicYear: '2023-2024',
    submissionDate: '2023-05-17',
    feedback: 'Good comprehension, needs improvement in writing skills.'
  }
];

const MOCK_CLASSES = ['10A', '10B', '10C', '11A', '11B', '12A', '12B'];
const MOCK_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];
const MOCK_EXAM_TYPES = ['Mid-Term', 'Final', 'Quiz', 'Assignment', 'Project'];
const MOCK_SEMESTERS = ['1st', '2nd'];
const MOCK_ACADEMIC_YEARS = ['2022-2023', '2023-2024', '2024-2025'];

const Grades = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [gradesData, setGradesData] = useState(MOCK_GRADES_DATA);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [gradeFormData, setGradeFormData] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    class: '',
    examType: '',
    marks: '',
    totalMarks: 100,
    semester: '',
    academicYear: '',
    feedback: ''
  });

  // Filter grades data based on search term and filters
  useEffect(() => {
    let filteredData = MOCK_GRADES_DATA.filter(record => 
      (record.studentName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterClass === '' || record.class === filterClass) &&
      (filterSubject === '' || record.subject === filterSubject) &&
      (filterExamType === '' || record.examType === filterExamType) &&
      (filterSemester === '' || record.semester === filterSemester) &&
      (filterAcademicYear === '' || record.academicYear === filterAcademicYear)
    );
    
    setGradesData(filteredData);
    setPage(0);
  }, [searchTerm, filterClass, filterSubject, filterExamType, filterSemester, filterAcademicYear]);

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

  const handleFilterSubject = (e) => {
    setFilterSubject(e.target.value);
  };

  const handleFilterExamType = (e) => {
    setFilterExamType(e.target.value);
  };

  const handleFilterSemester = (e) => {
    setFilterSemester(e.target.value);
  };

  const handleFilterAcademicYear = (e) => {
    setFilterAcademicYear(e.target.value);
  };

  const handleOpenGradeDialog = (grade = null) => {
    if (grade) {
      setSelectedGrade(grade);
      setGradeFormData({
        studentId: grade.studentId,
        studentName: grade.studentName,
        subject: grade.subject,
        class: grade.class,
        examType: grade.examType,
        marks: grade.marks,
        totalMarks: grade.totalMarks,
        semester: grade.semester,
        academicYear: grade.academicYear,
        feedback: grade.feedback
      });
    } else {
      setSelectedGrade(null);
      setGradeFormData({
        studentId: '',
        studentName: '',
        subject: '',
        class: '',
        examType: '',
        marks: '',
        totalMarks: 100,
        semester: '',
        academicYear: '',
        feedback: ''
      });
    }
    setOpenGradeDialog(true);
  };

  const handleCloseGradeDialog = () => {
    setOpenGradeDialog(false);
    setError('');
    setSuccess(false);
  };

  const handleGradeFormChange = (e) => {
    const { name, value } = e.target;
    setGradeFormData({
      ...gradeFormData,
      [name]: value
    });
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleSaveGrade = () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate form data
    if (!gradeFormData.studentName || !gradeFormData.subject || !gradeFormData.class || 
        !gradeFormData.examType || !gradeFormData.marks || !gradeFormData.semester || 
        !gradeFormData.academicYear) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    
    // Calculate percentage and grade
    const marks = parseFloat(gradeFormData.marks);
    const totalMarks = parseFloat(gradeFormData.totalMarks);
    
    if (isNaN(marks) || isNaN(totalMarks) || marks < 0 || totalMarks <= 0 || marks > totalMarks) {
      setError('Please enter valid marks');
      setLoading(false);
      return;
    }
    
    const percentage = (marks / totalMarks) * 100;
    const grade = calculateGrade(percentage);
    
    // Simulate API call
    setTimeout(() => {
      try {
        if (selectedGrade) {
          // Update existing grade record
          const updatedData = gradesData.map(record => 
            record.id === selectedGrade.id 
              ? { 
                  ...record, 
                  ...gradeFormData,
                  percentage,
                  grade,
                  submissionDate: format(new Date(), 'yyyy-MM-dd')
                } 
              : record
          );
          setGradesData(updatedData);
        } else {
          // Add new grade record
          const newGrade = {
            id: Math.random().toString(36).substring(2, 9),
            ...gradeFormData,
            percentage,
            grade,
            submissionDate: format(new Date(), 'yyyy-MM-dd')
          };
          setGradesData([newGrade, ...gradesData]);
        }
        
        setSuccess(true);
        setLoading(false);
        
        // Close dialog after a short delay
        setTimeout(() => {
          handleCloseGradeDialog();
        }, 1500);
      } catch (err) {
        setError('An error occurred while saving grade');
        setLoading(false);
      }
    }, 1000);
  };

  const handleDeleteGrade = (id) => {
    if (window.confirm('Are you sure you want to delete this grade record?')) {
      // Simulate API call
      setGradesData(gradesData.filter(record => record.id !== id));
    }
  };

  const handleExportGrades = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    alert('Grades data would be exported here');
  };

  const getGradeColor = (grade) => {
    switch (grade.charAt(0)) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Grades Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Manage Grades" />
          <Tab label="Grade Reports" />
          <Tab label="Performance Analytics" />
        </Tabs>
        
        {/* Manage Grades Tab */}
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
              
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenGradeDialog()}
                >
                  Add Grade
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
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={filterSubject}
                    onChange={handleFilterSubject}
                    label="Subject"
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {MOCK_SUBJECTS.map(subj => (
                      <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    value={filterExamType}
                    onChange={handleFilterExamType}
                    label="Exam Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {MOCK_EXAM_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
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
                  onClick={handleExportGrades}
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
                    <TableCell>Subject</TableCell>
                    <TableCell>Exam Type</TableCell>
                    <TableCell align="center">Marks</TableCell>
                    <TableCell align="center">Percentage</TableCell>
                    <TableCell align="center">Grade</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradesData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.class}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.examType}</TableCell>
                        <TableCell align="center">{record.marks}/{record.totalMarks}</TableCell>
                        <TableCell align="center">{record.percentage.toFixed(2)}%</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={record.grade}
                            color={getGradeColor(record.grade)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.submissionDate}</TableCell>
                        <TableCell align="center">
                          {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <>
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenGradeDialog(record)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteGrade(record.id)}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {gradesData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No grade records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={gradesData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        )}
        
        {/* Grade Reports Tab */}
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
                        size="small"
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
                    <Grid item xs={12} sm={3}>
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
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportGrades}
                        fullWidth
                      >
                        Generate Report
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Performance Overview
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      {MOCK_CLASSES.slice(0, 5).map((cls, index) => {
                        const avgPercentage = 85 - index * 3;
                        return (
                          <Box key={cls} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{cls}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {avgPercentage}%
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
                                  width: `${avgPercentage}%`,
                                  backgroundColor: avgPercentage > 80 ? 'success.main' : 
                                                  avgPercentage > 60 ? 'warning.main' : 'error.main',
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
                      Subject Performance
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      {MOCK_SUBJECTS.slice(0, 5).map((subject, index) => {
                        const avgPercentage = 88 - index * 4;
                        return (
                          <Box key={subject} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{subject}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {avgPercentage}%
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
                                  width: `${avgPercentage}%`,
                                  backgroundColor: avgPercentage > 80 ? 'success.main' : 
                                                  avgPercentage > 60 ? 'warning.main' : 'error.main',
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
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performers
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Student</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell align="center">Average</TableCell>
                            <TableCell align="center">Grade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { name: 'Jane Smith', class: '10A', average: 92, grade: 'A+' },
                            { name: 'Emily Williams', class: '10B', average: 88, grade: 'A' },
                            { name: 'John Doe', class: '10A', average: 85, grade: 'A' },
                            { name: 'Michael Johnson', class: '10B', average: 78, grade: 'B+' },
                            { name: 'David Brown', class: '10C', average: 72, grade: 'B' }
                          ].map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.class}</TableCell>
                              <TableCell align="center">{student.average}%</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={student.grade}
                                  color={getGradeColor(student.grade)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Performance Analytics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GradeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Grade Distribution
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
                      {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((grade, index) => {
                        const height = 100 - (index * 15);
                        return (
                          <Box key={grade} sx={{ textAlign: 'center' }}>
                            <Box
                              sx={{
                                height: `${height}px`,
                                width: 20,
                                backgroundColor: getGradeColor(grade),
                                borderRadius: 1,
                                mb: 1
                              }}
                            />
                            <Typography variant="body2">{grade}</Typography>
                            <Typography variant="caption">{height}%</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Exam Type Performance
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ my: 2 }}>
                      {MOCK_EXAM_TYPES.map((type, index) => {
                        const avgPercentage = 85 - (index * 5);
                        return (
                          <Box key={type} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{type}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {avgPercentage}%
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
                                  width: `${avgPercentage}%`,
                                  backgroundColor: avgPercentage > 80 ? 'success.main' : 
                                                  avgPercentage > 60 ? 'warning.main' : 'error.main',
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
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Semester Comparison
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ my: 2 }}>
                      {MOCK_CLASSES.slice(0, 5).map((cls, index) => {
                        const sem1 = 85 - (index * 2);
                        const sem2 = sem1 + (Math.random() * 10 - 5);
                        return (
                          <Box key={cls} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{cls}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ width: 60 }}>1st Sem:</Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  backgroundColor: 'grey.300',
                                  borderRadius: 1,
                                  height: 8,
                                  position: 'relative'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${sem1}%`,
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1,
                                    height: 8
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ ml: 1 }}>{sem1.toFixed(1)}%</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ width: 60 }}>2nd Sem:</Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  backgroundColor: 'grey.300',
                                  borderRadius: 1,
                                  height: 8
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${sem2}%`,
                                    backgroundColor: 'secondary.main',
                                    borderRadius: 1,
                                    height: 8
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ ml: 1 }}>{sem2.toFixed(1)}%</Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Year-on-Year Performance Trend
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', mt: 3 }}>
                      {MOCK_SUBJECTS.map((subject, index) => {
                        const height1 = 60 + Math.random() * 30;
                        const height2 = height1 + (Math.random() * 20 - 10);
                        const height3 = height2 + (Math.random() * 20 - 10);
                        return (
                          <Box key={subject} sx={{ textAlign: 'center', display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{ mx: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  height: `${height1}%`,
                                  width: 15,
                                  backgroundColor: 'primary.light',
                                  borderRadius: 1,
                                  mb: 1
                                }}
                              />
                              <Typography variant="caption">2022</Typography>
                            </Box>
                            <Box sx={{ mx: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  height: `${height2}%`,
                                  width: 15,
                                  backgroundColor: 'primary.main',
                                  borderRadius: 1,
                                  mb: 1
                                }}
                              />
                              <Typography variant="caption">2023</Typography>
                            </Box>
                            <Box sx={{ mx: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  height: `${height3}%`,
                                  width: 15,
                                  backgroundColor: 'primary.dark',
                                  borderRadius: 1,
                                  mb: 1
                                }}
                              />
                              <Typography variant="caption">2024</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ writing_mode: 'vertical-rl', transform: 'rotate(180deg)', mb: 2 }}>
                              {subject}
                            </Typography>
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
      
      {/* Add/Edit Grade Dialog */}
      <Dialog open={openGradeDialog} onClose={handleCloseGradeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGrade ? 'Edit Grade Record' : 'Add New Grade Record'}
        </DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Grade record saved successfully!
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
                value={gradeFormData.studentName}
                onChange={handleGradeFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={gradeFormData.studentId}
                onChange={handleGradeFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  name="class"
                  value={gradeFormData.class}
                  onChange={handleGradeFormChange}
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
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={gradeFormData.subject}
                  onChange={handleGradeFormChange}
                  label="Subject"
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {MOCK_SUBJECTS.map(subj => (
                    <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  name="examType"
                  value={gradeFormData.examType}
                  onChange={handleGradeFormChange}
                  label="Exam Type"
                >
                  <MenuItem value="">Select Exam Type</MenuItem>
                  {MOCK_EXAM_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={gradeFormData.semester}
                  onChange={handleGradeFormChange}
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
                  value={gradeFormData.academicYear}
                  onChange={handleGradeFormChange}
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="Marks"
                  name="marks"
                  type="number"
                  value={gradeFormData.marks}
                  onChange={handleGradeFormChange}
                  required
                  inputProps={{ min: 0, max: gradeFormData.totalMarks }}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body1" sx={{ mx: 1 }}>/</Typography>
                <TextField
                  fullWidth
                  label="Total Marks"
                  name="totalMarks"
                  type="number"
                  value={gradeFormData.totalMarks}
                  onChange={handleGradeFormChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Feedback"
                name="feedback"
                multiline
                rows={3}
                value={gradeFormData.feedback}
                onChange={handleGradeFormChange}
                placeholder="Provide feedback on student's performance..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGradeDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveGrade}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Grades;