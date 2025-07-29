import React, { useState, useEffect, useRef } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  ListItemAvatar,
  Avatar,
  Chip,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Popover,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, S3_BASE_URL } from '../../config';
import { demoMachineOptions, demoWorkOrders, demoPastLogs } from '../../data/demoData';
import { demoConfig } from '../../config/demoConfig';
import { coffeeManualSections, coffeePartsListFromManual } from '../../data/coffeeManualSections';
import DemoBanner from '../DemoBanner/DemoBanner';

/** ADJUST to match your environment */

/** ResourceItem interface, etc. */
interface ResourceItem {
  type: 'directory' | 'file';
  name?: string;
  path?: string;
  prefix?: string;
  children?: ResourceItem[];
}

interface Attachment {
  id: string;
  type: 'note' | 'video' | 'photo';
  content: string;
  importance?: 'low' | 'medium' | 'high';
}

interface CognitoUser {
  username: string;
  attributes?: { [key: string]: string };
}

interface LocationInfo {
  id: number;
  state: string;
  area: string;
  address: string;
  phone: string;
  poc: string;
}

/** Chunk text exactly like the backend for debugging.
 * If the file content contains a manual marker, split on it.
 */
function chunkText(text: string, maxChunkLength = 1000): string[] {
  const MANUAL_MARKER = "<<<MANUAL_CHUNK_BREAK>>>";
  if (text.includes(MANUAL_MARKER)) {
    return text.split(MANUAL_MARKER).map(s => s.trim()).filter(Boolean);
  }
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  sentences.forEach(sentence => {
    if (sentence.includes('![')) {
      currentChunk += sentence + ' ';
    } else if ((currentChunk + sentence).length > maxChunkLength) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence + ' ';
    } else {
      currentChunk += sentence + ' ';
    }
  });
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/** Flatten directories so a user can pick a "Move" target folder. */
function flattenDirectories(
  items: ResourceItem[],
  results: { label: string; prefix: string }[] = [],
  currentPath: string[] = []
): { label: string; prefix: string }[] {
  for (const item of items) {
    if (item.type === 'directory' && item.name) {
      const label = [...currentPath, item.name].join('/');
      const prefix = item.prefix || '';
      results.push({ label, prefix });
      if (item.children && item.children.length > 0) {
        flattenDirectories(item.children, results, [...currentPath, item.name]);
      }
    }
  }
  return results;
}

/**
 * ResourceNode: Display the folder/file tree.
 */
const ResourceNode: React.FC<{
  item: ResourceItem;
  onSelect: (item: ResourceItem) => void;
  onAttachResource: (item: ResourceItem) => void;
  t: (key: string) => string;
}> = ({ item, onSelect, onAttachResource, t }) => {
  if (item.type === 'directory') {
    return (
      <Accordion disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => onSelect(item)}
        >
          <Typography variant="subtitle2" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
            [DIR] {item.name}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 2 }}>
          {item.children && item.children.length > 0 ? (
            item.children.map((child, idx) => (
              <Box key={idx} mb={1}>
                <ResourceNode
                  item={child}
                  onSelect={onSelect}
                  onAttachResource={onAttachResource}
                  t={t}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)', fontWeight: 500 }}>
              Empty folder
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    );
  } else {
    const isImage = item.name?.match(/\.(png|jpg|jpeg|gif|webp)$/i);
    const isVideo = item.name?.match(/\.(mp4|mov|avi|mkv|webp)$/i);
    const fileUrl = item.path?.startsWith('http')
      ? item.path
      : `${S3_BASE_URL}/${item.path?.replace(/^\/+/, '')}`;
    return (
      <ListItem
        sx={{ py: 0.5, pl: 1, display: 'flex', justifyContent: 'space-between' }}
        onClick={() => onSelect(item)}
      >
        {isImage ? (
          <Tooltip
            title={
              <img
                src={fileUrl}
                alt={item.name}
                style={{ maxWidth: '300px', maxHeight: '300px' }}
              />
            }
            arrow
            placement="right"
          >
            <div style={{ cursor: 'pointer' }}>
              <ListItemText
                primary={item.name || 'unknown'}
                secondary={item.name?.endsWith('.txt') ? 'Text File' : 'Binary File'}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  sx: { color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }
                }}
                secondaryTypographyProps={{ 
                  variant: 'caption',
                  sx: { color: 'rgba(30, 41, 59, 0.7)' }
                }}
              />
            </div>
          </Tooltip>
        ) : (
          <ListItemText
            primary={item.name || 'unknown'}
            secondary={item.name?.endsWith('.txt') ? t('admin.textFile') : t('admin.binaryFile')}
            primaryTypographyProps={{ 
              variant: 'body2',
              sx: { color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }
            }}
            secondaryTypographyProps={{ 
              variant: 'caption',
              sx: { color: 'rgba(30, 41, 59, 0.7)' }
            }}
          />
        )}
        {(isImage || isVideo) && (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAttachResource(item);
            }}
          >
            {t('admin.attach')}
          </Button>
        )}
      </ListItem>
    );
  }
};

/** Count files in a folder for the Machines tab */
function countFilesInFolder(folder: ResourceItem, ext?: string): number {
  if (!folder.children) return 0;
  let count = 0;
  folder.children.forEach(child => {
    if (child.type === 'file') {
      if (!ext || (child.name && child.name.endsWith(ext))) {
        count++;
      }
    } else if (child.type === 'directory') {
      count += countFilesInFolder(child, ext);
    }
  });
  return count;
}

/** Parse folder naming like "U12_Something" for Machines tab */
function parseMachineFolder(folderName: string): { model: string; instance: string } {
  const parts = folderName.split('_');
  const model = parts.slice(1).join('_');
  return { model, instance: folderName };
}

interface MachineInstance {
  instanceFolder: string;
  machineNumber: string;
  textCount: number;
  imageCount: number;
}

/** Group machines by model */
function groupMachines(resources: ResourceItem[]): { [model: string]: MachineInstance[] } {
  const grouped: { [model: string]: MachineInstance[] } = {};
  for (const folder of resources) {
    if (folder.type === 'directory' && folder.name && folder.name.toLowerCase() !== 'origin') {
      const { model, instance } = parseMachineFolder(folder.name);
      const textCount = countFilesInFolder(folder, '.txt');
      const imageCount = countFilesInFolder(folder, '.png');
      if (!grouped[model]) {
        grouped[model] = [];
      }
      grouped[model].push({
        instanceFolder: instance,
        machineNumber: instance,
        textCount,
        imageCount
      });
    }
  }
  return grouped;
}

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <MainPanel />
      </Box>
      <Box component="footer" sx={{ textAlign: 'center', p: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>
          &copy; {new Date().getFullYear()} {t('admin.copyrightNotice')}
        </Typography>
      </Box>
    </Box>
  );
};

const MainPanel: React.FC = () => {
  const { t } = useTranslation();
  // Tab state
  const [tab, setTab] = useState<number>(0);

  // Users
  const [users, setUsers] = useState<CognitoUser[]>([]);
  const [newUser, setNewUser] = useState<string>('');

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // File content and chunking
  const [fileContent, setFileContent] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [fileChunks, setFileChunks] = useState<string[]>([]);
  const [editableChunks, setEditableChunks] = useState<string[]>([]);
  const [viewChunks, setViewChunks] = useState<boolean>(false);

  // Image and media management
  const [showImagePreview, setShowImagePreview] = useState<boolean>(true);
  const [imageInsertDialog, setImageInsertDialog] = useState<boolean>(false);
  const [videoInsertDialog, setVideoInsertDialog] = useState<boolean>(false);
  const [insertPosition, setInsertPosition] = useState<number>(0);

  // File uploads
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [partsFile, setPartsFile] = useState<File | null>(null);

  // Paragraph attachments
  const [paragraphAttachments, setParagraphAttachments] = useState<{ [key: number]: Attachment[] }>({});
  const [newAttachmentType, setNewAttachmentType] = useState<'note' | 'video' | 'photo'>('note');
  const [newAttachmentContent, setNewAttachmentContent] = useState<string>('');
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [newAttachmentImportance, setNewAttachmentImportance] = useState<'low' | 'medium' | 'high'>('low');

  // Folder notes
  const [folderNote, setFolderNote] = useState<string>('');

  // Rename / Move
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetPrefix, setTargetPrefix] = useState('');

  // Hover preview state
  const [previewAnchor, setPreviewAnchor] = useState<HTMLElement | null>(null);
  const [previewContent, setPreviewContent] = useState<{ type: 'svg' | 'video', path: string, name: string } | null>(null);

  // QR Codes
  const [qrMachineModel, setQrMachineModel] = useState<string>('');
  const [qrMachineNumber, setQrMachineNumber] = useState<string>('');
  const [qrLocation, setQrLocation] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<Array<{
    machineModel: string;
    machineNumber: string;
    location: string;
    data: string;
    filePath?: string;
  }>>([]);

  // Locations
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [newLocationState, setNewLocationState] = useState<string>('');
  const [newLocationArea, setNewLocationArea] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [newLocationAddress, setNewLocationAddress] = useState<string>('');
  const [newLocationPhone, setNewLocationPhone] = useState<string>('');
  const [newLocationPOC, setNewLocationPOC] = useState<string>('');

  // Machines
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [machinePOC, setMachinePOC] = useState<{ [key: string]: string }>({});
  const [expandedMachines, setExpandedMachines] = useState<string[]>([]);

  // Loading states
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // EXACT_PHRASES
  const [keySearchPhrases, setKeySearchPhrases] = useState<string[]>([]);
  const [newKeyPhrase, setNewKeyPhrase] = useState<string>("");

  /** Switch Tabs */
  const handleTabChange = (e: React.SyntheticEvent, newVal: number) => {
    setTab(newVal);
    setSelectedResource(null);
    setFileContent('');
    setFileChunks([]);
    setViewChunks(false);
    if (newVal === 2) {
      fetchHistory();
    }
  };

  /** Fetch Cognito users */
  useEffect(() => {
    if (tab === 0) {
      if (demoConfig.isDemo) {
        // Demo mode: Use predefined coffee technicians
        const demoUsers: CognitoUser[] = [
          {
            username: 'coffee_tech_manager',
            attributes: {
              given_name: 'Sarah Rodriguez',
              email: 'sarah.rodriguez@coffeetech.demo',
              email_verified: 'true'
            }
          },
          {
            username: 'senior_barista_tech',
            attributes: {
              given_name: 'Michael Chen',
              email: 'michael.chen@coffeetech.demo',
              email_verified: 'true'
            }
          },
          {
            username: 'machine_specialist',
            attributes: {
              given_name: 'Jessica Martinez',
              email: 'jessica.martinez@coffeetech.demo',
              email_verified: 'true'
            }
          },
          {
            username: 'maintenance_lead',
            attributes: {
              given_name: 'David Thompson',
              email: 'david.thompson@coffeetech.demo',
              email_verified: 'false'
            }
          },
          {
            username: 'equipment_trainer',
            attributes: {
              given_name: 'Emily Johnson',
              email: 'emily.johnson@coffeetech.demo',
              email_verified: 'true'
            }
          }
        ];
        setUsers(demoUsers);
      } else {
        // Real API call for production
        fetch('https://enosxykv98.execute-api.us-west-1.amazonaws.com/api/cognitoUsers')
          .then(res => res.json())
          .then(data => { if (data.users) setUsers(data.users); })
          .catch(err => console.error('Error fetching users:', err));
      }
    }
  }, [tab]);

  const addUser = () => {
    if (newUser.trim()) {
      setUsers([...users, { username: newUser.trim() }]);
      setNewUser('');
    }
  };

  /** Fetch resources & EXACT_PHRASES */
  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      if (demoConfig.isDemo) {
        // Demo mode: Use predefined coffee machine resources
        const demoResources: ResourceItem[] = [
          {
            type: 'directory',
            name: 'coffee_machines',
            prefix: 'manuals/coffee_machines/',
            children: [
              {
                type: 'directory',
                name: 'CM-2000-001',
                prefix: 'manuals/coffee_machines/CM-2000-001/',
                children: [
                  {
                    type: 'file',
                    name: 'daily_maintenance.txt',
                    path: 'manuals/coffee_machines/CM-2000-001/daily_maintenance.txt'
                  },
                  {
                    type: 'file',
                    name: 'troubleshooting_guide.txt',
                    path: 'manuals/coffee_machines/CM-2000-001/troubleshooting_guide.txt'
                  },
                  {
                    type: 'file',
                    name: 'machine_photo.jpg',
                    path: 'manuals/coffee_machines/CM-2000-001/machine_photo.jpg'
                  },
                  {
                    type: 'directory',
                    name: 'notes',
                    prefix: 'manuals/coffee_machines/CM-2000-001/notes/',
                    children: [
                      {
                        type: 'file',
                        name: 'weekly_cleaning_log.txt',
                        path: 'manuals/coffee_machines/CM-2000-001/notes/weekly_cleaning_log.txt'
                      },
                      {
                        type: 'file',
                        name: 'parts_replacement_history.txt',
                        path: 'manuals/coffee_machines/CM-2000-001/notes/parts_replacement_history.txt'
                      }
                    ]
                  }
                ]
              },
              {
                type: 'directory',
                name: 'CM-2000-002',
                prefix: 'manuals/coffee_machines/CM-2000-002/',
                children: [
                  {
                    type: 'file',
                    name: 'daily_maintenance.txt',
                    path: 'manuals/coffee_machines/CM-2000-002/daily_maintenance.txt'
                  },
                  {
                    type: 'file',
                    name: 'grinder_calibration.txt',
                    path: 'manuals/coffee_machines/CM-2000-002/grinder_calibration.txt'
                  },
                  {
                    type: 'file',
                    name: 'steam_system_repair.txt',
                    path: 'manuals/coffee_machines/CM-2000-002/steam_system_repair.txt'
                  }
                ]
              },
              {
                type: 'directory',
                name: 'CM-2000-003',
                prefix: 'manuals/coffee_machines/CM-2000-003/',
                children: [
                  {
                    type: 'file',
                    name: 'descaling_procedure.txt',
                    path: 'manuals/coffee_machines/CM-2000-003/descaling_procedure.txt'
                  },
                  {
                    type: 'file',
                    name: 'temperature_calibration.txt',
                    path: 'manuals/coffee_machines/CM-2000-003/temperature_calibration.txt'
                  }
                ]
              }
            ]
          },
          {
            type: 'directory',
            name: 'parts_catalog',
            prefix: 'manuals/parts_catalog/',
            children: [
              {
                type: 'file',
                name: 'water_system_parts.txt',
                path: 'manuals/parts_catalog/water_system_parts.txt'
              },
              {
                type: 'file',
                name: 'grinder_components.txt',
                path: 'manuals/parts_catalog/grinder_components.txt'
              },
              {
                type: 'file',
                name: 'heating_elements.txt',
                path: 'manuals/parts_catalog/heating_elements.txt'
              },
              {
                type: 'file',
                name: 'steam_system_parts.txt',
                path: 'manuals/parts_catalog/steam_system_parts.txt'
              }
            ]
          },
          {
            type: 'directory',
            name: 'maintenance_procedures',
            prefix: 'manuals/maintenance_procedures/',
            children: [
              {
                type: 'file',
                name: 'weekly_descaling.txt',
                path: 'manuals/maintenance_procedures/weekly_descaling.txt'
              },
              {
                type: 'file',
                name: 'monthly_deep_cleaning.txt',
                path: 'manuals/maintenance_procedures/monthly_deep_cleaning.txt'
              },
              {
                type: 'file',
                name: 'quarterly_calibration.txt',
                path: 'manuals/maintenance_procedures/quarterly_calibration.txt'
              },
              {
                type: 'file',
                name: 'safety_procedures.txt',
                path: 'manuals/maintenance_procedures/safety_procedures.txt'
              },
              // Visual Guides - SVG Files
              {
                type: 'directory',
                name: 'visual_guides',
                prefix: 'manuals/maintenance_procedures/visual_guides/',
                children: [
                  { type: 'file', name: 'espresso-machine-cleaning.svg', path: '/assets/espresso-machine-cleaning.svg' },
                  { type: 'file', name: 'coffee-grinder-operation.svg', path: '/assets/coffee-grinder-operation.svg' },
                  { type: 'file', name: 'steam-wand-cleaning.svg', path: '/assets/steam-wand-cleaning.svg' },
                  { type: 'file', name: 'water-filter-replacement.svg', path: '/assets/water-filter-replacement.svg' },
                  { type: 'file', name: 'troubleshooting-guide.svg', path: '/assets/troubleshooting-guide.svg' },
                  { type: 'file', name: 'filter-stuck-removal.svg', path: '/assets/filter-stuck-removal.svg' },
                  { type: 'file', name: 'grinder-jam-clearing.svg', path: '/assets/grinder-jam-clearing.svg' },
                  { type: 'file', name: 'steam-wand-blockage.svg', path: '/assets/steam-wand-blockage.svg' },
                  { type: 'file', name: 'brewing-chamber-cleaning.svg', path: '/assets/brewing-chamber-cleaning.svg' }
                ]
              },
              // Video Tutorials
              {
                type: 'directory',
                name: 'video_tutorials',
                prefix: 'manuals/maintenance_procedures/video_tutorials/',
                children: [
                  { type: 'file', name: 'Coffee_Machine_Filter_Replacement_Video.mp4', path: '/assets/Coffee_Machine_Filter_Replacement_Video.mp4' },
                  { type: 'file', name: 'Cleaning_Grinder.mp4', path: '/assets/Cleaning_Grinder.mp4' }
                ]
              }
            ]
          }
        ];
        setResources(demoResources);
      } else {
        // Real API call for production
        const res = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await res.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
    setLoadingResources(false);
  };

  const fetchKeyPhrases = async () => {
    try {
      if (demoConfig.isDemo) {
        // Demo mode: Use predefined coffee-related search phrases
        const demoPhrases = [
          'coffee machine maintenance',
          'descaling procedure',
          'grinder calibration',
          'steam wand cleaning',
          'temperature sensor',
          'water filter replacement',
          'burr replacement',
          'pressure calibration',
          'safety procedures',
          'troubleshooting guide'
        ];
        setKeySearchPhrases(demoPhrases);
      } else {
        // Real API call for production
        const resp = await fetch(`${API_BASE_URL}/api/exactPhrases`);
        if (!resp.ok) throw new Error('Failed to GET exactPhrases');
        const data = await resp.json();
        setKeySearchPhrases(data.phrases || []);
      }
    } catch (err) {
      console.error('Error loading EXACT_PHRASES:', err);
    }
  };

  useEffect(() => {
    if (tab === 1) {
      fetchResources();
      fetchKeyPhrases();
    }
  }, [tab]);

  /** Fetch history logs for Machines */
  const fetchHistory = async () => {
    try {
      if (demoConfig.isDemo) {
        // Demo mode: Use predefined coffee machine history
        const demoHistoryLogs = [
          {
            timestamp: '2025-07-28T14:30:00Z',
            message: 'Daily maintenance completed on CM-2000-001 by tech_user_sarah',
            machineNumber: 'CM-2000-001',
            type: 'maintenance',
            severity: 'info'
          },
          {
            timestamp: '2025-07-28T10:15:00Z',
            message: 'Descaling cycle initiated on CM-2000-002 - estimated completion 45 minutes',
            machineNumber: 'CM-2000-002',
            type: 'maintenance',
            severity: 'info'
          },
          {
            timestamp: '2025-07-27T16:45:00Z',
            message: 'Water filter replacement completed on CM-2000-001 - next replacement due in 3 months',
            machineNumber: 'CM-2000-001',
            type: 'parts_replacement',
            severity: 'info'
          },
          {
            timestamp: '2025-07-27T09:20:00Z',
            message: 'Temperature sensor calibration performed on CM-2000-003 - readings now accurate',
            machineNumber: 'CM-2000-003',
            type: 'calibration',
            severity: 'info'
          },
          {
            timestamp: '2025-07-26T13:10:00Z',
            message: 'Grinder burr replacement completed on CM-2000-002 - improved grind consistency',
            machineNumber: 'CM-2000-002',
            type: 'parts_replacement',
            severity: 'warning'
          },
          {
            timestamp: '2025-07-26T11:30:00Z',
            message: 'Steam wand cleaning performed on all machines - milk system sanitized',
            machineNumber: 'ALL',
            type: 'cleaning',
            severity: 'info'
          },
          {
            timestamp: '2025-07-25T15:45:00Z',
            message: 'Emergency repair: heating element replaced on CM-2000-003',
            machineNumber: 'CM-2000-003',
            type: 'emergency_repair',
            severity: 'error'
          },
          {
            timestamp: '2025-07-25T08:00:00Z',
            message: 'Weekly deep cleaning cycle completed on CM-2000-001',
            machineNumber: 'CM-2000-001',
            type: 'deep_cleaning',
            severity: 'info'
          },
          {
            timestamp: '2025-07-24T17:30:00Z',
            message: 'Pressure calibration adjustment made on CM-2000-002 - optimal brewing pressure restored',
            machineNumber: 'CM-2000-002',
            type: 'calibration',
            severity: 'warning'
          },
          {
            timestamp: '2025-07-24T12:15:00Z',
            message: 'Quarterly maintenance inspection completed on all coffee machines',
            machineNumber: 'ALL',
            type: 'inspection',
            severity: 'info'
          }
        ];
        setHistoryLogs(demoHistoryLogs);
      } else {
        // Real API call for production
        const res = await fetch(`${API_BASE_URL}/api/history`);
        const data = await res.json();
        setHistoryLogs(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  /** Load resource details when selected */
  const handleSelectResource = async (resItem: ResourceItem) => {
    setSelectedResource(resItem);
    setFileContent('');
    setParagraphAttachments({});
    setFileChunks([]);
    setViewChunks(false);
    setFolderNote('');
    
    if (resItem.type === 'file' && resItem.name?.endsWith('.txt') && resItem.path) {
      if (demoConfig.isDemo) {
        // Demo mode: Generate coffee machine manual content based on file name
        let demoContent = '';
        
        if (resItem.name.includes('daily_maintenance')) {
          demoContent = `# Daily Coffee Machine Maintenance Checklist

## Morning Startup (5 minutes)
1. **Visual Inspection**
   - Check water reservoir level (minimum 80%)
   - Inspect drip tray for overflow
   - Verify all control panel lights are functioning
   - Check for any visible leaks or damage

2. **Water System Check**
   - Empty and refill water reservoir with fresh, filtered water
   - Run water-only cycle to check flow rate
   - Check water filter date (replace every 3 months)
   - Verify water temperature reaches 195-205°F

3. **Grinder Inspection**
   - Empty coffee bean hopper
   - Check for foreign objects or debris
   - Wipe exterior with damp cloth
   - Test grind settings (should be consistent)

## During Operation (Throughout Day)
4. **Steam System**
   - Purge steam wand before first use
   - Clean milk residue after each use
   - Check steam pressure (1.0-1.5 bar optimal)
   - Monitor for unusual noises

5. **Brewing System**
   - Clean portafilter between uses
   - Check brewing pressure (9 bar optimal)
   - Monitor extraction time (25-30 seconds)
   - Taste test coffee quality hourly

## End of Day Cleaning (15 minutes)
6. **Complete Shutdown**
   - Run cleaning cycle with water only
   - Empty all water from system
   - Clean and dry all removable parts
   - Wipe down exterior surfaces
   - Record any issues in maintenance log

![daily_maintenance_checklist.jpg](daily_maintenance_checklist.jpg)
[VIDEO: Daily Maintenance Procedure](daily_maintenance_demo.mp4)

**Next Service Due:** Weekly descaling (every 7 days)
**Parts to Monitor:** Water filter, gaskets, steam wand tip`;
        
        } else if (resItem.name.includes('troubleshooting')) {
          demoContent = `# Coffee Machine Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Machine Won't Start
**Symptoms:** No power, display blank, no response to buttons
**Diagnosis Steps:**
1. Check power connection and outlet
2. Verify circuit breaker hasn't tripped
3. Inspect power cord for damage
4. Check water reservoir is properly seated
5. Ensure all safety interlocks are engaged

**Solutions:**
- Replace thermal fuse (CM-TF-018) - $6.99
- Reset control board
- Professional electrical inspection required

### 🟡 Weak Coffee / Poor Extraction
**Symptoms:** Coffee tastes weak, watery, or sour
**Diagnosis Steps:**
1. Check grind size (may be too coarse)
2. Verify coffee-to-water ratio
3. Test brewing temperature (195-205°F)
4. Check brewing pressure (9 bar)
5. Inspect portafilter gasket

**Solutions:**
- Adjust grinder to finer setting
- Increase coffee dose
- Descale heating system
- Replace brewing gasket (CM-BG-011) - $8.99
- Calibrate temperature sensor

### 🟠 Grinding Issues
**Symptoms:** Inconsistent grind, unusual noise, jamming
**Diagnosis Steps:**
1. Check for foreign objects in hopper
2. Inspect burr alignment and wear
3. Listen for motor strain or binding
4. Test grind adjustment mechanism
5. Check for coffee oil buildup

**Solutions:**
- Clean grinder with tablets (CM-GCT-020) - $24.99
- Replace upper burr set (CM-UB-004) - $34.99
- Replace lower burr set (CM-LB-005) - $34.99
- Professional motor service

![troubleshooting_flowchart.jpg](troubleshooting_flowchart.jpg)
[VIDEO: Step-by-Step Troubleshooting](troubleshooting_guide.mp4)

**Emergency Contact:** Call maintenance hotline for critical issues`;
        
        } else if (resItem.name.includes('descaling')) {
          demoContent = `# Descaling Procedure - Coffee Machine CM-2000

## Required Materials
- Descaling solution (CM-DS-019) - $16.99
- Fresh filtered water
- Measuring cup
- Clean towels
- Logbook for recording

## Pre-Descaling Preparation (10 minutes)
1. **Safety First**
   - Turn off machine and allow to cool completely
   - Remove water filter from reservoir
   - Empty all water from system
   - Clear work area around machine

2. **Solution Preparation**
   - Mix descaling solution 1:10 ratio with water
   - Use 200ml solution + 1800ml water
   - Stir thoroughly until completely dissolved
   - Fill reservoir with prepared solution

## Descaling Process (45 minutes)
3. **Automatic Cycle**
   - Press and hold CLEAN button for 3 seconds
   - Display will show "DESCALING MODE"
   - Machine begins automatic circulation
   - Solution circulates for 15 minutes
   - System pauses for 15-minute soak period
   - Final circulation and completion beep

4. **Rinse Cycles**
   - Empty reservoir completely
   - Fill with fresh water only
   - Run 3 complete rinse cycles
   - Taste water output - should be neutral
   - No chemical taste should remain

## Post-Descaling (15 minutes)
5. **System Restoration**
   - Install fresh water filter
   - Fill reservoir with filtered water
   - Run brewing cycle to verify operation
   - Check temperature and pressure readings
   - Record completion in maintenance log

![descaling_procedure_steps.jpg](descaling_procedure_steps.jpg)
[VIDEO: Complete Descaling Process](descaling_demo_video.mp4)

**Frequency:** Every 2-3 months or when DESCALE light appears
**Duration:** Approximately 75 minutes total
**Cost per Service:** $16.99 (solution only)`;
        
        } else if (resItem.name.includes('parts')) {
          demoContent = generatePartsContent(resItem.name);
        
        } else if (resItem.name.includes('safety')) {
          demoContent = `# Coffee Machine Safety Procedures

## Personal Protective Equipment (PPE)
- Heat-resistant gloves (required for hot component work)
- Safety glasses (required during grinder maintenance)
- Non-slip footwear
- Apron or protective clothing

## Electrical Safety
⚠️ **CRITICAL:** Always disconnect power before maintenance
- Use only grounded outlets (GFCI recommended)
- Keep electrical components dry at all times
- Inspect power cords daily for damage
- Never operate with wet hands

## Hot Surface Precautions
🔥 **DANGER:** Components reach 300°F+
- Allow complete cooling before internal work
- Steam wand reaches 300°F - handle with extreme care
- Heating elements remain hot for 30+ minutes after shutdown
- Use thermal imaging if available

## Chemical Safety (Descaling)
☠️ **CAUTION:** Use only approved solutions
- Wear protective eyewear and gloves
- Ensure adequate ventilation during descaling
- Store chemicals away from food preparation areas
- Follow all MSDS (Material Safety Data Sheet) guidelines

## Emergency Procedures
🚨 **Emergency Actions:**
- **Fire:** Use Class C extinguisher only
- **Electrical shock:** Disconnect power immediately
- **Steam burns:** Apply cold water for 15 minutes
- **Chemical contact:** Flush with water for 15 minutes

![safety_equipment_layout.jpg](safety_equipment_layout.jpg)
[VIDEO: Safety Training Module](safety_procedures_demo.mp4)

**Emergency Contact:** 911 for medical emergencies
**Maintenance Hotline:** (555) COFFEE-1 for equipment issues`;
        
        } else {
          // Default demo content for other files
          demoContent = `# ${resItem.name.replace('.txt', '').replace(/_/g, ' ').toUpperCase()}

This is demo content for ${resItem.name} in the coffee machine maintenance system.

## Overview
This document contains important information about coffee machine maintenance and operations.

## Key Points
- Regular maintenance ensures optimal performance
- Follow safety procedures at all times
- Use only approved replacement parts
- Document all maintenance activities

## Related Resources
![machine_diagram.jpg](machine_diagram.jpg)
[VIDEO: Maintenance Demonstration](maintenance_demo.mp4)

**Last Updated:** ${new Date().toLocaleDateString()}
**Version:** Demo 1.0
**Responsible Technician:** Demo User`;
        }
        
        setFileContent(demoContent);
      } else {
        // Real API call for production
        let rawPath = resItem.path.startsWith('/') ? resItem.path.slice(1) : resItem.path;
        try {
          const resp = await fetch(`${API_BASE_URL}/api/manualFile?file=${encodeURIComponent(rawPath)}`);
          if (!resp.ok) {
            setFileContent('Error loading file content.');
            return;
          }
          const text = await resp.text();
          setFileContent(text);
        } catch (err) {
          console.error('Error loading .txt file:', err);
          setFileContent('Error loading file content.');
        }
      }
    }
  };

  // Helper function to generate parts content
  function generatePartsContent(fileName: string): string {
    if (fileName.includes('water')) {
      return `# Water System Parts Catalog

## Primary Components
**Water Reservoir (CM-WR-001)** - $45.99
- Capacity: 2.5 liters
- BPA-free construction
- Transparent level indicator
- Replacement interval: 24 months

**Water Filter Cartridge (CM-WF-002)** - $12.99
- Reduces chlorine and impurities
- NSF certified
- Replacement interval: 3 months
- Compatible with all CM-2000 series

**Water Pump Assembly (CM-WP-003)** - $89.99
- Pressure rating: 15 bar
- Flow rate: 1.2 L/min
- Self-priming design
- Replacement interval: 18 months

![water_system_diagram.jpg](water_system_diagram.jpg)`;
    } else if (fileName.includes('grinder')) {
      return `# Grinder Components Catalog

## Burr Sets
**Upper Burr Set (CM-UB-004)** - $34.99
- Hardened steel construction
- Precision ground surface
- 40mm diameter
- Replacement interval: 12 months

**Lower Burr Set (CM-LB-005)** - $34.99
- Matching hardened steel
- Self-aligning design
- Micro-adjustment capability
- Replacement interval: 12 months

**Grinder Motor (CM-GM-006)** - $125.99
- Variable speed control
- Thermal overload protection
- Low noise operation
- Replacement interval: 36 months

![grinder_exploded_view.jpg](grinder_exploded_view.jpg)`;
    } else {
      return `# Parts Catalog - ${fileName.replace('.txt', '').replace(/_/g, ' ').toUpperCase()}

## Available Components
Multiple parts available for coffee machine maintenance and repair.

See main parts catalog for complete listings and pricing.

![parts_overview.jpg](parts_overview.jpg)`;
    }
  }

  /** Show chunks for editing and initialize editableChunks */
  const handleShowChunks = () => {
    const chunks = chunkText(fileContent);
    setFileChunks(chunks);
    setEditableChunks(chunks);
    setViewChunks(true);
  };

  /** Get paragraph index from cursor */
  const getParagraphIndex = () => {
    if (textAreaRef.current) {
      const selStart = textAreaRef.current.selectionStart;
      return fileContent.substring(0, selStart).split('\n\n').length - 1;
    }
    return 0;
  };

  /** Insert snippet at cursor */
  function insertIntoText(snippet: string) {
    if (!textAreaRef.current) {
      setFileContent(prev => prev + '\n' + snippet + '\n');
      return;
    }
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    setFileContent(prev => prev.substring(0, start) + snippet + prev.substring(end));
  };

  /** Insert image anchor link */
  const handleInsertImage = (imagePath: string, altText: string = '') => {
    const snippet = `![${altText || 'Image'}](${imagePath})`;
    insertIntoText(snippet);
    setImageInsertDialog(false);
  };

  /** Insert video anchor link */
  const handleInsertVideo = (videoPath: string, title: string = '') => {
    const snippet = `[🎥 ${title || 'Video'}](${videoPath})`;
    insertIntoText(snippet);
    setVideoInsertDialog(false);
  };

  /** Open image insert dialog */
  const openImageInsertDialog = () => {
    if (textAreaRef.current) {
      setInsertPosition(textAreaRef.current.selectionStart);
    }
    setImageInsertDialog(true);
  };

  /** Open video insert dialog */
  const openVideoInsertDialog = () => {
    if (textAreaRef.current) {
      setInsertPosition(textAreaRef.current.selectionStart);
    }
    setVideoInsertDialog(true);
  };

  /** Parse and render text with embedded images */
  const renderTextWithImages = (text: string) => {
    if (!showImagePreview) {
      return <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{text}</Typography>;
    }

    const parts = text.split(/(\!\[.*?\]\(.*?\))/g);
    return (
      <Box>
        {parts.map((part, index) => {
          const imageMatch = part.match(/\!\[(.*?)\]\((.*?)\)/);
          if (imageMatch) {
            const [, altText, imagePath] = imageMatch;
            const fullImagePath = imagePath.startsWith('/') ? imagePath : `/assets/${imagePath}`;
            return (
              <Box key={index} sx={{ my: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={fullImagePath}
                  alt={altText}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = `
                      <div style="
                        padding: 20px;
                        border: 2px dashed #cbd5e1;
                        border-radius: 8px;
                        text-align: center;
                        color: #64748b;
                      ">
                        📸 Image: ${altText || imagePath}
                      </div>
                    `;
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  {altText}
                </Typography>
              </Box>
            );
          }
          return (
            <Typography key={index} sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {part}
            </Typography>
          );
        })}
      </Box>
    );
  };

  /** Handle resource attachment */
  const handleAttachResource = (resource: ResourceItem) => {
    const resourceUrl = resource.path?.startsWith('http')
      ? resource.path
      : `${S3_BASE_URL}/${resource.path?.replace(/^\/+/, '')}`;
    const isImage = resource.name?.match(/\.(png|jpg|jpeg|gif|webp)$/i);
    const isVideo = resource.name?.match(/\.(mp4|mov|avi|mkv|webp)$/i);
    let snippet = '';
    if (isImage) {
      snippet = `![${resource.name}](${resourceUrl})`;
    } else if (isVideo) {
      snippet = `[VIDEO: ${resource.name}](${resourceUrl})`;
    } else {
      snippet = `[FILE: ${resource.name}](${resourceUrl})`;
    }
    insertIntoText(snippet);
  };

  /** Upload an attachment file */
  async function uploadAttachmentFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch(`${API_BASE_URL}/api/uploadChatMedia`, {
      method: 'POST',
      body: formData
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await resp.json();
    return data.fileUrl;
  }

  /** Handle adding a new attachment */
  const handleAddAttachment = async () => {
    if (!selectedResource) return;
    const paragraphIndex = getParagraphIndex();
    let finalUrl = '';
    let displayName = newAttachmentContent;
    if (newAttachmentType === 'video' || newAttachmentType === 'photo') {
      if (!newAttachmentFile) {
        alert(`Please upload a ${newAttachmentType} file first.`);
        return;
      }
      try {
        finalUrl = await uploadAttachmentFile(newAttachmentFile);
      } catch (err) {
        console.error('Upload attachment error:', err);
        alert('Could not upload attachment.');
        return;
      }
      if (!displayName) {
        displayName = newAttachmentFile.name;
      }
      setNewAttachmentFile(null);
    }
    let snippet = '';
    if (newAttachmentType === 'note') {
      snippet = displayName;
    } else if (newAttachmentType === 'photo') {
      snippet = `![${displayName}](${finalUrl})`;
    } else if (newAttachmentType === 'video') {
      snippet = `[VIDEO: ${displayName}](${finalUrl})`;
    }
    insertIntoText(snippet);
    const newAtt: Attachment = {
      id: Date.now().toString(),
      type: newAttachmentType,
      content: finalUrl || displayName,
      importance: newAttachmentType === 'note' ? newAttachmentImportance : undefined
    };
    setParagraphAttachments(prev => {
      const oldList = prev[paragraphIndex] || [];
      return { ...prev, [paragraphIndex]: [...oldList, newAtt] };
    });
    setNewAttachmentContent('');
  };

  /** Save file changes to server */
  const handleSaveFile = async () => {
    if (!selectedResource?.path) return;
    
    if (demoConfig.isDemo) {
      // Demo mode: Simulate file saving
      alert(`Demo: File changes saved successfully!\n\nFile: ${selectedResource.name}\nCharacters: ${fileContent.length}\nChunks: ${fileChunks.length}\n\nIn production, this would be saved to the server.`);
      return;
    }
    
    // Real API call for production
    try {
      const body: any = {
        filePath: selectedResource.path,
        content: fileContent,
        attachments: paragraphAttachments
      };
      if (fileChunks.length > 0) {
        body.chunks = fileChunks;
      }
      const resp = await fetch(`${API_BASE_URL}/api/saveFile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await resp.json();
      if (result.message) {
        alert(result.message);
        fetchResources();
      }
    } catch (err) {
      console.error('Error saving .txt:', err);
      alert('Error saving file.');
    }
  };

  /** Upload new manual (PDF/DOCX) */
  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      setUploadMessage("Uploading...");
      const formData = new FormData();
      formData.append('file', uploadFile);
      const resp = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      setUploadMessage("Processing...");
      await new Promise(r => setTimeout(r, 1000));
      const data = await resp.json();
      alert(data.message || "File uploaded");
      setUploadFile(null);
      fetchResources();
    } catch (err) {
      console.error('Upload error:', err);
      alert('File upload failed.');
    } finally {
      setUploadMessage("");
      setUploading(false);
    }
  };

  /** Upload new PARTS file */
  const handlePartsUpload = async () => {
    if (!partsFile) return;
    setUploading(true);
    try {
      setUploadMessage("Uploading parts file...");
      const formData = new FormData();
      formData.append('file', partsFile);
      const resp = await fetch(`${API_BASE_URL}/api/uploadParts`, {
        method: 'POST',
        body: formData
      });
      setUploadMessage("Processing...");
      await new Promise(r => setTimeout(r, 1000));
      const data = await resp.json();
      alert(data.message || "Parts file uploaded");
      setPartsFile(null);
      fetchResources();
    } catch (err) {
      console.error('Parts upload error:', err);
      alert('Parts file upload failed.');
    } finally {
      setUploadMessage("");
      setUploading(false);
    }
  };

  // Flatten directories for move target selection
  const allDirectories = flattenDirectories(resources);

  /** RENAME dialog handlers */
  const openRenameDialog = () => {
    if (!selectedResource) return;
    setNewName(selectedResource.name || '');
    setRenameDialogOpen(true);
  };
  const closeRenameDialog = () => setRenameDialogOpen(false);

  const handleRename = async () => {
    if (!selectedResource) return;
    const isDirectory = selectedResource.type === 'directory';
    let oldKey = isDirectory
      ? (selectedResource.prefix || `manuals/${selectedResource.name}/`)
      : (selectedResource.path || '');
    if (!oldKey) {
      alert("Can't rename: no oldKey found.");
      closeRenameDialog();
      return;
    }
    const safeName = newName.replace(/[\\/]/g, '_').trim();
    let newKey = '';
    if (isDirectory) {
      const trimmed = oldKey.endsWith('/') ? oldKey.slice(0, -1) : oldKey;
      const segments = trimmed.split('/');
      segments[segments.length - 1] = safeName;
      newKey = segments.join('/') + '/';
    } else {
      const segments = oldKey.split('/');
      segments[segments.length - 1] = safeName;
      newKey = segments.join('/');
    }
    try {
      const body = { oldKey, newKey };
      const resp = await fetch(`${API_BASE_URL}/api/moveResource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const err = await resp.json();
        alert(err.error || 'Rename failed.');
        closeRenameDialog();
        return;
      }
      alert("Resource renamed successfully.");
      closeRenameDialog();
      setSelectedResource(null);
      fetchResources();
    } catch (err) {
      console.error('Rename error:', err);
      alert('Rename error. See console.');
      closeRenameDialog();
    }
  };

  /** MOVE dialog handlers */
  const openMoveDialog = () => {
    if (!selectedResource) return;
    setMoveDialogOpen(true);
    setTargetPrefix('');
  };
  const closeMoveDialog = () => setMoveDialogOpen(false);

  const handleMove = async () => {
    if (!selectedResource) return;
    const isDirectory = selectedResource.type === 'directory';
    const oldKey = isDirectory
      ? (selectedResource.prefix || '')
      : (selectedResource.path || '');
    if (!oldKey) {
      alert("Can't move: no oldKey found.");
      closeMoveDialog();
      return;
    }
    if (!targetPrefix) {
      alert("Please select a target folder first.");
      return;
    }
    const parts = oldKey.split('/');
    const nameToKeep = isDirectory
      ? parts[parts.length - 2]
      : parts[parts.length - 1];
    let finalPrefix = targetPrefix;
    if (!finalPrefix.endsWith('/')) finalPrefix += '/';
    let newKey = finalPrefix + nameToKeep;
    if (isDirectory && !newKey.endsWith('/')) {
      newKey += '/';
    }
    try {
      const body = { oldKey, newKey };
      const resp = await fetch(`${API_BASE_URL}/api/moveResource`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const err = await resp.json();
        alert(err.error || 'Move failed.');
        closeMoveDialog();
        return;
      }
      alert("Resource moved successfully.");
      closeMoveDialog();
      setSelectedResource(null);
      fetchResources();
    } catch (err) {
      console.error('Move error:', err);
      alert('Move error. See console.');
      closeMoveDialog();
    }
  };

  /** Add a note to a machine folder */
  const handleAddFolderNote = async () => {
    if (!selectedResource || !selectedResource.name) return;
    const machineName = selectedResource.name;
    const noteContent = folderNote.trim();
    if (!noteContent) {
      alert("Please enter note content.");
      return;
    }
    
    if (demoConfig.isDemo) {
      // Demo mode: Simulate note saving
      alert(`Demo: Note added successfully!\n\nMachine: ${machineName}\nNote: ${noteContent}\n\nIn production, this would be saved to the machine's notes folder.`);
      setFolderNote('');
      return;
    }
    
    // Real API call for production
    try {
      const body = {
        modelName: 'MachineModel',
        machineNumber: machineName,
        noteContent,
      };
      const resp = await fetch(`${API_BASE_URL}/api/saveMachineNote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await resp.json();
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message || "Note added.");
        setFolderNote('');
      }
    } catch (err) {
      console.error('Error adding folder note:', err);
      alert('Error adding note.');
    }
  };

  /** Machines tab logic */
  const machineModels = demoConfig.isDemo 
    ? ['CM-2000-001', 'CM-2000-002', 'CM-2000-003', 'CM-2000-004', 'CM-2000-005']
    : resources
        .filter(r => r.type === 'directory' && r.name && r.name.toLowerCase() !== 'origin')
        .map(r => r.name) as string[];

  const getHistoryForMachine = (machineNumber: string) =>
    historyLogs.filter(log => log.message.toLowerCase().includes(machineNumber.toLowerCase()));

  const toggleMachineExpand = (key: string) => {
    if (expandedMachines.includes(key)) {
      setExpandedMachines(expandedMachines.filter(k => k !== key));
    } else {
      setExpandedMachines([...expandedMachines, key]);
    }
  };

  /** QR Codes tab */
  const handleGenerateQRCode = async () => {
    if (!qrMachineModel || !qrMachineNumber || !qrLocation) {
      alert("Please fill out model, machine #, and location.");
      return;
    }
    
    if (demoConfig.isDemo) {
      // Demo mode: Generate QR code locally
      const demoQrData = `coffee-machine://${qrMachineModel}/${qrMachineNumber}?location=${encodeURIComponent(qrLocation)}`;
      const newQr = {
        machineModel: qrMachineModel,
        machineNumber: qrMachineNumber,
        location: qrLocation,
        data: demoQrData,
        filePath: `demo/qr_codes/${qrMachineModel}_${qrMachineNumber}.png`
      };
      setQrCodes([...qrCodes, newQr]);
      setQrMachineModel('');
      setQrMachineNumber('');
      setQrLocation('');
      alert(`Demo QR Code generated successfully for ${qrMachineModel} at ${qrLocation}`);
    } else {
      // Real API call for production
      try {
        const body = {
          machineModel: qrMachineModel,
          machineNumber: qrMachineNumber,
          location: qrLocation
        };
        const resp = await fetch(`${API_BASE_URL}/api/saveQRCode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const result = await resp.json();
        if (result.error) {
          alert(result.error);
        } else {
          const newQr = {
            machineModel: qrMachineModel,
            machineNumber: qrMachineNumber,
            location: qrLocation,
            data: result.embeddedUrl,
            filePath: result.filePath
          };
          setQrCodes([...qrCodes, newQr]);
          setQrMachineModel('');
          setQrMachineNumber('');
          setQrLocation('');
        }
      } catch (err) {
        console.error('Error saving QR code:', err);
        alert('Error saving QR code');
      }
    }
  };

  /** Locations tab logic */
  const defaultStates = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  const defaultAreas: { [state: string]: string[] } = {
    AL: ["Montgomery", "Birmingham", "Mobile"],
    AK: ["Juneau", "Anchorage"],
    // ...
  };

  const handleAddLocation = async () => {
    const areaName = newLocationArea === 'other' ? customCity.trim() : newLocationArea.trim();
    if (!newLocationState.trim() || !areaName || !newLocationAddress.trim() || !newLocationPhone.trim() || !newLocationPOC.trim()) {
      alert("Please fill all location fields.");
      return;
    }
    const newLoc: LocationInfo = {
      id: Date.now(),
      state: newLocationState.trim(),
      area: areaName,
      address: newLocationAddress.trim(),
      phone: newLocationPhone.trim(),
      poc: newLocationPOC.trim()
    };
    
    if (demoConfig.isDemo) {
      // Demo mode: Add location locally
      setLocations([...locations, newLoc]);
      alert(`Demo: Location added successfully!\n\n${newLoc.area}, ${newLoc.state}\n${newLoc.address}\nPOC: ${newLoc.poc}\n\nIn production, this would be saved to the database.`);
    } else {
      // Real API call for production
      try {
        const response = await fetch(`${API_BASE_URL}/api/saveLocation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: newLoc })
        });
        const result = await response.json();
        if (result.error) {
          alert(result.error);
        } else {
          setLocations([...locations, newLoc]);
          alert(result.message);
        }
      } catch (err) {
        console.error('Error saving location:', err);
        alert('Error saving location.');
      }
    }
    
    setNewLocationState('');
    setNewLocationArea('');
    setCustomCity('');
    setNewLocationAddress('');
    setNewLocationPhone('');
    setNewLocationPOC('');
  };

  useEffect(() => {
    if (tab === 4) {
      if (demoConfig.isDemo) {
        // Demo mode: Use predefined coffee shop locations
        const demoLocations: LocationInfo[] = [
          {
            id: 1,
            state: 'CA',
            area: 'San Francisco',
            address: '123 Market Street, Coffee District',
            phone: '(415) 555-BREW',
            poc: 'coffee_tech_manager'
          },
          {
            id: 2,
            state: 'CA',
            area: 'Los Angeles',
            address: '456 Sunset Boulevard, Downtown',
            phone: '(213) 555-JAVA',
            poc: 'senior_barista_tech'
          },
          {
            id: 3,
            state: 'NY',
            area: 'New York',
            address: '789 Broadway, Coffee Row',
            phone: '(212) 555-CAFE',
            poc: 'machine_specialist'
          },
          {
            id: 4,
            state: 'TX',
            area: 'Austin',
            address: '321 South Lamar, Coffee Quarter',
            phone: '(512) 555-BEAN',
            poc: 'maintenance_lead'
          },
          {
            id: 5,
            state: 'WA',
            area: 'Seattle',
            address: '654 Pike Place, Coffee Central',
            phone: '(206) 555-DRIP',
            poc: 'equipment_trainer'
          },
          {
            id: 6,
            state: 'FL',
            area: 'Miami',
            address: '987 Ocean Drive, Beach Brew',
            phone: '(305) 555-LATTE',
            poc: 'coffee_tech_manager'
          }
        ];
        setLocations(demoLocations);
      } else {
        // Real API call for production
        fetch(`${API_BASE_URL}/api/locations`)
          .then(res => res.json())
          .then(data => { if (data.locations) setLocations(data.locations); })
          .catch(err => console.error('Error fetching locations:', err));
      }
    }
  }, [tab]);

  const groupedLocations = locations.reduce((acc, loc) => {
    if (!acc[loc.state]) acc[loc.state] = {};
    if (!acc[loc.state][loc.area]) acc[loc.state][loc.area] = [];
    acc[loc.state][loc.area].push(loc);
    return acc;
  }, {} as { [st: string]: { [ar: string]: LocationInfo[] } });

  /** EXACT_PHRASES endpoints */
  const handleAddPhrase = async () => {
    const phrase = newKeyPhrase.trim().toLowerCase();
    if (!phrase) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/exactPhrases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase })
      });
      const data = await resp.json();
      if (data.error) {
        alert(data.error);
      } else {
        setKeySearchPhrases(data.phrases || []);
      }
    } catch (err) {
      console.error('Error adding phrase:', err);
      alert('Could not add phrase.');
    }
    setNewKeyPhrase('');
  };

  const handleRemovePhrase = async (phrase: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/exactPhrases`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase })
      });
      const data = await resp.json();
      if (data.error) {
        alert(data.error);
      } else {
        setKeySearchPhrases(data.phrases || []);
      }
    } catch (err) {
      console.error('Error removing phrase:', err);
      alert('Could not remove phrase.');
    }
  };

  return (
    <>
      {demoConfig.isDemo && <DemoBanner />}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={t('tabs.technicians')} />
        <Tab label={t('tabs.resources')} />
        <Tab label={t('tabs.machines')} />
        <Tab label={t('tabs.qrCodes')} />
        <Tab label={t('tabs.locations')} />
      </Tabs>

      {/* TAB 0: USERS */}
      {tab === 0 && (
        <Paper sx={{ 
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
            ☕ Coffee Technician Management
          </Typography>
          <List>
            {users.map((user, i) => (
              <ListItem key={i}>
                <ListItemAvatar>
                  <Avatar>
                    {user.attributes?.given_name
                      ? user.attributes.given_name.charAt(0)
                      : user.username.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.attributes?.given_name ? `${user.attributes.given_name} (${user.username})` : user.username}
                  secondary={user.attributes?.email || 'No email'}
                />
                {user.attributes?.email_verified === "true" ? (
                  <Chip label="Verified" color="success" size="small" />
                ) : (
                  <Chip label="Unverified" color="warning" size="small" />
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* TAB 1: RESOURCES */}
      {tab === 1 && (
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          <Paper sx={{ 
            width: '30%', 
            p: 2, 
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
              ☕ Coffee Machine Resources & Manuals
            </Typography>
            {resources.map((rItem, i) => (
              <Box key={i} mb={1}>
                <ResourceNode
                  item={rItem}
                  onSelect={handleSelectResource}
                  onAttachResource={handleAttachResource}
                  t={t}
                />
              </Box>
            ))}
          </Paper>
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
              ☕ Manual & Documentation Details
            </Typography>
            {!selectedResource ? (
              <Typography sx={{ color: 'rgba(30, 41, 59, 0.7)', fontStyle: 'italic' }}>
                Please select a folder or file.
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                  {selectedResource.type === 'directory'
                    ? `Folder: ${selectedResource.name}`
                    : `File: ${selectedResource.name}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button variant="outlined" onClick={openRenameDialog}>Rename</Button>
                  <Button variant="outlined" onClick={openMoveDialog}>Move</Button>
                </Box>
                {selectedResource.type === 'directory' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                      Add Note to Machine Folder
                    </Typography>
                    <TextField
                      fullWidth
                      label="Note Content"
                      value={folderNote}
                      onChange={e => setFolderNote(e.target.value)}
                      sx={{ my: 1 }}
                    />
                    <Button variant="contained" onClick={handleAddFolderNote}>Add Note</Button>
                  </Box>
                )}
                {selectedResource.type === 'file' && selectedResource.name?.endsWith('.txt') && (
                  <Box>
                    {/* Image Preview Toggle and Insert Controls */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showImagePreview}
                            onChange={(e) => setShowImagePreview(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Show Image Preview"
                      />
                      <IconButton
                        onClick={openImageInsertDialog}
                        color="primary"
                        title="Insert Image"
                        size="small"
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                      <IconButton
                        onClick={openVideoInsertDialog}
                        color="secondary"
                        title="Insert Video"
                        size="small"
                      >
                        <VideoCallIcon />
                      </IconButton>
                    </Box>

                    {/* Text Editor */}
                    <TextField
                      multiline
                      fullWidth
                      rows={10}
                      value={fileContent}
                      onChange={e => setFileContent(e.target.value)}
                      inputRef={textAreaRef}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      placeholder="Enter manual content... Use ![alt text](image-path) for images and [🎥 title](video-path) for videos"
                    />

                    {/* Image Preview Panel */}
                    {showImagePreview && fileContent && (
                      <Box sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        p: 2,
                        mb: 2,
                        backgroundColor: '#f8fafc',
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                          📖 Preview with Images
                        </Typography>
                        {renderTextWithImages(fileContent)}
                      </Box>
                    )}
                    <Typography variant="subtitle2" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                      Add New Attachment for This Paragraph
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                      <TextField
                        select
                        label="Type"
                        value={newAttachmentType}
                        onChange={e => setNewAttachmentType(e.target.value as 'note' | 'video' | 'photo')}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="note">Note</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="photo">Photo</MenuItem>
                      </TextField>
                      {newAttachmentType === 'note' && (
                        <TextField
                          select
                          label="Importance"
                          value={newAttachmentImportance}
                          onChange={e => setNewAttachmentImportance(e.target.value as 'low' | 'medium' | 'high')}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </TextField>
                      )}
                      {newAttachmentType === 'note' ? (
                        <TextField
                          label="Content/URL"
                          value={newAttachmentContent}
                          onChange={e => setNewAttachmentContent(e.target.value)}
                          size="small"
                          sx={{ flex: 1, minWidth: 200 }}
                        />
                      ) : (
                        <Box>
                          <Button variant="contained" component="label" size="small">
                            Upload {newAttachmentType}
                            <input type="file" hidden onChange={(e) => {
                              if (e.target.files?.length) {
                                setNewAttachmentFile(e.target.files[0]);
                              }
                            }} />
                          </Button>
                          {newAttachmentFile && (
                            <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(30, 41, 59, 0.7)' }}>
                              {newAttachmentFile.name}
                            </Typography>
                          )}
                        </Box>
                      )}
                      <Button variant="contained" onClick={handleAddAttachment} size="small">
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button variant="contained" onClick={handleSaveFile}>Save File</Button>
                      <Button variant="outlined" onClick={handleShowChunks}>View & Edit Chunks</Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Dialog open={renameDialogOpen} onClose={closeRenameDialog}>
            <DialogTitle>Rename Resource</DialogTitle>
            <DialogContent>
              <TextField fullWidth label="New Name" value={newName} onChange={e => setNewName(e.target.value)} sx={{ mt: 2 }} />
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(30, 41, 59, 0.6)' }}>
                (Slashes will be replaced with underscores.)
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeRenameDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleRename}>Rename</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={moveDialogOpen} onClose={closeMoveDialog}>
            <DialogTitle>Move Resource</DialogTitle>
            <DialogContent>
              <Typography sx={{ color: 'rgba(30, 41, 59, 0.8)' }}>
                Select a target folder to move this resource into:
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Target Folder</InputLabel>
                <Select value={targetPrefix} label="Target Folder" onChange={e => setTargetPrefix(e.target.value as string)}>
                  <MenuItem value="">(Select folder)</MenuItem>
                  {allDirectories.map((d, idx) => (
                    <MenuItem key={idx} value={d.prefix}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeMoveDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleMove}>Move</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* TAB 2: MACHINES */}
      {tab === 2 && (
        <Paper sx={{ 
          p: 2, 
          overflowY: 'auto', 
          flex: 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
            ☕ Coffee Machines Management
          </Typography>
          
          {demoConfig.isDemo ? (
            // Demo mode: Show coffee machine data
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                Coffee Machine Fleet Overview
              </Typography>
              
              {demoMachineOptions.map((machine, index) => {
                const key = machine.machineNumber;
                const logs = getHistoryForMachine(machine.machineNumber);
                const isExpanded = expandedMachines.includes(key);
                
                // Demo statistics
                const demoStats = {
                  textFiles: 4 + index,
                  images: 2 + index,
                  uptime: 95 + index,
                  lastMaintenance: `${3 - index} days ago`,
                  nextService: `${7 + index} days`,
                  totalHours: 1200 + (index * 300)
                };
                
                return (
                  <Paper key={key} sx={{ 
                    p: 3, 
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
                        ☕ {machine.label}
                      </Typography>
                      <Chip 
                        label={demoStats.uptime >= 98 ? "Excellent" : demoStats.uptime >= 95 ? "Good" : "Needs Attention"} 
                        color={demoStats.uptime >= 98 ? "success" : demoStats.uptime >= 95 ? "primary" : "warning"}
                        variant="filled"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>Machine ID</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }}>
                          {machine.machineNumber}
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>Uptime</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }}>
                          {demoStats.uptime}%
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>Operating Hours</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }}>
                          {demoStats.totalHours.toLocaleString()}h
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>Documentation</Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 600 }}>
                          {demoStats.textFiles} docs, {demoStats.images} images
                        </Typography>
                      </Paper>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                          Last Maintenance: {demoStats.lastMaintenance}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                          Next Service: {demoStats.nextService}
                        </Typography>
                      </Box>
                      
                      <FormControl size="small" sx={{ width: 200 }}>
                        <InputLabel>Primary Technician</InputLabel>
                        <Select 
                          value={machinePOC[key] || users[index % users.length]?.username || ''} 
                          label="Primary Technician" 
                          onChange={e => setMachinePOC({ ...machinePOC, [key]: e.target.value as string })}
                        >
                          {users.map((u, i) => (
                            <MenuItem key={i} value={u.username}>
                              {u.attributes?.given_name || u.username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => toggleMachineExpand(key)} 
                      sx={{ mt: 1 }}
                      startIcon={isExpanded ? <ExpandMoreIcon /> : <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}
                    >
                      {isExpanded ? "Hide Maintenance History" : "Show Maintenance History"}
                    </Button>
                    
                    <Collapse in={isExpanded} unmountOnExit>
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                          Recent Maintenance History
                        </Typography>
                        {logs.length > 0 ? (
                          <List dense>
                            {logs.slice(0, 5).map((log, i) => (
                              <ListItem key={i} sx={{ py: 1 }}>
                                <ListItemAvatar>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: log.severity === 'error' ? 'error.main' : 
                                            log.severity === 'warning' ? 'warning.main' : 'success.main'
                                  }}>
                                    {log.type?.charAt(0).toUpperCase() || 'M'}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={log.message}
                                  secondary={new Date(log.timestamp).toLocaleString()}
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                <Chip 
                                  label={log.type?.replace('_', ' ') || 'maintenance'} 
                                  size="small" 
                                  variant="outlined"
                                  color={log.severity === 'error' ? 'error' : log.severity === 'warning' ? 'warning' : 'default'}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.6)', fontStyle: 'italic' }}>
                            No maintenance history available for this machine.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </>
          ) : (
            // Production mode: Use real data
            (() => {
              const grouped = groupMachines(resources);
              const machineModelsList = Object.keys(grouped);
              if (machineModelsList.length === 0) {
                return <Typography sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>No machine models found.</Typography>;
              }
              return machineModelsList.map((model) => {
                const instances = grouped[model];
                return (
                  <Paper key={model} sx={{ 
                    p: 2, 
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                      Model: {model}
                    </Typography>
                    {instances.map(instance => {
                      const key = `${model}-${instance.machineNumber}`;
                      const logs = getHistoryForMachine(instance.machineNumber);
                      return (
                        <Paper key={key} sx={{ 
                          p: 1, 
                          mt: 1,
                          background: 'rgba(255, 255, 255, 0.7)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                              Instance: {instance.instanceFolder}
                            </Typography>
                            <FormControl size="small" sx={{ width: 200 }}>
                              <InputLabel>Main Technician</InputLabel>
                              <Select value={machinePOC[key] || ''} label="Main Technician" onChange={e => setMachinePOC({ ...machinePOC, [key]: e.target.value as string })}>
                                {users.map((u, i) => (
                                  <MenuItem key={i} value={u.username}>
                                    {u.username}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>
                            {instance.textCount} text files | {instance.imageCount} images
                          </Typography>
                          <Button size="small" onClick={() => toggleMachineExpand(key)} sx={{ mt: 1 }}>
                            {expandedMachines.includes(key) ? "Hide History" : "Show History"}
                          </Button>
                          <Collapse in={expandedMachines.includes(key)} unmountOnExit>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                                Recent Activity
                              </Typography>
                              {logs.length > 0 ? (
                                <List dense>
                                  {logs.slice(0, 3).map((log, i) => (
                                    <ListItem key={i}>
                                      <ListItemText
                                        primary={log.message}
                                        secondary={new Date(log.timestamp).toLocaleString()}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.6)', fontStyle: 'italic' }}>
                                  No recent activity.
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Paper>
                );
              });
            })()
          )}
        </Paper>
      )}

      {/* TAB 3: QR CODES */}
      {tab === 3 && (
        <Paper sx={{ 
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
            ☕ Coffee Machine QR Code Generator
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <FormControl fullWidth>
              <InputLabel>Machine Model</InputLabel>
              <Select value={qrMachineModel} label="Machine Model" onChange={e => setQrMachineModel(e.target.value as string)}>
                {machineModels.map((m, i) => (
                  <MenuItem key={i} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Machine Number" value={qrMachineNumber} onChange={e => setQrMachineNumber(e.target.value)} />
            <TextField label="Location" value={qrLocation} onChange={e => setQrLocation(e.target.value)} />
            <Button variant="contained" onClick={handleGenerateQRCode}>
              Generate QR Code
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
              Generated QR Codes
            </Typography>
            {qrCodes.map((qr, i) => (
              <Paper key={i} sx={{ 
                p: 2, 
                mt: 1,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.8)' }}>
                  Model: {qr.machineModel}, Number: {qr.machineNumber}, Loc: {qr.location}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: 'rgba(30, 41, 59, 0.6)' }}>
                  Embedded URL: {qr.data}
                </Typography>
                <QRCodeCanvas value={qr.data} />
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* TAB 4: LOCATIONS */}
      {tab === 4 && (
        <Paper sx={{ 
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
            ☕ Coffee Shop Locations Management
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, maxWidth: 400 }}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select value={newLocationState} label="State" onChange={e => {
                setNewLocationState(e.target.value as string);
                setNewLocationArea('');
                setCustomCity('');
              }}>
                {defaultStates.map((st, i) => (
                  <MenuItem key={i} value={st}>{st}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Area/City</InputLabel>
              <Select value={newLocationArea} label="Area/City" onChange={e => setNewLocationArea(e.target.value as string)} disabled={!newLocationState}>
                {newLocationState && defaultAreas[newLocationState]
                  ? defaultAreas[newLocationState].map((a, i) => (
                      <MenuItem key={i} value={a}>{a}</MenuItem>
                    ))
                  : <MenuItem value=""><em>Choose an area/city</em></MenuItem>}
                <MenuItem value="other">Other (manual)</MenuItem>
              </Select>
            </FormControl>
            {newLocationArea === 'other' && (
              <TextField label="Enter City" value={customCity} onChange={e => setCustomCity(e.target.value)} />
            )}
            <TextField label="Address" value={newLocationAddress} onChange={e => setNewLocationAddress(e.target.value)} />
            <TextField label="Phone" value={newLocationPhone} onChange={e => setNewLocationPhone(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Point of Contact</InputLabel>
              <Select value={newLocationPOC} label="POC" onChange={e => setNewLocationPOC(e.target.value as string)}>
                {users.map((u, i) => (
                  <MenuItem key={i} value={u.username}>{u.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddLocation}>Add Location</Button>
          </Box>
          {Object.keys(groupedLocations).length === 0
            ? <Typography sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>No locations added yet.</Typography>
            : Object.entries(groupedLocations).map(([st, areas]) => (
              <Box key={st} sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ color: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
                  {st}
                </Typography>
                {Object.entries(areas).map(([area, locs]) => (
                  <Box key={area} sx={{ pl: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                      {area}
                    </Typography>
                    <List>
                      {locs.map(loc => (
                        <ListItem key={loc.id}>
                          <ListItemText primary={loc.address} secondary={`Phone: ${loc.phone} | POC: ${loc.poc}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            ))
          }
        </Paper>
      )}

      {/* Upload area in Resources tab */}
      {tab === 1 && (
        <Box mt={2}>
          <Typography variant="subtitle1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
            Upload New Manual/PDF/DOCX
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <TextField
              type="file"
              onChange={e => {
                const target = e.target as HTMLInputElement;
                setUploadFile(target.files && target.files[0] ? target.files[0] : null);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleUpload}>
              Upload
            </Button>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
              Upload Parts File
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                type="file"
                onChange={e => {
                  const target = e.target as HTMLInputElement;
                  setPartsFile(target.files && target.files[0] ? target.files[0] : null);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handlePartsUpload}>
                Upload Parts
              </Button>
            </Box>
          </Box>
          <Accordion defaultExpanded={false} sx={{ mt: 4 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                Key Search Queries (Server-Based)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ mt: 1, mb: 1 }}>
                {keySearchPhrases.map((phrase, i) => (
                  <ListItem key={i} sx={{ pl: 0 }}>
                    <ListItemText primary={phrase} />
                    <Button variant="text" color="error" onClick={() => handleRemovePhrase(phrase)}>
                      Remove
                    </Button>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField label="New Phrase" value={newKeyPhrase} onChange={e => setNewKeyPhrase(e.target.value)} size="small" />
                <Button variant="contained" onClick={handleAddPhrase}>Add Phrase</Button>
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(30, 41, 59, 0.6)' }}>
                Changes are in server memory and do not persist through restarts.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      <Backdrop open={loadingResources || uploading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="body1" sx={{ mt: 2, color: '#fff' }}>
            {loadingResources ? "Loading resources..." : uploadMessage}
          </Typography>
        </Box>
      </Backdrop>

      {/* Chunk viewer dialog with editable chunks */}
      <Dialog open={viewChunks} onClose={() => setViewChunks(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            View & Edit Chunks
            <FormControlLabel
              control={
                <Switch
                  checked={showImagePreview}
                  onChange={(e) => setShowImagePreview(e.target.checked)}
                  size="small"
                />
              }
              label="Preview Images"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editableChunks.length === 0 && (
            <Typography variant="body2" sx={{ color: 'rgba(30, 41, 59, 0.7)' }}>
              No chunks found.
            </Typography>
          )}
          {editableChunks.map((chunk, idx) => (
            <Box key={idx} mb={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
                  Chunk {idx + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    const imagePath = prompt('Enter image path (e.g., espresso-machine-cleaning.svg):');
                    if (imagePath) {
                      const altText = prompt('Enter alt text for the image:') || 'Image';
                      const newChunks = [...editableChunks];
                      newChunks[idx] += `\n\n![${altText}](${imagePath})`;
                      setEditableChunks(newChunks);
                    }
                  }}
                  title="Insert Image"
                >
                  <PhotoCameraIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    const videoPath = prompt('Enter video path or URL:');
                    if (videoPath) {
                      const title = prompt('Enter video title:') || 'Video';
                      const newChunks = [...editableChunks];
                      newChunks[idx] += `\n\n[🎥 ${title}](${videoPath})`;
                      setEditableChunks(newChunks);
                    }
                  }}
                  title="Insert Video Link"
                >
                  <VideoCallIcon />
                </IconButton>
              </Box>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={chunk}
                onChange={e => {
                  const newChunks = [...editableChunks];
                  newChunks[idx] = e.target.value;
                  setEditableChunks(newChunks);
                }}
                rows={4}
              />
              {showImagePreview && chunk && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'rgba(30, 41, 59, 0.8)' }}>
                    Preview:
                  </Typography>
                  {renderTextWithImages(chunk)}
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewChunks(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setFileChunks(editableChunks); setViewChunks(false); }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Insert Dialog */}
      <Dialog open={imageInsertDialog} onClose={() => setImageInsertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(30, 41, 59, 0.7)' }}>
            Insert an image reference into your manual text.
          </Typography>
          
          {/* Maintenance Procedures - General Guides */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
            📋 General Maintenance Procedures
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {[
              'espresso-machine-cleaning.svg',
              'coffee-grinder-operation.svg', 
              'steam-wand-cleaning.svg',
              'water-filter-replacement.svg',
              'troubleshooting-guide.svg'
            ].map((imageName) => (
              <Button
                key={imageName}
                variant="outlined"
                size="small"
                onClick={() => handleInsertImage(`/assets/${imageName}`, imageName.replace('.svg', '').replace(/-/g, ' '))}
                onMouseEnter={(e) => {
                  setPreviewAnchor(e.currentTarget);
                  setPreviewContent({ type: 'svg', path: `/assets/${imageName}`, name: imageName });
                }}
                onMouseLeave={() => {
                  setPreviewAnchor(null);
                  setPreviewContent(null);
                }}
                sx={{ textTransform: 'none' }}
              >
                {imageName.replace('.svg', '').replace(/-/g, ' ')}
              </Button>
            ))}
          </Box>

          {/* Problem-Specific Procedures */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
            🚨 Problem-Specific Emergency Procedures
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {[
              'filter-stuck-removal.svg',
              'grinder-jam-clearing.svg',
              'steam-wand-blockage.svg',
              'brewing-chamber-cleaning.svg'
            ].map((imageName) => (
              <Button
                key={imageName}
                variant="outlined"
                size="small"
                color="warning"
                onClick={() => handleInsertImage(`/assets/${imageName}`, imageName.replace('.svg', '').replace(/-/g, ' '))}
                onMouseEnter={(e) => {
                  setPreviewAnchor(e.currentTarget);
                  setPreviewContent({ type: 'svg', path: `/assets/${imageName}`, name: imageName });
                }}
                onMouseLeave={() => {
                  setPreviewAnchor(null);
                  setPreviewContent(null);
                }}
                sx={{ textTransform: 'none' }}
              >
                🔧 {imageName.replace('.svg', '').replace(/-/g, ' ')}
              </Button>
            ))}
          </Box>

          {/* Maintenance Videos */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(30, 41, 59, 0.8)', fontWeight: 600 }}>
            🎥 Video Maintenance Guides
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {[
              { file: 'Coffee_Machine_Filter_Replacement_Video.mp4', title: 'Filter Replacement Guide' },
              { file: 'Cleaning_Grinder.mp4', title: 'Grinder Cleaning Procedure' }
            ].map((video) => (
              <Button
                key={video.file}
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => handleInsertVideo(`/assets/${video.file}`, video.title)}
                onMouseEnter={(e) => {
                  setPreviewAnchor(e.currentTarget);
                  setPreviewContent({ type: 'video', path: `/assets/${video.file}`, name: video.file });
                }}
                onMouseLeave={() => {
                  setPreviewAnchor(null);
                  setPreviewContent(null);
                }}
                sx={{ textTransform: 'none' }}
                startIcon={<span>🎥</span>}
              >
                {video.title}
              </Button>
            ))}
          </Box>
          <TextField
            fullWidth
            label="Custom Image Path"
            placeholder="e.g., /assets/my-image.jpg"
            sx={{ mb: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                const altText = prompt('Enter alt text for the image:') || 'Image';
                handleInsertImage(target.value, altText);
              }
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.6)' }}>
            Click a predefined image or enter a custom path and press Enter
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageInsertDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Video Insert Dialog */}
      <Dialog open={videoInsertDialog} onClose={() => setVideoInsertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Video Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(30, 41, 59, 0.7)' }}>
            Insert a video reference into your manual text.
          </Typography>
          <TextField
            fullWidth
            label="Video URL or Path"
            placeholder="e.g., https://example.com/video.mp4 or /videos/maintenance.mp4"
            sx={{ mb: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                const title = prompt('Enter video title:') || 'Video';
                handleInsertVideo(target.value, title);
              }
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.6)' }}>
            Enter video URL or path and press Enter
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoInsertDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Hover Preview Popover */}
      <Popover
        open={Boolean(previewAnchor && previewContent)}
        anchorEl={previewAnchor}
        onClose={() => {
          setPreviewAnchor(null);
          setPreviewContent(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          pointerEvents: 'none',
        }}
        disableRestoreFocus
      >
        {previewContent && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {previewContent.name}
            </Typography>
            {previewContent.type === 'svg' ? (
              <Box
                component="img"
                src={previewContent.path}
                alt={previewContent.name}
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', p: 3, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <Box component="span" sx={{ fontSize: '48px' }}>🎥</Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'rgba(30, 41, 59, 0.7)' }}>
                  Video File Preview
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 0.6)' }}>
                  Click to insert video link
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Popover>
    </>
  );
};

export default AdminPanel;
