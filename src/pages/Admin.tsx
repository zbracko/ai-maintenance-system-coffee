import React from 'react';
import AdminPanel from '../components/AdminPanel/AdminPanel';
import { Box } from '@mui/material';

const Admin: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}
    >
      <AdminPanel />
    </Box>
  );
};

export default Admin;
