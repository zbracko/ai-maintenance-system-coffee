import React from 'react';
import { Box, Typography, FormControlLabel, Switch, TextField, Button, Paper } from '@mui/material';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState<boolean>(true);
  const [username, setUsername] = React.useState<string>('JohnDoe');

  const handleSave = () => {
    // Future implementation: Save settings to backend or local storage
    alert('Settings saved successfully!');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      padding="2rem"
      boxSizing="border-box"
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: '#1e293b',
          fontWeight: 700,
          mb: 4
        }}
      >
        Settings
      </Typography>
      
      <Paper
        sx={{
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          maxWidth: '600px'
        }}
      >
        <Box sx={{ marginTop: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                name="darkMode"
                color="primary"
              />
            }
            label={
              <Typography sx={{ color: '#1e293b' }}>
                Dark Mode
              </Typography>
            }
          />
        </Box>
        
        <Box sx={{ marginTop: 3 }}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': {
                color: '#64748b',
              },
              '& .MuiOutlinedInput-root': {
                color: '#1e293b',
                '& fieldset': {
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ marginTop: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            fullWidth
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              color: '#1e293b',
              fontWeight: 600,
              padding: '12px 24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
