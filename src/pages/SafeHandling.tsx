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
    id: 'coffee-machine-electrical',
    title: 'Coffee Machine Electrical Safety',
    description: 'Essential electrical safety protocols for coffee equipment maintenance',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMwMDAiPjxyZWN0IHg9IjgiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSIxNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjI0IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMzIiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI0MCIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQ4IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNTYiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI2NCIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjcyIiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iODAiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI4OCIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjgiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iODgiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iOCIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSIzMiIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI0MCIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI2NCIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48cmVjdCB4PSI4OCIgeT0iMjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz48L2c+PC9zdmc+',
    points: [
      {
        id: 'espresso-power-off',
        text: 'Always switch OFF and unplug espresso machine before any maintenance work',
        image: '/assets/espresso-machine-cleaning.svg',
        video: null
      },
      {
        id: 'grinder-lockout',
        text: 'Implement lockout procedures for coffee grinder electrical connections',
        image: '/assets/coffee-grinder-operation.svg',
        video: null
      },
      {
        id: 'water-electrical',
        text: 'Ensure no water contact with electrical components during cleaning',
        image: '/assets/steam-wand-cleaning.svg',
        video: null
      },
      {
        id: 'voltage-verification',
        text: 'Use multimeter to verify zero voltage before opening electrical panels',
        image: '/assets/troubleshooting-guide.svg',
        video: null
      }
    ]
  },
  {
    id: 'hot-surfaces-steam',
    title: 'Hot Surfaces & Steam Safety',
    description: 'Protection from burns and steam-related injuries during coffee service',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMwMDAiPjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjIwIiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjI4IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjM2IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQ0IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjUyIiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjY4IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9Ijc2IiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjEyIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjM2IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjUyIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9Ijc2IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjEyIiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjIwIiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjI4IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjx0ZXh0IHg9IjUwIiB5PSI5MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiPkhPVDwvdGV4dD48L2c+PC9zdmc+',
    points: [
      {
        id: 'cooling-period',
        text: 'Allow espresso machine to cool for minimum 30 minutes after use before maintenance',
        image: '/assets/espresso-machine-cleaning.svg',
        video: null
      },
      {
        id: 'heat-resistant-gloves',
        text: 'Use heat-resistant gloves when handling hot portafilters and group heads',
        image: '/assets/steam-wand-cleaning.svg',
        video: null
      },
      {
        id: 'steam-wand-safety',
        text: 'Never remove steam wand tip while system is pressurized',
        image: '/assets/steam-wand-cleaning.svg',
        video: null
      },
      {
        id: 'temperature-monitoring',
        text: 'Use infrared thermometer to verify safe surface temperatures before contact',
        image: '/assets/troubleshooting-guide.svg',
        video: null
      }
    ]
  },
  {
    id: 'cleaning-chemicals',
    title: 'Coffee Cleaning Chemical Safety',
    description: 'Safe handling of descaling solutions and coffee cleaning chemicals',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMwMDAiPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjI0IiB5PSIxNiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQwIiB5PSIxNiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg0OGQiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNTYiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNjQiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNzIiIHk9IjE2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMTYiIHk9IjI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNDAiIHk9IjI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iNzIiIHk9IjI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMTYiIHk9IjMyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMjQiIHk9IjMyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHJlY3QgeD0iMzIiIHk9IjMyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+PHRleHQgeD0iNTAiIHk9Ijg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjhweCIgZmlsbD0iIzAwNjZjYyI+Q0hFTTwvdGV4dD48L2c+PC9zdmc+',
    points: [
      {
        id: 'descaling-ppe',
        text: 'Wear chemical-resistant gloves and eye protection when handling descaling solutions',
        image: '/assets/water-filter-replacement.svg',
        video: null
      },
      {
        id: 'coffee-ventilation',
        text: 'Ensure adequate ventilation when using espresso machine cleaners',
        image: '/assets/espresso-machine-cleaning.svg',
        video: null
      },
      {
        id: 'chemical-sds',
        text: 'Review Safety Data Sheets for all coffee cleaning products before use',
        image: '/assets/troubleshooting-guide.svg',
        video: null
      },
      {
        id: 'emergency-wash',
        text: 'Know location of emergency eyewash station for chemical exposure',
        image: '/assets/water-filter-replacement.svg',
        video: null
      }
    ]
  },
  {
    id: 'coffee-equipment-mechanical',
    title: 'Coffee Equipment Mechanical Safety',
    description: 'Protection from moving parts and mechanical hazards in coffee equipment',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxnIGZpbGw9IiMwMDAiPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjI4IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjM2IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQ0IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjUyIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjY4IiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjIwIiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQ0IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjY4IiB5PSIyOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjIwIiB5PSIzNiIgd2lkdGg9IjQiIGhlaWdodD0iNCIvPjx0ZXh0IHg9IjUwIiB5PSI4NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiNmZjY2MDAiPk1FQ0g8L3RleHQ+PC9nPjwvc3ZnPg==',
    points: [
      {
        id: 'grinder-burr-safety',
        text: 'Secure coffee grinder burrs and turn off power before cleaning or adjustment',
        image: '/assets/coffee-grinder-operation.svg',
        video: null
      },
      {
        id: 'group-head-caution',
        text: 'Be aware of group head spring tension and moving parts during service',
        image: '/assets/espresso-machine-cleaning.svg',
        video: null
      },
      {
        id: 'tool-maintenance',
        text: 'Use proper coffee tools and maintain them in good condition',
        image: '/assets/troubleshooting-guide.svg',
        video: null
      },
      {
        id: 'machine-lifting',
        text: 'Use proper lifting techniques when moving heavy espresso machines',
        image: '/assets/water-filter-replacement.svg',
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
        Coffee Equipment Safety Procedures
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
        Essential safety procedures for coffee machine maintenance and operation
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
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700 }}>
                          {procedure.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {procedure.description}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', textAlign: 'center', mb: 1 }}>
                          Safety QR Code
                        </Typography>
                        <img 
                          src={procedure.qrCode} 
                          alt={`QR Code for ${procedure.title}`}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#fff'
                          }}
                        />
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
