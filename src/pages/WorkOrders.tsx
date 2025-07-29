import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { demoWorkOrders } from '../data/demoData';
import { demoConfig } from '../config/demoConfig';

interface WorkOrder {
  id: string;
  dateIssued: string;
  priority?: string;
  location?: string;
  asset?: string;
  description?: string;
  requestedBy?: string;
  assignedTo?: string;
  dueDate?: string;
  materials?: string;
  additionalNotes?: string;
  task?: string;
  status?: string;
}

const WorkOrders: React.FC = () => {
  const { t } = useTranslation();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoConfig.isDemo) {
      // Use demo data for work orders
      const demoWorkOrdersFormatted = demoWorkOrders.map(wo => ({
        id: wo.id,
        dateIssued: wo.createdDate || new Date().toISOString().split('T')[0],
        priority: wo.priority || 'Medium',
        location: wo.location || 'Coffee Station',
        asset: wo.asset || wo.task,
        description: wo.description || wo.task,
        requestedBy: wo.requestedBy || wo.createdBy,
        assignedTo: wo.assignedTo || 'Available Technician',
        dueDate: wo.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        task: wo.task,
        status: wo.status || 'Open'
      }));
      
      setWorkOrders(demoWorkOrdersFormatted);
      setLoading(false);
    } else {
      // Real API call (disabled in demo)
      fetch(`/api/workorders`)
        .then((res) => res.json())
        .then((data) => {
          setWorkOrders(data.workOrders || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching work orders:', err);
          setError(t('workOrders.error'));
          setLoading(false);
        });
    }
  }, [t]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Paper
          sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography sx={{ color: '#1e293b' }}>{t('workOrders.loading')}</Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Paper
          sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '2rem',
        boxSizing: 'border-box',
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
        {t('workOrders.title')}
      </Typography>
      
      <Paper 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <List>
          {workOrders.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={t('workOrders.noWorkOrders')}
                secondary="No work orders found. Create new work orders through the chat interface."
              />
            </ListItem>
          ) : (
            workOrders.map((wo, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                        {wo.id}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: wo.priority === 'High' ? '#fee2e2' : 
                                         wo.priority === 'Medium' ? '#fef3c7' : '#dcfce7',
                          color: wo.priority === 'High' ? '#dc2626' : 
                                wo.priority === 'Medium' ? '#d97706' : '#16a34a'
                        }}
                      >
                        {wo.priority || 'Medium'} Priority
                      </Typography>
                      {wo.status && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: wo.status === 'Open' ? '#dbeafe' : '#d1fae5',
                            color: wo.status === 'Open' ? '#1d4ed8' : '#059669'
                          }}
                        >
                          {wo.status}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#374151', mb: 1 }}>
                        {wo.description || wo.task || t('workOrders.noDescription')}
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                        <Typography component="span" variant="body2" color="textSecondary">
                          <strong>{t('workOrders.dateIssued')}:</strong> {wo.dateIssued}
                        </Typography>
                        
                        {wo.location && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            <strong>{t('workOrders.location')}:</strong> {wo.location}
                          </Typography>
                        )}
                        
                        {wo.asset && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            <strong>{t('workOrders.asset')}:</strong> {wo.asset}
                          </Typography>
                        )}
                        
                        {wo.assignedTo && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            <strong>{t('workOrders.assignedTo')}:</strong> {wo.assignedTo}
                          </Typography>
                        )}
                        
                        {wo.dueDate && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            <strong>{t('workOrders.dueDate')}:</strong> {wo.dueDate}
                          </Typography>
                        )}
                        
                        {wo.requestedBy && (
                          <Typography component="span" variant="body2" color="textSecondary">
                            <strong>Requested By:</strong> {wo.requestedBy}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default WorkOrders;
