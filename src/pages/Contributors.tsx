import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';

const Contributors: React.FC = () => {
  const contributors = [
    {
      name: 'John Doe',
      role: 'Senior Engineer',
      expertise: 'HVAC Systems',
      avatar: 'https://via.placeholder.com/150/2563eb/ffffff?text=JD',
    },
    {
      name: 'Jane Smith',
      role: 'Maintenance Lead',
      expertise: 'Electrical Systems',
      avatar: 'https://via.placeholder.com/150/059669/ffffff?text=JS',
    },
    {
      name: 'Mike Johnson',
      role: 'Safety Coordinator',
      expertise: 'Industrial Safety',
      avatar: 'https://via.placeholder.com/150/dc2626/ffffff?text=MJ',
    },
    {
      name: 'Sarah Davis',
      role: 'Equipment Specialist',
      expertise: 'Mechanical Systems',
      avatar: 'https://via.placeholder.com/150/7c2d12/ffffff?text=SD',
    },
    {
      name: 'David Wilson',
      role: 'Data Analyst',
      expertise: 'Predictive Maintenance',
      avatar: 'https://via.placeholder.com/150/7c3aed/ffffff?text=DW',
    },
    {
      name: 'Emily Chen',
      role: 'Quality Assurance',
      expertise: 'Process Optimization',
      avatar: 'https://via.placeholder.com/150/ea580c/ffffff?text=EC',
    }
  ];

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
          mb: 4,
          textAlign: 'center'
        }}
      >
        Our Contributors
      </Typography>
      
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          p: 3,
          flex: 1,
          overflowY: 'auto'
        }}
      >
        <Grid container spacing={3} sx={{ flex: 1 }}>
          {contributors.map((contributor, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar 
                    src={contributor.avatar} 
                    alt={contributor.name} 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      marginRight: 3,
                      border: '3px solid rgba(37, 99, 235, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#1e293b', 
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      {contributor.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#2563eb',
                        fontWeight: 500,
                        mb: 0.5
                      }}
                    >
                      {contributor.role}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem'
                      }}
                    >
                      Expertise: {contributor.expertise}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Contributors;
