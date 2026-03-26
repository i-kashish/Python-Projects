import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Drawer, Toolbar, Typography, Divider,
  IconButton, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, Switch, useMediaQuery, useTheme,
  Badge, Tooltip, Chip, Zoom, Fade, Button
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Grade as GradeIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Logout as LogoutIcon,
  QrCode as QrCodeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import SettingsContext from '../context/SettingsContext';

const drawerWidth = 280;

// Styled components for enhanced UI
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    width: drawerWidth,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
      : 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: 12,
  margin: '4px 12px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: active
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      : 'transparent',
    opacity: active ? 0.1 : 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateX(8px)',
    '&::before': {
      opacity: 0.05,
    },
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'color 0.3s ease',
  },
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 400,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(Box)(({ theme }) => ({
  color: 'inherit',
  '& input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '35ch',
    },
    border: 'none',
    background: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '0.9rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1,
    },
  },
}));

const Layout = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const menuItems = [
    {
      category: 'General',
      items: [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/', color: '#6366f1' },
      ]
    },
    {
      category: 'Management',
      items: [
        { text: 'Students', icon: <PeopleIcon />, path: '/students', roles: ['admin', 'teacher'], color: '#10b981', badge: '250', section: 'students' },
        { text: 'Teachers', icon: <SchoolIcon />, path: '/teachers', roles: ['admin'], color: '#f59e0b', badge: '25', section: 'teachers' },
      ]
    },
    {
      category: 'Academic',
      items: [
        { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance', color: '#3b82f6', badge: 'New', section: 'attendance' },
        { text: 'Grades', icon: <GradeIcon />, path: '/grades', color: '#8b5cf6', section: 'grades' },
        { text: 'Scan QR', icon: <QrCodeIcon />, path: '/scan-attendance', roles: ['student'], color: '#ec4899', section: 'attendance' },
      ]
    },
    {
      category: 'Finance',
      items: [
        { text: 'Fees', icon: <PaymentIcon />, path: '/fees', color: '#ef4444', section: 'fees' },
      ]
    },
    {
      category: 'System',
      items: [
        { text: 'Admin Panel', icon: <SettingsIcon />, path: '/admin-panel', roles: ['admin'], color: '#747474' },
      ]
    },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
            🎓
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              EduManage
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Smart Education
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <GlassCard sx={{ margin: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user?.profilePicture}
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>
            <Chip
              label={user?.role || 'Student'}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>
      </GlassCard>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((category) => {
          const visibleItems = category.items.filter(item => {
            const isVisible = item.section ? settings.sections[item.section] !== false : true;
            return isVisible && (!item.roles || item.roles.includes(user?.role));
          });

          if (visibleItems.length === 0) return null;

          return (
            <Box key={category.category} sx={{ mb: 2 }}>
              <Typography
                variant="overline"
                onClick={() => {
                  if (category.category === 'System') navigate('/admin-panel');
                }}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  color: 'text.secondary',
                  opacity: 0.7,
                  letterSpacing: '1px',
                  display: 'block',
                  cursor: category.category === 'System' ? 'pointer' : 'default',
                  '&:hover': {
                    color: category.category === 'System' ? 'primary.main' : 'text.secondary',
                    opacity: 1,
                    background: category.category === 'System' ? alpha('#6366f1', 0.05) : 'transparent',
                    borderRadius: 2
                  },
                  transition: 'all 0.2s'
                }}
              >
                {category.category}
              </Typography>
              {visibleItems.map((item) => (
                <Tooltip key={item.text} title={item.text} placement="right" arrow>
                  <StyledListItem
                    active={location.pathname === item.path ? 1 : 0}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }}
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: item.color }}>
                      {item.badge ? (
                        <Badge
                          badgeContent={item.badge}
                          color={item.badge === 'New' ? 'secondary' : 'primary'}
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: location.pathname === item.path ? 600 : 400
                      }}
                    />
                  </StyledListItem>
                </Tooltip>
              ))}
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
              {user?.role === 'admin' ? '🔧 Admin Portal' :
                user?.role === 'teacher' ? '👨‍🏫 Teacher Hub' : '🎓 Student Portal'}
            </Typography>

            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase>
                <input
                  placeholder="Search students, teachers..."
                  aria-label="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                />
              </StyledInputBase>
            </Search>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user?.role === 'admin' && (
              <Button
                color="inherit"
                onClick={() => navigate('/admin-panel')}
                startIcon={<LockIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Admin Panel
              </Button>
            )}
            {user?.role === 'admin' && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/admin-panel')}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <LockIcon />
              </IconButton>
            )}
            <Tooltip title="Toggle theme" arrow>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                <Zoom in={true}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </Zoom>
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications" arrow>
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile menu" arrow>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <ProfileAvatar
                  alt={user?.name}
                  src={user?.profilePicture}
                >
                  {user?.name?.charAt(0) || 'U'}
                </ProfileAvatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => {
              navigate('/profile');
              handleProfileMenuClose();
            }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
              <Chip label="3 New" size="small" color="primary" />
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationMenuClose}>
              <Box sx={{ py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>New Assignment</Typography>
                <Typography variant="body2" color="text.secondary">Math homework due on Friday</Typography>
                <Typography variant="caption" color="primary">2 hours ago</Typography>
              </Box>
            </MenuItem>
            <Divider variant="inset" component="li" />
            <MenuItem onClick={handleNotificationMenuClose}>
              <Box sx={{ py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Fee Pending</Typography>
                <Typography variant="body2" color="text.secondary">Library fees are overdue</Typography>
                <Typography variant="caption" color="text.secondary">1 day ago</Typography>
              </Box>
            </MenuItem>
            <Divider variant="inset" component="li" />
            <MenuItem onClick={handleNotificationMenuClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>View All Notifications</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;