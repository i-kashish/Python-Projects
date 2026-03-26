import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button, Paper,
  Grid, Link, Alert, Tab, Tabs, CircularProgress,
  Fade, Zoom, Avatar, Chip, InputAdornment, IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  LockOutlined, School, Email, Visibility, VisibilityOff,
  Person, Shield, AutoAwesome, Celebration
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

// Enhanced styled components
const LoginContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  borderRadius: 24,
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: 480,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
  },
  '&:disabled': {
    background: alpha(theme.palette.action.disabled, 0.12),
  },
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: 'float 6s ease-in-out infinite',
  opacity: 0.1,
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '33%': { transform: 'translateY(-20px) rotate(120deg)' },
    '66%': { transform: 'translateY(-10px) rotate(240deg)' },
  },
}));

const Login = () => {
  const { login, register, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student'
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }

    // Clear any existing errors
    setError(null);
  }, [user, navigate, setError]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setLocalError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    const { email } = formData;

    if (!email) {
      setLocalError('Please enter your email');
      setLoading(false);
      return;
    }

    const result = await login(email);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    const { name, email, role } = formData;

    // Validation
    if (!name || !email) {
      setLocalError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await register({ name, email, role });
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <LoginContainer component="main" maxWidth={false}>
      {/* Floating background elements */}
      <FloatingIcon sx={{ top: '10%', left: '10%' }}>
        <AutoAwesome sx={{ fontSize: 60, color: 'primary.main' }} />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '70%', right: '15%' }}>
        <Celebration sx={{ fontSize: 80, color: 'secondary.main' }} />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '20%', left: '20%' }}>
        <Shield sx={{ fontSize: 50, color: 'success.main' }} />
      </FloatingIcon>

      <Fade in={true} timeout={800}>
        <GlassCard elevation={0}>
          <Zoom in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                }}
              >
                <School sx={{ fontSize: 40 }} />
              </Avatar>

              <Typography
                component="h1"
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                EduManage
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Smart Education Platform
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Chip
                  icon={<Person />}
                  label="Students"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                />
                <Chip
                  icon={<School />}
                  label="Teachers"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                />
                <Chip
                  icon={<Shield />}
                  label="Admin"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                />
              </Box>
            </Box>
          </Zoom>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 4,
              '& .MuiTab-root': {
                borderRadius: 3,
                margin: '0 8px',
                fontWeight: 600,
                minHeight: 48,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab label="🔐 Login" />
            <Tab label="🎓 Register" />
          </Tabs>

          {(error || localError) && (
            <Fade in={true}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  background: alpha('#ef4444', 0.1),
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                {error || localError}
              </Alert>
            </Fade>
          )}
          {tabValue === 0 ? (
            <Fade in={true} timeout={600}>
              <Box component="form" onSubmit={handleLogin} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="📧 Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <GradientButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 4, mb: 3 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>🚀 Sign In</>
                  )}
                </GradientButton>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link
                      href="#"
                      variant="body1"
                      onClick={(e) => {
                        e.preventDefault();
                        setTabValue(1);
                      }}
                      sx={{
                        fontWeight: 500,
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      🎯 Don't have an account? Join us!
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          ) : (
            <Fade in={true} timeout={600}>
              <Box component="form" onSubmit={handleRegister} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="👤 Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="📧 Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  margin="normal"
                  fullWidth
                  label="🔑 Register as"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': { borderRadius: 4 }
                  }}
                >
                  <option value="student">🎓 Student</option>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="admin">🔧 Admin (Superuser)</option>
                </TextField>
                <GradientButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 4, mb: 3 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>🎉 Create Account</>
                  )}
                </GradientButton>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link
                      href="#"
                      variant="body1"
                      onClick={(e) => {
                        e.preventDefault();
                        setTabValue(0);
                      }}
                      sx={{
                        fontWeight: 500,
                        textDecoration: 'none',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      🔙 Already have an account? Sign in!
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </GlassCard>
      </Fade>
    </LoginContainer>
  );
};

export default Login;