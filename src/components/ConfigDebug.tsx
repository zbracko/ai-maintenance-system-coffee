import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { API_BASE_URL, S3_BASE_URL, S3_BUCKET_NAME, S3_REGION, FRONTEND_URL } from '../config';

const ConfigDebug: React.FC = () => {
  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: '0 auto' }}>
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom color="primary">
          🔧 Configuration Debug Info
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', mt: 2 }}>
          <strong>Environment Variables:</strong><br/>
          NODE_ENV: {process.env.NODE_ENV || 'undefined'}<br/>
          REACT_APP_API_BASE_URL: {process.env.REACT_APP_API_BASE_URL || 'undefined'}<br/>
          REACT_APP_S3_BUCKET: {process.env.REACT_APP_S3_BUCKET || 'undefined'}<br/>
          REACT_APP_S3_REGION: {process.env.REACT_APP_S3_REGION || 'undefined'}<br/>
          REACT_APP_FRONTEND_URL: {process.env.REACT_APP_FRONTEND_URL || 'undefined'}<br/>
          REACT_APP_DEMO_MODE: {process.env.REACT_APP_DEMO_MODE || 'undefined'}<br/>
        </Typography>

        <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', mt: 2 }}>
          <strong>Actual Config Values:</strong><br/>
          API_BASE_URL: {API_BASE_URL}<br/>
          S3_BUCKET_NAME: {S3_BUCKET_NAME}<br/>
          S3_REGION: {S3_REGION}<br/>
          S3_BASE_URL: {S3_BASE_URL}<br/>
          FRONTEND_URL: {FRONTEND_URL}<br/>
        </Typography>

        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          This debug component helps identify if environment variables are properly set in Amplify.
          If you see "undefined" values, the environment variables are not configured in AWS Amplify Console.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ConfigDebug;
