import React from 'react';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import DemoBanner from '../components/DemoBanner/DemoBanner';
import { Box } from '@mui/material';
import { demoConfig } from '../config/demoConfig';

const Chat: React.FC = () => {
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
      {demoConfig.isDemo && <DemoBanner />}
      <ChatInterface />
    </Box>
  );
};

export default Chat;
