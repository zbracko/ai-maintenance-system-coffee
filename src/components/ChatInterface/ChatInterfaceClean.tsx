/**
 * ChatInterface Component
 * 
 * Clean AI-powered maintenance chat interface with OpenAI integration.
 * Features contextual conversations, work order management, and troubleshooting guidance.
 * 
 * @author AI Maintenance System
 * @version 3.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';

import { useTranslation } from 'react-i18next';
import { demoConfig, demoResponseTemplates } from '../../config/demoConfig';
import { demoMachineOptions, createWorkOrderFromChat } from '../../data/demoData';
import { getOpenAIResponse, ConversationContext, Message } from '../../utils/openai';

// Interfaces
interface ChatMessage extends Message {
  images?: string[];
  instructions?: Array<{ text: string; isDone?: boolean }>;
}

interface ChatInterfaceProps {}

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ================================================================
  // STATE MANAGEMENT
  // ================================================================

  // Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'bot', 
      text: demoConfig.isDemo ? demoResponseTemplates.greeting : t('chat.initialMessage'),
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  
  // Session and context state
  const [sessionId] = useState(() => 
    Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  );
  
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    sessionId,
    troubleshootingStep: 0
  });
  
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);
  
  // ================================================================
  // EFFECTS
  // ================================================================

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message with demo showcase
  useEffect(() => {
    if (demoConfig.isDemo && messages.length === 1) {
      setTimeout(() => {
        const welcomeMessage = `☕ **Welcome to the AI Coffee Machine Maintenance System!**\n\n🤖 **Enhanced with OpenAI Integration:**\n• Natural conversation with full context awareness\n• Remembers our entire conversation history\n• Includes machine data, work orders, and maintenance logs\n• Intelligent troubleshooting without duplicate work orders\n\n**🎯 Try these conversation starters:**\n• "Machine 001 is making weird noises"\n• "Show me current work orders"\n• "I need help with maintenance"\n• "The grinder is broken" (with typos!)\n\n**💡 I'll remember everything we discuss and provide contextual responses!**`;
        
        addBotMessage(welcomeMessage, [], [], [
          '🔧 Troubleshoot Machine 001',
          '📋 View Work Orders', 
          '🧽 Maintenance Help',
          '🔍 Equipment List'
        ]);
      }, 1500);
    }
  }, []); // Run once on mount

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================

  const addBotMessage = (text: string, images: string[] = [], instructions: Array<{ text: string; isDone?: boolean }> = [], options: string[] = []) => {
    const message: ChatMessage = {
      sender: 'bot',
      text,
      images,
      instructions,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, message]);
    setCurrentOptions(options);
  };

  const addUserMessage = (text: string) => {
    const message: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, message]);
  };

  // ================================================================
  // MAIN CHAT HANDLERS
  // ================================================================

  const handleSend = async (messageText?: string) => {
    const userText = messageText ? messageText.trim() : input.trim();
    if (!userText || isLoading) return;
    
    setInput('');
    setIsLoading(true);
    setCurrentOptions([]);
    
    // Add user message
    addUserMessage(userText);
    
    try {
      // Get OpenAI response with full context
      const aiResponse = await getOpenAIResponse(
        userText,
        messages,
        conversationContext
      );
      
      // Update conversation context based on response
      const updatedContext = updateConversationContext(userText, aiResponse.text || '');
      setConversationContext(updatedContext);
      
      // Add AI response
      addBotMessage(
        aiResponse.text, 
        aiResponse.images || [], 
        [], 
        aiResponse.options || []
      );
      
    } catch (error) {
      console.error('Chat error:', error);
      addBotMessage(
        "I apologize, but I encountered an issue. Please try again or describe your maintenance need in different words.",
        [],
        [],
        ['Try again', 'Start over', 'Help me', 'View work orders']
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  const handleMachineSelection = (machineNumber: string) => {
    const selectedMachine = demoMachineOptions.find(m => m.machineNumber === machineNumber);
    if (selectedMachine) {
      setConversationContext(prev => ({
        ...prev,
        selectedMachine: machineNumber
      }));
      setShowMachineDropdown(false);
      handleSend(`Selected: ${selectedMachine.label}`);
    }
  };

  // ================================================================
  // CONTEXT MANAGEMENT
  // ================================================================

  const updateConversationContext = (userText: string, aiResponse: string): ConversationContext => {
    const newContext = { ...conversationContext };
    
    // Extract machine mentions
    const machineMatch = userText.match(/machine\s+(\w+)/i);
    if (machineMatch && demoMachineOptions.find(m => m.machineNumber === machineMatch[1])) {
      newContext.selectedMachine = machineMatch[1];
    }
    
    // Extract issue types
    const issueTypes = ['noise', 'broken', 'not working', 'leak', 'temperature', 'quality', 'grinding'];
    for (const issue of issueTypes) {
      if (userText.toLowerCase().includes(issue)) {
        newContext.currentIssue = issue;
        break;
      }
    }
    
    // Track work order creation
    if (aiResponse.includes('Work Order') && !newContext.activeWorkOrder) {
      const workOrderMatch = aiResponse.match(/Work Order[:\s]+([A-Z0-9-]+)/i);
      if (workOrderMatch) {
        newContext.activeWorkOrder = workOrderMatch[1];
      }
    }
    
    // Update troubleshooting step
    if (userText.toLowerCase().includes('continue') || userText.toLowerCase().includes('next')) {
      newContext.troubleshootingStep = (newContext.troubleshootingStep || 0) + 1;
    }
    
    return newContext;
  };

  // ================================================================
  // KEY PRESS HANDLER
  // ================================================================

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
          🤖 AI Maintenance Assistant
        </Typography>
        {demoConfig.isDemo && (
          <Alert severity="info" sx={{ mt: 1 }}>
            🧠 **Enhanced with OpenAI**: Full conversation context, machine data, and intelligent responses
          </Alert>
        )}
        {conversationContext.selectedMachine && (
          <Chip 
            label={`Machine: ${conversationContext.selectedMachine}`} 
            color="primary" 
            size="small" 
            sx={{ mt: 1, mr: 1 }} 
          />
        )}
        {conversationContext.activeWorkOrder && (
          <Chip 
            label={`Work Order: ${conversationContext.activeWorkOrder}`} 
            color="secondary" 
            size="small" 
            sx={{ mt: 1 }} 
          />
        )}
      </Paper>

      {/* Messages Area */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                  color: message.sender === 'user' ? 'white' : 'black',
                  borderRadius: 2,
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body1" component="div">
                  {message.text.split('\n').map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line.includes('**') ? (
                        <strong>{line.replace(/\*\*/g, '')}</strong>
                      ) : (
                        line
                      )}
                      {lineIndex < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Typography>
                
                {message.instructions && message.instructions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {message.instructions.map((instruction, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                        • {instruction.text}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2">AI is thinking...</Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Action Options */}
        {currentOptions.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentOptions.map((option, index) => (
              <Chip
                key={index}
                label={option}
                onClick={() => handleOptionClick(option)}
                color="primary"
                variant="outlined"
                clickable
                size="small"
              />
            ))}
          </Box>
        )}

        {/* Machine Selection Dropdown */}
        {showMachineDropdown && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Machine</InputLabel>
              <Select
                label="Select Machine"
                onChange={(e) => handleMachineSelection(e.target.value as string)}
              >
                {demoMachineOptions.map((machine) => (
                  <MenuItem key={machine.machineNumber} value={machine.machineNumber}>
                    {machine.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Input Area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about maintenance, troubleshooting, or describe your issue..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            size="small"
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            endIcon={<SendIcon />}
            sx={{
              minWidth: 'auto',
              px: 3,
              py: 1,
              borderRadius: 2
            }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
