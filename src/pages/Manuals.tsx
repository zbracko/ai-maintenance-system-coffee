import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import DemoBanner from '../components/DemoBanner/DemoBanner';
import { demoConfig } from '../config/demoConfig';
import { coffeeManualSections } from '../data/coffeeManualSections';

interface ResourceItem {
  type: 'directory' | 'file';
  name?: string;
  path?: string;
  children?: ResourceItem[];
}

const Manuals: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);

  useEffect(() => {
    if (demoConfig.isDemo) {
      // In demo mode, use coffee manual sections instead of API call
      const demoResources: ResourceItem[] = coffeeManualSections.map(section => ({
        type: 'file' as const,
        name: `${section.title}.txt`,
        path: `/coffee-manual/${section.id}.txt`
      }));
      setResources(demoResources);
    } else {
      // Real API call for production
      const fetchResources = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/resources`);
          const data = await res.json();
          setResources(data.resources || []);
        } catch (err) {
          console.error('Error loading manuals:', err);
        }
      };
      fetchResources();
    }
  }, []);

  const handleSelectFile = async (file: ResourceItem) => {
    // Only load content if it's a .txt
    if (!file.name?.endsWith('.txt')) return;

    if (demoConfig.isDemo) {
      // In demo mode, find the corresponding coffee manual section
      const sectionId = file.path?.split('/').pop()?.replace('.txt', '');
      const section = coffeeManualSections.find(s => s.id === sectionId);
      
      if (section) {
        let content = `${section.title}\n${'='.repeat(section.title.length)}\n\n`;
        content += section.content.join('\n\n');
        
        if (section.images?.length) {
          content += '\n\n📸 IMAGES:\n';
          section.images.forEach((img, idx) => {
            content += `• Image ${idx + 1}: ${img}\n`;
          });
        }
        
        if (section.videos?.length) {
          content += '\n\n🎥 VIDEOS:\n';
          section.videos.forEach((vid, idx) => {
            content += `• Video ${idx + 1}: ${vid}\n`;
          });
        }
        
        setSelectedFileContent(content);
      }
    } else {
      // Real API call for production
      // Key change: remove any leading slash from file.path,
      // then build /api/manualFile?file=...
      let rawPath = file.path || '';
      if (rawPath.startsWith('/')) {
        rawPath = rawPath.slice(1);
      }

      const apiUrl = `${API_BASE_URL}/api/manualFile?file=${encodeURIComponent(rawPath)}`;

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          setSelectedFileContent(t('manuals.failedToLoadFile') || 'Error loading file content.');
          return;
        }
        const text = await res.text();
        setSelectedFileContent(text);
      } catch (err) {
        console.error('Error fetching file:', err);
        setSelectedFileContent(t('manuals.failedToLoadFile') || 'Error loading file content.');
      }
    }
  };

  const renderFiles = (items: ResourceItem[], depth = 0) => {
    return items
      .filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      )
      .map((item, idx) => {
        if (item.type === 'directory') {
          return (
            <Accordion key={idx} disableGutters elevation={0} sx={{ pl: depth * 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold" color="primary">
                  📁 {item.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {item.children && renderFiles(item.children, depth + 1)}
              </AccordionDetails>
            </Accordion>
          );
        } else {
          return (
            <ListItem
              key={idx}
              onClick={() => handleSelectFile(item)}
              sx={{
                pl: depth * 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              <ListItemText
                primary={`📄 ${item.name}`}
                secondary={
                  item.name?.endsWith('.txt')
                    ? t('manuals.textDocument')
                    : t('manuals.otherFile')
                }
              />
            </ListItem>
          );
        }
      });
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
      {demoConfig.isDemo && <DemoBanner />}
      
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
        {demoConfig.isDemo ? 'Coffee Machine Maintenance Manuals' : t('manuals.title')}
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <TextField
          label={t('manuals.search')}
          fullWidth
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      <Paper
        sx={{
          maxHeight: '60vh',
          overflow: 'auto',
          p: 3,
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <List>{renderFiles(resources)}</List>
      </Paper>

      {selectedFileContent && (
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
          <Typography
            variant="h6"
            sx={{
              color: '#1e293b',
              fontWeight: 600,
              mb: 2
            }}
          >
            {t('manuals.manualContent')}
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{selectedFileContent}</pre>
        </Paper>
      )}
    </Box>
  );
};

export default Manuals;