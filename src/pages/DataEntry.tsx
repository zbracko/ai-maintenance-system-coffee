import React from 'react';
import DataEntryForm from '../components/DataEntryForm/DataEntryForm';
import { Box } from '@mui/material';

const DataEntry: React.FC = () => {
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      padding="2rem"
      boxSizing="border-box"
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}
    >
      <DataEntryForm />
    </Box>
  );
};

export default DataEntry;
