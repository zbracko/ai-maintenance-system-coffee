import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logomain.png';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import VoiceCommand from '../VoiceCommand/VoiceCommand';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: t('navbar.chat'), path: '/' },
    { label: t('navbar.adminPanel'), path: '/admin' },
    { label: t('navbar.manuals'), path: '/manuals' },
    { label: t('VideoManual'), path: '/VideoManual' },
    { label: t('navbar.logs'), path: '/logs' },
    { label: t('navbar.safeHandling'), path: '/safe-handling' },
    { label: t('navbar.workOrders'), path: '/work-orders' },
  ];

  return (
    <>
      <AppBar 
        position="static"
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          color: '#1e293b'
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            sx={{ display: { xs: 'block', md: 'none' } }} 
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          <Box component="img" src={logo} alt="Logo" sx={{ height: 40, marginRight: 2 }} />

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated && menuItems.map((item) => (
              <Button key={item.label} color="inherit" component={RouterLink} to={item.path}>
                {item.label}
              </Button>
            ))}
            {isAuthenticated && (
              <Button color="inherit" onClick={logout}>
                {t('navbar.logout')}
              </Button>
            )}
          </Box>

          <LanguageSelector />
        </Toolbar>
      </AppBar>

      <Drawer 
        anchor="left" 
        open={mobileOpen} 
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <List sx={{ width: 250 }}>
          {isAuthenticated && menuItems.map((item) => (
            <ListItem 
              key={item.label} 
              component={RouterLink} 
              to={item.path} 
              onClick={handleDrawerToggle}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          {isAuthenticated && (
            <ListItem 
              onClick={() => { logout(); handleDrawerToggle(); }}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              <ListItemText primary={t('navbar.logout')} />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
