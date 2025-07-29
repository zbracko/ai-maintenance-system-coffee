/**
 * Chat Session Utilities
 * 
 * Handles automatic saving of chat sessions to maintenance logs
 * and retrieval of actual conversation data for maintenance records.
 */

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  userId?: string;
  userName?: string;
  machineId?: string;
  messages: ChatMessage[];
  tags: string[];
  workOrderGenerated?: boolean;
  workOrderId?: string;
  partsUsed?: string[];
  problemResolved?: boolean;
  duration?: string;
}

/**
 * Saves a chat session to localStorage for potential conversion to maintenance log
 */
export const saveChatSession = (session: ChatSession): void => {
  try {
    const existingSessions = getChatSessions();
    const updatedSessions = [session, ...existingSessions.slice(0, 49)]; // Keep last 50 sessions
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    console.log('✅ Chat session saved:', session.sessionId);
  } catch (error) {
    console.error('❌ Error saving chat session:', error);
  }
};

/**
 * Retrieves all saved chat sessions from localStorage
 */
export const getChatSessions = (): ChatSession[] => {
  try {
    const sessions = localStorage.getItem('chatSessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('❌ Error retrieving chat sessions:', error);
    return [];
  }
};

/**
 * Gets the most recent chat session
 */
export const getLastChatSession = (): ChatSession | null => {
  const sessions = getChatSessions();
  return sessions.length > 0 ? sessions[0] : null;
};

/**
 * Converts a chat session to a maintenance log entry
 */
export const convertSessionToMaintenanceLog = (session: ChatSession, logId: number) => {
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

  // Analyze conversation for key information
  const analysis = analyzeConversation(session.messages);
  
  // Ensure all properties are properly formatted for PDF generation
  const partsUsedArray = session.partsUsed || analysis.detectedParts || [];
  const formattedPartsUsed = Array.isArray(partsUsedArray) ? partsUsedArray : [];
  
  return {
    id: logId,
    date: startTime.toISOString().split('T')[0],
    time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    machine: String(session.machineId || analysis.detectedMachine || 'Coffee Machine #001'),
    technician: String(session.userName || 'Chat User'),
    type: 'AI Chat Session',
    workOrder: String(session.workOrderId || `WO-CHAT-${Date.now().toString().slice(-6)}`),
    description: String(`AUTO-SAVED: ${analysis.summary || 'Chat session maintenance assistance'}`),
    status: session.problemResolved ? 'Completed' : 'In Progress',
    priority: String(analysis.priority || 'Medium'),
    duration: `${duration} minutes`,
    partsUsed: formattedPartsUsed.map(part => String(part)),
    notes: String(formatSessionNotes(session, analysis)),
    severity: analysis.priority === 'High' ? 'high' : analysis.priority === 'Medium' ? 'medium' : 'low'
  };
};

/**
 * Analyzes conversation content to extract key information
 */
const analyzeConversation = (messages: ChatMessage[]) => {
  const userMessages = messages.filter(m => m.sender === 'user').map(m => m.text.toLowerCase());
  const botMessages = messages.filter(m => m.sender === 'bot').map(m => m.text.toLowerCase());
  
  // Detect problem types
  const problemKeywords = {
    taste: ['taste', 'bitter', 'sour', 'weak', 'strong', 'flavor'],
    flow: ['slow', 'fast', 'dripping', 'pressure', 'extraction'],
    temperature: ['hot', 'cold', 'warm', 'temperature', 'heating'],
    cleaning: ['clean', 'descale', 'maintenance', 'filter', 'clog'],
    mechanical: ['noise', 'grinding', 'motor', 'broken', 'stuck']
  };

  const detectedProblems = [];
  for (const [type, keywords] of Object.entries(problemKeywords)) {
    if (keywords.some(keyword => userMessages.some(msg => msg.includes(keyword)))) {
      detectedProblems.push(type);
    }
  }

  // Detect parts mentioned
  const partKeywords = ['filter', 'descaling solution', 'grinder', 'burr', 'valve', 'seal', 'sensor'];
  const detectedParts = partKeywords.filter(part => 
    [...userMessages, ...botMessages].some(msg => msg.includes(part))
  );

  // Determine priority based on keywords
  const highPriorityKeywords = ['emergency', 'broken', 'not working', 'urgent', 'error'];
  const mediumPriorityKeywords = ['issue', 'problem', 'wrong', 'bad'];
  
  let priority = 'Low';
  if (highPriorityKeywords.some(keyword => userMessages.some(msg => msg.includes(keyword)))) {
    priority = 'High';
  } else if (mediumPriorityKeywords.some(keyword => userMessages.some(msg => msg.includes(keyword)))) {
    priority = 'Medium';
  }

  // Detect machine references
  const machinePattern = /(machine|espresso|coffee maker|grinder)[\s#]*(\d+|[a-z]+\d+)/i;
  let detectedMachine = null;
  for (const msg of userMessages) {
    const match = msg.match(machinePattern);
    if (match) {
      detectedMachine = `Coffee Machine #${match[2]}`;
      break;
    }
  }

  return {
    detectedProblems,
    detectedParts: detectedParts.length > 0 ? detectedParts.map(part => 
      `${part.charAt(0).toUpperCase() + part.slice(1)} CM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    ) : [],
    priority,
    detectedMachine,
    summary: detectedProblems.length > 0 
      ? `${detectedProblems.join(', ')} issues resolved through AI assistance`
      : 'General maintenance assistance provided'
  };
};

/**
 * Formats session data into maintenance log notes (PDF-friendly format)
 */
const formatSessionNotes = (session: ChatSession, analysis: any): string => {
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  
  // Create clean, PDF-friendly text without emojis and special characters
  let notes = `ACTUAL CHAT SESSION AUTOMATICALLY SAVED\n\n`;
  notes += `SESSION ID: ${session.sessionId}\n`;
  notes += `START: ${startTime.toLocaleString()}\n`;
  notes += `END: ${endTime.toLocaleString()}\n`;
  notes += `USER: ${session.userName || 'Chat User'}\n`;
  notes += `AI: Coffee Maintenance Assistant v2.1\n`;
  notes += `AUTO-TAGS: ${session.tags ? session.tags.join(', ') : 'none'}\n\n`;
  
  notes += `LIVE CONVERSATION TRANSCRIPT:\n\n`;
  
  if (session.messages && Array.isArray(session.messages)) {
    session.messages.forEach((message, index) => {
      try {
        const time = new Date(message.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
        const sender = message.sender === 'user' ? 'User' : 'AI Assistant';
        
        // Clean the text: remove emojis and special characters that cause PDF issues
        const cleanText = String(message.text || 'No message content')
          .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols
          .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport symbols
          .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
          .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
          .replace(/[^\x00-\x7F]/g, '')           // Remove non-ASCII characters
          .replace(/\s+/g, ' ')                   // Normalize whitespace
          .trim();
          
        // Limit message length for PDF readability
        const truncatedText = cleanText.length > 200 
          ? cleanText.substring(0, 200) + '...' 
          : cleanText;
          
        notes += `[${time}] ${sender}: ${truncatedText}\n\n`;
      } catch (error) {
        console.warn(`Error processing message ${index}:`, error);
        notes += `[ERROR] Could not process message ${index}\n\n`;
      }
    });
  } else {
    notes += `No messages available in session\n\n`;
  }
  
  notes += `SESSION SUMMARY:\n`;
  notes += `Problems Detected: ${(analysis.detectedProblems || []).join(', ') || 'General assistance'}\n`;
  notes += `Parts Mentioned: ${(analysis.detectedParts || []).join(', ') || 'None'}\n`;
  notes += `Duration: ${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} minutes\n`;
  notes += `Next Recommended Service: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n`;
  notes += `AUTO-GENERATED FROM LIVE CHAT SESSION`;
  
  return notes;
};

/**
 * Auto-generates maintenance log from chat session when certain conditions are met
 */
export const shouldAutoGenerateMaintenanceLog = (session: ChatSession): boolean => {
  // Criteria for auto-generating maintenance log:
  // 1. Session has more than 3 messages
  // 2. Session mentions maintenance-related keywords
  // 3. Session lasted more than 5 minutes
  
  if (session.messages.length < 4) return false;
  
  const allText = session.messages.map(m => m.text.toLowerCase()).join(' ');
  const maintenanceKeywords = [
    'repair', 'fix', 'clean', 'descale', 'replace', 'maintenance',
    'problem', 'issue', 'broken', 'not working', 'help'
  ];
  
  const hasMaintenanceContent = maintenanceKeywords.some(keyword => allText.includes(keyword));
  
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  return hasMaintenanceContent && durationMinutes >= 2; // Reduced to 2 minutes for demo
};
