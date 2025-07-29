import React from 'react';
import { Box, Typography } from '@mui/material';
import getSvg from '../../assets/Click2Svg'; // Adjust the relative path if needed

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        color: '#333333',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, row on larger screens
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {/* Centered Copyright Text */}
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} AI Maintenance System. All rights reserved.
      </Typography>

      {/* Right-side "Built by Click2.ai" with SVG (Moves below text on mobile) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centers on small screens
          mt: { xs: 1, md: 0 }, // Adds margin on top for mobile view
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          Built by Click2.ai
        </Typography>
        <Box
          component="span"
          sx={{ display: 'inline-flex' }}
          dangerouslySetInnerHTML={{ __html: getSvg(24, 'click2-svg') }}
        />
      </Box>
    </Box>
  );
};

export default Footer;
