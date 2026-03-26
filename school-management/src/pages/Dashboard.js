import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  CardHeader, Avatar, IconButton, Divider, List,
  ListItem, ListItemText, ListItemAvatar, Chip,
  LinearProgress, Skeleton, Fade, Zoom, Button,
  Tooltip as MuiTooltip, Stack
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Grade as GradeIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid
} from 'recharts';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SettingsContext from '../context/SettingsContext';

// Enhanced styled components
const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: `linear-gradient(135deg, ${gradient})`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-8.837-7.163-16-16-16s-16 7.163-16 16 7.163 16 16 16 16-7.163 16-16zm16 0c0-8.837-7.163-16-16-16s-16 7.163-16 16 7.163 16 16 16 16-7.163 16-16z"/%3E%3C/g%3E%3C/svg%3E")',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 20,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
    borderRadius: '20px 20px 0 0',
  },
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  fontSize: '2.5rem',
  animation: 'countUp 2s ease-out',
  '@keyframes countUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));
const attendanceData = [
  { name: 'Present', value: 85, color: '#4caf50' },
  { name: 'Absent', value: 10, color: '#f44336' },
  { name: 'Late', value: 5, color: '#ff9800' },
];

const gradeData = [
  { subject: 'Math', score: 85, full: 100 },
  { subject: 'Science', score: 78, full: 100 },
  { subject: 'History', score: 92, full: 100 },
  { subject: 'English', score: 88, full: 100 },
  { subject: 'Computer', score: 95, full: 100 },
];

const activityData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 48 },
  { day: 'Thu', count: 61 },
  { day: 'Fri', count: 55 },
  { day: 'Sat', count: 42 },
  { day: 'Sun', count: 38 },
];

const notifications = [
  { id: 1, title: 'Assignment Due', message: 'Math assignment due tomorrow', time: '2 hours ago', type: 'warning' },
  { id: 2, title: 'Fee Payment', message: 'Fee payment received', time: '1 day ago', type: 'success' },
  { id: 3, title: 'Exam Schedule', message: 'Mid-term exams start next week', time: '2 days ago', type: 'info' },
];

const upcomingEvents = [
  { id: 1, title: 'Science Project Submission', date: 'May 15, 2023' },
  { id: 2, title: 'Parent-Teacher Meeting', date: 'May 20, 2023' },
  { id: 3, title: 'Annual Sports Day', date: 'May 25, 2023' },
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);
  const [counts, setCounts] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [studentRes, teacherRes] = await Promise.all([
          axios.get('/api/users', { params: { role: 'student', limit: 1 } }),
          axios.get('/api/users', { params: { role: 'teacher', limit: 1 } })
        ]);
        setCounts({
          students: studentRes.data.totalUsers || 0,
          teachers: teacherRes.data.totalUsers || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      } finally {
        setLoading(false);
        setAnimateCards(true);
      }
    };

    fetchCounts();
  }, []);

  // Enhanced widget data with animations
  const widgets = [
    {
      title: 'Total Students',
      value: counts.students.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      gradient: '#6366f1, #8b5cf6',
      roles: ['admin', 'teacher'],
      path: '/students'
    },
    {
      title: 'Total Teachers',
      value: counts.teachers.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      gradient: '#f59e0b, #fbbf24',
      roles: ['admin'],
      path: '/teachers'
    },
    {
      title: 'Attendance Rate',
      value: '96.5%',
      change: '+2.3%',
      trend: 'up',
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      gradient: '#10b981, #34d399',
      path: '/attendance'
    },
    {
      title: 'Average Grade',
      value: 'A-',
      change: '+0.2',
      trend: 'up',
      icon: <GradeIcon sx={{ fontSize: 40 }} />,
      gradient: '#8b5cf6, #ec4899',
      path: '/grades'
    },
    {
      title: 'Revenue',
      value: '$0',
      change: '+0%',
      trend: 'up',
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      gradient: '#ef4444, #f87171',
      roles: ['admin'],
      path: '/fees'
    },
  ];
  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={60} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {user?.name || 'User'}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Here's what's happening at your school today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/grades')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 3
              }}
            >
              View Reports
            </Button>
            <Button
              variant="outlined"
              startIcon={<CalendarTodayIcon />}
              onClick={() => navigate('/attendance')}
              sx={{ borderRadius: 3 }}
            >
              Schedule
            </Button>
          </Box>
        </Box>

        {/* Enhanced Stats Widgets */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {widgets.map((widget, index) => {
            const sectionKey = widget.title.toLowerCase().replace('total ', '').replace(' rate', '').replace('average ', '');
            const isVisible = settings.sections[sectionKey] !== false;

            return isVisible && (!widget.roles || widget.roles.includes(user?.role)) && (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in={animateCards} timeout={600 + index * 200}>
                  <GradientCard
                    gradient={widget.gradient}
                    onClick={() => widget.path && navigate(widget.path)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ opacity: 0.9 }}>
                          {widget.icon}
                        </Box>
                        <Chip
                          icon={widget.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={widget.change}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        />
                      </Box>

                      <AnimatedNumber variant="h3">
                        {widget.value}
                      </AnimatedNumber>

                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        {widget.title}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={75}
                        sx={{
                          mt: 2,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'rgba(255,255,255,0.8)'
                          }
                        }}
                      />
                    </CardContent>
                  </GradientCard>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* Enhanced Charts and Lists */}
        <Grid container spacing={3}>
          {/* Attendance Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Fade in={true} timeout={1000}>
              <GlassCard>
                <CardHeader
                  title="Attendance Overview"
                  subheader="Last 30 days"
                  avatar={
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <EventNoteIcon />
                    </Avatar>
                  }
                  action={
                    <MuiTooltip title="More options" arrow>
                      <IconButton aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    </MuiTooltip>
                  }
                />
                <CardContent>
                  <Box sx={{ height: 280, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {attendanceData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color
                          }}
                        />
                        <Typography variant="caption">{item.name}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>
          {/* Enhanced Academic Performance Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Fade in={true} timeout={1200}>
              <GlassCard>
                <CardHeader
                  title="Academic Trends"
                  subheader="Weekly performance analytics"
                  avatar={
                    <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.2), color: '#8b5cf6' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  }
                  action={
                    <MuiTooltip title="Analytics details" arrow>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </MuiTooltip>
                  }
                />
                <CardContent>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gradeData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
                        <XAxis
                          dataKey="subject"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#64748b' }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Avg. Growth</Typography>
                    <Chip size="small" label="+4.2%" color="success" sx={{ fontWeight: 600 }} />
                  </Box>
                </CardContent>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Notifications"
                avatar={
                  <Avatar sx={{ bgcolor: '#f50057' }}>
                    <NotificationsIcon />
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <List sx={{ maxHeight: 250, overflow: 'auto' }}>
                {notifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor:
                            notification.type === 'warning' ? '#ff9800' :
                              notification.type === 'success' ? '#4caf50' : '#2196f3'
                        }}>
                          {notification.type === 'warning' ? '!' :
                            notification.type === 'success' ? <CheckCircleIcon /> : 'i'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            {` — ${notification.time}`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Upcoming Events"
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <List>
                {upcomingEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem>
                      <ListItemText
                        primary={event.title}
                        secondary={event.date}
                      />
                      <Chip
                        label="Upcoming"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Attendance Status */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Recent Attendance"
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <List>
                {[
                  { subject: 'Mathematics', status: 'present', date: 'May 10, 2023' },
                  { subject: 'Science', status: 'present', date: 'May 9, 2023' },
                  { subject: 'History', status: 'absent', date: 'May 8, 2023' },
                  { subject: 'English', status: 'present', date: 'May 7, 2023' },
                ].map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.subject}
                        secondary={item.date}
                      />
                      {item.status === 'present' ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Present"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<CancelIcon />}
                          label="Absent"
                          size="small"
                          color="error"
                        />
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;