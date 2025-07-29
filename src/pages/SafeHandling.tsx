import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  List,
  ListItem,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { demoConfig } from '../config/demoConfig';

// Demo safety procedures data
const demoSafetyProcedures = [
  {
    id: 'electrical-safety',
    title: 'Electrical Safety Procedures',
    description: 'Essential electrical safety protocols for coffee machine maintenance',
    points: [
      {
        id: 'power-disconnect',
        text: 'Always disconnect power before any maintenance work',
        image: '/src/assets/Picture2.png',
        video: null
      },
      {
        id: 'lockout-tagout',
        text: 'Implement proper lockout/tagout procedures',
        image: '/src/assets/Picture3.png',
        video: null
      },
      {
        id: 'grounding',
        text: 'Verify proper grounding of all electrical components',
        image: '/src/assets/Picture4.png',
        video: null
      },
      {
        id: 'voltage-testing',
        text: 'Use voltage tester to confirm zero energy state',
        image: '/src/assets/Picture5.png',
        video: null
      }
    ]
  },
  {
    id: 'thermal-safety',
    title: 'Thermal Protection',
    description: 'Protection against burns and heat-related injuries',
    points: [
      {
        id: 'cooling-time',
        text: 'Allow machine to cool for minimum 30 minutes before service',
        image: '/src/assets/Picture2.png',
        video: null
      },
      {
        id: 'heat-gloves',
        text: 'Use heat-resistant gloves rated for 400°F minimum',
        image: '/src/assets/Picture3.png',
        video: null
      },
      {
        id: 'steam-safety',
        text: 'Never work on pressurized steam systems',
        image: '/src/assets/Picture4.png',
        video: null
      },
      {
        id: 'temperature-check',
        text: 'Use infrared thermometer to verify safe temperatures',
        image: '/src/assets/Picture5.png',
        video: null
      }
    ]
  },
  {
    id: 'chemical-safety',
    title: 'Chemical Handling',
    description: 'Safe handling of cleaning chemicals and descaling solutions',
    points: [
      {
        id: 'ppe-required',
        text: 'Wear chemical-resistant gloves and eye protection',
        image: '/src/assets/Picture2.png',
        video: null
      },
      {
        id: 'ventilation',
        text: 'Ensure adequate ventilation when using chemicals',
        image: '/src/assets/Picture3.png',
        video: null
      },
      {
        id: 'sds-review',
        text: 'Review Safety Data Sheets before chemical use',
        image: '/src/assets/Picture4.png',
        video: null
      },
      {
        id: 'emergency-rinse',
        text: 'Know location of emergency eyewash and shower stations',
        image: '/src/assets/Picture5.png',
        video: null
      }
    ]
  },
  {
    id: 'mechanical-safety',
    title: 'Mechanical Safety',
    description: 'Protection from moving parts and mechanical hazards',
    points: [
      {
        id: 'moving-parts',
        text: 'Secure all moving parts before maintenance',
        image: '/src/assets/Picture2.png',
        video: null
      },
      {
        id: 'pinch-points',
        text: 'Be aware of pinch points and crushing hazards',
        image: '/src/assets/Picture3.png',
        video: null
      },
      {
        id: 'tool-safety',
        text: 'Use proper tools and maintain them in good condition',
        image: '/src/assets/Picture4.png',
        video: null
      },
      {
        id: 'lifting-techniques',
        text: 'Use proper lifting techniques for heavy components',
        image: '/src/assets/Picture5.png',
        video: null
      }
    ]
  }
];

// Replace the local endpoint with your actual AWS endpoint.

interface ResourceItem {
  type: 'directory' | 'file';
  name?: string;
  path?: string;
  children?: ResourceItem[];
}

interface SafetyPoint {
  id: string;
  text: string;
  image?: string;
  video?: string;
}

const SafeHandling: React.FC = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [safetyPoints, setSafetyPoints] = useState<{ [key: string]: SafetyPoint[] }>({});
  const [newPointText, setNewPointText] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('');
  const [newVideo, setNewVideo] = useState<string>('');

  useEffect(() => {
    const fetchResources = async () => {
      if (demoConfig.isDemo) {
        // Use demo safety procedures
        const demoResources = demoSafetyProcedures.map(procedure => ({
          type: 'directory' as const,
          name: procedure.id,
          path: procedure.id,
          children: procedure.points.map(point => ({
            type: 'file' as const,
            name: point.id,
            path: `${procedure.id}/${point.id}`
          }))
        }));
        
        setResources(demoResources);
        
        // Set initial safety points from demo data
        const initialSafetyPoints: { [key: string]: SafetyPoint[] } = {};
        demoSafetyProcedures.forEach(procedure => {
          initialSafetyPoints[procedure.id] = procedure.points;
        });
        setSafetyPoints(initialSafetyPoints);
      } else {
        // Real API call (disabled in demo)
        try {
          const res = await fetch(`/api/resources`);
          const data = await res.json();
          setResources(data.resources || []);
        } catch (error) {
          console.error('Error fetching resources:', error);
          // Fallback to demo data
          const demoResources = demoSafetyProcedures.map(procedure => ({
            type: 'directory' as const,
            name: procedure.id,
            path: procedure.id
          }));
          setResources(demoResources);
        }
      }
    };

    fetchResources();
  }, []);

  const parseMachineFolder = (folderName: string): string => {
    const parts = folderName.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : folderName;
  };

  const handleAddPoint = (machineKey: string) => {
    const newPoint: SafetyPoint = {
      id: Date.now().toString(),
      text: newPointText,
      image: newImage,
      video: newVideo,
    };
    setSafetyPoints((prev) => ({
      ...prev,
      [machineKey]: [...(prev[machineKey] || []), newPoint],
    }));
    setNewPointText('');
    setNewImage('');
    setNewVideo('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setNewImage(url);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setNewVideo(url);
    }
  };

  return (
    <Box 
      padding="2rem" 
      boxSizing="border-box"
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        overflow: 'auto' 
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: '#1e293b',
          fontWeight: 700,
          mb: 2,
          textAlign: 'center'
        }}
      >
        {t('safeHandling.title')}
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          color: '#64748b',
          mb: 4,
          textAlign: 'center'
        }}
      >
        Essential safety procedures for coffee machine maintenance
      </Typography>
      
      <Paper 
        sx={{ 
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {demoConfig.isDemo ? (
          // Demo mode - show structured safety procedures
          <Grid container spacing={3}>
            {demoSafetyProcedures.map((procedure, procedureIndex) => (
              <Grid item xs={12} key={procedure.id}>
                <Card sx={{ 
                  background: 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  mb: 2
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 32 }} />
                      <Box>
                        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700 }}>
                          {procedure.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {procedure.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {procedure.points.map((point, pointIndex) => (
                        <Grid item xs={12} md={6} key={point.id}>
                          <Card sx={{ 
                            background: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '8px',
                            height: '100%'
                          }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                <CheckCircleIcon sx={{ color: '#10b981', mr: 1, mt: 0.5, fontSize: 20 }} />
                                <Typography variant="body1" sx={{ flexGrow: 1, color: '#374151' }}>
                                  {point.text}
                                </Typography>
                              </Box>
                              
                              {point.image && (
                                <Box sx={{ mt: 'auto', pt: 2 }}>
                                  <CardMedia
                                    component="img"
                                    height="120"
                                    image={point.image}
                                    alt={`Safety procedure ${pointIndex + 1}`}
                                    sx={{ 
                                      borderRadius: '8px',
                                      objectFit: 'cover',
                                      backgroundColor: '#f1f5f9'
                                    }}
                                  />
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" sx={{ color: '#1e40af', fontWeight: 600, mb: 1 }}>
                        💡 Add Custom Safety Points
                      </Typography>
                      <TextField
                        label="Add safety instruction for this procedure"
                        fullWidth
                        multiline
                        minRows={2}
                        value={newPointText}
                        onChange={(e) => setNewPointText(e.target.value)}
                        sx={{ mb: 2 }}
                        size="small"
                      />
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <IconButton color="primary" component="label" size="small">
                          <PhotoCamera />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Attach Image
                        </Typography>
                        <IconButton color="primary" component="label" size="small">
                          <VideoLibraryIcon />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            style={{ display: 'none' }}
                          />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Attach Video
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddPoint(procedure.id)}
                        disabled={!newPointText.trim()}
                        sx={{ backgroundColor: '#3b82f6' }}
                      >
                        Add Safety Point
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          // Production mode - show original accordion layout
          resources
            .filter((item) => item.type === 'directory' && item.name && item.name.toLowerCase() !== 'origin')
            .map((folder, idx) => {
              const machineKey = folder.name || `machine-${idx}`;
              const machineName = parseMachineFolder(machineKey);
              const points = safetyPoints[machineKey] || [];

              return (
                <Accordion key={machineKey} disableGutters elevation={0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="bold" color="primary">
                      {machineName || machineKey}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {points.map((point) => (
                        <ListItem
                          key={point.id}
                          alignItems="flex-start"
                          sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                        >
                          <Typography variant="body1">• {point.text}</Typography>
                          {point.image && (
                            <Box mt={1}>
                              <img
                                src={point.image}
                                alt="safety"
                                style={{ maxWidth: '100%', maxHeight: '150px' }}
                              />
                            </Box>
                          )}
                          {point.video && (
                            <Box mt={1}>
                              <video src={point.video} controls style={{ maxWidth: '100%' }} />
                            </Box>
                          )}
                        </ListItem>
                      ))}
                    </List>

                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('safeHandling.addPointTitle')}
                      </Typography>
                      <TextField
                        label={t('safeHandling.pointInstruction')}
                        fullWidth
                        multiline
                        minRows={2}
                        value={newPointText}
                        onChange={(e) => setNewPointText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          mb: 2,
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body2">{t('safeHandling.attachImage')}</Typography>
                          <IconButton color="primary" component="label">
                            <PhotoCamera />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              style={{ display: 'none' }}
                            />
                          </IconButton>
                        </Box>
                        <Box>
                          <Typography variant="body2">{t('safeHandling.attachVideo')}</Typography>
                          <IconButton color="primary" component="label">
                            <VideoLibraryIcon />
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              style={{ display: 'none' }}
                            />
                          </IconButton>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => handleAddPoint(machineKey)}
                        disabled={!newPointText.trim()}
                      >
                        {t('safeHandling.addSafetyPoint')}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })
        )}
      </Paper>
    </Box>
  );
};

export default SafeHandling;
