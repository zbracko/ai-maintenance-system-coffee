import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

const VoiceCommand: React.FC = () => {
  const handleVoiceCommand = () => {
    // Future implementation: Integrate voice command functionality
    alert('Voice command feature is under development!');
  };

  return (
    <Tooltip title="Activate Voice Command">
      <IconButton color="inherit" onClick={handleVoiceCommand}>
        <MicIcon />
      </IconButton>
    </Tooltip>
  );
};

export default VoiceCommand;
