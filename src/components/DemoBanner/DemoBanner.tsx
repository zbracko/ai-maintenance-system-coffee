import React from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { demoConfig } from '../../config/demoConfig';

const DemoBanner: React.FC = () => {
  if (!demoConfig.isDemo) {
    return null;
  }

  return (
    <Alert
      severity="info"
      sx={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        margin: '16px',
        marginBottom: '8px',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
        '& .MuiAlert-icon': {
          color: '#3b82f6'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Chip 
          label="DEMO MODE" 
          color="primary" 
          variant="filled"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white'
          }}
        />
        <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 500, flex: 1 }}>
          ☕ Coffee Machine Maintenance System Demo - No real AI or data connections active
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
          All responses are simulated for demonstration purposes
        </Typography>
      </Box>
    </Alert>
  );
};

export default DemoBanner;
