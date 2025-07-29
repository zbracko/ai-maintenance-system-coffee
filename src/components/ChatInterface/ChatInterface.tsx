/**
 * ChatInterface Component
 * 
 * Premium AI-powered maintenance chat interface with glassmorphism design.
 * Features include voice commands, QR scanning, work order management,
 * file uploads, and comprehensive maintenance assistance.
 * 
 * @author AI Maintenance System
 * @version 2.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText as MUIListItemText,
  useMediaQuery,
  useTheme,
  Dialog,
  Checkbox,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';

import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';

// MUI icons
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MicIcon from '@mui/icons-material/Mic';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import jsPDF from 'jspdf';

import Picture2 from '../../assets/Picture2.png';
import Picture3 from '../../assets/Picture3.png';
import Picture4 from '../../assets/Picture4.png';
import Picture5 from '../../assets/Picture5.png';

import { coffeeManualSections, coffeePartsListFromManual } from '../../data/coffeeManualSections';
import { 
  demoWorkOrders, 
  demoPastLogs, 
  demoChatResponses, 
  demoMachineOptions,
  demoConfiguration,
  createWorkOrderFromChat
} from '../../data/demoData';
import { demoConfig, demoResponseTemplates } from '../../config/demoConfig';

import { useTranslation } from 'react-i18next';

// Import OpenAI integration
import { getOpenAIResponse, ConversationContext as OpenAIConversationContext, updateContextFromMessage } from '../../utils/openai';

// Import Work Order and Log utilities
import { 
  getRelatedLog, 
  getRelatedWorkOrder, 
  downloadLogPDF, 
  generateAIReport, 
  downloadAIReportPDF,
  type WorkOrder,
  type MaintenanceLog
} from '../../utils/workOrderLogUtils';

// Demo mode - disable real API calls
const REACT_APP_API_BASE_URL = demoConfig.useRealAPI ? "https://c5pnv814u2.execute-api.us-west-1.amazonaws.com" : null;

// Conversation context for dynamic interactions
interface ConversationContext {
  selectedMachine?: string;
  maintenanceType?: string;
  currentIssue?: string;
  step?: number;
  waitingForMachineSelection?: boolean;
  waitingForIssueType?: boolean;
  troubleshootingFlow?: boolean;
}

// Enhanced response interface
interface DynamicResponse {
  text: string;
  images?: string[];
  videos?: string[];
  instructions?: Instruction[];
  options?: string[];
  requiresMachine?: boolean;
  nextStep?: string;
  context?: Partial<ConversationContext>;
}

// New interfaces for machine dropdown
interface ResourceItem {
  type: 'directory' | 'file';
  name?: string;
  path?: string;
  prefix?: string;
  children?: ResourceItem[];
}

interface MachineOption {
  machineNumber: string;
  label: string;
}

// Interfaces
interface Message {
  sender: 'user' | 'bot';
  text: string;
  images?: string[];
  videos?: string[];
  instructions?: Instruction[];
}

interface Instruction {
  text: string;
  link?: string;
  feedback?: string;
  isDone?: boolean;
}

type ChatFlow =
  | 'idle'
  | 'showingWorkOrders'
  | 'selectedWorkOrder'
  | 'verifyingMachine'
  | 'safeHandling'
  | 'showInstructions'
  | 'showPastLogs'
  | 'showParts'
  | 'finalNotes'
  | 'downloadDocs'
  | 'creatingWorkOrder'
  | 'showMaintenanceManual'
  | 'viewingManualSection'
  | 'viewingPartsListSection'
  | 'other'
  | 'diagnosingStep1'
  | 'diagnosingStep2'
  | 'diagnosingStep3'
  | 'partsReplacedStep1'
  | 'partsReplacedStep2';

interface LocalWorkOrder {
  id: string;
  task: string;
  timeSpent: string;
  steps: string;
  partsUsed: string;
  comments: string;
}

interface PastLog {
  date: string;
  summary: string;
}

interface NewWorkOrderForm {
  id: string;
  dateIssued: string;
  priority: string;
  location: string;
  asset: string;
  description: string;
  requestedBy: string;
  assignedTo: string;
  dueDate: string;
  materials: string;
  additionalNotes: string;
}

interface SafetyCheck {
  label: string;
  image: string;
  checked: boolean;
}

interface PartOption {
  name: string;
  lastReplaced: string;
  selected: boolean;
}

// Mock data for Coffee Machine demonstration - Use demo data instead
const mockWorkOrders: LocalWorkOrder[] = demoWorkOrders.map(wo => ({
  id: wo.id,
  task: wo.task,
  timeSpent: wo.timeSpent,
  steps: wo.steps,
  partsUsed: wo.partsUsed,
  comments: wo.comments,
}));

const mockPastLogs: PastLog[] = demoPastLogs.map(log => ({
  date: log.date,
  summary: log.summary
}));

const initialSafetyChecks: SafetyCheck[] = [
  { label: 'Wear Heat-Resistant Gloves', image: Picture2, checked: false },
  { label: 'Disconnect Power Supply', image: Picture3, checked: false },
  { label: 'Allow Machine to Cool', image: Picture4, checked: false },
  { label: 'Clear Work Area', image: Picture5, checked: false },
];

const initialParts: PartOption[] = [
  { name: 'Water Filter (CM-WF-002)', lastReplaced: '2025-04-28', selected: false },
  { name: 'Grinder Burr Set (CM-UB-004)', lastReplaced: '2024-12-15', selected: false },
  { name: 'Steam Valve Seals (CM-SVS-014)', lastReplaced: '2025-01-20', selected: false },
  { name: 'Temperature Sensor (CM-TS-008)', lastReplaced: '2024-10-30', selected: false },
];

const machineOptions = demoMachineOptions.map(opt => opt.label);

const priorityOptions = ['High', 'Medium', 'Low'];
const assignedToOptions = ['Technician A', 'Technician B', 'External Vendor'];

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true
};

const mobileButtonSliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 1.3,
  centerMode: false,
  swipeToSlide: true,
  arrows: false
};

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Extracts any Markdown-style images of the form
 * ![alt text](https://some-image-url)
 * from the AI response text, returning a clean text
 * (with those images removed) and an array of image URLs.
 */
function parseMessageForImages(text: string): { cleanText: string; images: string[] } {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  let images: string[] = [];
  let cleanText = text;
  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    images.push(match[1]);
    cleanText = cleanText.replace(match[0], '');
  }
  return { cleanText: cleanText.trim(), images };
}

// ================================================================
// SESSION MANAGEMENT
// ================================================================

// ======== NEW CHANGE: Generate new session ID on mount =========
const generateSessionId = (): string => {
  return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const ChatInterface: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Update current language when i18n language changes
  useEffect(() => {
    const currentLang = i18n.language;
    if (currentLang.startsWith('es')) {
      setCurrentLanguage('es');
    } else if (currentLang.startsWith('fr')) {
      setCurrentLanguage('fr');
    } else {
      setCurrentLanguage('en');
    }
  }, [i18n.language]);

  // ================================================================
  // STATE MANAGEMENT
  // ================================================================

  // Session management
  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    localStorage.setItem('currentSessionId', newSessionId);
  }, []);

  // Update OpenAI context when session ID changes
  useEffect(() => {
    if (sessionId) {
      setOpenAIContext(prev => ({
        ...prev,
        sessionId: sessionId
      }));
    }
  }, [sessionId]);

  // Core chat state
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: t('chat.initialMessage') }
  ]);
  const [input, setInput] = useState('');
  const [workOrders, setWorkOrders] = useState<LocalWorkOrder[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<Slider | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [chatFlow, setChatFlow] = useState<ChatFlow>('idle');

  const [selectedWO, setSelectedWO] = useState<LocalWorkOrder | null>(null);
  const [machineNumber, setMachineNumber] = useState<string>('');
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>(initialSafetyChecks);
  const [parts, setParts] = useState<PartOption[]>(initialParts);
  const [finalNotes, setFinalNotes] = useState<string>('');

  const [createWOopen, setCreateWOopen] = useState(false);
  const [newWOForm, setNewWOForm] = useState<NewWorkOrderForm>({
    id: '',
    dateIssued: '',
    priority: '',
    location: '',
    asset: '',
    description: '',
    requestedBy: '',
    assignedTo: '',
    dueDate: '',
    materials: '',
    additionalNotes: ''
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedManualSection, setSelectedManualSection] = useState<typeof coffeeManualSections[0] | null>(null);
  const [selectedPartsList, setSelectedPartsList] = useState<typeof coffeeManualSections[0] | null>(null);

  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const [loadingResponse, setLoadingResponse] = useState(false);
  const [loadingText, setLoadingText] = useState(t('chatInterface.processing'));

  // ======== Added for media capture ========
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // ========================================

  // ======== NEW STATE: For Add Note functionality ========
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNoteMessage, setSelectedNoteMessage] = useState<string>('');
  const [additionalNote, setAdditionalNote] = useState('');
  // New state for machine dropdown confirmation
  const [confirmMachine, setConfirmMachine] = useState<string>('');
  
  // Static machine options (no longer using dropdown)
  const machineOptionsList = [
    { machineNumber: '001', label: 'Espresso Machine #001 (Front Counter)' },
    { machineNumber: '002', label: 'Coffee Maker #002 (Back Station)' },
    { machineNumber: '003', label: 'Grinder #003 (Left Counter)' },
    { machineNumber: '004', label: 'Steam Wand #004 (Right Station)' },
    { machineNumber: '005', label: 'Bean Hopper #005 (Storage Area)' }
  ];
  
  // ======== NEW STATE: For dynamic conversations ========
  const [conversationContext, setConversationContext] = useState<ConversationContext>({});
  
  // ======== OpenAI Integration State ========
  const [openAIContext, setOpenAIContext] = useState<OpenAIConversationContext>({
    sessionId: sessionId
  });
  const [conversationHistory, setConversationHistory] = useState<{ sender: 'user' | 'bot'; text: string; timestamp?: string }[]>([]);
  
  const [showIssueTypeButtons, setShowIssueTypeButtons] = useState<boolean>(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [activeWorkOrder, setActiveWorkOrder] = useState<string | null>(null);
  const [troubleshootingStep, setTroubleshootingStep] = useState<number>(0);
  
  // ======== SHOWCASE MODE STATE ========
  const [showcaseMode, setShowcaseMode] = useState<boolean>(false);
  const [demoScenarios] = useState([
    "Machine 001 won't start",
    "Coffee tastes terrible",
    "Strange grinding noise",
    "Steam wand not working",
    "Need to create work order",
    "Show maintenance history",
    "What machines do you support?"
  ]);
  
  // ======== CONVERSATION MEMORY ========
  const [conversationMemory, setConversationMemory] = useState<{
    lastMentionedMachine?: string;
    lastIssueType?: string;
    recentTopics: string[];
    userPreferences: { [key: string]: any };
  }>({
    recentTopics: [],
    userPreferences: {}
  });
  
  // Smart context tracking
  const updateConversationMemory = (userText: string, botResponse: string) => {
    setConversationMemory(prev => {
      const newMemory = { ...prev };
      
      // Track mentioned machines
      const machineMatch = userText.match(/machine\s+(\w+)/i);
      if (machineMatch) {
        newMemory.lastMentionedMachine = machineMatch[1];
      }
      
      // Track issue types
      const issueTypes = ['noise', 'leak', 'temperature', 'quality', 'power', 'grinding'];
      for (const issue of issueTypes) {
        if (userText.toLowerCase().includes(issue)) {
          newMemory.lastIssueType = issue;
          break;
        }
      }
      
      // Track recent topics (last 5)
      const topics = [...prev.recentTopics];
      if (userText.length > 5) {
        topics.unshift(userText);
        newMemory.recentTopics = topics.slice(0, 5);
      }
      
      return newMemory;
    });
  };
  // ====================================
  
  // ======== WORK ORDER-LOG MANAGEMENT STATE ========
  const [selectedWorkOrderForLog, setSelectedWorkOrderForLog] = useState<WorkOrder | null>(null);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [showLogDetails, setShowLogDetails] = useState<boolean>(false);
  const [aiReportGenerating, setAiReportGenerating] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es' | 'fr'>('en');
  // ====================================

  // Show welcome message on component mount with enhanced showcase features
  useEffect(() => {
    if (demoConfig.isDemo && messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage = `☕ **Welcome to the AI Coffee Machine Maintenance System Demo!**\n\n${demoResponseTemplates.greeting}\n\n🚀 **Advanced Features Showcase:**\n\n**🤖 Natural Language Understanding:**\n• I can understand typos and variations: "machien wont start" → "machine won't start"\n• Conversational flow: I remember context throughout our chat\n• Multiple input styles: formal technical language or casual descriptions\n\n**🎯 Demo Conversation Starters:**\n• *"Machine 001 is making weird noises"* - Troubleshooting with work order creation\n• *"Show me work orders"* - View and manage maintenance requests\n• *"How do I clean the espresso machine?"* - Step-by-step maintenance guidance\n• *"What machines do you support?"* - Complete equipment inventory\n• *"Create work order for broken grinder"* - New service request workflow\n• *"When was machine 003 last serviced?"* - Maintenance history tracking\n\n**💬 Try typing with intentional typos like:**\n• "cofee machien broken"\n• "shwo maintance histroy"\n• "grindor makng wierd noise"\n\n**🛠️ I'll demonstrate:**\n✅ Contextual conversations that flow naturally\n✅ Work order creation and management\n✅ Advanced typo recognition and correction\n✅ Step-by-step troubleshooting guidance\n✅ Maintenance scheduling and tracking\n✅ Parts identification and ordering\n\n${demoResponseTemplates.capabilities}\n\nReady to explore? Try any of the examples above or ask me anything about coffee machine maintenance!`;
        addBotMessage(welcomeMessage, ['coffee_machine_overview.jpg'], ['system_capabilities_demo.mp4']);
        
        // Add quick action buttons for showcase
        setTimeout(() => {
          addBotMessage(
            "🎪 **Quick Demo Actions** - Click any button below for instant demonstration:",
            [],
            [],
            [],
            [
              '🔧 Troubleshoot Machine 001',
              '📋 Show Work Orders',
              '🧽 Maintenance Guide',
              '🔍 Equipment List',
              '⚡ Typo Test: "machien broke"'
            ]
          );
        }, 2000);
      }, 1000); // Delay to make it feel more natural
    }
  }, []); // Empty dependency array = run once on mount

  // Set default machine for confirmMachine
  useEffect(() => {
    if (machineOptionsList.length > 0) {
      setConfirmMachine(machineOptionsList[0].machineNumber);
    }
  }, []);

  useEffect(() => {
    // This effect rotates "thinking" messages if loadingResponse==true
    if (loadingResponse) {
      const manualAnalysis = [
        "Cross-referencing manual schematics with log data...",
        "Synthesizing procedural notes against diagnostic outputs...",
        "Integrating manufacturer specifications with system error codes...",
        "Parsing service manuals to correlate with observed anomalies...",
        "Analyzing maintenance logs against operational directives...",
        "Deciphering technical documentation for fault isolation procedures...",
        "Extracting relevant service bulletin data from maintenance history...",
        "Matching component diagrams to recorded sensor deviations...",
        "Interpreting operational notes to derive corrective actions..."
      ];
      const informationExtraction = [
        "Compiling relevant maintenance guidelines from documentation...",
        "Extracting repair protocols from manufacturer manuals...",
        "Reasoning through logged error sequences and manual specifications...",
        "Identifying critical maintenance steps within procedural documents...",
        "Analyzing technical notes to establish component dependencies...",
        "Constructing a logical flow from manual specifications to system logs...",
        "Deriving optimal maintenance strategies from combined documentation...",
        "Filtering relevant data from service records and manuals...",
        "Interpreting historical maintenance data and comparing to manuals."
      ];
      const aiThoughtProcess = [
        "Contextualizing system logs within manufacturer guidelines...",
        "Formulating a repair strategy based on interpreted documentation...",
        "Reasoning through error patterns by comparing against manual procedures...",
        "Aligning observed system behavior with documented specifications...",
        "Building a response model from maintenance records and repair guides...",
        "Deriving a solution path by integrating manual information with system data...",
        "Creating a repair directive by synthesizing manual information and logs."
      ];

      const messagesArray = [];
      const maxLength = Math.max(manualAnalysis.length, informationExtraction.length, aiThoughtProcess.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < manualAnalysis.length) messagesArray.push(manualAnalysis[i]);
        if (i < informationExtraction.length) messagesArray.push(informationExtraction[i]);
        if (i < aiThoughtProcess.length) messagesArray.push(aiThoughtProcess[i]);
      }

      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % messagesArray.length;
        setLoadingText(messagesArray[index]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loadingResponse]);

  // Handle option button clicks during troubleshooting
  const handleOptionSelection = (option: string) => {
    // Check if this is a work order-log button
    const isViewRelatedLog = option === t('workOrderLog.viewRelatedLog') || 
                            option === 'View Related Log' || 
                            option === 'Ver Registro Relacionado' || 
                            option === 'Voir le Journal Associé';
    
    const isDownloadLog = option === t('workOrderLog.downloadLog') || 
                         option === 'Download Log' || 
                         option === 'Descargar Registro' || 
                         option === 'Télécharger le Journal';
    
    const isGenerateAIReport = option === t('workOrderLog.generateAIReport') || 
                              option === 'Generate AI Report' || 
                              option === 'Generar Reporte con IA' || 
                              option === 'Générer un Rapport IA';
    
    // Check if this is a "View Log for [workOrderId]" button
    const viewLogMatch = option.match(/^View Log for (WO-\d+)$/);
    
    // Handle work order-log specific buttons
    if (isViewRelatedLog && selectedWorkOrderForLog) {
      handleViewRelatedLog(selectedWorkOrderForLog);
      return;
    }
    
    if (isDownloadLog && selectedLog) {
      handleDownloadLog();
      return;
    }
    
    if (isGenerateAIReport && selectedWorkOrderForLog) {
      handleGenerateAIReport();
      return;
    }
    
    // Handle dynamic "View Log for [workOrderId]" buttons
    if (viewLogMatch) {
      const workOrderId = viewLogMatch[1];
      const workOrder = demoWorkOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        handleViewRelatedLog(workOrder);
        return;
      }
    }
    
    // Add user message showing selection
    setMessages(prev => [...prev, {
      sender: 'user',
      text: option
    }]);
    
    setCurrentOptions([]);
    setShowIssueTypeButtons(false);
    
    // If we're in an active troubleshooting session, handle contextually
    if (activeWorkOrder && conversationContext.troubleshootingFlow) {
      const contextualResponse = handleContextualFollowUp(option, activeWorkOrder);
      if (contextualResponse) {
        addBotMessage(contextualResponse.text, contextualResponse.images, contextualResponse.videos, contextualResponse.instructions, contextualResponse.options);
        return;
      }
    }
    
    // Handle issue type selection for new troubleshooting
    if (!activeWorkOrder && conversationContext.selectedMachine) {
      handleIssueTypeSelection(option);
    }
  };

  // Enhanced addBotMessage to support images, videos, and dynamic conversations
  const addBotMessage = (text: string, images?: string[], videos?: string[], instructions?: Instruction[], options?: string[]) => {
    const message: Message = {
      sender: 'bot',
      text,
      images,
      videos,
      instructions
    };
    setMessages((prev) => [...prev, message]);
    
    // Add to conversation history for OpenAI context
    setConversationHistory(prev => [...prev, {
      sender: 'bot',
      text,
      timestamp: new Date().toISOString()
    }]);
    
    // Handle dynamic conversation options
    if (options && options.length > 0) {
      setCurrentOptions(options);
      setShowIssueTypeButtons(true);
    }
  };

  // Add machine selection response
  const addMachineSelectionMessage = () => {
    // Skip machine selection dropdown, go directly to issue types
    addBotMessage(
      "I can help you with that! What type of issue are you experiencing with your coffee equipment?",
      [],
      [],
      [],
      [
        "Machine won't start",
        "Poor coffee quality",
        "Water/Steam issues", 
        "Unusual sounds",
        "Error messages",
        "Regular maintenance"
      ]
    );
    
    setShowIssueTypeButtons(true);
  };

  // Handle issue type selection
  const handleIssueTypeSelection = (issueType: string) => {
    setConversationContext(prev => ({ 
      ...prev, 
      currentIssue: issueType,
      troubleshootingFlow: true,
      step: 1
    }));
    
    // Update OpenAI context with current issue
    setOpenAIContext(prev => ({
      ...prev,
      currentIssue: issueType,
      troubleshootingStep: 1
    }));
    
    setShowIssueTypeButtons(false);
    setCurrentOptions([]);
    setTroubleshootingStep(1);
    
    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: issueType
    }]);
    
    // Update conversation history
    setConversationHistory(prev => [...prev, {
      sender: 'user',
      text: issueType,
      timestamp: new Date().toISOString()
    }]);
    
    // Create work order ONLY for new issues, not for follow-ups
    if (!activeWorkOrder) {
      const machineNumber = conversationContext.selectedMachine || 'unknown';
      const response = getDynamicResponse(issueType, machineNumber);
      addBotMessage(response.text, response.images, response.videos, response.instructions, response.options);
    }
  };

  // Enhanced contextual response matching with advanced typo tolerance
  const findBestResponse = (userText: string) => {
    const userTextLower = userText.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize spaces
      .trim();
    
    // Extract key words for contextual matching
    const userWords = userTextLower.split(' ');
    
    // Define response categories with keywords, synonyms, and common typos
    const responseCategories = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings', 'helo', 'hii', 'heey'],
      help: ['help', 'assist', 'support', 'what can you do', 'capabilities', 'functions', 'halp', 'asist', 'suport'],
      machine_list: [
        'what machines', 'which machines', 'machines do you know', 'what equipment',
        'list machines', 'show machines', 'available machines', 'machine types',
        'what coffee machines', 'machines you support', 'machine models',
        'wat machines', 'machiens', 'machins', 'equipement', 'cofee machines', 'coffe machines'
      ],
      maintenance_history: [
        'when was', 'last changed', 'last replaced', 'maintenance history', 'service history',
        'when did', 'previous maintenance', 'last service', 'history of', 'maintenance log',
        'service record', 'repair history', 'last repair', 'when was last',
        'maintance history', 'maintanance', 'servise history', 'repari history'
      ],
      maintenance_notes: [
        'show notes', 'maintenance notes', 'service notes', 'technician notes',
        'show observations', 'recent notes', 'log entries', 'notes and comments',
        'maintance notes', 'servise notes', 'technicain notes', 'shwo notes'
      ],
      reports: [
        'generate report', 'create report', 'maintenance report', 'service report',
        'show report', 'performance report', 'analytics', 'statistics', 'metrics',
        'generat report', 'creat report', 'maintance report', 'servise report', 'reprot'
      ],
      logs: [
        'create log', 'maintenance log', 'service log', 'new log entry',
        'log maintenance', 'record service', 'document work', 'log entry',
        'creat log', 'maintance log', 'servise log', 'log entrys'
      ],
      machine_issues: [
        'broken', 'not working', 'wont start', 'doesnt work', 'problem', 'issue', 'trouble',
        'whats wrong', 'what wrong', 'fix', 'repair', 'malfunction', 'fault', 'weird noise',
        'strange noise', 'unusual sound', 'grinding noise', 'rattling', 'squealing',
        'brken', 'brokn', 'not workng', 'wont start', 'dosnt work', 'problm', 'isue', 'troble',
        'whats worng', 'wat wrong', 'fixx', 'repari', 'malfuntion', 'falt', 'wierd noise',
        'strang noise', 'unusaul sound', 'grindng noise', 'ratling', 'squeeling'
      ],
      no_power: ['no power', 'wont turn on', 'not turning on', 'dead', 'not starting', 'power issue', 'no powr', 'wont turn on', 'not startng', 'powr issue'],
      coffee_quality: [
        'tastes bad', 'bad taste', 'bitter', 'weak', 'sour', 'off taste', 'quality',
        'coffee taste', 'flavor', 'brewing', 'extraction',
        'tastes bd', 'bad tast', 'biter', 'wek', 'sowr', 'cofee taste', 'flaver', 'brewng', 'extracton'
      ],
      cleaning: [
        'clean', 'cleaning', 'wash', 'descale', 'descaling', 'maintenance', 'service',
        'how to clean', 'cleaning procedure',
        'clen', 'clening', 'whash', 'descal', 'descalng', 'maintance', 'servise', 'how to clen'
      ],
      grinder: [
        'grinder', 'grinding', 'grind', 'burr', 'noise', 'jammed', 'stuck',
        'grinder problem', 'grinding noise',
        'grindor', 'grindng', 'grnd', 'bur', 'nois', 'jamd', 'stuk', 'grindor problem', 'grindng noise'
      ],
      steam: [
        'steam', 'milk', 'froth', 'frothing', 'steam wand', 'not frothing',
        'steam not working', 'milk not hot',
        'steem', 'milch', 'frooth', 'frothng', 'steem wand', 'not frothng', 'steem not workng', 'milk not hoyt'
      ],
      temperature: [
        'hot', 'cold', 'temperature', 'not hot enough', 'overheating', 'temp',
        'heating', 'thermal',
        'hoyt', 'colsd', 'temperatur', 'not hoyt enough', 'overheatng', 'tmp', 'heatng', 'therml'
      ],
      parts: [
        'parts', 'replacement', 'catalog', 'spare', 'components', 'what parts',
        'need parts', 'order parts',
        'partrs', 'replacemnt', 'catalg', 'spar', 'componts', 'wat parts', 'ned parts', 'ordr parts'
      ],
      work_orders: [
        'work order', 'work orders', 'tickets', 'service request', 'maintenance request',
        'show work orders', 'create work order',
        'wrok order', 'work ordrs', 'tickts', 'servise request', 'maintance request', 'shwo work orders', 'creat work order'
      ],
      error_codes: [
        'error', 'error code', 'e01', 'e02', 'e03', 'e04', 'e05', 'display error',
        'error message',
        'eror', 'eror code', 'e1', 'e2', 'e3', 'e4', 'e5', 'displa error', 'eror mesage'
      ]
    };

    // Score responses based on keyword matches with advanced fuzzy matching
    let bestMatch = null;
    let bestScore = 0;
    
    // Check for exact phrase matches first
    for (const [key, response] of Object.entries(demoChatResponses)) {
      const keyLower = key.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      
      // Exact match gets highest score
      if (keyLower === userTextLower) {
        return response;
      }
      
      // Partial phrase match with typo tolerance
      if (fuzzyStringMatch(userTextLower, keyLower) || userTextLower.includes(keyLower) || keyLower.includes(userTextLower)) {
        const score = calculateSimilarityScore(userTextLower, keyLower);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = response;
        }
      }
    }
    
    // If no direct match, use category-based matching with enhanced fuzzy logic
    if (!bestMatch) {
      for (const [category, keywords] of Object.entries(responseCategories)) {
        let categoryScore = 0;
        
        for (const keyword of keywords) {
          const keywordWords = keyword.split(' ');
          let keywordScore = 0;
          
          for (const keywordWord of keywordWords) {
            for (const userWord of userWords) {
              // Exact word match
              if (userWord === keywordWord) {
                keywordScore += 4;
              }
              // Advanced fuzzy match with edit distance
              else if (calculateEditDistance(userWord, keywordWord) <= 2 && Math.abs(userWord.length - keywordWord.length) <= 2) {
                keywordScore += 3;
              }
              // Partial word match (for typos)
              else if (userWord.includes(keywordWord) || keywordWord.includes(userWord)) {
                keywordScore += 2;
              }
              // Simple fuzzy match for common misspellings
              else if (fuzzyMatch(userWord, keywordWord)) {
                keywordScore += 1;
              }
            }
          }
          
          if (keywordScore > 0) {
            categoryScore += keywordScore / keywordWords.length;
          }
        }
        
        if (categoryScore > bestScore && categoryScore > 1) { // Minimum threshold for matches
          bestScore = categoryScore;
          bestMatch = getCategoryResponse(category, userText);
        }
      }
    }
    
    return bestMatch;
  };

  // Advanced fuzzy matching utilities for typo recognition
  const calculateEditDistance = (str1: string, str2: string): number => {
    const dp: number[][] = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= str2.length; j++) dp[0][j] = j;
    
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // deletion
            dp[i][j - 1] + 1,     // insertion
            dp[i - 1][j - 1] + 1  // substitution
          );
        }
      }
    }
    
    return dp[str1.length][str2.length];
  };

  const calculateSimilarityScore = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    
    const editDistance = calculateEditDistance(str1, str2);
    return (maxLen - editDistance) / maxLen;
  };

  const fuzzyStringMatch = (str1: string, str2: string, threshold: number = 0.6): boolean => {
    if (str1 === str2) return true;
    if (Math.abs(str1.length - str2.length) > 3) return false;
    
    const similarity = calculateSimilarityScore(str1, str2);
    return similarity >= threshold;
  };

  // Enhanced fuzzy matching for common misspellings with phonetic similarities
  const fuzzyMatch = (word1: string, word2: string): boolean => {
    if (Math.abs(word1.length - word2.length) > 2) return false;
    
    // Quick similarity check
    if (calculateSimilarityScore(word1, word2) >= 0.7) return true;
    
    const commonMisspellings: { [key: string]: string[] } = {
      'machine': ['machien', 'machin', 'mashine', 'masheen', 'machne'],
      'coffee': ['cofee', 'coffe', 'caffee', 'cofie', 'coffy'],
      'broken': ['broke', 'brken', 'brokan', 'brokn', 'broked'],
      'working': ['workng', 'workin', 'wrkng', 'workig', 'workn'],
      'problem': ['problm', 'probem', 'probelm', 'poblm', 'problme'],
      'cleaning': ['cleening', 'clening', 'cleanng', 'cleann', 'clening'],
      'grinder': ['grindor', 'griner', 'grindner', 'grindre', 'grindr'],
      'temperature': ['temp', 'temprature', 'temperatur', 'tempreture', 'temperatue'],
      'noise': ['nois', 'noice', 'noize', 'noyse', 'noys'],
      'sound': ['sond', 'sownd', 'soung', 'soun', 'sownd'],
      'hearing': ['hering', 'hearng', 'hearig', 'hearin', 'hering'],
      'weird': ['wierd', 'weerd', 'werd', 'wired', 'weard'],
      'strange': ['strang', 'stranje', 'strnage', 'strng', 'strainge'],
      'maintenance': ['maintanance', 'maintenace', 'maintance', 'maintenenace', 'maintainance'],
      'history': ['histroy', 'histry', 'histor', 'histoyr', 'hstory'],
      'report': ['repport', 'reporrt', 'reprt', 'repotr', 'reportt'],
      'service': ['servise', 'servic', 'servis', 'servce', 'sevice'],
      'technician': ['technicain', 'technicin', 'technican', 'tecnician', 'technicaian'],
      'replace': ['replac', 'reaplce', 'replase', 'replacce', 'replaec'],
      'component': ['componnt', 'compnent', 'componet', 'compoent', 'compoennt'],
      'available': ['availabe', 'avaliable', 'availible', 'avalable', 'availabl'],
      'what': ['wat', 'wht', 'whta', 'waht', 'wath'],
      'when': ['wen', 'whn', 'wehn', 'whne', 'wehen'],
      'where': ['wher', 'whre', 'were', 'wheer', 'wherr'],
      'how': ['hw', 'hwo', 'hoow', 'howw', 'ho'],
      'does': ['dos', 'dose', 'doess', 'deos', 'does'],
      'doesn': ['dosnt', 'doesnt', 'dosent', 'doesent', 'dosn'],
      'won': ['wont', 'wn', 'wonn', 'ownt', 'wont'],
      'can': ['cna', 'cn', 'cann', 'acn', 'ca'],
      'help': ['halp', 'hlp', 'hepl', 'hep', 'helps'],
      'show': ['shwo', 'sho', 'shw', 'shaw', 'showw'],
      'create': ['creat', 'crate', 'craete', 'creae', 'crete'],
      'order': ['ordr', 'orde', 'oder', 'ordder', 'ordetr']
    };
    
    for (const [correct, variations] of Object.entries(commonMisspellings)) {
      if ((word1 === correct && variations.includes(word2)) ||
          (word2 === correct && variations.includes(word1))) {
        return true;
      }
    }
    
    return false;
  };

  // Generate enhanced machine list response with conversation starters
  const generateMachineListResponse = () => {
    const machineList = demoMachineOptions.map((machine, index) => 
      `${index + 1}. **${machine.label}** (ID: ${machine.machineNumber})`
    ).join('\n');
    
    return {
      text: `☕ **Available Coffee Machines in Your Facility:**\n\nI can help you with maintenance and troubleshooting for these coffee machines:\n\n${machineList}\n\n🔧 **What I can assist you with today:**\n• **Diagnostic troubleshooting** - "Machine 001 won't start" or "Strange noise from grinder"\n• **Maintenance procedures** - "How do I clean machine 002?" or "Show maintenance schedule"\n• **Work order creation** - "Create work order for broken steam wand"\n• **Parts identification** - "What parts need replacement?" or "Show parts catalog"\n• **Safety protocols** - "Safety procedures for machine repair"\n• **Maintenance history** - "When was grinder last serviced?"\n• **Technical reports** - "Generate maintenance report"\n\n💬 **Try saying something like:**\n• "Machine 001 is making weird noises"\n• "Show me work orders for today"\n• "How do I descale the espresso machine?"\n• "What's the maintenance history for machine 003?"\n\nI understand natural language and can handle typos too! Just describe your issue and I'll help guide you through it step by step.`,
      images: ['coffee_machines_overview.jpg'],
      videos: []
    };
  };

  // Get response for a category when no exact match found
  const getCategoryResponse = (category: string, userText: string) => {
    const categoryResponses: { [key: string]: any } = {
      greeting: demoChatResponses['hello'],
      help: demoChatResponses['help'],
      machine_list: generateMachineListResponse(),
      maintenance_history: demoChatResponses['when was grinder last changed'] || demoChatResponses['show maintenance history'],
      maintenance_notes: demoChatResponses['show maintenance notes'],
      reports: demoChatResponses['generate report'],
      logs: demoChatResponses['create maintenance log'],
      machine_issues: demoChatResponses["what's wrong with the coffee machine"],
      no_power: demoChatResponses['no power'],
      coffee_quality: demoChatResponses['coffee tastes bad'],
      cleaning: demoChatResponses['how do I clean the coffee machine'],
      grinder: demoChatResponses['grinder making noise'],
      steam: demoChatResponses['steam wand not working'],
      temperature: demoChatResponses['coffee not hot enough'],
      parts: demoChatResponses['what parts need replacement'],
      work_orders: demoChatResponses['show work orders'],
      error_codes: demoChatResponses['error codes']
    };
    
    return categoryResponses[category] || null;
  };

  // Detect user intent from text
  const detectUserIntent = (userText: string): string => {
    const text = userText.toLowerCase();
    
    if (text.includes('work order') || text.includes('ticket') || text.includes('service request')) {
      return 'work_orders';
    }
    if (text.includes('broken') || text.includes('not working') || text.includes('problem')) {
      return 'troubleshooting';
    }
    if (text.includes('clean') || text.includes('maintain') || text.includes('service')) {
      return 'maintenance';
    }
    if (text.includes('part') || text.includes('replace') || text.includes('component')) {
      return 'parts';
    }
    if (text.includes('manual') || text.includes('instruction') || text.includes('guide')) {
      return 'documentation';
    }
    
    return 'general';
  };

  // Handle contextual follow-up responses during troubleshooting
  const handleContextualFollowUp = (userText: string, workOrderId: string): DynamicResponse | null => {
    const machineLabel = machineOptionsList.find(m => m.machineNumber === conversationContext.selectedMachine)?.label || 'Selected Machine';
    const currentIssue = conversationContext.currentIssue || 'issue';
    
    const userTextLower = userText.toLowerCase();
    
    // Handle specific troubleshooting responses - don't create new work orders!
    if (currentIssue === 'strange noises') {
      if (userTextLower.includes('clicking') || userTextLower.includes('tapping')) {
        return {
          text: `📝 **Work Order ${workOrderId} - Clicking/Tapping Analysis**\n\n🔊 **Clicking/Tapping Sound Diagnosis for ${machineLabel}:**\n\nClicking or tapping sounds usually indicate:\n\n**🔍 MOST LIKELY CAUSES:**`,
          instructions: [
            { text: "1. Solenoid valve activation (normal clicking during brewing cycles)" },
            { text: "2. Relay switching in control board (electrical clicking)" },
            { text: "3. Loose internal components vibrating against housing" },
            { text: "4. Timer mechanism in control system" },
            { text: "5. Check if clicking occurs during specific operations" }
          ],
          images: ["/assets/Picture3.png"],
          options: ['Regular clicking during brewing', 'Random clicking sounds', 'Loud mechanical tapping', 'Start basic troubleshooting', 'Contact technician']
        };
      }
      
      if (userTextLower.includes('start basic troubleshooting')) {
        return {
          text: `📝 **Work Order ${workOrderId} - Basic Troubleshooting Protocol**\n\n  **Safe Basic Troubleshooting for ${machineLabel}:**\n\nLet's systematically identify the clicking/tapping source:\n\n**⚙️ STEP-BY-STEP DIAGNOSIS:**`,
          instructions: [
            { text: "1. SAFETY: Turn off machine and let it cool for 5 minutes" },
            { text: "2. VISUAL: Remove any removable panels and inspect for loose screws" },
            { text: "3. LISTEN: Turn machine back on and pinpoint where sound originates" },
            { text: "4. TEST: Try different functions (brew, steam, grind) to isolate the trigger" },
            { text: "5. DOCUMENT: Note when clicking occurs and how frequently" }
          ],
          images: ["/assets/Picture2.png"],
          options: ['Sound comes from control panel', 'Sound from water system', 'Sound from grinding area', 'Multiple sources', 'Issue resolved']
        };
      }
      
      if (userTextLower.includes('regular clicking during brewing')) {
        return {
          text: `📝 **Work Order ${workOrderId} - Normal Operation Confirmed**\n\n✅ **Good News for ${machineLabel}!**\n\nRegular clicking during brewing is **NORMAL** operation:\n\n**🔄 NORMAL BREWING SOUNDS:**`,
          instructions: [
            { text: "✅ Solenoid valves opening/closing for water flow control" },
            { text: "✅ Internal pumps cycling to maintain pressure" },
            { text: "✅ Timer relays switching for brewing sequences" },
            { text: "✅ Temperature control systems activating" },
            { text: "✅ Safety mechanisms engaging during operation" }
          ],
          options: ['Mark work order complete', 'Document as normal operation', 'Schedule routine maintenance', 'Close case', 'Ask another question']
        };
      }
    }
    
    // Handle machine won't start follow-ups
    if (currentIssue === "machine won't start") {
      if (userTextLower.includes('start basic troubleshooting')) {
        return {
          text: `📝 **Work Order ${workOrderId} - Power Troubleshooting**\n\n⚡ **Basic Power Troubleshooting for ${machineLabel}:**\n\nLet's check the power system systematically:\n\n**  POWER SYSTEM CHECKS:**`,
          instructions: [
            { text: "1. POWER SOURCE: Verify outlet has power (test with another device)" },
            { text: "2. POWER CORD: Inspect cord for damage, ensure secure connection" },
            { text: "3. CIRCUIT BREAKER: Check if machine's circuit breaker tripped" },
            { text: "4. POWER SWITCH: Ensure main power switch is fully engaged" },
            { text: "5. INDICATOR LIGHTS: Note any lights that turn on when powered" }
          ],
          images: ["/assets/Picture2.png"],
          options: ['No power at outlet', 'Power cord damaged', 'Lights come on', 'Still no response', 'Machine started working']
        };
      }
    }
    
    // General follow-up options
    if (userTextLower.includes('provide more details')) {
      return {
        text: `📝 **Work Order ${workOrderId} - Gathering Details**\n\n📋 **Detailed Information Request for ${machineLabel}:**\n\nI need more specific information to provide accurate guidance:\n\n**  PLEASE PROVIDE:**`,
        instructions: [
          { text: "1. When did this issue first occur? (Today, yesterday, ongoing?)" },
          { text: "2. What was happening just before the problem started?" },
          { text: "3. Has this machine had any recent maintenance or repairs?" },
          { text: "4. Are there any unusual sounds, smells, or visual indicators?" },
          { text: "5. How often is this machine used daily?" }
        ],
        options: ['Issue started today', 'Ongoing problem', 'After recent maintenance', 'During heavy use period', 'No clear pattern']
      };
    }
    
    if (userTextLower.includes('contact technician') || userTextLower.includes('need technician')) {
      return {
        text: `📝 **Work Order ${workOrderId} - Technician Request**\n\n👨‍🔧 **Professional Technician Needed for ${machineLabel}:**\n\nI'll escalate this to a qualified technician. Here's what I'll include:\n\n**📋 TECHNICIAN BRIEFING:**`,
        instructions: [
          { text: "1. Machine: " + machineLabel },
          { text: "2. Issue: " + currentIssue },
          { text: "3. Symptoms: Clicking/tapping sounds during operation" },
          { text: "4. Troubleshooting completed: Basic diagnostics attempted" },
          { text: "5. Priority: Medium (operational but needs attention)" }
        ],
        options: ['Schedule for today', 'Schedule for tomorrow', 'Urgent - ASAP', 'Add to maintenance queue', 'Mark work order complete']
      };
    }
    
    return null;
  };

  // Generate contextual response based on intent with enhanced conversation flow
  const generateContextualResponse = (userText: string, intent: string): string => {
    const responses = {
      work_orders: `I can help you with work orders! What specifically would you like to do?\n\n• View current work orders\n• Create a new work order\n• Check status of existing orders\n• Update or close work orders\n\nJust let me know what you need!`,

      troubleshooting: `🔧 **AI-Powered Troubleshooting Assistant**\n\nLet me help you diagnose and fix your coffee machine issues! I use advanced AI to guide you through systematic troubleshooting:\n\n**  My Troubleshooting Process:**\n• **Step-by-step diagnostic procedures** tailored to your specific machine\n• **Common issue identification** with instant solutions\n• **Safety protocols and procedures** for safe repair work\n• **When to call for professional help** vs. DIY fixes\n• **Real-time work order creation** during troubleshooting\n• **Photo and video guidance** for complex procedures\n\n**🎯 Tell me about your issue like:**\n• "Machine 001 won't start at all"\n• "Coffee tastes terrible from espresso machine"\n• "Hearing strange grinding noises"\n• "Steam wand not working properly"\n• "Error code E02 showing on display"\n\nI'll ask follow-up questions and guide you through the solution!`,

      maintenance: `🧽 **Comprehensive Maintenance Guidance**\n\nI can guide you through complete maintenance procedures with professional-grade instructions:\n\n**🛠️ Maintenance Services I Provide:**\n• **Daily cleaning routines** - Quick 5-minute procedures\n• **Weekly descaling procedures** - Deep cleaning protocols\n• **Monthly system inspections** - Preventive maintenance checklists\n• **Quarterly overhauls** - Professional-level servicing\n• **Emergency maintenance** - Urgent repair procedures\n• **Seasonal maintenance scheduling** - Automated reminders\n\n**📅 Maintenance Types:**\n• **Preventive** - "Schedule monthly descaling for all machines"\n• **Corrective** - "Fix grinding mechanism in machine 003"\n• **Predictive** - "Check sensor readings and predict failures"\n• **Emergency** - "Urgent repair needed for leaking machine"\n\n**💬 Just ask me:**\n• "How do I clean the espresso machine?"\n• "Show me the descaling procedure"\n• "What maintenance is due this week?"\n• "Create maintenance schedule for new machine"`,

      parts: `🔧 **Intelligent Parts Management System**\n\nI can help you identify, order, and install the right parts with precision:\n\n**🎯 Parts & Components Services:**\n• **Complete parts catalog** with real-time pricing and availability\n• **Compatibility verification** - Ensure parts fit your exact machine model\n• **Installation instructions** with step-by-step photo guides\n• **Maintenance schedules** for optimal replacement timing\n• **Inventory tracking** - Know what parts you have in stock\n• **Supplier recommendations** - Best prices and fastest delivery\n\n**🔍 I can help you:**\n• **Identify needed parts** - "What part is making this noise?"\n• **Check compatibility** - "Will part CM-WF-002 work in machine 001?"\n• **Order supplies** - "Order replacement filter for espresso machine"\n• **Track inventory** - "How many steam valve seals do we have?"\n• **Plan replacements** - "What parts will need replacement soon?"\n\n**💬 Try asking:**\n• "What parts need replacement in machine 002?"\n• "Show me the parts catalog for grinders"\n• "Order water filter for machine 001"\n• "When was the last burr set replaced?"`,

      documentation: `📚 **Comprehensive Technical Documentation Hub**\n\nI have access to extensive documentation and can provide targeted information:\n\n**  Available Resources:**\n• **Interactive maintenance manuals** with searchable procedures\n• **High-definition video tutorials** for complex repairs\n• **Safety procedures and protocols** with OSHA compliance\n• **Technical specifications** for all machine models\n• **Troubleshooting flowcharts** with decision trees\n• **Parts diagrams** with exploded views\n• **Service bulletins** and manufacturer updates\n\n**🎥 Documentation Types:**\n• **Text guides** - Detailed step-by-step procedures\n• **Video tutorials** - Visual demonstrations of repairs\n• **Interactive diagrams** - Clickable parts identification\n• **Safety protocols** - OSHA-compliant procedures\n• **Technical specs** - Detailed machine specifications\n\n**💬 Ask me for:**\n• "Show me the manual for descaling procedure"\n• "Video tutorial for replacing grinder burrs"\n• "Safety procedures for electrical repairs"\n• "Technical specifications for machine 001"`,

      general: `🤖 **AI Coffee Machine Maintenance Assistant**\n\nI understand you mentioned: "${userText}"\n\nI'm your intelligent maintenance assistant with advanced natural language understanding! I can handle complex requests, typos, and conversational input.\n\n**☕ My Core Capabilities:**\n• **🔧 Troubleshooting** - Diagnose and fix issues with AI-guided procedures\n• **🧽 Maintenance** - Complete cleaning, descaling, and preventive care\n• **🔩 Parts Management** - Identify, order, and install replacement components\n• **📋 Work Orders** - Create, track, and manage service requests\n• **📚 Documentation** - Access manuals, guides, and video tutorials\n• **📊 Analytics** - Generate reports and track maintenance metrics\n• **🛡️ Safety** - OSHA-compliant safety procedures and protocols\n\n**🎯 I'm designed for natural conversation, so you can:**\n• Use everyday language - "My coffee machine is acting weird"\n• Make typos - I'll understand "machien wont start" as "machine won't start"\n• Ask follow-up questions - I maintain context throughout our conversation\n• Be specific or general - "Fix machine 001" or "Something's wrong with the grinder"\n\n**💬 Try asking something specific like:**\n• "Machine 001 is making grinding noises and won't brew"\n• "Show me today's work orders and their status"\n• "How do I clean the espresso machine safely?"\n• "What maintenance is overdue for machine 003?"\n\nI'm here to make maintenance simple, safe, and efficient!`
    };

    return responses[intent] || responses.general;
  };

  // Get dynamic response based on issue and machine
  const getDynamicResponse = (issueType: string, machineNumber: string): DynamicResponse => {
    const machineLabel = machineOptionsList.find(m => m.machineNumber === machineNumber)?.label || `Machine #${machineNumber}`;
    
    // Check if we already have an active work order for this conversation
    let workOrder;
    if (activeWorkOrder) {
      // Use existing work order
      workOrder = demoWorkOrders.find(wo => wo.id === activeWorkOrder);
      if (!workOrder) {
        // Fallback if work order not found
        workOrder = createWorkOrderFromChat(machineNumber, issueType, `${issueType} reported on ${machineLabel}`);
        setActiveWorkOrder(workOrder.id);
        
        // Update OpenAI context with active work order
        setOpenAIContext(prev => ({
          ...prev,
          activeWorkOrder: workOrder.id
        }));
      }
    } else {
      // Create new work order for this conversation
      workOrder = createWorkOrderFromChat(machineNumber, issueType, `${issueType} reported on ${machineLabel}`);
      setActiveWorkOrder(workOrder.id);
      
      // Update OpenAI context with active work order
      setOpenAIContext(prev => ({
        ...prev,
        activeWorkOrder: workOrder.id
      }));
      
      // Add to demo work orders list (simulating backend storage)
      if (!demoWorkOrders.find(wo => wo.id === workOrder.id)) {
        demoWorkOrders.unshift(workOrder);
      }
    }
    
    switch (issueType.toLowerCase()) {
      case 'machine won\'t start':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nLet's troubleshoot the startup issue with ${machineLabel}. I've created a high-priority work order and will guide you through a systematic check:\n\n📋 **Immediate Actions:**`,
          instructions: [
            { text: "1. Check power connection - ensure the machine is plugged in securely" },
            { text: "2. Verify the power switch is in the ON position" },
            { text: "3. Check if any indicator lights are showing" },
            { text: "4. Listen for any sounds when pressing the power button" },
            { text: "5. If no response, check circuit breaker and outlet" }
          ],
          images: ["/assets/Picture2.png"],
          options: ['Lights are on but no response', 'No lights at all', 'Makes sounds but won\'t start', 'Issue resolved', 'Need technician']
        };
        
      case 'poor coffee quality':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nCoffee quality issues with ${machineLabel} can affect customer satisfaction. I've logged this as a medium-priority work order. Let's check the most common causes:\n\n☕ **Quality Assessment:**`,
          instructions: [
            { text: "1. Check water level and quality (use filtered water)" },
            { text: "2. Inspect coffee bean freshness and grind size" },
            { text: "3. Verify brewing temperature (195-205°F)" },
            { text: "4. Check for mineral buildup in brewing chamber" },
            { text: "5. Test extraction timing and pressure" }
          ],
          images: ["/assets/Picture3.png"],
          options: ['Coffee tastes weak', 'Coffee tastes bitter', 'Temperature issues', 'All quality checks done', 'Schedule deep cleaning']
        };
        
      case 'water/steam issues':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nWater and steam problems with ${machineLabel} require immediate attention for safety. I've created a high-priority work order. Here's what to check:\n\n💧 **Water System Diagnosis:**`,
          instructions: [
            { text: "1. Check water reservoir level and connections" },
            { text: "2. Inspect steam wand for blockages or mineral buildup" },
            { text: "3. Verify water pump operation and pressure" },
            { text: "4. Check for leaks around connections and seals" },
            { text: "5. Test safety valves and pressure relief" }
          ],
          images: ["/assets/Picture4.png"],
          videos: ["/assets/maintenance-video.mp4"],
          options: ['No water flow', 'Steam not working', 'Water leaking', 'Pump making noise', 'Safety concern']
        };
        
      case 'strange noises':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nUnusual sounds from ${machineLabel} can indicate mechanical issues. I've logged this for investigation. Let's identify the source:\n\n🔊 **Sound Analysis:**`,
          instructions: [
            { text: "1. Listen carefully to identify the type of noise (grinding, squealing, clicking)" },
            { text: "2. Note when the noise occurs (startup, brewing, steaming)" },
            { text: "3. Check for loose components or foreign objects" },
            { text: "4. Inspect moving parts for wear or damage" },
            { text: "5. Record noise pattern for technician review" }
          ],
          options: ['Grinding/scraping sounds', 'High-pitched squealing', 'Clicking or tapping', 'Vibration/rattling', 'Intermittent noise']
        };
        
      case 'error messages':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nError messages on ${machineLabel} provide specific diagnostic information. I've created a high-priority work order. Let's decode what's happening:\n\n⚠️ **Error Diagnosis:**`,
          instructions: [
            { text: "1. Note the exact error code or message displayed" },
            { text: "2. Check the machine's manual for error code meanings" },
            { text: "3. Try a soft reset by turning off and on" },
            { text: "4. Document when the error first appeared" },
            { text: "5. Take photo of error display for technician reference" }
          ],
          options: ['E01 - Water system error', 'E02 - Temperature error', 'E03 - Pump error', 'E04 - Sensor error', 'Other error code']
        };
        
      case 'routine maintenance':
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing maintenance)\n\nExcellent! Regular maintenance keeps ${machineLabel} running smoothly and prevents costly repairs. I've scheduled this as preventive maintenance:\n\n🧹 **Maintenance Schedule:**`,
          instructions: [
            { text: "1. Daily: Empty drip tray and water reservoir cleaning" },
            { text: "2. Weekly: Deep clean brew group and steam wand" },
            { text: "3. Monthly: Descaling and filter replacement" },
            { text: "4. Quarterly: Professional inspection and calibration" },
            { text: "5. Annual: Complete overhaul and part replacement" }
          ],
          images: ["/assets/Picture5.png"],
          options: ['Daily maintenance', 'Weekly cleaning', 'Monthly descaling', 'Quarterly service', 'View maintenance history']
        };
        
      default:
        return {
          text: `✅ **Work Order: ${workOrder.id}** (Continuing troubleshooting)\n\nI'll help you with the ${issueType} issue on ${machineLabel}. A work order has been created and logged in the system. Let me gather some more information to provide the best assistance:\n\n🔍 **Next Steps:**`,
          instructions: [
            { text: "1. Document the current state of the machine" },
            { text: "2. Note any recent changes or unusual events" },
            { text: "3. Check for related symptoms or issues" },
            { text: "4. Gather necessary tools and safety equipment" }
          ],
          options: ['Provide more details', 'Start basic troubleshooting', 'Contact technician', 'View manual', 'Update work order']
        };
    }
  };

  /** For detecting flow from user text */
  const detectFlow = (userText: string): ChatFlow => {
    const lc = userText.toLowerCase();
    if (chatFlow === 'idle') {
      if (lc.includes('see') && lc.includes('work order')) return 'showingWorkOrders';
      if (lc.includes('create') && lc.includes('work order')) return 'creatingWorkOrder';
      if (lc.includes('view') && lc.includes('manual')) return 'showMaintenanceManual';
      if (lc.includes('diagnose')) return 'diagnosingStep1';
      if (lc.includes('help me fix machine')) return 'diagnosingStep1';
      if (lc.includes('how do i fix')) return 'diagnosingStep1';
      return 'other';
    }
    return chatFlow;
  };

  /**
   * Attempt to parse user text for "Add note/photo/video to machine X"
   */
  const tryAddChatDrivenNote = async (userText: string): Promise<boolean> => {
    const pattern = /add\s+(note|photo|video)\s+to\s+machine\s+(\S+)\s*:\s*(.+)/i;
    const match = userText.match(pattern);
    if (!match) {
      return false;
    }

    const noteType = match[1].toLowerCase(); 
    const targetMachine = match[2];
    const noteBody = match[3];

    const modelName = targetMachine;
    const machineNumber = targetMachine;

    let noteContent = noteBody;
    if (noteType === 'photo') {
      noteContent = `PHOTO: ${noteBody}`;
    } else if (noteType === 'video') {
      noteContent = `VIDEO: ${noteBody}`;
    }
    if (demoConfig.isDemo) {
      // Demo mode - simulate saving note
      setTimeout(() => {
        addBotMessage(`✅ Demo: ${noteType.toUpperCase()} note saved for machine "${targetMachine}"\n\nNote: ${noteContent}\n\nIn the real system, this would be saved to the maintenance database and visible under Resource Management => notes folder.`);
      }, 500);
    } else {
      // Real API call for production
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/saveMachineNote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelName: modelName,
            machineNumber: machineNumber,
            noteContent: noteContent
          })
        });
        const data = await response.json();
        if (data.error) {
          addBotMessage(`Error: ${data.error}`);
        } else {
          addBotMessage(
            `Your ${noteType} was saved to machine "${targetMachine}". You can see it under Resource Management => notes folder.`
          );
        }
      } catch (err) {
        console.error('Error saving chat-driven note:', err);
        addBotMessage('Oops, an error occurred while saving your note.');
      }
    }
    return true;
  };

  // ================================================================
  // CORE CHAT HANDLERS
  // ================================================================

  /** The main "Send" function for new chat messages */
  const handleSend = async (voiceText?: string) => {
    const userText = voiceText ? voiceText.trim() : input.trim();
    if (!userText) return;
    setInput('');

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // 1) check for note/photo/video command
    const noteCommandHandled = await tryAddChatDrivenNote(userText);
    if (noteCommandHandled) {
      return;
    }

    // 2) normal flow
    handleWorkOrderFlow(userText);
    handleManualFlow(userText);

    if (chatFlow === 'idle') {
      const newFlow = detectFlow(userText);
      setChatFlow(newFlow);

      if (newFlow === 'showingWorkOrders') {
        // Always use demo data for consistency
        const fetchedOrders = mockWorkOrders;
        setWorkOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          addBotMessage(t('chat.workOrdersPrompt'));
          fetchedOrders.forEach((wo: LocalWorkOrder, i: number) => {
            addBotMessage(`${i + 1}) ${wo.id} - ${wo.task}`);
          });
        } else {
          addBotMessage(t('chat.noWorkOrders'));
        }
        addBotMessage(t('chat.scanQrOption'));
      } else if (newFlow === 'creatingWorkOrder') {
        setCreateWOopen(true);
      } else if (newFlow === 'showMaintenanceManual') {
        showManualTableOfContents();
      } else if (newFlow === 'diagnosingStep1') {
        setChatFlow('diagnosingStep1');
        addBotMessage(t('chat.diagnosingStep1'));
      } else {
        // ENHANCED: Use OpenAI for contextual responses
        setChatFlow('idle');
        setLoadingResponse(true);
        
        try {
          // Update conversation history
          const updatedHistory = [...conversationHistory, { sender: 'user' as const, text: userText, timestamp: new Date().toISOString() }];
          setConversationHistory(updatedHistory);
          
          // Update OpenAI context with user input analysis
          const contextUpdates = updateContextFromMessage(userText, openAIContext);
          const updatedOpenAIContext: OpenAIConversationContext = {
            ...openAIContext,
            ...contextUpdates,
            selectedMachine: contextUpdates.selectedMachine || conversationContext.selectedMachine,
            currentIssue: contextUpdates.currentIssue || conversationContext.currentIssue,
            activeWorkOrder: activeWorkOrder || undefined,
            troubleshootingStep: contextUpdates.troubleshootingStep || troubleshootingStep
          };
          setOpenAIContext(updatedOpenAIContext);
          
          // Also update the local conversation context
          if (contextUpdates.selectedMachine && contextUpdates.selectedMachine !== conversationContext.selectedMachine) {
            setConversationContext(prev => ({ ...prev, selectedMachine: contextUpdates.selectedMachine }));
          }
          if (contextUpdates.currentIssue && contextUpdates.currentIssue !== conversationContext.currentIssue) {
            setConversationContext(prev => ({ ...prev, currentIssue: contextUpdates.currentIssue }));
          }
          
          // Get OpenAI response with full context
          const openAIResponse = await getOpenAIResponse(userText, updatedHistory, updatedOpenAIContext);
          
          // Add bot response to conversation history
          const botMessage = { sender: 'bot' as const, text: openAIResponse.text, timestamp: new Date().toISOString() };
          setConversationHistory(prev => [...prev, botMessage]);
          
          // Update conversation memory with both user input and AI response
          updateConversationMemory(userText, openAIResponse.text);
          
          // Send the contextual response
          addBotMessage(
            openAIResponse.text, 
            openAIResponse.images || [], 
            [], // videos
            [], // instructions
            openAIResponse.options || []
          );
          
          // Update current options for button interactions
          if (openAIResponse.options) {
            setCurrentOptions(openAIResponse.options);
          }
          
          // Handle any required actions
          if (openAIResponse.requiresAction) {
            // Could trigger specific UI states based on response
            if (openAIResponse.text.toLowerCase().includes('select') && openAIResponse.text.toLowerCase().includes('machine')) {
              addMachineSelectionMessage();
            }
          }
          
        } catch (error) {
          console.error('Error getting OpenAI response:', error);
          
          // Fallback to enhanced demo responses
          setTimeout(() => {
            const userTextLower = userText.toLowerCase();
            
            // Update conversation memory first
            updateConversationMemory(userText, '');
            
            // Check if we're in an active troubleshooting session
            if (activeWorkOrder && conversationContext.troubleshootingFlow) {
              const contextualResponse = handleContextualFollowUp(userText, activeWorkOrder);
              if (contextualResponse) {
                addBotMessage(contextualResponse.text, contextualResponse.images, contextualResponse.videos, contextualResponse.instructions, contextualResponse.options);
                setLoadingResponse(false);
                return;
              }
            }
            
            // Handle quick demo action buttons
            if (currentOptions.includes(userText)) {
              setCurrentOptions([]);
              setShowIssueTypeButtons(false);
              
              // If we're in troubleshooting mode with an active work order, handle contextually
              if (activeWorkOrder && conversationContext.troubleshootingFlow) {
                const contextualResponse = handleContextualFollowUp(userText, activeWorkOrder);
                if (contextualResponse) {
                  addBotMessage(contextualResponse.text, contextualResponse.images, contextualResponse.videos, contextualResponse.instructions, contextualResponse.options);
                  setLoadingResponse(false);
                  return;
                }
              }
              
              switch (userText) {
                case '🔧 Troubleshoot Machine 001':
                  setConversationContext({ selectedMachine: '001', troubleshootingFlow: true });
                  const troubleshootResponse = getDynamicResponse('Machine won\'t start', '001');
                  addBotMessage(troubleshootResponse.text, troubleshootResponse.images, troubleshootResponse.videos, troubleshootResponse.instructions, troubleshootResponse.options);
                  setLoadingResponse(false);
                  return;
                  
                case '📋 Show Work Orders':
                  const workOrdersWithButtons = demoWorkOrders.slice(0, 3).map((wo, index) => {
                    const relatedLog = getRelatedLog(wo.id);
                    const hasRelatedLog = relatedLog !== null;
                    
                    return `${index + 1}. **${wo.id}** - ${wo.task}\n   📍 ${wo.location} | ⏰ ${wo.status} | 🔧 ${wo.assignedTo}${hasRelatedLog ? '\n   📝 Related maintenance log available' : ''}`;
                  }).join('\n\n');
                  
                  const workOrderButtons = demoWorkOrders.slice(0, 3).reduce((buttons: string[], wo) => {
                    const relatedLog = getRelatedLog(wo.id);
                    if (relatedLog) {
                      buttons.push(`View Log for ${wo.id}`);
                    }
                    return buttons;
                  }, []);
                  
                  addBotMessage(
                    `📋 **Current Work Orders (${demoWorkOrders.length} active)**\n\n${workOrdersWithButtons}\n\n💬 **Try saying:**\n• "Show details for ${demoWorkOrders[0].id}"\n• "Create new work order for machine 002"\n• "Update work order with completion notes"`,
                    undefined,
                    undefined,
                    undefined,
                    workOrderButtons.length > 0 ? workOrderButtons : undefined
                  );
                  setLoadingResponse(false);
                  return;
                  
                case '🧽 Maintenance Guide':
                  addBotMessage(
                    `🧽 **Interactive Maintenance Guide**\n\n**📅 Today's Scheduled Maintenance:**\n• Machine 001: Daily cleaning (Due now)\n• Machine 003: Weekly descaling (Overdue by 2 days)\n• Machine 002: Filter replacement (Due tomorrow)\n\n**🔧 Step-by-Step Procedures:**\n• **Daily Cleaning** - 5 minutes per machine\n• **Weekly Descaling** - 30 minutes deep clean\n• **Monthly Inspection** - Complete system check\n\n💬 **Try asking:**\n• "How do I clean machine 001?"\n• "Show descaling procedure"\n• "What maintenance is overdue?"`
                  );
                  setLoadingResponse(false);
                  return;
                  
                case '🔍 Equipment List':
                  const response = generateMachineListResponse();
                  addBotMessage(response.text, response.images, response.videos);
                  setLoadingResponse(false);
                  return;
                  
                case '⚡ Typo Test: "machien broke"':
                  // Simulate typo processing
                  addBotMessage("🔍 **Processing:** 'machien broke'\n\n✅ **Understood as:** 'machine broke'\n\n🤖 **AI Recognition Process:**\n• Detected typo in 'machien' → corrected to 'machine'\n• Identified intent: troubleshooting request\n• Context: equipment malfunction\n\n🛠️ **Response:** Which machine is broken? I can help you troubleshoot the issue step by step. Please select the machine or tell me more about what's happening.");
                  
                  setTimeout(() => {
                    addBotMessage(
                      "This demonstrates my advanced typo recognition system that can understand:\n• Common misspellings\n• Phonetic variations\n• Missing letters\n• Swapped characters\n• Shortened words\n\n💬 **Try more typos like:**\n• 'cofee tastes bd'\n• 'grindor makng strang noise'\n• 'ned halp with maintance'",
                      [],
                      [],
                      [],
                      ['Try: "cofee tastes bd"', 'Try: "grindor noise"', 'Try: "ned halp"']
                    );
                  }, 2000);
                  setLoadingResponse(false);
                  return;
              }
            }
            
            // Handle typo demonstration requests
            if (userText.includes('cofee tastes bd') || userText.includes('coffee tastes bad')) {
              addBotMessage("🔍 **Processed:** 'cofee tastes bd' → 'coffee tastes bad'\n\n☕ **Coffee Quality Issue Detected**\n\nLet me help you improve the coffee quality! This is usually related to:\n• Water temperature (should be 195-205°F)\n• Grind size (too fine = bitter, too coarse = weak)\n• Bean freshness (use within 2 weeks of roasting)\n• Extraction time (20-30 seconds for espresso)\n\nWhich machine is having taste issues? I'll guide you through quality diagnostics.");
              setLoadingResponse(false);
              return;
            }
            
            if (userText.includes('grindor') || userText.includes('grinder')) {
              addBotMessage("🔍 **Processed:** 'grindor makng noise' → 'grinder making noise'\n\n🔊 **Grinder Noise Diagnosis**\n\nUnusual grinder sounds can indicate:\n• Worn burr sets (grinding/scraping sound)\n• Foreign object in grinding chamber (clicking)\n• Motor bearing wear (high-pitched whine)\n• Loose components (rattling)\n\nLet me guide you through grinder troubleshooting. Which machine's grinder is making noise?");
              setLoadingResponse(false);
              return;
            }
            
            if (userText.includes('ned halp') || userText.includes('need help')) {
              addBotMessage("🔍 **Processed:** 'ned halp with maintance' → 'need help with maintenance'\n\n🛠️ **Maintenance Assistance Menu**\n\nI can help you with:\n• **Routine Maintenance** - Daily, weekly, monthly procedures\n• **Troubleshooting** - Diagnose and fix issues\n• **Work Orders** - Create and track service requests\n• **Parts & Supplies** - Identify and order components\n• **Safety Procedures** - OSHA-compliant protocols\n\nWhat specific maintenance help do you need today?");
              setLoadingResponse(false);
              return;
            }
            
            // Use conversation memory for better context
            const enhancedUserText = userText + (conversationMemory.lastMentionedMachine ? ` (machine: ${conversationMemory.lastMentionedMachine})` : '');
            
            // Check for dynamic conversation triggers with memory context
            const needsMachineSelection = (
              userTextLower.includes('fix') ||
              userTextLower.includes('repair') ||
              userTextLower.includes('issue') ||
              userTextLower.includes('problem') ||
              userTextLower.includes('troubleshoot') ||
              userTextLower.includes('broken') ||
              userTextLower.includes('not working') ||
              userTextLower.includes('help with machine') ||
              userTextLower.includes('maintenance on') ||
              userTextLower.includes('whats wrong') ||
              userTextLower.includes('what wrong') ||
              userTextLower.includes('weird noise') ||
              userTextLower.includes('strange noise')
            ) && !conversationMemory.lastMentionedMachine;
            
            if (needsMachineSelection && !conversationContext.selectedMachine) {
              addMachineSelectionMessage();
              setLoadingResponse(false);
              return;
            }
            
            // Use enhanced response matching with conversation memory
            let response = findBestResponse(enhancedUserText);
            
            // Add conversation context to responses
            if (response && conversationMemory.lastMentionedMachine) {
              if (response.text && !response.text.includes('machine')) {
                response = {
                  ...response,
                  text: `🔄 **Continuing with Machine ${conversationMemory.lastMentionedMachine}**\n\n${response.text}\n\n💡 *I remembered we were discussing Machine ${conversationMemory.lastMentionedMachine} from our previous conversation.*`
                };
              }
            }
            
            // Fallback responses if no match found with enhanced natural conversation
            if (!response) {
              if (userTextLower.includes('hello') || userTextLower.includes('hi') || userTextLower.includes('hey')) {
                response = {
                  text: `Hi there! 👋 \n\n${conversationMemory.recentTopics.length > 0 ? 
                    `Good to see you again! We were talking about ${conversationMemory.recentTopics[0]}. ` : 
                    'Welcome to the AI Maintenance Assistant! '}\n\nHow can I help you today? I can assist with troubleshooting, maintenance procedures, work orders, or just answer questions about your coffee machines.`,
                  images: [],
                  videos: [],
                  options: ['🔧 Troubleshoot an issue', '🧽 Maintenance guidance', '📋 View work orders', '🔍 Equipment info']
                };
              } else if (userTextLower.includes('thank') || userTextLower.includes('thanks')) {
                response = {
                  text: `You're welcome! 😊 I'm here whenever you need help with your coffee equipment. Is there anything else I can assist you with?`,
                  images: [],
                  videos: [],
                  options: ['🔧 Other issues?', '📋 Check work orders', '🧽 Maintenance tips', '✅ All done for now']
                };
              } else if (userTextLower.includes('how are you') || userTextLower.includes('how do you do')) {
                response = {
                  text: `I'm doing great, thanks for asking! 🤖 I'm here and ready to help with all your coffee machine maintenance needs. What's going on with your equipment today?`,
                  images: [],
                  videos: [],
                  options: ['🔧 Need troubleshooting help', '📋 Check work orders', '🧽 Maintenance guidance', '💬 Just chatting']
                };
              } else if (userTextLower.includes('bye') || userTextLower.includes('goodbye') || userTextLower.includes('see you')) {
                response = {
                  text: `Goodbye! 👋 Take care, and don't hesitate to come back if you need any help with your coffee machines. Have a great day!`,
                  images: [],
                  videos: []
                };
              } else {
                // For general conversation, provide natural responses instead of immediately suggesting work orders
                const intent = detectUserIntent(userText);
                
                // Only create work orders for actual maintenance issues, not general questions
                if (intent === 'troubleshooting' && (userTextLower.includes('broken') || userTextLower.includes('not working') || userTextLower.includes('problem') || userTextLower.includes('issue'))) {
                  const contextualResponse = generateContextualResponse(userText, intent);
                  response = {
                    text: contextualResponse,
                    images: [],
                    videos: [],
                    options: ['🔧 Start troubleshooting', '📋 Create work order', '💬 Tell me more', '📞 Call technician']
                  };
                } else {
                  // Natural conversation for informational queries
                  response = {
                    text: `I understand you mentioned: "${userText}"\n\nI'm here to help with coffee machine maintenance! ${conversationMemory.lastMentionedMachine ? 
                      `Since we were discussing Machine ${conversationMemory.lastMentionedMachine}, ` : 
                      ''} what would you like to know?\n\n💬 I can help you with:\n• Troubleshooting specific issues\n• Maintenance procedures and schedules\n• Work order management\n• Equipment information and manuals`,
                    images: [],
                    videos: [],
                    options: ['🔧 Troubleshoot issue', '🧽 Maintenance help', '📋 Work orders', '🔍 Equipment info']
                  };
                }
              }
            }
            
            // Send the response with all available media and options
            addBotMessage(response.text, response.images, response.videos, response.instructions, response.options);
            setLoadingResponse(false);
          }, demoConfig.aiResponseConfig.responseDelay);
        }
        
        setLoadingResponse(false);
      }
    }
  };

  /** Optional: speech recognition */
  const startVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('chat.speechNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let transcriptAccum = "";

    recognition.onresult = (event: any) => {
      transcriptAccum = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcriptAccum += event.results[i][0].transcript;
      }
      setInput(transcriptAccum);
      if (event.results[event.results.length - 1].isFinal) {
        handleSend(transcriptAccum);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      alert(t('chat.speechRecognitionError', { error: event.error }));
    };

    recognition.onend = () => {
      if (transcriptAccum.trim() !== "") {
        handleSend(transcriptAccum);
      }
    };

    recognition.start();
  };

  const handleImageClick = (img: string) => {
    setSelectedImage(img);
  };

  /** The “Work Order flow” steps */
  const handleWorkOrderFlow = (userText: string) => {
    if (chatFlow === 'showingWorkOrders') {
      const chosen = parseWorkOrderSelection(userText);
      if (!chosen) return;
      selectWorkOrder(chosen);
      return;
    }
    if (chatFlow === 'selectedWorkOrder') {
      setMachineNumber(userText);
      setChatFlow('verifyingMachine');
      addBotMessage(t('chat.machineRecorded', { number: userText }));
      return;
    }
    if (chatFlow === 'verifyingMachine') {
      return;
    }
    if (chatFlow === 'safeHandling') {
      return;
    }
    if (chatFlow === 'showInstructions') {
      return;
    }
    if (chatFlow === 'showPastLogs') {
      return;
    }
    if (chatFlow === 'showParts') {
      return;
    }
    if (chatFlow === 'finalNotes') {
      setFinalNotes(userText);
      setChatFlow('downloadDocs');
      addBotMessage(t('chat.finalNotesRecorded'));
      return;
    }
    if (chatFlow === 'downloadDocs') {
      if (userText.toLowerCase().includes('download')) {
        generatePDF();
        setChatFlow('idle');
      } else {
        addBotMessage(t('chat.workflowCompletedNoDownload'));
        setChatFlow('idle');
      }
      return;
    }
  };

  /** The “Manual flow” steps */
  const handleManualFlow = (userText: string) => {
    if (chatFlow === 'showMaintenanceManual') {
      const foundSection = coffeeManualSections.find(sec =>
        sec.title.toLowerCase().includes(userText.toLowerCase())
      );
      if (foundSection) {
        setSelectedManualSection(foundSection);
        setChatFlow('viewingManualSection');
        addBotMessage(t('chat.selectedManualSection', { title: foundSection.title }));
      }
      if (userText.toLowerCase().includes('parts')) {
        setChatFlow('viewingPartsListSection');
        addBotMessage(t('chat.viewingPartsListSectionPrompt'));
      }
      return;
    }
    if (chatFlow === 'viewingManualSection') {
      if (userText.toLowerCase().includes('back')) {
        showManualTableOfContents();
      }
      return;
    }
    if (chatFlow === 'viewingPartsListSection') {
      const foundPart = coffeePartsListFromManual.find(p =>
        p.name.toLowerCase().includes(userText.toLowerCase())
      );
      if (foundPart) {
        // Create a manual section from the part for display consistency
        const partSection = {
          id: foundPart.partNumber,
          title: foundPart.name,
          content: [
            `Part Number: ${foundPart.partNumber}`,
            `Category: ${foundPart.category}`,
            `Description: ${foundPart.description}`,
            `Replacement Interval: ${foundPart.replacementInterval}`,
            `Price: ${foundPart.price}`
          ]
        };
        setSelectedPartsList(partSection);
        addBotMessage(t('chat.selectedPartsList', { title: foundPart.name }));
      }
      if (userText.toLowerCase().includes('back')) {
        showManualTableOfContents();
      }
      return;
    }
  };

  const parseWorkOrderSelection = (userText: string): LocalWorkOrder | null => {
    const lc = userText.toLowerCase();
    const num = parseInt(lc, 10);
    if (!isNaN(num) && num > 0 && num <= workOrders.length) {
      return workOrders[num - 1];
    }
    const found = workOrders.find((wo) => wo.id.toLowerCase() === lc);
    return found || null;
  };

  // When a work order is selected, populate the chat with details and reset chat flow.
  const selectWorkOrder = (wo: LocalWorkOrder) => {
    setSelectedWO(wo);
    setChatFlow('idle');
    const workOrderDetails = `Work Order Selected:
ID: ${wo.id}
Task: ${wo.task}
Time Spent: ${wo.timeSpent}
Steps: ${wo.steps}
Parts Used: ${wo.partsUsed}
Comments: ${wo.comments}`;
    addBotMessage(workOrderDetails);
  };

  /** Generate PDF of the steps */
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(t('chat.pdfReportTitle'), 10, 10);
    if (selectedWO) {
      doc.text(`${t('chat.workOrder')}: ${selectedWO.id}`, 10, 20);
      doc.text(`${t('chat.task')}: ${selectedWO.task}`, 10, 26);
      doc.text(`${t('chat.machineNumber')}: ${machineNumber}`, 10, 32);
    }
    let yPos = 40;
    doc.text(t('chat.safetyChecks') + ':', 10, yPos);
    yPos += 6;
    safetyChecks.forEach((s) => {
      doc.text(`- [${s.checked ? 'X' : ' '}] ${s.label}`, 10, yPos);
      yPos += 6;
    });
    yPos += 4;
    doc.text(t('chat.partsReplaced') + ':', 10, yPos);
    yPos += 6;
    parts.forEach((p) => {
      doc.text(`- [${p.selected ? 'X' : ' '}] ${p.name} (${t('chat.lastReplaced')}: ${p.lastReplaced})`, 10, yPos);
      yPos += 6;
    });
    yPos += 4;
    doc.text(`${t('chat.finalNotes')}: ${finalNotes}`, 10, yPos);
    doc.save('WorkOrderReport.pdf');
    addBotMessage(t('chat.pdfDownloaded'));
  };

  /** Create new Work Order */
  const handleCreateWorkOrder = async () => {
    if (!newWOForm.id || !newWOForm.dateIssued) {
      alert(t('chat.fillRequiredWOFields'));
      return;
    }
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/saveWorkOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWOForm)
      });
      const result = await response.json();
      if (result.error) {
        alert(result.error);
      } else {
        addBotMessage(t('chat.workOrderCreated', { workOrder: JSON.stringify(result.workOrder, null, 2) }));
      }
    } catch (err) {
      console.error('Error saving work order:', err);
      alert(t('chat.errorSavingWO'));
    }
    setChatFlow('idle');
    setCreateWOopen(false);
    setNewWOForm({
      id: '',
      dateIssued: '',
      priority: '',
      location: '',
      asset: '',
      description: '',
      requestedBy: '',
      assignedTo: '',
      dueDate: '',
      materials: '',
      additionalNotes: ''
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleSafetyCheck = (index: number) => {
    const updated = [...safetyChecks];
    updated[index].checked = !updated[index].checked;
    setSafetyChecks(updated);
  };

  const handleTogglePart = (index: number) => {
    const updated = [...parts];
    updated[index].selected = !updated[index].selected;
    setParts(updated);
  };

  const handleQuickLinkClick = (slideIndex: number, image: string) => {
    sliderRef.current?.slickGoTo(slideIndex);
    setSelectedImage(image);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // ================================================================
  // UI INTERACTION HANDLERS
  // ================================================================

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCreateHelp = () => {
    alert(t('chat.createHelpRequest'));
    handleMenuClose();
  };
  const handleVideoMeeting = () => {
    alert(t('chat.scheduleVideoMeeting'));
    handleMenuClose();
  };
  const handleSendFeedback = () => {
    alert(t('chat.sendFeedback'));
    handleMenuClose();
  };

  /**
   * Modified camera icon click so it triggers file input on mobile.
   */
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * When user picks an image or video from file input (mobile camera or local file),
   * we upload it to the server, then store a note referencing that media.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    // Clear the input so if user picks the same file again, we can handle it.
    e.target.value = '';

    try {
      // 1) Upload the file to the server
      const formData = new FormData();
      formData.append('file', file);
      // We'll also pass the model and machine number so the back end knows where to store
      const storedMachineModel = localStorage.getItem('currentMachineModel') || 'GenericModel';
      const storedMachineNum = localStorage.getItem('currentMachineNumber') || 'GenericNumber';
      formData.append('modelName', storedMachineModel);
      formData.append('machineNumber', storedMachineNum);

      const uploadRes = await fetch(`${REACT_APP_API_BASE_URL}/api/uploadChatMedia`, {
        method: 'POST',
        body: formData
      });
      let uploadData;
      try {
        uploadData = await uploadRes.json();
      } catch (jsonError) {
        const textResponse = await uploadRes.text();
        try {
          uploadData = JSON.parse(textResponse);
        } catch (e) {
          // If parsing still fails, assume the response text is the fileUrl
          uploadData = { fileUrl: textResponse };
        }
      }
      
      if (uploadData.error) {
        console.error('Media upload error:', uploadData.error);
        addBotMessage(`Error uploading media: ${uploadData.error}`);
        return;
      }

      // 2) Now that the file is stored in S3, create a note referencing the path
      // so it shows up in the relevant machine's notes. We'll pass "PHOTO:" or "VIDEO:".
      let prefix = 'PHOTO:';
      if (file.type.includes('video')) {
        prefix = 'VIDEO:';
      }
      const noteResponse = await fetch(`${REACT_APP_API_BASE_URL}/api/saveMachineNote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: storedMachineModel,
          machineNumber: storedMachineNum,
          noteContent: `${prefix} ${uploadData.fileUrl}`
        })
      });
      const noteData = await noteResponse.json();
      if (noteData.error) {
        console.error('Error saving note for uploaded media:', noteData.error);
        addBotMessage(`Error saving note: ${noteData.error}`);
        return;
      }

      // 3) Display a short message in the chat so user sees it's done
      if (prefix === 'PHOTO:') {
        setMessages(prev => [
          ...prev,
          {
            sender: 'user',
            text: t('chat.photoUploaded'),
            images: [uploadData.fileUrl]
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'user',
            text: t('chat.videoUploaded'),
            videos: [uploadData.fileUrl]
          }
        ]);
      }
      addBotMessage(t('chat.mediaSavedNote'));
    } catch (err) {
      console.error('Error uploading media from chat:', err);
      addBotMessage('An error occurred while uploading media.');
    }
  };

  const handleQRCodeClick = () => {
    if (isMobile) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!devices || devices.length === 0) {
            alert(t('chat.noCamerasFound'));
            return;
          }
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back'));
          const cameraId = backCam ? backCam.id : devices[0].id;
          setSelectedCameraId(cameraId);
          setQrScannerOpen(true);
        })
        .catch((err) => {
          console.error('getCameras() error:', err);
          alert(t('chat.cannotAccessCameras'));
        });
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: t('chat.qrScannedDesktop') },
        { sender: 'bot', text: t('chat.scanCompletePlaceholder') }
      ]);
    }
  };

  useEffect(() => {
    if (qrScannerOpen && selectedCameraId) {
      const html5QrCode = new Html5Qrcode('qr-reader');
      // Removing the qrbox option to use the full camera preview
      const config = {
        fps: 10,
      };

      html5QrCode
        .start(
          selectedCameraId,
          config,
          (decodedText) => {
            setQrScannerOpen(false);
            // Handle the decoded text as needed
            setMessages(prev => [
              ...prev,
              { sender: 'user', text: `Scanned QR => ${decodedText}` }
            ]);
          },
          (error) => {
            console.error('QR scanning error:', error);
          }
        )
        .catch((err) => {
          console.error('Camera start error:', err);
          alert('Could not start QR camera.');
        });

      return () => {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch((err) => console.error('Failed to stop html5Qrcode:', err));
      };
    }
  }, [qrScannerOpen, selectedCameraId]);

  const showManualTableOfContents = () => {
    setChatFlow('showMaintenanceManual');
    setSelectedManualSection(null);
    setSelectedPartsList(null);
    
    // Build the table of contents message with coffee manual sections
    let tocMessage = `📖 **Coffee Machine Maintenance Manual - Table of Contents**\n\nSelect a section by typing its name:\n\n`;
    
    coffeeManualSections.forEach((section, index) => {
      tocMessage += `${index + 1}. **${section.title}**\n`;
    });
    
    tocMessage += `\n💡 **Additional Options:**\n`;
    tocMessage += `• Type "parts" to view parts list\n`;
    tocMessage += `• Type "back" to return to main chat\n\n`;
    tocMessage += `**Available Sections:**\n`;
    
    coffeeManualSections.forEach((section) => {
      tocMessage += `• ${section.title}\n`;
    });
    
    addBotMessage(tocMessage);
  };

  const resetFlow = () => {
    setChatFlow('idle');
    setSelectedWO(null);
    setMachineNumber('');
    setSafetyChecks(initialSafetyChecks);
    setParts(initialParts);
    setFinalNotes('');
    // Reset conversation context
    setConversationContext({});
    
    // Reset OpenAI conversation context and history
    setOpenAIContext({ sessionId: sessionId });
    setConversationHistory([]);
    
    setActiveWorkOrder(null);
    setTroubleshootingStep(0);
    setShowIssueTypeButtons(false);
    setCurrentOptions([]);
    addBotMessage(t('chat.flowReset'));
  };

  // ================================================================
  // WORK ORDER-LOG MANAGEMENT FUNCTIONS
  // ================================================================

  /**
   * Handle viewing related log for a work order
   */
  const handleViewRelatedLog = (workOrder: WorkOrder) => {
    const relatedLog = getRelatedLog(workOrder.id);
    if (relatedLog) {
      setSelectedWorkOrderForLog(workOrder);
      setSelectedLog(relatedLog);
      setShowLogDetails(true);
      
      // Display log details in chat
      const logMessage = `📋 **${t('workOrderLog.logDetails')}**\n\n` +
        `**${t('workOrderLog.relatedWorkOrder')}:** ${workOrder.id} - ${workOrder.task}\n\n` +
        `**${t('workOrderLog.logDetails')}:**\n` +
        `• **${t('workOrderLog.machineId')}:** ${relatedLog.machineId || 'N/A'}\n` +
        `• **${t('workOrderLog.technician')}:** ${relatedLog.technician}\n` +
        `• **${t('workOrderLog.duration')}:** ${relatedLog.duration}\n` +
        `• **${t('workOrderLog.priority')}:** ${relatedLog.priority || 'N/A'}\n` +
        `• **${t('workOrderLog.type')}:** ${relatedLog.type || 'N/A'}\n` +
        `• **${t('workOrderLog.cost')}:** ${relatedLog.cost || 'N/A'}\n\n` +
        `**Summary:** ${relatedLog.summary}\n\n` +
        `**Issues:** ${relatedLog.issues}\n\n` +
        (relatedLog.partsUsed && relatedLog.partsUsed.length > 0 ? 
          `**${t('workOrderLog.partsUsed')}:**\n${relatedLog.partsUsed.map(part => `• ${part}`).join('\n')}\n\n` : '') +
        (relatedLog.steps && relatedLog.steps.length > 0 ? 
          `**${t('workOrderLog.stepsPerformed')}:**\n${relatedLog.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` : '') +
        (relatedLog.recommendations ? `**${t('workOrderLog.recommendations')}:** ${relatedLog.recommendations}\n\n` : '') +
        (relatedLog.followUpRequired ? 
          `**${t('workOrderLog.followUpRequired')}:** Yes${relatedLog.followUpDate ? ` (${relatedLog.followUpDate})` : ''}\n\n` : '');
      
      addBotMessage(logMessage, [], [], [], [
        t('workOrderLog.downloadLog'),
        t('workOrderLog.generateAIReport')
      ]);
    } else {
      addBotMessage(`❌ ${t('workOrderLog.logNotFound')} ${workOrder.id}`);
    }
  };

  /**
   * Handle downloading individual log as PDF
   */
  const handleDownloadLog = () => {
    if (selectedLog) {
      downloadLogPDF(selectedLog, currentLanguage);
      addBotMessage(`✅ ${t('workOrderLog.downloadLog')} ${selectedLog.id} downloaded successfully.`);
    }
  };

  /**
   * Handle generating AI report for work order and log
   */
  const handleGenerateAIReport = async () => {
    if (!selectedWorkOrderForLog) return;
    
    setAiReportGenerating(true);
    addBotMessage(`🤖 ${t('workOrderLog.aiReportGenerating')}`);
    
    try {
      const reportContent = await generateAIReport(selectedWorkOrderForLog, selectedLog, currentLanguage);
      
      // Display the AI report in chat
      const reportMessage = `🤖 **AI-Generated Maintenance Report**\n\n${reportContent}`;
      addBotMessage(reportMessage, [], [], [], [t('workOrderLog.downloadReport')]);
      
      setAiReportGenerating(false);
      addBotMessage(`✅ ${t('workOrderLog.aiReportReady')}`);
    } catch (error) {
      console.error('Error generating AI report:', error);
      setAiReportGenerating(false);
      addBotMessage(`❌ Error generating AI report. Please try again.`);
    }
  };

  /**
   * Handle downloading AI report as PDF
   */
  const handleDownloadAIReport = async () => {
    if (!selectedWorkOrderForLog) return;
    
    try {
      const reportContent = await generateAIReport(selectedWorkOrderForLog, selectedLog, currentLanguage);
      downloadAIReportPDF(reportContent, selectedWorkOrderForLog, currentLanguage);
      addBotMessage(`✅ AI Report for ${selectedWorkOrderForLog.id} downloaded successfully.`);
    } catch (error) {
      console.error('Error downloading AI report:', error);
      addBotMessage(`❌ Error downloading AI report. Please try again.`);
    }
  };

  // ======== NEW FUNCTION: Save note from dialog using confirmed machine (dropdown) ========
  const handleSaveNote = async () => {
    // Combine the original message with additional note text.
    const noteContent = `Original Message: ${selectedNoteMessage}\nAdditional Note: ${additionalNote}`;
    
    // Use the confirmed machine from dropdown
    const modelName = localStorage.getItem('currentMachineModel') || 'Coffee Machine CM-2000';
    const machineNumberToUse = confirmMachine || 'CM-2000-001';

    if (demoConfig.isDemo) {
      // Demo mode - simulate saving note
      setTimeout(() => {
        addBotMessage(`✅ Demo: Note saved for machine "${machineNumberToUse}"\n\nNote content: ${noteContent}\n\nIn the real system, this would be saved to the maintenance database and visible in Resource Management.`);
      }, 500);
    } else {
      // Real API call for production
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/saveMachineNote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelName,
            machineNumber: machineNumberToUse,
            noteContent
          })
        });
        const data = await response.json();
        if (data.error) {
          addBotMessage(`Error saving note: ${data.error}`);
        } else {
          addBotMessage(`Note saved for machine "${machineNumberToUse}". Check the notes folder in Resource Management.`);
        }
      } catch (err) {
        console.error('Error saving note:', err);
        addBotMessage('Oops, an error occurred while saving your note.');
      }
    }
    // Reset dialog state
    setNoteDialogOpen(false);
    setAdditionalNote('');
  };

  // ================================================================
  // COMPONENT RENDER
  // ================================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 30s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 6,
        pb: 6,
        px: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
        '@keyframes gradientShift': {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        }
      }}
    >
      {/* Enhanced Modern Header with Floating Animation */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          maxWidth: '800px',
          position: 'relative',
          zIndex: 2,
          animation: 'floatIn 1.5s ease-out',
          '@keyframes floatIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-30px) scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            }
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              right: '-20px',
              bottom: '-20px',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              borderRadius: '30px',
              filter: 'blur(20px)',
              zIndex: -1,
            }
          }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 3,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.1)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)',
                borderRadius: '2px',
              }
            }}
          >
            {t('chatInterface.title')}
          </Typography>
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'rgba(30, 41, 59, 0.8)',
            maxWidth: '700px',
            mx: 'auto',
            fontWeight: 300,
            lineHeight: 1.7,
            fontSize: { xs: '1.1rem', md: '1.4rem' },
            textShadow: '0 2px 10px rgba(0,0,0,0.05)',
            animation: 'fadeInUp 1.8s ease-out 0.3s both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              }
            }
          }}
        >
          {t('chatInterface.subtitle')}
          <br />
          <Box component="span" sx={{ 
            color: 'rgba(30, 41, 59, 0.6)',
            fontSize: '0.9em',
            fontStyle: 'italic'
          }}>
            {t('chatInterface.callToAction')}
          </Box>
        </Typography>
      </Box>

      {/* Advanced Chat Container with Sophisticated Glassmorphism */}
      <Box
        sx={{
          width: { xs: '95%', sm: '90%', md: '1000px' },
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 0 0 1px rgba(148, 163, 184, 0.1)
          `,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideInUp 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: '24px',
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `
              0 40px 80px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9),
              0 0 0 1px rgba(59, 130, 246, 0.2)
            `,
          },
          '@keyframes slideInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(50px) scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            }
          }
        }}
      >
        {/* Enhanced Chat Messages Area with Advanced Scrolling */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 4,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '20px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '20px',
              background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(148, 163, 184, 0.1)',
              borderRadius: '10px',
              margin: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.6))',
              borderRadius: '10px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.8))',
              }
            },
          }}
        >
        <List sx={{ position: 'relative' }}>
          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              <div
                onMouseEnter={() => setHoveredMessageIndex(i)}
                onMouseLeave={() => setHoveredMessageIndex(null)}
                style={{ 
                  position: 'relative',
                  animation: `messageSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s both`
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(59, 130, 246, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(34, 197, 94, 0.15) 50%, rgba(245, 158, 11, 0.1) 100%)',
                    border: msg.sender === 'user' 
                      ? '1px solid rgba(99, 102, 241, 0.3)' 
                      : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: msg.sender === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
                    marginBottom: 3,
                    padding: '20px 24px',
                    color: 'rgba(30, 41, 59, 0.95)',
                    position: 'relative',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(245, 158, 11, 0.05))',
                      borderRadius: 'inherit',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    },
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.02)',
                      background: msg.sender === 'user' 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(59, 130, 246, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(34, 197, 94, 0.25) 50%, rgba(245, 158, 11, 0.2) 100%)',
                      boxShadow: msg.sender === 'user' 
                        ? '0 20px 40px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.4)'
                        : '0 20px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.4)',
                      '&::before': {
                        opacity: 1,
                      }
                    },
                    '@keyframes messageSlideIn': {
                      '0%': {
                        opacity: 0,
                        transform: msg.sender === 'user' ? 'translateX(50px)' : 'translateX(-50px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateX(0)',
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mb: 1
                      }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: msg.sender === 'user' 
                              ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                              : 'linear-gradient(45deg, #10b981, #f59e0b)',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.5 }
                            }
                          }}
                        />
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {msg.sender === 'bot' ? 'AI Assistant' : 'You'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            color: '#1e293b',
                            fontSize: '1rem',
                            lineHeight: 1.6,
                            fontWeight: 400
                          }}
                        >
                          {msg.text}
                        </Typography>
                        {msg.images?.length && (
                          <Box mt={2}>
                            <Slider {...sliderSettings} ref={sliderRef}>
                              {msg.images.map((img, idx) => (
                                <Box key={idx} textAlign="center">
                                  {/* Display actual images or fallback to placeholder */}
                                  {img.startsWith('/assets/') || img.startsWith('assets/') ? (
                                    <Box
                                      component="img"
                                      src={img.startsWith('/') ? img : `/${img}`}
                                      alt={`Maintenance Image ${idx + 1}`}
                                      sx={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'contain',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                          transform: 'scale(1.02)'
                                        }
                                      }}
                                      onClick={() => handleImageClick(img)}
                                      onError={(e) => {
                                        // Fallback to placeholder if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement.innerHTML = `
                                          <div style="
                                            width: 100%;
                                            height: 300px;
                                            background-color: #f1f5f9;
                                            border: 2px dashed #cbd5e1;
                                            border-radius: 8px;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                            cursor: pointer;
                                          ">
                                            <span style="font-size: 48px; color: #64748b; margin-bottom: 8px;">📸</span>
                                            <span style="font-size: 14px; color: #64748b; font-weight: 500;">Image not available</span>
                                            <span style="font-size: 12px; color: #64748b; margin-top: 4px;">${img}</span>
                                          </div>
                                        `;
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '300px',
                                        backgroundColor: '#f1f5f9',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          backgroundColor: '#e2e8f0',
                                          borderColor: '#94a3b8'
                                        }
                                      }}
                                      onClick={() => handleImageClick(img)}
                                    >
                                      <PhotoCameraIcon sx={{ fontSize: 48, color: '#64748b', mb: 1 }} />
                                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                        📸 Demo Image Placeholder
                                      </Typography>
                                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        {img}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Slider>
                          </Box>
                        )}
                        {msg.videos?.map((vid, idx) => (
                          <Box key={idx} mt={2}>
                            {/* Placeholder video for demo */}
                            <Box
                              sx={{
                                width: '100%',
                                height: '200px',
                                backgroundColor: '#f8fafc',
                                border: '2px dashed #e2e8f0',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: '#f1f5f9',
                                  borderColor: '#cbd5e1'
                                }
                              }}
                              onClick={() => alert(`Demo video: ${vid}\n\nIn a real system, this would play a maintenance video showing step-by-step procedures.`)}
                            >
                              <VideoCallIcon sx={{ fontSize: 56, color: '#64748b', mb: 1 }} />
                              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                🎥 Demo Video Placeholder
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, textAlign: 'center', px: 2 }}>
                                {vid}
                              </Typography>
                              <Typography variant="caption" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Click to preview video description
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
                {/* Show the "Add Note" button when hovered */}
                {hoveredMessageIndex === i && (
                  <IconButton
                    onClick={() => {
                      setSelectedNoteMessage(msg.text);
                      // Set the confirmed machine from the fetched dropdown options
                      setConfirmMachine(machineOptionsList.length > 0 ? machineOptionsList[0].machineNumber : '');
                      setNoteDialogOpen(true);
                    }}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(255,255,255,0.8)'
                    }}
                  >
                    <NoteAddIcon />
                  </IconButton>
                )}
              </div>
              {i < messages.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
        </Box>

        {/* ======== LOG DETAILS DISPLAY ======== */}
        {showLogDetails && selectedLog && (
          <Box
            sx={{
              mt: 2,
              p: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              animation: 'slideInUp 0.5s ease-out',
              '@keyframes slideInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                {t('workOrderLog.logDetails')}: {selectedLog.workOrderId}
              </Typography>
              <IconButton
                onClick={() => {
                  setShowLogDetails(false);
                  setSelectedLog(null);
                  setSelectedWorkOrderForLog(null);
                }}
                size="small"
                sx={{
                  color: '#64748b',
                  '&:hover': {
                    color: '#e11d48',
                    backgroundColor: 'rgba(225, 29, 72, 0.1)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  {t('workOrderLog.basic')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('workOrderLog.technician')}:</strong> {selectedLog.technician}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('workOrderLog.dateCompleted')}:</strong> {selectedLog.date}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('workOrderLog.timeSpent')}:</strong> {selectedLog.duration}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('workOrderLog.status')}:</strong> {selectedLog.type}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  {t('workOrderLog.costs')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('workOrderLog.totalCost')}:</strong> {selectedLog.cost}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Priority:</strong> {selectedLog.priority}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Follow-up Required:</strong> {selectedLog.followUpRequired ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>

            {selectedLog.partsUsed && selectedLog.partsUsed.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  {t('workOrderLog.partsReplaced')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedLog.partsUsed.map((part, index) => (
                    <Chip
                      key={index}
                      label={part}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#065f46',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                {t('workOrderLog.workPerformed')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#1e293b',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                p: 2,
                borderRadius: '8px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedLog.summary}
              </Typography>
            </Box>

            {selectedLog.steps && selectedLog.steps.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  {t('workOrderLog.stepsPerformed')}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {selectedLog.steps.map((step, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5, color: '#1e293b' }}>
                      {index + 1}. {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {selectedLog.recommendations && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                  Recommendations
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#1e293b',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedLog.recommendations}
                </Typography>
              </Box>
            )}

            <Box sx={{ 
              mt: 3, 
              pt: 2, 
              borderTop: '1px solid rgba(226, 232, 240, 0.5)',
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadLog}
                disabled={!selectedLog}
                sx={{
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  }
                }}
              >
                {t('workOrderLog.downloadLog')}
              </Button>
              
              <Button
                variant="contained"
                startIcon={aiReportGenerating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleGenerateAIReport}
                disabled={aiReportGenerating || !selectedWorkOrderForLog}
                sx={{
                  background: 'linear-gradient(45deg, #8b5cf6, #a855f7)',
                  border: 0,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #9333ea)',
                  },
                  '&:disabled': {
                    background: 'rgba(139, 92, 246, 0.3)',
                  }
                }}
              >
                {aiReportGenerating ? t('workOrderLog.generating') : t('workOrderLog.generateAIReport')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {loadingResponse && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mt: 3, 
            mb: 3,
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        >
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              p: 3,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                      animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': {
                          transform: 'scale(0.8) translateY(0)',
                          opacity: 0.5,
                        },
                        '40%': {
                          transform: 'scale(1.2) translateY(-10px)',
                          opacity: 1,
                        }
                      }
                    }}
                  />
                ))}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(30, 41, 59, 0.8)',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              >
                {loadingText}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={resetFlow}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '50px',
            color: 'rgba(30, 41, 59, 0.9)',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '0.9rem',
            textTransform: 'none',
            letterSpacing: '0.5px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              transform: 'translateY(-2px) scale(1.05)',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
            },
            '&:active': {
              transform: 'translateY(0) scale(1.02)',
            }
          }}
        >
          {t('chatInterface.resetFlow')}
        </Button>
      </Box>

      {/* ======== DYNAMIC CONVERSATION UI COMPONENTS ======== */}
      
      {/* Issue Type Selection Buttons */}
      {showIssueTypeButtons && (
        <Box sx={{ 
          width: { xs: '90%', md: '600px' }, 
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          p: 3
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
            {t('chatInterface.selectIssueType')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentOptions.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionSelection(option)}
                variant="outlined"
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(30, 41, 59, 0.9)',
                  fontWeight: 500,
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                  }
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* ======== END DYNAMIC CONVERSATION UI ======== */}

      {chatFlow === 'showingWorkOrders' && !selectedWO && (
        <Paper
          elevation={0}
          sx={{
            width: { xs: '90%', md: '600px' },
            p: 3,
            mb: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#1e293b',
              fontWeight: 600 
            }}
          >
            {t('chat.selectWorkOrder')}
          </Typography>
          {workOrders.length > 0 ? (
            workOrders.map((wo, index) => (
              <Paper
                key={wo.id}
                sx={{ 
                  p: 3, 
                  mb: 2.5, 
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(25px) saturate(180%)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: index % 3 === 0 
                      ? 'linear-gradient(90deg, #10b981, #22d3ee)' 
                      : index % 3 === 1 
                      ? 'linear-gradient(90deg, #f59e0b, #eab308)' 
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    zIndex: 1,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)',
                    transition: 'left 0.6s ease',
                    zIndex: 0,
                  },
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    '&::after': {
                      left: '100%',
                    }
                  }
                }}
                onClick={() => selectWorkOrder(wo)}
              >
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  sx={{
                    color: '#1e293b',
                    fontSize: '1.1rem',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {wo.id} - {wo.task}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography>{t('chat.noWorkOrdersAvailable')}</Typography>
          )}
        </Paper>
      )}

      {chatFlow === 'selectedWorkOrder' && (
        <Paper
          elevation={0}
          sx={{
            width: { xs: '90%', md: '600px' },
            p: 4,
            mb: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(25px) saturate(180%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #10b981, #22d3ee, #6366f1)',
              zIndex: 1,
            },
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
            {t('chat.pickMachineNumber')}
          </Typography>
          {machineOptions.map((opt, idx) => (
            <Button
              key={idx}
              variant="outlined"
              sx={{ mt: 1, mr: 1 }}
              onClick={() => {
                setMachineNumber(opt);
                setChatFlow('verifyingMachine');
                addBotMessage(t('chat.machineRecorded', { number: opt }));
              }}
            >
              {opt}
            </Button>
          ))}
        </Paper>
      )}

      {/* Revolutionary Input Bar with Advanced Glassmorphism */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: { xs: '95%', sm: '700px' },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '50px',
          overflow: 'hidden',
          px: 2,
          py: 1,
          mb: 4,
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 0 0 1px rgba(148, 163, 184, 0.1)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: '50px',
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: `
              0 25px 50px rgba(59, 130, 246, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.9),
              0 0 0 1px rgba(59, 130, 246, 0.2)
            `,
          },
          '&:focus-within': {
            transform: 'translateY(-3px)',
            border: '1px solid rgba(99, 102, 241, 0.6)',
            boxShadow: `
              0 0 0 3px rgba(99, 102, 241, 0.1),
              0 30px 60px rgba(99, 102, 241, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `,
          },
        }}
      >
        {/* Hidden file input for camera / gallery capture */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*,video/*"
          capture="environment" 
          onChange={handleFileChange}
        />
        <IconButton 
          onClick={handleCameraClick}
          sx={{
            color: 'rgba(100, 116, 139, 0.7)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            margin: 0.5,
            border: '1px solid rgba(148, 163, 184, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: 'rgba(59, 130, 246, 1)',
              background: 'rgba(59, 130, 246, 0.1)',
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton 
          onClick={handleQRCodeClick}
          sx={{
            color: 'rgba(100, 116, 139, 0.7)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            margin: 0.5,
            border: '1px solid rgba(148, 163, 184, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: 'rgba(16, 185, 129, 1)',
              background: 'rgba(16, 185, 129, 0.1)',
              transform: 'scale(1.1) rotate(-5deg)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <QrCodeScannerIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton 
          onClick={handleMoreClick}
          sx={{
            color: 'rgba(100, 116, 139, 0.7)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            margin: 0.5,
            border: '1px solid rgba(148, 163, 184, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: 'rgba(139, 92, 246, 1)',
              background: 'rgba(139, 92, 246, 0.1)',
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <MoreHorizIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <TextField
          variant="standard"
          placeholder={t('chatInterface.placeholderMaintenance')}
          fullWidth
          InputProps={{ 
            disableUnderline: true,
            sx: {
              color: 'rgba(30, 41, 59, 0.9)',
              fontSize: '1.1rem',
              fontWeight: 400,
              '& input': {
                padding: '12px 16px',
                '&::placeholder': {
                  color: 'rgba(100, 116, 139, 0.6)',
                  opacity: 1,
                  fontStyle: 'italic',
                },
              },
            },
          }}
          sx={{ 
            mx: 2,
            '& .MuiInputBase-root': {
              background: 'rgba(248, 250, 252, 0.8)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(248, 250, 252, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              },
              '&.Mui-focused': {
                background: 'rgba(248, 250, 252, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
              }
            }
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <IconButton 
          onClick={() => startVoiceRecognition()}
          sx={{
            color: 'rgba(100, 116, 139, 0.7)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            margin: 0.5,
            border: '1px solid rgba(148, 163, 184, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.1)',
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <MicIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Revolutionary Send Button */}
        <IconButton
          onClick={() => handleSend()}
          disabled={!input.trim()}
          sx={{
            ml: 1,
            width: 50,
            height: 50,
            background: input.trim() 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' 
              : 'rgba(148, 163, 184, 0.3)',
            color: input.trim() ? '#ffffff' : 'rgba(100, 116, 139, 0.7)',
            borderRadius: '50%',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            border: input.trim() ? 'none' : '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: input.trim() 
              ? '0 8px 32px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 4px 16px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              transform: input.trim() ? 'scale(1.1) rotate(5deg)' : 'scale(1.05)',
              background: input.trim() 
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0891b2 100%)'
                : 'rgba(148, 163, 184, 0.4)',
              boxShadow: input.trim()
                ? '0 12px 40px rgba(99, 102, 241, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                : '0 6px 20px rgba(148, 163, 184, 0.2)',
            },
            '&:active': {
              transform: input.trim() ? 'scale(1.05)' : 'scale(1.02)',
            },
            '&:disabled': {
              color: 'rgba(100, 116, 139, 0.4)',
              background: 'rgba(148, 163, 184, 0.2)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&::before': input.trim() ? {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)',
                borderRadius: '50%',
                opacity: 0.7,
                animation: 'rotate 3s linear infinite',
                zIndex: -1,
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              } : {}
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </Box>
        </IconButton>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(25px) saturate(180%)',
            borderRadius: '20px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            mt: 1,
            minWidth: '240px',
          }
        }}
      >
        <MenuItem
          onClick={handleCreateHelp}
          sx={{
            background: 'transparent',
            color: '#1e293b',
            m: 1,
            px: 3,
            py: 2,
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(34, 197, 94, 0.1)',
              transform: 'translateX(8px)',
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)'
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: '#22c55e' }}>
            <HelpOutlineIcon />
          </ListItemIcon>
          <MUIListItemText 
            primary={t('chatInterface.createHelpRequest')} 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#1e293b'
              } 
            }} 
          />
        </MenuItem>
        <MenuItem
          onClick={handleVideoMeeting}
          sx={{
            background: 'transparent',
            color: '#1e293b',
            m: 1,
            px: 3,
            py: 2,
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(245, 158, 11, 0.1)',
              transform: 'translateX(8px)',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)'
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: '#f59e0b' }}>
            <VideoCallIcon />
          </ListItemIcon>
          <MUIListItemText 
            primary={t('chatInterface.scheduleVideoMeeting')} 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#1e293b'
              } 
            }} 
          />
        </MenuItem>
        <MenuItem
          onClick={handleSendFeedback}
          sx={{
            background: 'transparent',
            color: '#1e293b',
            m: 1,
            px: 3,
            py: 2,
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(59, 130, 246, 0.1)',
              transform: 'translateX(8px)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)'
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: '#3b82f6' }}>
            <FeedbackIcon />
          </ListItemIcon>
          <MUIListItemText 
            primary={t('chatInterface.sendFeedback')} 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#1e293b'
              } 
            }} 
          />
        </MenuItem>
      </Menu>

      {isMobile ? (
        <Box sx={{ width: '100%', mb: 4 }}>
          <Slider {...mobileButtonSliderSettings}>
            <Box px={1}>
              <Button
                variant="contained"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(15px)',
                  color: '#1e293b',
                  borderRadius: '24px',
                  width: '100%',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': { 
                    background: 'rgba(59, 130, 246, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => {
                  setInput(t('chat.seeWorkOrders'));
                  handleSend();
                }}
              >
                <ListAltIcon sx={{ mr: 1, color: '#10b981' }} />
                {t('chat.seeWorkOrders')}
              </Button>
            </Box>
            <Box px={1}>
              <Button
                variant="contained"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(15px)',
                  color: '#1e293b',
                  borderRadius: '24px',
                  width: '100%',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': { 
                    background: 'rgba(59, 130, 246, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => {
                  setInput(t('chat.createNewWorkOrder'));
                  handleSend();
                }}
              >
                <NoteAddIcon sx={{ mr: 1, color: '#6366f1' }} />
                {t('chat.createNewWorkOrder')}
              </Button>
            </Box>
            <Box px={1}>
              <Button
                variant="contained"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(15px)',
                  color: '#1e293b',
                  borderRadius: '24px',
                  width: '100%',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': { 
                    background: 'rgba(59, 130, 246, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => {
                  setInput(t('chat.viewMaintenanceManual'));
                  handleSend();
                }}
              >
                <ListAltIcon sx={{ mr: 1, color: '#f59e0b' }} />
                {t('chat.viewMaintenanceManual')}
              </Button>
            </Box>
          </Slider>
        </Box>
      ) : (
        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              '&:hover': { 
                background: 'rgba(59, 130, 246, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => {
              setInput(t('chat.seeWorkOrders'));
              handleSend();
            }}
          >
            <ListAltIcon sx={{ mr: 1, color: '#10b981' }} />
            {t('chat.seeWorkOrders')}
          </Button>
          <Button
            variant="contained"
            sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              '&:hover': { 
                background: 'rgba(59, 130, 246, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => {
              setInput(t('chat.createNewWorkOrder'));
              handleSend();
            }}
          >
            <NoteAddIcon sx={{ mr: 1, color: '#6366f1' }} />
            {t('chat.createNewWorkOrder')}
          </Button>
          <Button
            variant="contained"
            sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              '&:hover': { 
                background: 'rgba(59, 130, 246, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => {
              setInput(t('chat.viewMaintenanceManual'));
              handleSend();
            }}
          >
            <ListAltIcon sx={{ mr: 1, color: '#f59e0b' }} />
            {t('chat.viewMaintenanceManual')}
          </Button>
        </Stack>
      )}

      <Dialog open={qrScannerOpen} onClose={() => setQrScannerOpen(false)} fullWidth maxWidth="md" keepMounted>
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#1e293b',
            fontWeight: 600
          }}>
            {t('chat.scanQrCode')}
          </Typography>
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              aspectRatio: '16/9',
              margin: '0 auto' 
            }} 
          />
        </Box>
      </Dialog>

      <Dialog open={createWOopen} onClose={() => { setCreateWOopen(false); setChatFlow('idle'); }} maxWidth="sm" fullWidth>
        <Box sx={{ 
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{
            color: '#1e293b',
            fontWeight: 600
          }}>{t('chat.createNewWorkOrderDialogTitle')}</Typography>
          <TextField
            label={t('chat.workOrderID')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.id}
            onChange={(e) => setNewWOForm({ ...newWOForm, id: e.target.value })}
          />
          <TextField
            label={t('chat.dateIssued')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.dateIssued}
            onChange={(e) => setNewWOForm({ ...newWOForm, dateIssued: e.target.value })}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('chat.priority')}</InputLabel>
            <Select
              label={t('chat.priority')}
              value={newWOForm.priority}
              onChange={(e) => setNewWOForm({ ...newWOForm, priority: e.target.value })}
            >
              {priorityOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('chat.location')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.location}
            onChange={(e) => setNewWOForm({ ...newWOForm, location: e.target.value })}
          />
          <TextField
            label={t('chat.assetEquipment')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.asset}
            onChange={(e) => setNewWOForm({ ...newWOForm, asset: e.target.value })}
          />
          <TextField
            label={t('chat.description')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.description}
            onChange={(e) => setNewWOForm({ ...newWOForm, description: e.target.value })}
          />
          <TextField
            label={t('chat.requestedBy')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.requestedBy}
            onChange={(e) => setNewWOForm({ ...newWOForm, requestedBy: e.target.value })}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('chat.assignedTo')}</InputLabel>
            <Select
              label={t('chat.assignedTo')}
              value={newWOForm.assignedTo}
              onChange={(e) => setNewWOForm({ ...newWOForm, assignedTo: e.target.value })}
            >
              {assignedToOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('chat.dueDate')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.dueDate}
            onChange={(e) => setNewWOForm({ ...newWOForm, dueDate: e.target.value })}
          />
          <TextField
            label={t('chat.materials')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.materials}
            onChange={(e) => setNewWOForm({ ...newWOForm, materials: e.target.value })}
          />
          <TextField
            label={t('chat.additionalNotes')}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={newWOForm.additionalNotes}
            onChange={(e) => setNewWOForm({ ...newWOForm, additionalNotes: e.target.value })}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="text"
              onClick={() => {
                setCreateWOopen(false);
                setChatFlow('idle');
              }}
            >
              {t('chat.cancel')}
            </Button>
            <Button variant="contained" onClick={handleCreateWorkOrder}>
              {t('chat.create')}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* ===== NEW: Note Dialog for adding notes with machine dropdown ===== */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setAdditionalNote('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ 
          p: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom sx={{
            color: '#1e293b',
            fontWeight: 600
          }}>
            {t('chatInterface.addNote')}
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('chatInterface.machineLabel')}</InputLabel>
            <Select
              value={confirmMachine}
              label={t('chatInterface.machineLabel')}
              onChange={(e) => setConfirmMachine(e.target.value as string)}
            >
              {machineOptionsList.map((option, idx) => (
                <MenuItem key={idx} value={option.machineNumber}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ mb: 2, color: '#1e293b', fontWeight: 500 }}>
            {t('chatInterface.originalMessage')}
          </Typography>
          <Paper sx={{ 
            p: 1, 
            mb: 2, 
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(15px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>
              {selectedNoteMessage}
            </Typography>
          </Paper>
          <TextField
            label={t('chatInterface.additionalNote')}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="text"
              onClick={() => {
                setNoteDialogOpen(false);
                setAdditionalNote('');
              }}
            >
              {t('chatInterface.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSaveNote}>
              {t('chatInterface.saveNote')}
            </Button>
          </Stack>
        </Box>
      </Dialog>
      {/* ======================================================================= */}

    </Box>
  );
};

export default ChatInterface;
