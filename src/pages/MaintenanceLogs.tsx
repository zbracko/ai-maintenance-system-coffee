import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fab,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import { demoConfig } from '../config/demoConfig';
import { generateIndividualLogPDF } from '../utils/pdfGenerator';
import { 
  getChatSessions, 
  getLastChatSession, 
  convertSessionToMaintenanceLog,
  shouldAutoGenerateMaintenanceLog,
  saveChatSession 
} from '../utils/chatSessionUtils';

// Demo maintenance logs data
const demoMaintenanceLogs = [
  {
    id: 1,
    date: '2025-01-28',
    time: '09:15 AM',
    machine: 'Espresso Machine #001',
    technician: 'John Smith',
    type: 'Routine Maintenance',
    workOrder: 'WO-2025-001',
    description: 'Weekly descaling procedure completed successfully',
    status: 'Completed',
    priority: 'Medium',
    duration: '45 minutes',
    partsUsed: ['Water Filter CM-WF-002', 'Descaling Solution'],
    notes: 'Machine running smoothly after descaling. Recommended next service in 7 days.',
    severity: 'low'
  },
  {
    id: 2,
    date: '2025-01-27',
    time: '02:30 PM',
    machine: 'Coffee Grinder #003',
    technician: 'Sarah Johnson',
    type: 'Emergency Repair',
    workOrder: 'WO-2025-015',
    description: 'Strange grinding noise investigation and burr replacement',
    status: 'Completed',
    priority: 'High',
    duration: '2 hours 15 minutes',
    partsUsed: ['Grinder Burr Set CM-UB-004', 'Motor Lubricant'],
    notes: 'Worn burr set replaced. Noise eliminated. Customer satisfaction restored.',
    severity: 'high'
  },
  {
    id: 3,
    date: '2025-01-26',
    time: '11:00 AM',
    machine: 'Steam Wand #004',
    technician: 'Mike Wilson',
    type: 'Preventive Service',
    workOrder: 'WO-2025-008',
    description: 'Steam valve seals inspection and replacement',
    status: 'In Progress',
    priority: 'Medium',
    duration: '1 hour 30 minutes (estimated)',
    partsUsed: ['Steam Valve Seals CM-SVS-014'],
    notes: 'Seals showing wear. Replacement in progress. Will test functionality.',
    severity: 'medium'
  },
  {
    id: 4,
    date: '2025-01-25',
    time: '08:45 AM',
    machine: 'Coffee Maker #002',
    technician: 'Lisa Davis',
    type: 'Quality Control',
    workOrder: 'WO-2025-012',
    description: 'Coffee taste analysis and brewing system calibration',
    status: 'Completed',
    priority: 'Low',
    duration: '1 hour',
    partsUsed: ['Temperature Sensor CM-TS-008'],
    notes: 'Brewing temperature adjusted. Coffee quality improved significantly.',
    severity: 'low'
  },
  {
    id: 5,
    date: '2025-01-24',
    time: '03:15 PM',
    machine: 'Bean Hopper #005',
    technician: 'John Smith',
    type: 'Inspection',
    workOrder: 'WO-2025-003',
    description: 'Monthly capacity and cleanliness inspection',
    status: 'Completed',
    priority: 'Low',
    duration: '30 minutes',
    partsUsed: [],
    notes: 'Hopper clean and functioning properly. No issues detected.',
    severity: 'low'
  },
];

interface Log {
  id: number;
  date: string;
  time: string;
  machine: string;
  technician: string;
  type: string;
  workOrder: string;
  description: string;
  status: string;
  priority: string;
  duration: string;
  partsUsed: string[];
  notes: string;
  severity: string;
}

const MaintenanceLogs: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Initialize logs from localStorage or demo data + chat sessions
  const initializeLogs = (): Log[] => {
    console.log('🔄 Initializing logs...');
    const savedLogs = localStorage.getItem('maintenanceLogs');
    let baseLogs = demoMaintenanceLogs;
    
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        // If saved logs exist and have more than demo logs, use them
        if (parsed.length >= demoMaintenanceLogs.length) {
          baseLogs = parsed;
        }
      } catch (error) {
        console.error('Error parsing saved logs:', error);
      }
    }
    
    // Check for actual chat sessions and convert them to maintenance logs
    const chatSessions = getChatSessions();
    console.log('📋 Found chat sessions:', chatSessions.length, chatSessions);
    
    // Only use the LATEST qualifying chat session to avoid duplicates
    let latestChatLog: Log | null = null;
    
    if (chatSessions.length > 0) {
      // Sort sessions by start time, newest first
      const sortedSessions = [...chatSessions].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      // Find the first (most recent) session that qualifies for a maintenance log
      for (const session of sortedSessions) {
        console.log(`🔍 Checking latest session:`, session);
        const shouldGenerate = shouldAutoGenerateMaintenanceLog(session);
        console.log(`✅ Should generate log: ${shouldGenerate}`);
        
        if (shouldGenerate) {
          const logId = baseLogs.length + 1; // Always use next available ID
          latestChatLog = convertSessionToMaintenanceLog(session, logId);
          console.log('🆕 Generated maintenance log from latest session:', latestChatLog);
          break; // Only take the most recent qualifying session
        }
      }
    }
    
    console.log('📊 Chat log generated:', latestChatLog ? 1 : 0);
    
    // Combine demo logs with the single latest chat session log
    const allLogs = latestChatLog ? [latestChatLog, ...baseLogs] : baseLogs;
    
    // Sort by date/time, newest first
    allLogs.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('📈 Final logs count:', allLogs.length);
    return allLogs;
  };

  const [logs, setLogs] = useState<Log[]>(initializeLogs);
  const [availableChatSessions, setAvailableChatSessions] = useState(getChatSessions());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [newLogForm, setNewLogForm] = useState({
    machine: '',
    type: '',
    description: '',
    priority: 'Medium',
    technician: '',
    workOrder: ''
  });

  // Save logs to localStorage whenever logs change (but exclude chat-generated logs)
  useEffect(() => {
    // Only save user-created logs to localStorage, not chat-generated ones
    const userCreatedLogs = logs.filter(log => log.type !== 'AI Chat Session');
    localStorage.setItem('maintenanceLogs', JSON.stringify(userCreatedLogs));
  }, [logs]);

  // Function to refresh logs and check for new chat sessions
  const refreshLogsFromChatSessions = () => {
    console.log('🔄 Refreshing logs from chat sessions...');
    const newLogs = initializeLogs();
    setLogs(newLogs);
    setAvailableChatSessions(getChatSessions());
    console.log('✅ Logs refreshed. Found', getChatSessions().length, 'chat sessions');
  };

  // Function to create a sample chat session for testing
  const createSampleChatSession = () => {
    // Clear old sessions first to prevent accumulation
    localStorage.removeItem('chatSessions');
    
    const sampleSession = {
      sessionId: `chat_${Date.now()}`,
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      endTime: new Date().toISOString(),
      userId: 'user_lisa',
      userName: 'Lisa Rodriguez',
      machineId: 'Coffee Machine #002',
      messages: [
        {
          sender: 'user' as const,
          text: 'Hi, the coffee tastes really bitter today and has an off flavor',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          sender: 'bot' as const,
          text: 'I can help you troubleshoot this coffee quality issue. Bitter and off flavors usually indicate maintenance needs. When did you last descale the machine?',
          timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString()
        },
        {
          sender: 'user' as const,
          text: 'Not sure, maybe 2 months ago? Also the water filter might be old',
          timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString()
        },
        {
          sender: 'bot' as const,
          text: 'That explains the issue! You need to replace the water filter and perform descaling. Let me walk you through the process step by step.',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        },
        {
          sender: 'user' as const,
          text: 'Yes please, I need help with descaling',
          timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString()
        },
        {
          sender: 'bot' as const,
          text: 'Perfect! First, remove the old water filter and empty the reservoir completely. Then mix descaling solution 1:10 with water.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          sender: 'user' as const,
          text: 'Done! The coffee tastes much better now. Thank you!',
          timestamp: new Date().toISOString()
        }
      ],
      tags: ['coffee_quality', 'descaling', 'water_filter', 'maintenance'],
      workOrderGenerated: true,
      workOrderId: 'WO-CM-127',
      partsUsed: ['Water Filter CM-WF-002', 'Descaling Solution CM-DS-019'],
      problemResolved: true,
      duration: '15 minutes'
    };

    saveChatSession(sampleSession);
    console.log('🆕 Sample chat session created:', sampleSession);
    refreshLogsFromChatSessions();
  };

  // Auto-refresh logs every 30 seconds to check for new chat sessions
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSessions = getChatSessions();
      if (currentSessions.length !== availableChatSessions.length) {
        console.log('🆕 New chat session detected, refreshing logs...');
        refreshLogsFromChatSessions();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [availableChatSessions.length]);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.workOrder.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateLog = () => {
    if (newLogForm.machine && newLogForm.description) {
      const newLog: Log = {
        id: logs.length + 1,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        machine: newLogForm.machine,
        technician: newLogForm.technician || 'Current User',
        type: newLogForm.type,
        workOrder: newLogForm.workOrder || `WO-2025-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        description: newLogForm.description,
        status: 'In Progress',
        priority: newLogForm.priority,
        duration: 'Ongoing',
        partsUsed: [],
        notes: 'Log entry created by user',
        severity: newLogForm.priority === 'High' ? 'high' : newLogForm.priority === 'Medium' ? 'medium' : 'low'
      };

      setLogs([newLog, ...logs]);
      setShowCreateDialog(false);
      setNewLogForm({
        machine: '',
        type: '',
        description: '',
        priority: 'Medium',
        technician: '',
        workOrder: ''
      });
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Helper function to clean text for PDF
    const cleanTextForPDF = (text: string): string => {
      return String(text || '')
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols  
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport symbols
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
        .replace(/[^\x00-\x7F]/g, '')           // Remove non-ASCII characters
        .replace(/\s+/g, ' ')                   // Normalize whitespace
        .trim();
    };

    // Helper function to add wrapped text with proper page breaks
    const addWrappedText = (text: string, x: number, y: number, fontSize: number): number => {
      doc.setFontSize(fontSize);
      const cleanText = cleanTextForPDF(text);
      const lines = doc.splitTextToSize(cleanText, maxWidth);
      
      let currentY = y;
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.text(lines[i], x, currentY);
        currentY += fontSize * 0.4; // Line spacing
      }
      
      return currentY + 5; // Add some spacing after the text block
    };
    
    // Header
    doc.setFontSize(20);
    doc.text('Maintenance Logs Report', margin, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 35);
    doc.text(`Total Logs: ${filteredLogs.length}`, margin, 45);
    
    let yPosition = 60;
    
    filteredLogs.forEach((log, index) => {
      // Check if we need a new page for the log header
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Log header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      yPosition = addWrappedText(`${log.workOrder} - ${log.machine}`, margin, yPosition, 14);
      
      // Basic info
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPosition = addWrappedText(`Date: ${log.date} ${log.time} | Technician: ${cleanTextForPDF(log.technician)}`, margin, yPosition, 10);
      yPosition = addWrappedText(`Type: ${cleanTextForPDF(log.type)} | Status: ${cleanTextForPDF(log.status)} | Priority: ${cleanTextForPDF(log.priority)}`, margin, yPosition, 10);
      
      // Description
      yPosition = addWrappedText(`Description: ${cleanTextForPDF(log.description)}`, margin, yPosition, 10);
      
      // Parts used (if any)
      if (log.partsUsed && log.partsUsed.length > 0) {
        const partsText = log.partsUsed.map(part => cleanTextForPDF(String(part))).join(', ');
        yPosition = addWrappedText(`Parts Used: ${partsText}`, margin, yPosition, 10);
      }
      
      // Notes (this is often the longest section for chat sessions)
      if (log.notes) {
        const notesText = cleanTextForPDF(log.notes);
        // For very long notes (like chat sessions), truncate to prevent excessive length
        const truncatedNotes = notesText.length > 1000 
          ? notesText.substring(0, 1000) + '... [Content truncated for PDF summary]'
          : notesText;
        yPosition = addWrappedText(`Notes: ${truncatedNotes}`, margin, yPosition, 9);
      }
      
      // Add separator between logs
      yPosition += 15;
      
      // Add a line separator if not the last log
      if (index < filteredLogs.length - 1) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
    
    doc.save('maintenance-logs-report.pdf');
  };

  const handleGenerateIndividualPDF = async (log: Log, includeAI: boolean = true) => {
    setIsGeneratingPDF(true);
    setPdfProgress('Initializing PDF generation...');
    
    try {
      const currentLanguage = i18n.language;
      console.log('🔄 Starting PDF generation for:', log.workOrder, 'in language:', currentLanguage);
      
      if (includeAI) {
        setPdfProgress('Generating AI-enhanced content...');
        console.log('🤖 AI enhancement enabled');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      } else {
        setPdfProgress('Creating basic PDF...');
        console.log('📄 Basic PDF mode');
      }
      
      setPdfProgress('Creating PDF document...');
      await generateIndividualLogPDF(log, currentLanguage, includeAI);
      
      setPdfProgress('PDF generated successfully!');
      console.log('✅ PDF generation completed successfully');
      
      setTimeout(() => {
        setIsGeneratingPDF(false);
        setPdfProgress('');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error generating individual PDF:', error);
      setPdfProgress(`Error: ${error instanceof Error ? error.message : 'PDF generation failed'}`);
      
      setTimeout(() => {
        setIsGeneratingPDF(false);
        setPdfProgress('');
      }, 3000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ padding: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
            📋 Maintenance Logs
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh from Chat Sessions">
              <IconButton onClick={refreshLogsFromChatSessions} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download PDF Report">
              <IconButton onClick={generatePDFReport} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Fab 
              color="primary" 
              aria-label="add" 
              size="medium"
              onClick={() => setShowCreateDialog(true)}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Box>

        {demoConfig.isDemo && (
          <Alert severity="info" sx={{ mb: 2 }}>
            🎪 <strong>Demo Mode:</strong> This page shows maintenance logs with filtering, search, and PDF export. 
            Logs are automatically generated from actual chat sessions when you use the AI Chat interface! 
            Available chat sessions: {availableChatSessions.length}
          </Alert>
        )}

        {availableChatSessions.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            🤖 <strong>Live Chat Integration:</strong> Found {availableChatSessions.length} chat session(s). 
            Maintenance logs are automatically created from qualifying chat conversations. 
            <Button size="small" onClick={refreshLogsFromChatSessions} sx={{ ml: 1 }}>
              Refresh Now
            </Button>
          </Alert>
        )}

        {/* Debug/Testing Section */}
        {demoConfig.isDemo && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            🧪 <strong>Testing:</strong> Create a sample chat session to test the auto-generation feature.
            <Button size="small" onClick={createSampleChatSession} sx={{ ml: 1 }} variant="outlined">
              Create Sample Chat Session
            </Button>
          </Alert>
        )}

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Routine Maintenance">Routine</MenuItem>
                <MenuItem value="Emergency Repair">Emergency</MenuItem>
                <MenuItem value="Preventive Service">Preventive</MenuItem>
                <MenuItem value="Quality Control">Quality Control</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing {filteredLogs.length} of {logs.length} logs
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs List */}
      <Grid container spacing={2}>
        {filteredLogs.map((log) => (
          <Grid item xs={12} md={6} lg={4} key={log.id}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => setSelectedLog(log)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1f2937' }}>
                    {log.workOrder}
                  </Typography>
                  <Chip 
                    label={log.priority} 
                    size="small" 
                    sx={{ 
                      backgroundColor: getPriorityColor(log.priority),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {log.machine}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {log.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={log.status} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      borderColor: getStatusColor(log.status),
                      color: getStatusColor(log.status)
                    }}
                  />
                  <Chip 
                    icon={<BuildIcon />}
                    label={log.type} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    👨‍🔧 {log.technician}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      📅 {log.date}
                    </Typography>
                    <Tooltip title={t('maintenanceLogs.downloadIndividual')}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateIndividualPDF(log, true);
                        }}
                        disabled={isGeneratingPDF}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredLogs.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Typography variant="h6" color="text.secondary">
            No maintenance logs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or create a new log entry
          </Typography>
        </Paper>
      )}

      {/* Log Detail Dialog */}
      <Dialog 
        open={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedLog?.workOrder} - Details</Typography>
            <Chip 
              label={selectedLog?.status} 
              sx={{ 
                backgroundColor: getStatusColor(selectedLog?.status || ''),
                color: 'white'
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Machine</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.machine}</Typography>

                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.type}</Typography>

                <Typography variant="body2" color="text.secondary">Priority</Typography>
                <Chip 
                  label={selectedLog.priority} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getPriorityColor(selectedLog.priority),
                    color: 'white',
                    mb: 2
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Technician</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.technician}</Typography>

                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.date} at {selectedLog.time}</Typography>

                <Typography variant="body2" color="text.secondary">Duration</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.duration}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedLog.description}</Typography>

                {selectedLog.partsUsed.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary">Parts Used</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {selectedLog.partsUsed.map((part, index) => (
                        <Chip key={index} label={part} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}

                <Typography variant="body2" color="text.secondary">Notes</Typography>
                <Typography variant="body1">{selectedLog.notes}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handleGenerateIndividualPDF(selectedLog!, false)}
                disabled={isGeneratingPDF}
              >
                {t('maintenanceLogs.basicPdf')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                onClick={() => handleGenerateIndividualPDF(selectedLog!, true)}
                disabled={isGeneratingPDF}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  }
                }}
              >
                {t('maintenanceLogs.aiEnhancedPdf')}
              </Button>
            </Box>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Create Log Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Maintenance Log</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Machine"
                value={newLogForm.machine}
                onChange={(e) => setNewLogForm({...newLogForm, machine: e.target.value})}
                placeholder="e.g., Espresso Machine #001"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newLogForm.type}
                  label="Type"
                  onChange={(e) => setNewLogForm({...newLogForm, type: e.target.value})}
                >
                  <MenuItem value="Routine Maintenance">Routine Maintenance</MenuItem>
                  <MenuItem value="Emergency Repair">Emergency Repair</MenuItem>
                  <MenuItem value="Preventive Service">Preventive Service</MenuItem>
                  <MenuItem value="Quality Control">Quality Control</MenuItem>
                  <MenuItem value="Inspection">Inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newLogForm.priority}
                  label="Priority"
                  onChange={(e) => setNewLogForm({...newLogForm, priority: e.target.value})}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newLogForm.description}
                onChange={(e) => setNewLogForm({...newLogForm, description: e.target.value})}
                placeholder="Describe the maintenance activity..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Technician"
                value={newLogForm.technician}
                onChange={(e) => setNewLogForm({...newLogForm, technician: e.target.value})}
                placeholder="Your name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Order (Optional)"
                value={newLogForm.workOrder}
                onChange={(e) => setNewLogForm({...newLogForm, workOrder: e.target.value})}
                placeholder="Auto-generated if empty"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateLog} variant="contained">Create Log</Button>
        </DialogActions>
      </Dialog>

      {/* PDF Generation Progress Dialog */}
      <Dialog open={isGeneratingPDF} disableEscapeKeyDown>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SmartToyIcon color="primary" />
            <Typography variant="h6">{t('maintenanceLogs.generatingPdf')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {pdfProgress}
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
              {t('maintenanceLogs.pdfGenerating', { 
                language: i18n.language === 'es' ? 'Spanish' : i18n.language === 'fr' ? 'French' : 'English' 
              })}
            </Alert>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MaintenanceLogs;
