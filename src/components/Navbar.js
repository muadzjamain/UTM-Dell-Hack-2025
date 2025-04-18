import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpIcon from '@mui/icons-material/Help';
import FlagIcon from '@mui/icons-material/Flag';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState('employee');
  const [userProfile, setUserProfile] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'employee');
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setDrawerOpen(false);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Define navigation based on user role
  const employeePages = [
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Culture Rules', path: '/culture-compliance', icon: <BusinessIcon /> },
    { name: 'Training', path: '/study-companion', icon: <MenuBookIcon /> },
    { name: 'Personalized Goals', path: '/goals', icon: <FlagIcon /> },
    { name: 'Performance', path: '/performance-feedback', icon: <AssessmentIcon /> },
    { name: 'Support', path: '/support', icon: <HelpIcon /> },
  ];
  
  const managerPages = [
    ...employeePages,
    { name: 'Team Dashboard', path: '/team-dashboard', icon: <AdminPanelSettingsIcon /> },
  ];
  
  // Select pages based on user role
  const pages = userRole === 'manager' || userRole === 'hr' ? managerPages : employeePages;
  
  const settings = [
    { name: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
    { name: 'Logout', action: handleLogout, icon: <LogoutIcon /> }
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Deltri
          </Typography>
          
          {/* Only show manager badge when user is logged in and has manager role */}
          {user && userRole !== 'employee' && (
            <Chip 
              label={userRole.toUpperCase()}
              color="secondary"
              size="small"
              sx={{ 
                ml: 1, 
                display: { xs: 'none', md: 'flex' },
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            />
          )}
          
          {/* Mobile drawer */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={toggleDrawer(true)}
            color="inherit"
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              {user && userProfile && (
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6">{userProfile.firstName} {userProfile.lastName}</Typography>
                  <Typography variant="body2">{userProfile.email}</Typography>
                  {/* Only show role chip when user has a role other than employee */}
                  {userRole !== 'employee' && (
                    <Chip 
                      label={userRole.toUpperCase()} 
                      size="small" 
                      color="secondary"
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  )}
                </Box>
              )}
              
              <List>
                {user ? (
                  pages.map((page) => (
                    <ListItem key={page.name} disablePadding>
                      <ListItemButton component={RouterLink} to={page.path}>
                        <ListItemIcon>
                          {page.icon}
                        </ListItemIcon>
                        <ListItemText primary={page.name} />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton component={RouterLink} to="/support">
                        <ListItemIcon>
                          <HelpIcon />
                        </ListItemIcon>
                        <ListItemText primary="" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton component={RouterLink} to="/login">
                        <ListItemIcon>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sign In" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton component={RouterLink} to="/register">
                        <ListItemIcon>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Register" />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
              
              {user && (
                <>
                  <Divider />
                  <List>
                    {settings.map((setting) => (
                      <ListItem key={setting.name} disablePadding>
                        <ListItemButton 
                          onClick={() => {
                            if (setting.action) {
                              setting.action();
                            } else if (setting.path) {
                              navigate(setting.path);
                            }
                          }}
                        >
                          <ListItemIcon>
                            {setting.icon}
                          </ListItemIcon>
                          <ListItemText primary={setting.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </Drawer>
          
          {/* Logo for mobile screens */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Deltri
          </Typography>
          
          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {/* Show navigation items for logged in users */}
            {user && pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', mx: 1 }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
            
            {/* No public navigation items in desktop view */}
          </Box>
          
          {/* Support icon for all users */}
          {!user && (
            <IconButton
              component={RouterLink}
              to="/support"
              onClick={handleCloseNavMenu}
              color="inherit"
              sx={{ mx: 1 }}
              aria-label="support"
            >
              <HelpIcon />
            </IconButton>
          )}
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={userProfile?.firstName || 'User'} 
                      src="/static/images/avatar/2.jpg"
                      sx={{ bgcolor: userRole === 'manager' ? 'secondary.main' : 'primary.main' }}
                    >
                      {userProfile?.firstName?.charAt(0) || user.email?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userProfile && (
                    <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                      <Typography variant="subtitle1">
                        {userProfile.firstName} {userProfile.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userProfile.email}
                      </Typography>
                      {userRole !== 'manager' && (
                        <Chip 
                          label={userProfile.department} 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      )}
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  )}
                  
                  {settings.map((setting) => (
                    <MenuItem 
                      key={setting.name} 
                      onClick={() => {
                        handleCloseUserMenu();
                        if (setting.action) {
                          setting.action();
                        } else if (setting.path) {
                          navigate(setting.path);
                        }
                      }}
                    >
                      <ListItemIcon>
                        {setting.icon}
                      </ListItemIcon>
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
