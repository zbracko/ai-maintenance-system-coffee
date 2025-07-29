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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import { demoConfig } from '../config/demoConfig';

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
  }
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
  const { t } = useTranslation();
  // Initialize logs from localStorage or demo data
  const initializeLogs = (): Log[] => {
    const savedLogs = localStorage.getItem('maintenanceLogsNew');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (error) {
        console.error('Error parsing saved logs:', error);
        return demoMaintenanceLogs;
      }
    }
    return demoMaintenanceLogs;
  };

  const [logs, setLogs] = useState<Log[]>(initializeLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    machine: '',
    type: '',
    description: '',
    priority: 'Medium',
    technician: '',
    workOrder: ''
  });

  // Save logs to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem('maintenanceLogsNew', JSON.stringify(logs));
  }, [logs]);

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
    
    // Header
    doc.setFontSize(20);
    doc.text('Maintenance Logs Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Total Logs: ${filteredLogs.length}`, 20, 45);
    
    let yPosition = 60;
    
    filteredLogs.forEach((log, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`${log.workOrder} - ${log.machine}`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Date: ${log.date} ${log.time} | Technician: ${log.technician}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Type: ${log.type} | Status: ${log.status} | Priority: ${log.priority}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Description: ${log.description}`, 20, yPosition);
      yPosition += 7;
      if (log.notes) {
        doc.text(`Notes: ${log.notes}`, 20, yPosition);
        yPosition += 7;
      }
      yPosition += 10;
    });
    
    doc.save('maintenance-logs-report.pdf');
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
            🎪 <strong>Demo Mode:</strong> This page shows sample maintenance logs with filtering, search, and PDF export capabilities. In production, data would be synced with your maintenance management system.
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
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
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
                  <Typography variant="body2" color="text.secondary">
                    📅 {log.date}
                  </Typography>
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
          <Button onClick={() => setSelectedLog(null)}>Close</Button>
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
    </Box>
  );
};

export default MaintenanceLogs;
