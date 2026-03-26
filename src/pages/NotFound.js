import React from 'react';
import { Box, Typography, Button, Container, Fade, Zoom } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Home, ArrowBack, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  fontSize: '15rem',
  fontWeight: 900,
  background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 50px rgba(99, 102, 241, 0.3)',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '6rem',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  margin: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
  },
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  opacity: 0.1,
  animation: 'floatRandom 8s ease-in-out infinite',
  '@keyframes floatRandom': {
    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
    '25%': { transform: 'translate(-20px, -30px) rotate(90deg)' },
    '50%': { transform: 'translate(20px, -20px) rotate(180deg)' },
    '75%': { transform: 'translate(-30px, 10px) rotate(270deg)' },
  },
}));

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <NotFoundContainer maxWidth="md">
      {/* Floating background elements */}
      <FloatingElement sx={{ top: '10%', left: '10%' }}>
        <Search sx={{ fontSize: 60, color: 'primary.main' }} />
      </FloatingElement>
      <FloatingElement sx={{ top: '20%', right: '15%' }}>
        <Home sx={{ fontSize: 80, color: 'secondary.main' }} />
      </FloatingElement>
      <FloatingElement sx={{ bottom: '30%', left: '20%' }}>
        <ArrowBack sx={{ fontSize: 50, color: 'success.main' }} />
      </FloatingElement>
      <FloatingElement sx={{ bottom: '10%', right: '10%' }}>
        <Search sx={{ fontSize: 70, color: 'warning.main' }} />
      </FloatingElement>

      <Fade in={true} timeout={800}>
        <Box>
          <Zoom in={true} timeout={1000}>
            <AnimatedNumber variant="h1">
              404
            </AnimatedNumber>
          </Zoom>

          <Fade in={true} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                🎓 Oops! Page Not Found
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                The page you're looking for seems to have wandered off to another classroom. 
                Don't worry, let's get you back to your studies! 📚
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={1400}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
              <GradientButton
                variant="contained"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                }}
              >
                🏠 Go Home
              </GradientButton>
              
              <GradientButton
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                  },
                }}
              >
                ⬅️ Go Back
              </GradientButton>
            </Box>
          </Fade>

          <Fade in={true} timeout={1600}>
            <Box sx={{ mt: 6, p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="body1" color="text.secondary">
                💡 <strong>Quick Tips:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Check if you typed the URL correctly<br/>
                • Use the navigation menu to find what you're looking for<br/>
                • Contact support if you think this is an error
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Fade>
    </NotFoundContainer>
  );
};

export default NotFound;