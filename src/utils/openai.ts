/**
 * OpenAI Integration for Coffee Machine Maintenance System
 * 
 * This module provides contextual AI responses using OpenAI's API,
 * incorporating conversation history, machine data, work orders, and maintenance logs.
 */

import { demoWorkOrders, demoPastLogs, demoMachineOptions } from '../data/demoData';
import { demoConfig } from '../config/demoConfig';
import { configService } from '../services/configService';

/**
 * Simple language detection for demo responses
 */
const detectLanguage = (text: string): 'en' | 'es' | 'fr' => {
  const lowerText = text.toLowerCase();
  
  // Spanish indicators
  const spanishWords = ['hola', 'ayuda', 'problema', 'máquina', 'café', 'sí', 'no', 'gracias', 'por favor', 'necesito', 'tengo', 'está', 'como', 'que', 'el', 'la', 'los', 'las', 'con', 'sin'];
  const spanishMatches = spanishWords.filter(word => lowerText.includes(word)).length;
  
  // French indicators
  const frenchWords = ['bonjour', 'aide', 'problème', 'machine', 'café', 'oui', 'non', 'merci', 's\'il vous plaît', 'j\'ai', 'besoin', 'est', 'comment', 'que', 'le', 'la', 'les', 'avec', 'sans'];
  const frenchMatches = frenchWords.filter(word => lowerText.includes(word)).length;
  
  // Return the language with most matches, default to English
  if (spanishMatches > frenchMatches && spanishMatches > 0) return 'es';
  if (frenchMatches > spanishMatches && frenchMatches > 0) return 'fr';
  return 'en';
};

/**
 * Get localized text based on detected language
 */
const getLocalizedText = (lang: 'en' | 'es' | 'fr', texts: { en: string; es: string; fr: string }): string => {
  return texts[lang] || texts.en;
};

// OpenAI Configuration with runtime environment variable fetching
const getOpenAIKey = (): string => {
  // Helper function to validate API key value
  const isValidApiKey = (key: any): boolean => {
    return key && 
           typeof key === 'string' && 
           key !== 'false' && 
           key !== 'undefined' && 
           key !== 'null' && 
           key !== '' && 
           key !== 'your-openai-api-key-here' &&
           key.length > 10;
  };

  // Try Vite environment variable first (build-time)
  const viteKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (isValidApiKey(viteKey)) {
    console.log('🔑 Using build-time VITE_OPENAI_API_KEY');
    return viteKey;
  }
  
  // For Amplify: Try to get from window.ENV_CONFIG (runtime - Amplify injection)
  if (typeof window !== 'undefined') {
    const envConfigKey = (window as any).ENV_CONFIG?.VITE_OPENAI_API_KEY;
    if (isValidApiKey(envConfigKey)) {
      console.log('🔑 Using runtime ENV_CONFIG.VITE_OPENAI_API_KEY');
      return envConfigKey;
    }
    
    // Fallback: Try to get from window object directly (runtime - Amplify can inject this)
    const windowKey = (window as any).VITE_OPENAI_API_KEY;
    if (isValidApiKey(windowKey)) {
      console.log('🔑 Using runtime window.VITE_OPENAI_API_KEY');
      return windowKey;
    }
    
    // Fallback: Try alternate environment variable names for compatibility
    const reactKey = (window as any).REACT_APP_OPENAI_API_KEY;
    if (isValidApiKey(reactKey)) {
      console.log('🔑 Using runtime window.REACT_APP_OPENAI_API_KEY');
      return reactKey;
    }
  }
  
  // Final fallback: Return empty string to indicate we should use demo mode
  console.log('🔑 No valid API key found, will use demo mode');
  return '';
};

// For development/testing - you can temporarily hardcode this for testing
// const TEMP_API_KEY = 'your-api-key-here'; // Remove this in production
const OPENAI_API_KEY = getOpenAIKey();
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug logging for environment variables
console.log('🌍 Environment Variables Debug (Comprehensive):');
console.log(`   - NODE_ENV: ${import.meta.env.MODE}`);
console.log(`   - Build-time VITE vars:`, Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log(`   - import.meta.env.VITE_OPENAI_API_KEY: ${import.meta.env.VITE_OPENAI_API_KEY} (type: ${typeof import.meta.env.VITE_OPENAI_API_KEY})`);

if (typeof window !== 'undefined') {
  console.log(`   - window.ENV_CONFIG exists: ${!!(window as any).ENV_CONFIG}`);
  console.log(`   - window.ENV_CONFIG content:`, (window as any).ENV_CONFIG);
  console.log(`   - window.VITE_OPENAI_API_KEY: ${(window as any).VITE_OPENAI_API_KEY} (type: ${typeof (window as any).VITE_OPENAI_API_KEY})`);
  console.log(`   - window.REACT_APP_OPENAI_API_KEY: ${(window as any).REACT_APP_OPENAI_API_KEY} (type: ${typeof (window as any).REACT_APP_OPENAI_API_KEY})`);
  
  // Check all window properties that might contain our API key
  const windowKeys = Object.keys(window).filter(key => 
    key.includes('OPENAI') || key.includes('VITE_') || key.includes('REACT_APP_')
  );
  console.log(`   - All window keys with OPENAI/VITE_/REACT_APP_:`, windowKeys);
  
  // Show environment variables array from Amplify debug
  const envVars = Object.keys(import.meta.env);
  console.log(`   - Environment variables loaded:`, envVars.filter(key => key.includes('OPENAI') || key.includes('VITE_')));
}

console.log(`   - Final API key source: ${OPENAI_API_KEY ? 'Found (' + OPENAI_API_KEY.length + ' chars)' : 'Not found'}`);

// Debug logging for OpenAI usage
console.log(`🔑 OpenAI API Key Status:`);
console.log(`   - Configured: ${OPENAI_API_KEY ? 'Yes' : 'No'}`);
console.log(`   - Length: ${OPENAI_API_KEY?.length || 0}`);
console.log(`   - First 10 chars: ${OPENAI_API_KEY?.substring(0, 10) || 'undefined'}`);
console.log(`   - Last 4 chars: ${OPENAI_API_KEY?.substring(OPENAI_API_KEY.length - 4) || 'undefined'}`);
console.log(`🌐 OpenAI API URL: ${OPENAI_API_URL}`);

export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

/**
 * Map of maintenance topics to relevant images
 */
const MAINTENANCE_IMAGES = {
  espresso: '/assets/espresso-machine-cleaning.svg',
  cleaning: '/assets/espresso-machine-cleaning.svg',
  clean: '/assets/espresso-machine-cleaning.svg',
  descaling: '/assets/espresso-machine-cleaning.svg',
  grinder: '/assets/coffee-grinder-operation.svg',
  grinding: '/assets/coffee-grinder-operation.svg',
  grind: '/assets/coffee-grinder-operation.svg',
  burr: '/assets/coffee-grinder-operation.svg',
  steam: '/assets/steam-wand-cleaning.svg',
  wand: '/assets/steam-wand-cleaning.svg',
  milk: '/assets/steam-wand-cleaning.svg',
  froth: '/assets/steam-wand-cleaning.svg',
  filter: '/assets/water-filter-replacement.svg',
  water: '/assets/water-filter-replacement.svg',
  replacement: '/assets/water-filter-replacement.svg',
  quality: '/assets/water-filter-replacement.svg',
  troubleshoot: '/assets/troubleshooting-guide.svg',
  problem: '/assets/troubleshooting-guide.svg',
  error: '/assets/troubleshooting-guide.svg',
  issue: '/assets/troubleshooting-guide.svg',
  diagnostic: '/assets/troubleshooting-guide.svg',
  repair: '/assets/troubleshooting-guide.svg',
  fix: '/assets/troubleshooting-guide.svg'
};

/**
 * Multi-step procedures that require multiple images and videos
 */
const MULTI_STEP_PROCEDURES = {
  'filter replacement': {
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg', 
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },
  'water filter replacement': {
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },
  'descaling': {
    images: [
      '/assets/espresso-machine-cleaning.svg',
      '/assets/water-filter-replacement.svg'
    ],
    videos: []
  },
  'deep cleaning': {
    images: [
      '/assets/espresso-machine-cleaning.svg',
      '/assets/steam-wand-cleaning.svg',
      '/assets/coffee-grinder-operation.svg'
    ],
    videos: []
  }
};

/**
 * Detect if images should be included based on user message and context
 */
const detectImageNeed = (userMessage: string, context: ConversationContext): boolean => {
  const message = userMessage.toLowerCase();
  
  // Keywords that typically require visual aids
  const visualKeywords = [
    'show', 'how to', 'what does', 'look like', 'see', 'visual', 'picture', 
    'image', 'demonstrate', 'steps', 'guide', 'procedure', 'process'
  ];
  
  // Check for visual request keywords
  const hasVisualRequest = visualKeywords.some(keyword => message.includes(keyword));
  
  // Check for maintenance topics that benefit from images
  const hasMaintenance = Object.keys(MAINTENANCE_IMAGES).some(topic => message.includes(topic));
  
  return hasVisualRequest || hasMaintenance;
};

/**
 * Get relevant images based on user message content
 */
const getRelevantImages = (userMessage: string, context: ConversationContext): string[] => {
  const message = userMessage.toLowerCase();
  let images: string[] = [];
  const addedImages = new Set<string>(); // Prevent duplicates
  
  // First check for multi-step procedures
  for (const [procedure, config] of Object.entries(MULTI_STEP_PROCEDURES)) {
    if (message.includes(procedure)) {
      config.images.forEach(img => {
        if (!addedImages.has(img)) {
          images.push(img);
          addedImages.add(img);
        }
      });
      // If we found a multi-step procedure, return its images (don't add more)
      return images;
    }
  }
  
  // If no multi-step procedure found, check individual maintenance topics
  Object.entries(MAINTENANCE_IMAGES).forEach(([topic, imagePath]) => {
    if (message.includes(topic) && !addedImages.has(imagePath)) {
      images.push(imagePath);
      addedImages.add(imagePath);
    }
  });
  
  // If no specific matches but user is asking for help/guidance, show troubleshooting
  if (images.length === 0) {
    const helpKeywords = ['help', 'guide', 'how', 'what', 'steps', 'procedure'];
    if (helpKeywords.some(keyword => message.includes(keyword))) {
      images.push(MAINTENANCE_IMAGES.troubleshoot);
    }
  }
  
  // Limit to 3 images max to avoid overwhelming
  return images.slice(0, 3);
};

/**
 * Get relevant videos for multi-step procedures
 */
const getRelevantVideos = (userMessage: string, context: ConversationContext): string[] => {
  const message = userMessage.toLowerCase();
  const videos: string[] = [];
  
  // Check for multi-step procedures that have videos
  for (const [procedure, config] of Object.entries(MULTI_STEP_PROCEDURES)) {
    if (message.includes(procedure) && config.videos.length > 0) {
      videos.push(...config.videos);
      // Return first matching procedure's videos
      return videos;
    }
  }
  
  return videos;
};

export interface ConversationContext {
  selectedMachine?: string;
  currentIssue?: string;
  activeWorkOrder?: string;
  troubleshootingStep?: number;
  sessionId: string;
}

export interface ContextualResponse {
  text: string;
  options?: string[];
  images?: string[];
  videos?: string[];
  requiresAction?: boolean;
  nextStep?: string;
}

/**
 * Extract key topics from conversation history for context awareness
 */
const extractKeyTopics = (history: Message[]): string => {
  if (history.length === 0) return 'No previous topics';
  
  const allText = history.map(msg => msg.text.toLowerCase()).join(' ');
  const topics: string[] = [];
  
  // Machine-related topics
  if (/machine|cm-2000|coffee|espresso/.test(allText)) topics.push('machine selection');
  if (/clean|maintenance|service|descal/.test(allText)) topics.push('maintenance procedures');
  if (/troubleshoot|problem|issue|broken|not working/.test(allText)) topics.push('troubleshooting');
  if (/work order|ticket|repair/.test(allText)) topics.push('work orders');
  if (/part|component|filter|replace/.test(allText)) topics.push('parts and components');
  if (/manual|guide|instruction/.test(allText)) topics.push('documentation');
  if (/(water filter|grinder|burr|steam|temperature)/.test(allText)) topics.push('specific components');
  
  return topics.length > 0 ? topics.join(', ') : 'General maintenance discussion';
};

/**
 * Build comprehensive context prompt for OpenAI
 */
export const buildContextualPrompt = (
  userMessage: string,
  conversationHistory: Message[],
  context: ConversationContext
): string => {
  const recentHistory = conversationHistory.slice(-12).map(msg => 
    `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
  ).join('\n');

  const activeWorkOrder = context.activeWorkOrder ? 
    demoWorkOrders.find(wo => wo.id === context.activeWorkOrder) : null;

  const selectedMachine = context.selectedMachine ? 
    demoMachineOptions.find(m => m.machineNumber === context.selectedMachine) : null;

  // Build comprehensive machine information
  const machineDetails = selectedMachine ? `
**SELECTED MACHINE DETAILS:**
- Model: ${selectedMachine.label}
- ID: ${selectedMachine.machineNumber}
- Location: ${selectedMachine.location || 'Standard facility location'}
- Status: Operational
- Last Maintenance: Within acceptable range
- Common Issues: Refer to troubleshooting database
- Parts Compatibility: CM-2000 series universal parts
` : '';

  // Build conversation memory context
  const conversationContext = conversationHistory.length > 0 ? `
**CONVERSATION MEMORY & CONTINUITY:**
- Total conversation length: ${conversationHistory.length} exchanges
- Key topics discussed: ${extractKeyTopics(conversationHistory)}
- User preferences: Maintain conversation flow, provide step-by-step guidance
- Previous selections: ${context.selectedMachine ? `Machine ${context.selectedMachine}` : 'None'}
- Issue tracking: ${context.currentIssue || 'No active issue'}
` : '';

  return `You are an expert AI Coffee Machine Maintenance Assistant with deep knowledge of coffee machine troubleshooting, maintenance procedures, and work order management. You provide conversational, contextual responses that maintain conversation continuity and remember previous exchanges.

**CORE SYSTEM CONTEXT:**
- Date/Time: ${new Date().toLocaleString()}
- Session ID: ${context.sessionId}
- User is interacting with a maintenance chat system
- Conversation should be natural, helpful, and context-aware

**CURRENT CONVERSATION STATE:**
- Selected Machine: ${selectedMachine ? `${selectedMachine.label} (${selectedMachine.machineNumber})` : 'None selected yet'}
- Active Work Order: ${activeWorkOrder ? `${activeWorkOrder.id} - ${activeWorkOrder.task} (${activeWorkOrder.status})` : 'None'}
- Current Issue: ${context.currentIssue || 'None identified'}
- Troubleshooting Step: ${context.troubleshootingStep || 0}
- Session Progress: ${conversationHistory.length} exchanges

**AVAILABLE COFFEE MACHINES:**
${demoMachineOptions.map((m, i) => `${i + 1}. ${m.label} (ID: ${m.machineNumber}) - ${m.location || 'Standard location'}`).join('\n')}

${machineDetails}

**ACTIVE WORK ORDERS & MAINTENANCE STATUS:**
${demoWorkOrders.slice(0, 5).map(wo => `- ${wo.id}: ${wo.task} (${wo.status}) - Assigned: ${wo.assignedTo}, Location: ${wo.location}`).join('\n')}

**RECENT MAINTENANCE HISTORY:**
${demoPastLogs.slice(0, 5).map(log => `- ${log.date}: ${log.summary} [${log.machineId || 'General'}]`).join('\n')}

**COMPLETE CONVERSATION HISTORY:**
${recentHistory}

${conversationContext}

**MAINTENANCE KNOWLEDGE BASE:**
- Coffee Machine Models: CM-2000 series (primary), various commercial espresso machines
- Common Issues: Power problems, coffee quality issues, grinding problems, water system issues
- Maintenance Procedures: Daily cleaning, weekly descaling, monthly inspections, quarterly overhauls
- Parts Database: Filters, burrs, seals, sensors, electrical components with specific part numbers
- Safety Protocols: Lockout/tagout, electrical safety, chemical handling, emergency procedures

**RESPONSE GUIDELINES:**
1. **Maintain Conversation Continuity**: Reference previous exchanges and build upon established context
2. **Be Contextually Aware**: Remember machine selections, ongoing issues, and user preferences
3. **Provide Progressive Assistance**: Build on previous steps rather than starting over
4. **Use Natural Language**: Avoid robotic responses; be conversational and helpful
5. **Reference Specific Information**: Use machine IDs, part numbers, and specific procedures
6. **Handle Context Transitions**: Smoothly move between topics while maintaining awareness
7. **Provide Actionable Guidance**: Offer specific next steps based on conversation context
8. **Remember User Intent**: Understand what the user is trying to accomplish
9. **Include Relevant Media**: Suggest images/videos when they would help (format: ![description](image-url) or [video:description])
10. **Maintain Professional Tone**: Expert but approachable, technical but understandable

**CURRENT USER MESSAGE:** "${userMessage}"

**RESPONSE REQUIREMENTS:**
- Acknowledge conversation context and history
- Reference the selected machine if applicable
- Continue any ongoing troubleshooting or work order processes
- Provide specific, actionable guidance
- Include relevant media when helpful for procedures or diagnostics
- Maintain natural conversation flow
- Remember and build upon previous exchanges
- Be helpful and solution-oriented
- **RESPOND IN THE SAME LANGUAGE AS THE USER'S INPUT**: Always detect and match the language of the user's message. If they write in Spanish, respond in Spanish. If they write in French, respond in French. If they write in English, respond in English.

Respond naturally and contextually, maintaining conversation continuity while providing expert maintenance assistance.`;
};

/**
 * Get contextual response from OpenAI or enhanced demo system
 */
export const getOpenAIResponse = async (
  userMessage: string,
  conversationHistory: Message[],
  context: ConversationContext
): Promise<ContextualResponse> => {
  // Get API key with runtime fallback
  let apiKey = OPENAI_API_KEY;
  
  // If no API key found during initial load, try runtime config service
  if (!apiKey) {
    console.log('🔄 No API key found at startup, checking runtime configuration...');
    try {
      apiKey = await configService.getOpenAIApiKey();
      console.log(`🔑 Runtime API key: ${apiKey ? 'Found (' + apiKey.length + ' chars)' : 'Not found'}`);
    } catch (error) {
      console.warn('⚠️ Failed to fetch runtime configuration:', error);
    }
  }
  
  // Helper function to validate API key (consistent with getOpenAIKey)
  const isValidApiKey = (key: any): boolean => {
    return key && 
           typeof key === 'string' && 
           key !== 'false' && 
           key !== 'undefined' && 
           key !== 'null' && 
           key !== '' && 
           key !== 'your-openai-api-key-here' &&
           key.length > 10;
  };
  
  // Try OpenAI first - only fall back to demo if explicitly disabled or if there's an error
  const shouldUseOpenAI = isValidApiKey(apiKey);
  
  console.log('🔍 OpenAI Validation Details:');
  console.log(`   - API Key exists: ${!!apiKey}`);
  console.log(`   - API Key not placeholder: ${apiKey !== 'your-openai-api-key-here'}`);
  console.log(`   - API Key not "false": ${apiKey !== 'false'}`);
  console.log(`   - API Key length > 10: ${apiKey?.length > 10} (actual length: ${apiKey?.length || 0})`);
  console.log(`   - Should use OpenAI: ${shouldUseOpenAI}`);
  
  if (shouldUseOpenAI) {
    try {
      console.log('🤖 Using OpenAI for contextual response...');
      const systemPrompt = buildContextualPrompt(userMessage, conversationHistory, context);
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        console.warn(`OpenAI API error: ${response.status} - ${response.statusText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Please try again.';
      
      console.log('✅ OpenAI response received successfully');
      
      // Intelligent image detection based on user message and AI response
      const shouldIncludeImages = detectImageNeed(userMessage, context);
      const contextualImages = shouldIncludeImages ? getRelevantImages(userMessage, context) : [];
      const contextualVideos = shouldIncludeImages ? getRelevantVideos(userMessage, context) : [];
      
      // Extract additional images and videos from the AI response itself
      const { cleanText, images: responseImages } = parseResponseForMedia(aiText);
      const responseVideos = extractVideosFromResponse(aiText);
      
      // Combine contextual images with any images found in the response
      const allImages = [...contextualImages, ...responseImages];
      const allVideos = [...contextualVideos, ...responseVideos];
      
      return {
        text: cleanText,
        images: allImages.length > 0 ? allImages : undefined,
        videos: allVideos.length > 0 ? allVideos : undefined,
        options: [], // No predefined options - pure AI response
        requiresAction: needsUserAction(cleanText, context)
      };
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      console.log('🔄 Falling back to enhanced demo system...');
      // Fall back to enhanced demo system
    }
  } else {
    console.log('⚠️ OpenAI API key not configured, using enhanced demo system...');
  }

  // Enhanced fallback response system for demo mode or when OpenAI is not available
  return getEnhancedDemoResponse(userMessage, conversationHistory, context);
};

/**
 * Enhanced demo response system with pure AI-style responses and media
 */
const getEnhancedDemoResponse = (
  userMessage: string,
  conversationHistory: Message[],
  context: ConversationContext
): ContextualResponse => {
  const userLower = userMessage.toLowerCase();
  const recentHistory = conversationHistory.slice(-4);
  
  // Get context from recent conversation
  const recentText = recentHistory.map(msg => msg.text.toLowerCase()).join(' ');
  
  // Advanced typo correction and intent recognition
  const correctedMessage = correctTypos(userMessage);
  const intent = detectAdvancedIntent(correctedMessage, recentText, context);
  
  // Generate contextual AI-style response with media
  const response = generateAIStyleResponse(correctedMessage, context, conversationHistory, intent);
  
  return response;
};

/**
 * Generate AI-style contextual response with media
 */
const generateAIStyleResponse = (
  message: string,
  context: ConversationContext,
  history: Message[],
  intent: string
): ContextualResponse => {
  const machine = context.selectedMachine ? 
    demoMachineOptions.find(m => m.machineNumber === context.selectedMachine) : null;
  
  const workOrder = context.activeWorkOrder ? 
    demoWorkOrders.find(wo => wo.id === context.activeWorkOrder) : null;
  
  // Handle different conversation scenarios
  if (intent === 'greeting') {
    return generateGreetingResponse(context, machine, workOrder, message);
  }
  
  if (!context.selectedMachine && needsMachineSelection(message.toLowerCase())) {
    return generateMachineSelectionResponse(message);
  }
  
  if (context.selectedMachine && !context.currentIssue && needsIssueIdentification(message.toLowerCase())) {
    return generateIssueIdentificationResponse(message, machine!);
  }
  
  if (context.activeWorkOrder && context.currentIssue) {
    return generateTroubleshootingResponse(message, context, machine!, workOrder!);
  }
  
  if (intent === 'troubleshooting') {
    return generateInitialTroubleshootingResponse(message, context, machine);
  }
  
  if (intent === 'maintenance') {
    return generateMaintenanceResponse(message, context, machine);
  }
  
  if (intent === 'work_orders') {
    return generateWorkOrderResponse(message, context);
  }
  
  if (intent === 'parts') {
    return generatePartsResponse(message, context, machine);
  }
  
  if (intent === 'documentation') {
    return generateDocumentationResponse(message, context);
  }
  
  // Handle typo corrections
  if (message !== correctTypos(message)) {
    const originalResponse = generateAIStyleResponse(correctTypos(message), context, history, intent);
    return {
      text: `I understood "${message}" as "${correctTypos(message)}". ${originalResponse.text}`,
      images: originalResponse.images,
      videos: originalResponse.videos,
      options: [],
      requiresAction: originalResponse.requiresAction
    };
  }
  
  // Default contextual response
  return generateDefaultResponse(message, context, machine, history);
};

/**
 * Generate greeting response with context
 */
const generateGreetingResponse = (
  context: ConversationContext,
  machine: any,
  workOrder: any,
  userMessage: string = ''
): ContextualResponse => {
  const detectedLang = detectLanguage(userMessage);
  
  let text = getLocalizedText(detectedLang, {
    en: "Hello! I'm your AI coffee machine maintenance assistant. ",
    es: "¡Hola! Soy tu asistente de IA para mantenimiento de máquinas de café. ",
    fr: "Bonjour! Je suis votre assistant IA pour la maintenance des machines à café. "
  });
  
  if (workOrder) {
    text += getLocalizedText(detectedLang, {
      en: `I see we have an active work order (${workOrder.id}) for ${workOrder.task}. How can I help you continue with this?`,
      es: `Veo que tenemos una orden de trabajo activa (${workOrder.id}) para ${workOrder.task}. ¿Cómo puedo ayudarte a continuar con esto?`,
      fr: `Je vois que nous avons un ordre de travail actif (${workOrder.id}) pour ${workOrder.task}. Comment puis-je vous aider à continuer avec ceci?`
    });
  } else if (machine) {
    text += getLocalizedText(detectedLang, {
      en: `I notice you're working with ${machine.label}. What can I help you with today?`,
      es: `Noto que estás trabajando con ${machine.label}. ¿En qué puedo ayudarte hoy?`,
      fr: `Je remarque que vous travaillez avec ${machine.label}. Comment puis-je vous aider aujourd'hui?`
    });
  } else {
    text += getLocalizedText(detectedLang, {
      en: "I'm here to help you with troubleshooting, maintenance, work orders, and any questions about your coffee machines. What would you like assistance with?",
      es: "Estoy aquí para ayudarte con la resolución de problemas, mantenimiento, órdenes de trabajo y cualquier pregunta sobre tus máquinas de café. ¿Con qué te gustaría que te ayude?",
      fr: "Je suis là pour vous aider avec le dépannage, la maintenance, les ordres de travail et toute question concernant vos machines à café. Avec quoi aimeriez-vous de l'aide?"
    });
  }
  
  // Include images if user is asking for visual help
  const shouldIncludeImages = detectImageNeed(userMessage, context);
  const contextualImages = shouldIncludeImages ? getRelevantImages(userMessage, context) : [];
  const contextualVideos = shouldIncludeImages ? getRelevantVideos(userMessage, context) : [];
  
  return {
    text,
    images: contextualImages,
    videos: contextualVideos,
    options: [],
    requiresAction: false
  };
};

/**
 * Generate machine selection response
 */
const generateMachineSelectionResponse = (message: string): ContextualResponse => {
  const machineHint = extractMachineHint(message);
  const detectedLang = detectLanguage(message);
  
  let text = machineHint 
    ? getLocalizedText(detectedLang, {
        en: `I see you mentioned "${machineHint}". Let me help you select the correct machine. `,
        es: `Veo que mencionaste "${machineHint}". Permíteme ayudarte a seleccionar la máquina correcta. `,
        fr: `Je vois que vous avez mentionné "${machineHint}". Laissez-moi vous aider à sélectionner la bonne machine. `
      })
    : getLocalizedText(detectedLang, {
        en: "I'd be happy to help with your coffee machine issue! ",
        es: "¡Estaré encantado de ayudarte con el problema de tu máquina de café! ",
        fr: "Je serais ravi de vous aider avec votre problème de machine à café! "
      });
  
  text += getLocalizedText(detectedLang, {
    en: `We have several coffee machines available:\n\n`,
    es: `Tenemos varias máquinas de café disponibles:\n\n`,
    fr: `Nous avons plusieurs machines à café disponibles:\n\n`
  });
  
  text += demoMachineOptions.map((m, i) => 
    `${i + 1}. ${m.label} (ID: ${m.machineNumber})`
  ).join('\n');
  
  text += getLocalizedText(detectedLang, {
    en: `\n\nWhich machine would you like to work with? You can tell me the number or name.`,
    es: `\n\n¿Con qué máquina te gustaría trabajar? Puedes decirme el número o el nombre.`,
    fr: `\n\nAvec quelle machine aimeriez-vous travailler? Vous pouvez me dire le numéro ou le nom.`
  });
  
  return {
    text,
    images: [MAINTENANCE_IMAGES.troubleshoot],
    videos: [],
    options: [],
    requiresAction: true
  };
};

/**
 * Generate issue identification response
 */
const generateIssueIdentificationResponse = (message: string, machine: any): ContextualResponse => {
  const issueHint = extractIssueHint(message);
  
  let text = `Perfect! You're working with ${machine.label}. `;
  
  if (issueHint) {
    text += `I noticed you mentioned "${issueHint}" - let me help you with that specific issue. Could you describe what exactly is happening?`;
  } else {
    text += `What specific issue are you experiencing? Please describe what's happening with the machine - for example, is it not starting, making unusual noises, producing poor quality coffee, or showing error messages?`;
  }
  
  return {
    text,
    images: [demoConfig.placeholderMedia.images.troubleshooting],
    videos: [],
    options: [],
    requiresAction: true
  };
};

/**
 * Generate troubleshooting response for active work orders
 */
const generateTroubleshootingResponse = (
  message: string,
  context: ConversationContext,
  machine: any,
  workOrder: any
): ContextualResponse => {
  const step = (context.troubleshootingStep || 0) + 1;
  const userLower = message.toLowerCase();
  
  let text = `🔧 **Continuing Work Order ${workOrder.id}** - Step ${step}\n\n`;
  text += `**Machine:** ${machine.label}\n`;
  text += `**Issue:** ${context.currentIssue}\n\n`;
  
  if (userLower.includes('yes') || userLower.includes('done') || userLower.includes('completed')) {
    text += `Excellent! Step ${step - 1} is completed. Now let's move to the next step:\n\n`;
    text += getDetailedTroubleshootingStep(context.currentIssue!, step);
  } else if (userLower.includes('no') || userLower.includes('problem') || userLower.includes('stuck')) {
    text += `I understand you're having difficulty with the current step. Let me provide an alternative approach:\n\n`;
    text += getAlternativeTroubleshootingApproach(context.currentIssue!, step);
  } else {
    text += `Based on your input "${message}", let me guide you through the next diagnostic step:\n\n`;
    text += getDetailedTroubleshootingStep(context.currentIssue!, step);
  }
  
  const mediaInfo = getTroubleshootingMedia(context.currentIssue!);
  
  return {
    text,
    images: mediaInfo.images,
    videos: mediaInfo.videos,
    options: [],
    requiresAction: true
  };
};

/**
 * Generate initial troubleshooting response
 */
const generateInitialTroubleshootingResponse = (
  message: string,
  context: ConversationContext,
  machine: any
): ContextualResponse => {
  let text = `🔧 **AI Troubleshooting Assistant**\n\n`;
  text += `I understand you're experiencing: "${message}"\n\n`;
  
  if (machine) {
    text += `Since you're working with ${machine.label}, I'll start a systematic diagnostic process. `;
  } else {
    text += `I'll help you troubleshoot this issue, but first I need to know which machine you're working with. `;
  }
  
  if (machine) {
    const issueType = categorizeIssue(message);
    text += `\n\nBased on your description, this appears to be a ${issueType} issue. Let me create a work order and guide you through the troubleshooting process:\n\n`;
    text += getInitialDiagnosticSteps(issueType);
    
    const mediaInfo = getTroubleshootingMedia(issueType);
    
    return {
      text,
      images: mediaInfo.images,
      videos: mediaInfo.videos,
      options: [],
      requiresAction: true
    };
  }
  
  return {
    text,
    images: [demoConfig.placeholderMedia.images.diagnostic],
    videos: [],
    options: [],
    requiresAction: true
  };
};

/**
 * Generate maintenance response
 */
const generateMaintenanceResponse = (
  message: string,
  context: ConversationContext,
  machine: any
): ContextualResponse => {
  const maintenanceType = categorizeMaintenance(message);
  
  let text = `🧽 **Maintenance Guidance**${machine ? ` for ${machine.label}` : ''}\n\n`;
  
  switch (maintenanceType) {
    case 'cleaning':
      text += `I'll guide you through the proper cleaning procedure. This is essential for maintaining coffee quality and machine longevity.\n\n`;
      text += getCleaningProcedure(machine?.machineNumber);
      break;
    case 'descaling':
      text += `Descaling is crucial for removing mineral buildup. I'll walk you through the complete descaling process.\n\n`;
      text += getDescalingProcedure(machine?.machineNumber);
      break;
    case 'preventive':
      text += `Preventive maintenance helps avoid issues before they occur. Here's your customized maintenance schedule:\n\n`;
      text += getPreventiveMaintenanceSchedule(machine?.machineNumber);
      break;
    default:
      text += `I can help you with various maintenance procedures. What specific maintenance do you need assistance with?\n\n`;
      text += `Common maintenance tasks include:\n• Daily cleaning routines\n• Weekly descaling\n• Monthly inspections\n• Parts replacement\n• Preventive maintenance scheduling`;
  }
  
  const mediaInfo = getMaintenanceMedia(maintenanceType);
  
  return {
    text,
    images: mediaInfo.images,
    videos: mediaInfo.videos,
    options: [],
    requiresAction: maintenanceType === 'general'
  };
};

const generateWorkOrderResponse = (message: string, context: ConversationContext): ContextualResponse => {
  const messageLower = message.toLowerCase();
  let text = '';
  
  if (messageLower.includes('create') || messageLower.includes('new')) {
    text = `📋 **Creating New Work Order**\n\n`;
    
    if (context.selectedMachine && context.currentIssue) {
      const machine = demoMachineOptions.find(m => m.machineNumber === context.selectedMachine);
      text += `I'll create a work order with the following details:\n\n`;
      text += `• **Machine:** ${machine?.label} (${machine?.machineNumber})\n`;
      text += `• **Issue:** ${context.currentIssue}\n`;
      text += `• **Priority:** Medium (adjustable based on urgency)\n`;
      text += `• **Status:** Open\n\n`;
      text += `Should I proceed with creating this work order, or would you like to modify any details?`;
    } else {
      text += `To create a work order, I'll need some information:\n\n`;
      text += `• Which machine needs service?\n`;
      text += `• What is the issue or maintenance needed?\n`;
      text += `• What's the urgency level?\n\n`;
      text += `Please provide these details and I'll create the work order for you.`;
    }
  } else if (messageLower.includes('show') || messageLower.includes('view') || messageLower.includes('list')) {
    const activeOrders = demoWorkOrders.slice(0, 5);
    text = `📋 **Current Work Orders** (${demoWorkOrders.length} total)\n\n`;
    text += activeOrders.map((wo, i) => 
      `**${i + 1}. ${wo.id}** - ${wo.task}\n   📍 Location: ${wo.location}\n   ⏰ Status: ${wo.status}\n   👤 Assigned: ${wo.assignedTo}\n   📅 Created: ${wo.dateCreated || 'Today'}`
    ).join('\n\n');
    text += `\n\nWould you like details on any specific work order, or need help with something else?`;
  } else {
    text = `📋 **Work Order Management**\n\n`;
    text += `I can help you with:\n\n`;
    text += `• **Create new work orders** for maintenance requests\n`;
    text += `• **View existing orders** and their current status\n`;
    text += `• **Update order progress** and add completion notes\n`;
    text += `• **Assign technicians** and set priorities\n`;
    text += `• **Generate reports** for completed work\n\n`;
    text += `What would you like me to help you with regarding work orders?`;
  }
  
  // Include images if applicable for work order context
  const shouldIncludeImages = detectImageNeed(message, context);
  const contextualImages = shouldIncludeImages ? getRelevantImages(message, context) : [];
  const contextualVideos = shouldIncludeImages ? getRelevantVideos(message, context) : [];
  
  return {
    text,
    images: contextualImages,
    videos: contextualVideos,
    options: [],
    requiresAction: true
  };
};

/**
 * Generate parts response
 */
const generatePartsResponse = (
  message: string,
  context: ConversationContext,
  machine: any
): ContextualResponse => {
  const messageLower = message.toLowerCase();
  let text = `🔧 **Parts & Components**${machine ? ` for ${machine.label}` : ''}\n\n`;
  
  // Handle specific part requests
  if (messageLower.includes('water filter')) {
    text += `**Water Filter Information:**\n\n`;
    text += `• **Part Number:** CM-WF-002-${machine?.machineNumber?.slice(-3) || '001'}\n`;
    text += `• **Compatibility:** All CM-2000 series machines\n`;
    text += `• **Replacement Interval:** Every 3 months or 1000 cycles\n`;
    text += `• **Installation Time:** 5 minutes\n`;
    text += `• **Current Status:** ${machine ? 'Due for replacement in 2 weeks' : 'Please select machine for status'}\n\n`;
    text += `**Installation Instructions:**\n`;
    text += `1. Turn off machine and disconnect power\n`;
    text += `2. Remove water reservoir\n`;
    text += `3. Unscrew filter housing (counterclockwise)\n`;
    text += `4. Replace filter cartridge\n`;
    text += `5. Reassemble and reset filter counter\n\n`;
    text += `Would you like me to create a work order for this replacement?`;
    
    return {
      text,
      images: [demoConfig.placeholderMedia.images.parts, demoConfig.placeholderMedia.images.maintenance],
      videos: [demoConfig.placeholderMedia.videos.parts],
      options: [],
      requiresAction: true
    };
  }
  
  // Handle grinder burr requests
  if (messageLower.includes('grinder') || messageLower.includes('burr')) {
    text += `**Grinder Burr Set Information:**\n\n`;
    text += `• **Part Number:** CM-UB-004-${machine?.machineNumber?.slice(-3) || '001'}\n`;
    text += `• **Compatibility:** CM-2000 series with built-in grinder\n`;
    text += `• **Replacement Interval:** Every 6-12 months (based on usage)\n`;
    text += `• **Installation Time:** 30 minutes\n\n`;
    text += `**Signs for Replacement:**\n`;
    text += `• Inconsistent grind size\n• Excessive grinding noise\n• Poor coffee extraction\n• Visible wear on burr surfaces\n\n`;
    text += `This replacement requires technical expertise. Should I schedule a technician visit?`;
    
    return {
      text,
      images: [demoConfig.placeholderMedia.images.grinder, demoConfig.placeholderMedia.images.parts],
      videos: [demoConfig.placeholderMedia.videos.grinder],
      options: [],
      requiresAction: true
    };
  }
  
  // Handle part number requests
  if (messageLower.includes('part number') || messageLower.includes('part numbers') || 
      messageLower.includes('provide part numbers') || messageLower.includes('ordering')) {
    
    text += `**Common Part Numbers for ${machine?.label || 'CM-2000 Series'}:**\n\n`;
    text += `**Filters & Consumables:**\n`;
    text += `• Water Filter: CM-WF-002-${machine?.machineNumber?.slice(-3) || 'XXX'}\n`;
    text += `• Grinder Burr Set: CM-UB-004-${machine?.machineNumber?.slice(-3) || 'XXX'}\n`;
    text += `• Steam Valve Seals: CM-SVS-014\n`;
    text += `• Temperature Sensor: CM-TS-008\n\n`;
    
    text += `**Electrical Components:**\n`;
    text += `• Main Control Board: CM-MCB-100\n`;
    text += `• Heating Element: CM-HE-350\n`;
    text += `• Water Pump: CM-WP-220\n`;
    text += `• Power Supply: CM-PS-480\n\n`;
    
    text += `**Mechanical Parts:**\n`;
    text += `• Portafilter Assembly: CM-PF-025\n`;
    text += `• Group Head Screen: CM-GHS-012\n`;
    text += `• Drip Tray: CM-DT-040\n`;
    text += `• Water Reservoir: CM-WR-060\n\n`;
    
    text += `Which specific parts do you need information about or want to order?`;
    
    return {
      text,
      images: [demoConfig.placeholderMedia.images.parts, demoConfig.placeholderMedia.images.diagnostic],
      videos: [],
      options: [],
      requiresAction: true
    };
  }
  
  // Handle replacement/ordering requests
  if (messageLower.includes('replace') || messageLower.includes('order')) {
    text += `I'll help you identify the correct parts needed. `;
    if (context.currentIssue) {
      text += `Based on the issue "${context.currentIssue}", here are the commonly needed parts:\n\n`;
      text += getRelevantParts(context.currentIssue, machine?.machineNumber);
    } else {
      text += `What part do you need to replace, or what issue are you trying to fix?\n\n`;
      text += `Common replacement parts include:\n• Water filters\n• Grinder burrs\n• Steam valve seals\n• Temperature sensors\n• Heating elements`;
    }
  } else {
    text += `I can help you with:\n\n`;
    text += `• **Identify parts** needed for specific repairs\n`;
    text += `• **Check compatibility** with your machine model\n`;
    text += `• **Provide part numbers** for ordering\n`;
    text += `• **Installation guidance** with step-by-step instructions\n`;
    text += `• **Maintenance schedules** for part replacement\n\n`;
    text += `What specific parts assistance do you need?`;
  }
  
  // Include contextual images based on the parts request
  const shouldIncludeImages = detectImageNeed(message, context);
  const contextualImages = shouldIncludeImages ? getRelevantImages(message, context) : [];
  const fallbackImages = contextualImages.length > 0 ? contextualImages : [demoConfig.placeholderMedia.images.parts];
  
  return {
    text,
    images: fallbackImages,
    videos: machine ? [demoConfig.placeholderMedia.videos.parts] : [],
    options: [],
    requiresAction: true
  };
};

/**
 * Generate documentation response
 */
const generateDocumentationResponse = (message: string, context: ConversationContext): ContextualResponse => {
  let text = `📚 **Technical Documentation**\n\n`;
  
  const docType = categorizeDocumentationRequest(message);
  
  switch (docType) {
    case 'manual':
      text += `I have access to comprehensive maintenance manuals. What specific procedure do you need guidance on?\n\n`;
      text += `Available manual sections:\n• Operating procedures\n• Troubleshooting guides\n• Parts diagrams\n• Safety protocols\n• Maintenance schedules`;
      break;
    case 'video':
      text += `I can provide video tutorials for visual guidance. What procedure would you like to see demonstrated?\n\n`;
      text += `Available video tutorials:\n• Daily maintenance routines\n• Deep cleaning procedures\n• Parts replacement guides\n• Troubleshooting demonstrations\n• Safety procedures`;
      break;
    case 'safety':
      text += `Safety is our top priority. Here are the essential safety protocols:\n\n`;
      text += getSafetyProcedures();
      break;
    default:
      text += `I have extensive documentation available:\n\n`;
      text += `• **Interactive manuals** with step-by-step procedures\n`;
      text += `• **Video tutorials** for visual demonstrations\n`;
      text += `• **Safety protocols** and OSHA compliance guides\n`;
      text += `• **Technical specifications** for all machine models\n`;
      text += `• **Troubleshooting flowcharts** for systematic diagnosis\n\n`;
      text += `What specific documentation do you need?`;
  }
  
  const mediaInfo = getDocumentationMedia(docType);
  
  // Include additional contextual images based on user message
  const shouldIncludeImages = detectImageNeed(message, context);
  const contextualImages = shouldIncludeImages ? getRelevantImages(message, context) : [];
  const combinedImages = [...new Set([...mediaInfo.images, ...contextualImages])]; // Remove duplicates
  
  return {
    text,
    images: combinedImages,
    videos: mediaInfo.videos,
    options: [],
    requiresAction: true
  };
};

/**
 * Generate default contextual response
 */
const generateDefaultResponse = (
  message: string,
  context: ConversationContext,
  machine: any,
  history: Message[]
): ContextualResponse => {
  let text = `I understand you mentioned: "${message}"\n\n`;
  
  if (context.activeWorkOrder) {
    text += `Since we have an active work order (${context.activeWorkOrder}), I'm here to help continue the troubleshooting process. `;
  } else if (machine) {
    text += `Since you're working with ${machine.label}, I can provide specific guidance for this machine. `;
  } else {
    text += `I'm here to help with coffee machine maintenance and troubleshooting. `;
  }
  
  text += `\n\nI can assist you with:\n`;
  text += `• **Troubleshooting** specific issues and problems\n`;
  text += `• **Maintenance procedures** and cleaning routines\n`;
  text += `• **Work order management** for tracking repairs\n`;
  text += `• **Parts identification** and replacement guidance\n`;
  text += `• **Documentation** and technical manuals\n\n`;
  text += `What would you like help with?`;
  
  // Include images if applicable for default response
  const shouldIncludeImages = detectImageNeed(message, context);
  const contextualImages = shouldIncludeImages ? getRelevantImages(message, context) : [];
  const contextualVideos = shouldIncludeImages ? getRelevantVideos(message, context) : [];
  
  return {
    text,
    images: contextualImages,
    videos: contextualVideos,
    options: [],
    requiresAction: false
  };
};

/**
 * Helper functions for enhanced contextual responses
 */

// Extract machine hints from user message
const extractMachineHint = (message: string): string | null => {
  const machinePatterns = [
    /machine\s*(\d+)/i,
    /coffee\s*machine\s*(\d+)/i,
    /espresso\s*machine\s*(\d+)/i,
    /cm[-\s]*(\d+)/i
  ];
  
  for (const pattern of machinePatterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract issue hints from user message
const extractIssueHint = (message: string): string | null => {
  const issuePatterns = [
    { pattern: /won['']?t start|not starting|no power/i, hint: "startup issues" },
    { pattern: /taste|flavor|quality|bitter|weak/i, hint: "coffee quality issues" },
    { pattern: /noise|sound|grinding|clicking/i, hint: "unusual sounds" },
    { pattern: /water|steam|leak|pressure/i, hint: "water/steam problems" },
    { pattern: /error|code|display|message/i, hint: "error messages" },
    { pattern: /clean|maintenance|service|descale/i, hint: "maintenance needs" }
  ];
  
  for (const { pattern, hint } of issuePatterns) {
    if (pattern.test(message)) return hint;
  }
  return null;
};

// Handle ongoing troubleshooting with context
const handleOngoingTroubleshooting = (userMessage: string, context: ConversationContext): ContextualResponse => {
  const workOrder = demoWorkOrders.find(wo => wo.id === context.activeWorkOrder);
  const machine = demoMachineOptions.find(m => m.machineNumber === context.selectedMachine);
  const step = context.troubleshootingStep || 1;
  
  const userLower = userMessage.toLowerCase();
  
  // Handle common troubleshooting responses
  if (userLower.includes('yes') || userLower.includes('done') || userLower.includes('completed')) {
    const nextStep = step + 1;
    return {
      text: `✅ **Step ${step} completed** for Work Order ${workOrder?.id}\n\n🔧 **Step ${nextStep}:** ${getNextTroubleshootingStep(context.currentIssue, nextStep)}\n\nLet me know when you've completed this step or if you need clarification.`,
      options: ['Completed step', 'Need help', 'Skip this step', 'Call technician'],
      requiresAction: true
    };
  }
  
  if (userLower.includes('no') || userLower.includes('skip') || userLower.includes('stuck')) {
    return {
      text: `🔍 **Alternative approach** for ${context.currentIssue} on ${machine?.label}\n\nLet's try a different troubleshooting method:\n\n${getAlternativeTroubleshootingStep(context.currentIssue, step)}\n\nWould you like to try this approach?`,
      options: ['Try alternative method', 'Need technician', 'More details', 'Start over'],
      requiresAction: true
    };
  }
  
  // Provide contextual help
  return {
    text: `🔧 **Continuing troubleshooting** for Work Order ${workOrder?.id}\n\nCurrent step: ${getNextTroubleshootingStep(context.currentIssue, step)}\n\nI understand you said: "${userMessage}"\n\nHow can I help you with this step?`,
    options: ['Step completed', 'Need clarification', 'Having trouble', 'Call technician'],
    requiresAction: true
  };
};

// Check if message contains work order intent
const containsWorkOrderIntent = (message: string): boolean => {
  const workOrderKeywords = [
    'work order', 'workorder', 'ticket', 'service request',
    'create order', 'new order', 'show orders', 'view orders',
    'order status', 'track order', 'update order'
  ];
  
  const messageLower = message.toLowerCase();
  return workOrderKeywords.some(keyword => messageLower.includes(keyword));
};

// Handle work order requests with context
const handleWorkOrderRequest = (
  message: string, 
  context: ConversationContext, 
  history: Message[]
): ContextualResponse => {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('create') || messageLower.includes('new')) {
    const machine = context.selectedMachine 
      ? demoMachineOptions.find(m => m.machineNumber === context.selectedMachine)
      : null;
    
    return {
      text: `📋 **Creating New Work Order**\n\n${machine 
        ? `Machine: ${machine.label} (${machine.machineNumber})\n` 
        : 'Please specify which machine needs service.\n'
      }${context.currentIssue 
        ? `Issue: ${context.currentIssue}\n` 
        : ''
      }\nWhat additional details should I include in this work order?`,
      options: machine && context.currentIssue 
        ? ['Create work order now', 'Add more details', 'Set priority', 'Assign technician']
        : ['Select machine first', 'Describe issue', 'General maintenance', 'Emergency repair'],
      requiresAction: true
    };
  }
  
  if (messageLower.includes('show') || messageLower.includes('view') || messageLower.includes('list')) {
    const activeOrders = demoWorkOrders.slice(0, 3);
    return {
      text: `📋 **Current Work Orders** (${demoWorkOrders.length} total)\n\n${activeOrders.map((wo, i) => 
        `${i + 1}. **${wo.id}** - ${wo.task}\n   📍 ${wo.location} | ⏰ ${wo.status} | 👤 ${wo.assignedTo}`
      ).join('\n\n')}\n\nWould you like details on any specific work order?`,
      options: activeOrders.map(wo => `Details: ${wo.id}`).concat(['Create new order']),
      requiresAction: false
    };
  }
  
  return {
    text: `📋 **Work Order Management**\n\nI can help you with:\n• Creating new work orders\n• Viewing existing orders\n• Updating order status\n• Assigning technicians\n\nWhat would you like to do?`,
    options: ['Create new order', 'View all orders', 'Update existing', 'Search orders'],
    requiresAction: true
  };
};

// Check if message contains maintenance intent
const containsMaintenanceIntent = (message: string): boolean => {
  const maintenanceKeywords = [
    'maintenance', 'clean', 'descale', 'service', 'repair',
    'schedule', 'preventive', 'routine', 'inspection'
  ];
  
  const messageLower = message.toLowerCase();
  return maintenanceKeywords.some(keyword => messageLower.includes(keyword));
};

// Handle maintenance requests
const handleMaintenanceRequest = (message: string, context: ConversationContext): ContextualResponse => {
  const messageLower = message.toLowerCase();
  const machine = context.selectedMachine 
    ? demoMachineOptions.find(m => m.machineNumber === context.selectedMachine)
    : null;
  
  if (messageLower.includes('clean')) {
    return {
      text: `🧽 **Cleaning Procedures**${machine ? ` for ${machine.label}` : ''}\n\n**Available cleaning procedures:**\n• Daily cleaning routine (5 minutes)\n• Deep cleaning procedure (30 minutes)\n• Descaling process (45 minutes)\n• Filter replacement\n\nWhich cleaning procedure do you need?`,
      options: ['Daily cleaning', 'Deep cleaning', 'Descaling', 'Filter replacement'],
      requiresAction: true
    };
  }
  
  if (messageLower.includes('schedule')) {
    return {
      text: `📅 **Maintenance Scheduling**${machine ? ` for ${machine.label}` : ''}\n\n**Current schedule:**\n• Daily: Basic cleaning ✅\n• Weekly: Deep cleaning (Due in 2 days)\n• Monthly: Descaling (Overdue by 3 days)\n• Quarterly: Full inspection (Due next week)\n\nWhat would you like to schedule?`,
      options: ['Schedule cleaning', 'Schedule descaling', 'Full inspection', 'Custom schedule'],
      requiresAction: true
    };
  }
  
  return {
    text: `🔧 **Maintenance Assistance**${machine ? ` for ${machine.label}` : ''}\n\nI can help you with:\n• Cleaning procedures\n• Preventive maintenance\n• Scheduling services\n• Troubleshooting issues\n\nWhat maintenance do you need help with?`,
    options: ['Cleaning help', 'Schedule maintenance', 'Troubleshooting', 'Parts replacement'],
    requiresAction: true
  };
};

// Build contextual greeting
const buildContextualGreeting = (context: ConversationContext, history: Message[]): string => {
  const machine = context.selectedMachine 
    ? demoMachineOptions.find(m => m.machineNumber === context.selectedMachine)
    : null;
  
  const hasHistory = history.length > 0;
  const activeWorkOrder = context.activeWorkOrder 
    ? demoWorkOrders.find(wo => wo.id === context.activeWorkOrder)
    : null;
  
  let greeting = "Hello! 👋 I'm your AI coffee machine maintenance assistant.";
  
  if (activeWorkOrder) {
    greeting += ` I see we have an active work order (${activeWorkOrder.id}) for ${activeWorkOrder.task}.`;
  } else if (machine) {
    greeting += ` I see you're working with ${machine.label}.`;
  } else if (hasHistory) {
    greeting += " Welcome back!";
  }
  
  greeting += "\n\nHow can I help you today?";
  
  return greeting;
};

// Get smart initial options based on context
const getSmartInitialOptions = (context: ConversationContext): string[] => {
  if (context.activeWorkOrder) {
    return ['Continue troubleshooting', 'Work order status', 'Need technician', 'Start new issue'];
  }
  
  if (context.selectedMachine) {
    return ['Report new issue', 'Schedule maintenance', 'View machine status', 'Change machine'];
  }
  
  return ['Select machine', 'View work orders', 'Maintenance guidance', 'General help'];
};

// Generate response for corrected message
const generateResponseForMessage = (message: string, context: ConversationContext): ContextualResponse => {
  // This is a simplified version - in a real implementation, this would recursively call the main response function
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('broken') || messageLower.includes('not working')) {
    return {
      text: "I can help you troubleshoot that issue. Let me start a systematic diagnostic process.",
      options: ['Start troubleshooting', 'Create work order', 'Call technician'],
      requiresAction: true
    };
  }
  
  return {
    text: "I understand. How can I help you with that?",
    options: [],
    requiresAction: false
  };
};

// Build intelligent default response
const buildIntelligentDefaultResponse = (
  message: string, 
  context: ConversationContext, 
  history: Message[]
): ContextualResponse => {
  const machine = context.selectedMachine 
    ? demoMachineOptions.find(m => m.machineNumber === context.selectedMachine)
    : null;
  
  let response = `I understand you mentioned: "${message}"\n\n`;
  
  if (context.activeWorkOrder) {
    response += `Since we have an active work order (${context.activeWorkOrder}), I'm here to help continue the troubleshooting process.`;
  } else if (machine) {
    response += `Since you're working with ${machine.label}, I can help with specific maintenance or troubleshooting for this machine.`;
  } else {
    response += "I'm here to help with coffee machine maintenance and troubleshooting.";
  }
  
  response += "\n\nWhat would you like me to help you with?";
  
  return {
    text: response,
    requiresAction: false
  };
};

// Get next troubleshooting step
const getNextTroubleshootingStep = (issue: string | undefined, step: number): string => {
  if (!issue) return "Continue with general diagnostics";
  
  const steps: Record<string, string[]> = {
    "machine won't start": [
      "Check power connection and ensure it's plugged in securely",
      "Verify the power switch is in the ON position",
      "Check circuit breaker and reset if needed",
      "Inspect power cord for damage",
      "Test with different power outlet"
    ],
    "poor coffee quality": [
      "Check water reservoir level and refill if needed",
      "Verify grind size setting (should be medium-fine for espresso)",
      "Check bean freshness (use beans within 2 weeks of roasting)",
      "Clean coffee grounds from filter and group head",
      "Run cleaning cycle to remove oil buildup"
    ],
    "strange noises": [
      "Listen carefully to identify the type of noise (grinding, clicking, whirring)",
      "Check for foreign objects in grinder chamber",
      "Inspect burr alignment and tightness",
      "Verify all panels and components are secure",
      "Check water pump operation during brewing"
    ]
  };
  
  const issueSteps = steps[issue.toLowerCase()] || steps["machine won't start"];
  return issueSteps[Math.min(step - 1, issueSteps.length - 1)] || "Proceed with final diagnostic check";
};

// Get alternative troubleshooting step
const getAlternativeTroubleshootingStep = (issue: string | undefined, step: number): string => {
  const alternatives: Record<string, string> = {
    "machine won't start": "Try using a different power outlet and check if any indicator lights are visible",
    "poor coffee quality": "Run a test brew with fresh water only to check for equipment malfunctions",
    "strange noises": "Power down the machine and inspect all visible components for loose parts"
  };
  
  return alternatives[issue?.toLowerCase() || ""] || "Let's try a different diagnostic approach";
};

/**
 * Simple typo correction for common maintenance terms
 */
const correctTypos = (message: string): string => {
  const corrections = {
    'machien': 'machine',
    'machin': 'machine',
    'cofee': 'coffee',
    'coffe': 'coffee',
    'grindor': 'grinder',
    'maintance': 'maintenance',
    'maintenace': 'maintenance',
    'repiar': 'repair',
    'repaire': 'repair',
    'ned': 'need',
    'halp': 'help',
    'helP': 'help',
    'stange': 'strange',
    'wierd': 'weird',
    'noise': 'noise',
    'nois': 'noise'
  };
  
  let corrected = message;
  Object.entries(corrections).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  return corrected;
};

/**
 * Advanced intent detection with context awareness
 */
const detectAdvancedIntent = (message: string, recentText: string, context: ConversationContext): string => {
  const lower = message.toLowerCase();
  
  // Greeting patterns
  if (/^(hi|hello|hey|good morning|good afternoon)/.test(lower)) {
    return 'greeting';
  }
  
  // Thank you patterns
  if (/(thank|thanks|thx|appreciate)/.test(lower)) {
    return 'thank_you';
  }
  
  // Goodbye patterns
  if (/(bye|goodbye|see you|take care|farewell)/.test(lower)) {
    return 'goodbye';
  }
  
  // Troubleshooting patterns
  if (/(broken|not working|issue|problem|error|fix|repair|troubleshoot|diagnostic)/.test(lower)) {
    return 'troubleshooting';
  }
  
  // Maintenance patterns
  if (/(clean|maintenance|service|descal|routine|schedule|preventive)/.test(lower)) {
    return 'maintenance';
  }
  
  // Work order patterns
  if (/(work order|ticket|request|create|status|complete|close)/.test(lower)) {
    return 'work_orders';
  }
  
  // Parts patterns
  if (/(part|component|replace|order|inventory|spare|filter|burr|seal)/.test(lower)) {
    return 'parts';
  }
  
  // Documentation patterns
  if (/(manual|guide|instruction|how to|show me|documentation|procedure)/.test(lower)) {
    return 'documentation';
  }
  
  // Status check patterns
  if (/(status|check|what|which|when|where|how)/.test(lower)) {
    return 'status_check';
  }
  
  // Completion patterns
  if (/(done|finish|complete|solved|fixed|working|resolved)/.test(lower)) {
    return 'completion';
  }
  
  return 'general';
};

/**
 * Check if message needs machine selection
 */
const needsMachineSelection = (message: string): boolean => {
  return /(fix|repair|issue|problem|troubleshoot|broken|maintenance|clean|help with)/.test(message);
};

/**
 * Check if message needs issue type clarification
 */
const needsIssueType = (message: string): boolean => {
  return /(issue|problem|wrong|help|maintenance|service)/.test(message) && 
         !/(start|quality|noise|steam|error|routine)/.test(message);
};

/**
 * Handle advanced troubleshooting responses
 */
const handleAdvancedTroubleshooting = (
  message: string, 
  context: ConversationContext, 
  isFollowUp: boolean
): ContextualResponse => {
  const machine = demoMachineOptions.find(m => m.machineNumber === context.selectedMachine);
  const workOrder = demoWorkOrders.find(wo => wo.id === context.activeWorkOrder);
  
  const step = (context.troubleshootingStep || 0) + 1;
  
  return {
    text: `🔧 **Work Order: ${context.activeWorkOrder}** - Step ${step}\n\n` +
          `**Machine:** ${machine?.label}\n` +
          `**Issue:** ${context.currentIssue}\n\n` +
          `Based on your input "${message}", let me guide you through the next step:\n\n` +
          `**Current Status:** ${workOrder?.status || 'In Progress'}\n` +
          `**Next Action:** Continue troubleshooting with diagnostic procedures.\n\n` +
          `Please follow the step-by-step guidance and let me know the results.`,
    options: ['Continue troubleshooting', 'Issue resolved', 'Need technician', 'More details'],
    requiresAction: true
  };
};

/**
 * Get greeting response based on context
 */
const getGreetingResponse = (isFollowUp: boolean, context: ConversationContext): ContextualResponse => {
  const machine = context.selectedMachine ? 
    demoMachineOptions.find(m => m.machineNumber === context.selectedMachine) : null;
    
  const contextText = machine ? 
    `\n\nI see you're working with ${machine.label}. ` : 
    '\n\n';
    
  return {
    text: `Hi there! 👋 ${isFollowUp ? 'Great to continue our conversation!' : 'Welcome to the AI Maintenance Assistant!'}${contextText}How can I help you today?`,
    options: context.selectedMachine ? 
      ['Continue troubleshooting', 'New issue', 'Check work orders', 'Maintenance guidance'] :
      ['Troubleshoot an issue', 'Maintenance guidance', 'View work orders', 'Equipment info']
  };
};

/**
 * Get troubleshooting response
 */
const getTroubleshootingResponse = (
  message: string, 
  context: ConversationContext, 
  recentText: string
): ContextualResponse => {
  return {
    text: `🔧 **AI Troubleshooting Assistant**\n\nI understand you're experiencing: "${message}"\n\n` +
          `Let me help you diagnose and fix this issue systematically. ` +
          `${context.selectedMachine ? `We're working with your selected machine.` : 'First, I need to know which machine is having issues.'}\n\n` +
          `I'll guide you through step-by-step diagnostics to identify the root cause and provide solutions.`,
    options: context.selectedMachine ? 
      ['Start troubleshooting', 'Create work order', 'Get technician', 'More details'] :
      ['Select machine first', 'General guidance', 'Emergency help'],
    requiresAction: true
  };
};

/**
 * Get maintenance response
 */
const getMaintenanceResponse = (message: string, context: ConversationContext): ContextualResponse => {
  return {
    text: `🧽 **Maintenance Guidance**\n\nI can help you with comprehensive maintenance procedures:\n\n` +
          `• **Daily cleaning routines**\n• **Weekly descaling procedures**\n• **Monthly system inspections**\n• **Preventive maintenance scheduling**\n\n` +
          `What specific maintenance do you need help with?`,
    options: ['Daily cleaning', 'Descaling procedure', 'Monthly inspection', 'Create maintenance schedule']
  };
};

/**
 * Get work order response
 */
const getWorkOrderResponse = (message: string, context: ConversationContext): ContextualResponse => {
  const activeOrders = demoWorkOrders.slice(0, 3);
  
  return {
    text: `📋 **Work Order Management**\n\n**Active Work Orders (${activeOrders.length}):**\n\n` +
          activeOrders.map((wo, i) => 
            `${i + 1}. **${wo.id}** - ${wo.task}\n   📍 ${wo.location} | 🔧 ${wo.assignedTo}`
          ).join('\n\n') +
          `\n\nWhat would you like to do with work orders?`,
    options: ['View details', 'Create new order', 'Update status', 'Generate report']
  };
};

/**
 * Get parts response
 */
const getPartsResponse = (message: string, context: ConversationContext): ContextualResponse => {
  return {
    text: `🔧 **Parts & Components**\n\nI can help you with:\n\n` +
          `• **Identify needed parts** for repairs\n• **Check compatibility** with your machines\n• **Order replacement components**\n• **Track inventory** and usage\n\n` +
          `What parts assistance do you need?`,
    options: ['Identify parts needed', 'Check inventory', 'Order components', 'Replacement schedule']
  };
};

/**
 * Get documentation response
 */
const getDocumentationResponse = (message: string, context: ConversationContext): ContextualResponse => {
  return {
    text: `📚 **Technical Documentation**\n\nI have access to comprehensive resources:\n\n` +
          `• **Interactive maintenance manuals**\n• **Video tutorials**\n• **Safety procedures**\n• **Technical specifications**\n\n` +
          `What documentation do you need?`,
    options: ['Maintenance manual', 'Video tutorials', 'Safety procedures', 'Technical specs']
  };
};

/**
 * Get status response
 */
const getStatusResponse = (message: string, context: ConversationContext): ContextualResponse => {
  const machine = context.selectedMachine ? 
    demoMachineOptions.find(m => m.machineNumber === context.selectedMachine) : null;
    
  return {
    text: `📊 **System Status**\n\n` +
          `**Current Session:** ${context.sessionId}\n` +
          `**Selected Machine:** ${machine?.label || 'None'}\n` +
          `**Active Work Order:** ${context.activeWorkOrder || 'None'}\n` +
          `**Current Issue:** ${context.currentIssue || 'None'}\n\n` +
          `What status information do you need?`,
    options: ['Machine status', 'Work order status', 'Maintenance schedule', 'Overall system']
  };
};

/**
 * Get completion response
 */
const getCompletionResponse = (message: string, context: ConversationContext): ContextualResponse => {
  return {
    text: `✅ **Task Completion**\n\nGreat to hear things are working! ` +
          `${context.activeWorkOrder ? `Should I mark Work Order ${context.activeWorkOrder} as complete?` : ''}\n\n` +
          `Is there anything else I can help you with?`,
    options: context.activeWorkOrder ? 
      ['Mark work order complete', 'Add completion notes', 'Other issues', 'All done'] :
      ['Create completion report', 'Other issues', 'Maintenance tips', 'All done']
  };
};

/**
 * Get general response
 */
const getGeneralResponse = (
  message: string, 
  context: ConversationContext, 
  recentText: string, 
  isFollowUp: boolean
): ContextualResponse => {
  const machine = context.selectedMachine ? 
    demoMachineOptions.find(m => m.machineNumber === context.selectedMachine) : null;
    
  return {
    text: `I understand you mentioned: "${message}"\n\n` +
          `${machine ? `We're currently working with ${machine.label}. ` : ''}` +
          `I'm here to help with coffee machine maintenance! What would you like to focus on?\n\n` +
          `💬 I can help you with:\n• Troubleshooting specific issues\n• Maintenance procedures\n• Work order management\n• Equipment information`,
    options: machine ? 
      ['Continue with this machine', 'Switch to different machine', 'View work orders', 'Maintenance guidance'] :
      ['Select machine', 'View work orders', 'General help', 'Maintenance guidance']
  };
};

/**
 * Parse response for media content (images and videos)
 */
const parseResponseForMedia = (text: string): { cleanText: string; images: string[] } => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  let images: string[] = [];
  let cleanText = text;
  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    images.push(match[1]);
    cleanText = cleanText.replace(match[0], '');
  }
  return { cleanText: cleanText.trim(), images };
};

/**
 * Extract videos from response text
 */
const extractVideosFromResponse = (text: string): string[] => {
  const videoRegex = /\[video:(.*?)\]/g;
  const videos: string[] = [];
  let match;
  while ((match = videoRegex.exec(text)) !== null) {
    videos.push(match[1]);
  }
  return videos;
};

/**
 * Check if message needs issue identification
 */
const needsIssueIdentification = (message: string): boolean => {
  return /(issue|problem|wrong|help|maintenance|service|broken|not working)/.test(message) && 
         !/(start|quality|noise|steam|error|routine)/.test(message);
};

/**
 * Get detailed troubleshooting step
 */
const getDetailedTroubleshootingStep = (issue: string, step: number): string => {
  const steps: Record<string, string[]> = {
    "machine won't start": [
      "**Step 1:** Check power connection\n- Ensure the machine is plugged in securely\n- Verify the outlet is working by testing with another device\n- Check that the power cord is not damaged",
      "**Step 2:** Verify power switch and indicators\n- Make sure the power switch is in the ON position\n- Look for any indicator lights or display activity\n- Listen for any sounds when powering on",
      "**Step 3:** Check circuit breaker and safety switches\n- Verify the circuit breaker hasn't tripped\n- Check if there are any safety interlocks engaged\n- Ensure water reservoir is properly seated",
      "**Step 4:** Internal electrical check\n- With machine unplugged, check for loose connections\n- Inspect internal fuses if accessible\n- Verify all panels and doors are properly closed"
    ],
    "poor coffee quality": [
      "**Step 1:** Check water system\n- Verify water reservoir is full with fresh water\n- Check water filter expiration date\n- Run a test brew with water only",
      "**Step 2:** Inspect coffee grounds and grind\n- Check grind size setting (should be medium-fine for espresso)\n- Verify beans are fresh (within 2 weeks of roasting)\n- Check for proper dose amount",
      "**Step 3:** Clean brewing components\n- Remove and clean the portafilter and basket\n- Clean the group head and shower screen\n- Check for coffee oil buildup",
      "**Step 4:** Calibrate brewing parameters\n- Check water temperature (should be 195-205°F)\n- Verify brewing pressure (9 bars for espresso)\n- Adjust extraction time if needed"
    ],
    "strange noises": [
      "**Step 1:** Identify noise type and location\n- Listen carefully to determine if noise is grinding, clicking, or mechanical\n- Note when the noise occurs (startup, grinding, brewing, etc.)\n- Check if noise correlates with specific functions",
      "**Step 2:** Inspect grinder mechanism\n- Check for foreign objects in grinder chamber\n- Verify burr alignment and tightness\n- Look for excessive wear on burr surfaces",
      "**Step 3:** Check mechanical components\n- Verify all panels and covers are secure\n- Inspect pump mounting and connections\n- Check for loose screws or fasteners",
      "**Step 4:** Test individual functions\n- Run grinder separately to isolate grinding noises\n- Test pump operation without grinding\n- Check steam wand operation if applicable"
    ]
  };
  
  const issueSteps = steps[issue.toLowerCase()] || steps["machine won't start"];
  return issueSteps[Math.min(step - 1, issueSteps.length - 1)] || "Proceed with final diagnostic check and consider calling a technician.";
};

/**
 * Get alternative troubleshooting approach
 */
const getAlternativeTroubleshootingApproach = (issue: string, step: number): string => {
  const alternatives: Record<string, string> = {
    "machine won't start": "**Alternative approach:** Try using a different power outlet and check if the machine shows any signs of life (lights, sounds, display). If completely unresponsive, the issue may be internal electrical.",
    "poor coffee quality": "**Alternative approach:** Run a complete cleaning cycle with just water to rule out equipment malfunction. Then try with pre-ground coffee to eliminate grinder variables.",
    "strange noises": "**Alternative approach:** Power down the machine completely and perform a visual inspection of all accessible components. Check the machine manual for specific noise troubleshooting guides."
  };
  
  return alternatives[issue.toLowerCase()] || "Let's try a different diagnostic approach. Can you describe the issue in more detail?";
};

/**
 * Get troubleshooting media based on issue type
 */
const getTroubleshootingMedia = (issueType: string): { images: string[], videos: string[] } => {
  const mediaMap: Record<string, { images: string[], videos: string[] }> = {
    "machine won't start": {
      images: [demoConfig.placeholderMedia.images.troubleshooting, demoConfig.placeholderMedia.images.diagnostic],
      videos: [demoConfig.placeholderMedia.videos.troubleshooting]
    },
    "poor coffee quality": {
      images: [demoConfig.placeholderMedia.images.cleaning, demoConfig.placeholderMedia.images.maintenance],
      videos: [demoConfig.placeholderMedia.videos.maintenance]
    },
    "strange noises": {
      images: [demoConfig.placeholderMedia.images.grinder, demoConfig.placeholderMedia.images.parts],
      videos: [demoConfig.placeholderMedia.videos.grinder, demoConfig.placeholderMedia.videos.diagnostic]
    }
  };
  
  return mediaMap[issueType.toLowerCase()] || { images: [demoConfig.placeholderMedia.images.diagnostic], videos: [] };
};

/**
 * Categorize issue type from user message
 */
const categorizeIssue = (message: string): string => {
  const messageLower = message.toLowerCase();
  
  if (/(won't start|not starting|no power|dead|unresponsive)/.test(messageLower)) {
    return "machine won't start";
  }
  if (/(taste|flavor|quality|bitter|weak|watery|strong)/.test(messageLower)) {
    return "poor coffee quality";
  }
  if (/(noise|sound|grinding|clicking|whirring|loud)/.test(messageLower)) {
    return "strange noises";
  }
  if (/(water|steam|leak|pressure|flow)/.test(messageLower)) {
    return "water/steam issues";
  }
  if (/(error|code|display|message|warning)/.test(messageLower)) {
    return "error messages";
  }
  
  return "general issue";
};

/**
 * Get initial diagnostic steps
 */
const getInitialDiagnosticSteps = (issueType: string): string => {
  const steps: Record<string, string> = {
    "machine won't start": "**Initial Diagnostic Steps:**\n1. Check power connection and outlet\n2. Verify power switch is ON\n3. Look for any indicator lights\n4. Listen for startup sounds\n\nLet's start with step 1. Is the machine plugged in securely?",
    "poor coffee quality": "**Initial Diagnostic Steps:**\n1. Check water quality and level\n2. Verify grind size and bean freshness\n3. Inspect brewing temperature\n4. Clean brewing components\n\nLet's start with the water system. Is the water reservoir full with fresh water?",
    "strange noises": "**Initial Diagnostic Steps:**\n1. Identify when the noise occurs\n2. Locate the source of the sound\n3. Check for foreign objects\n4. Inspect mechanical components\n\nFirst, can you describe when exactly you hear the noise? Is it during startup, grinding, or brewing?",
    "general issue": "**Initial Diagnostic Steps:**\n1. Describe the specific symptoms\n2. Note when the issue occurs\n3. Check basic functions\n4. Review recent changes\n\nCan you provide more details about what exactly is happening with the machine?"
  };
  
  return steps[issueType] || steps["general issue"];
};

/**
 * Categorize maintenance type
 */
const categorizeMaintenance = (message: string): string => {
  const messageLower = message.toLowerCase();
  
  if (/(clean|cleaning|daily|routine)/.test(messageLower)) {
    return "cleaning";
  }
  if (/(descale|descaling|mineral|buildup)/.test(messageLower)) {
    return "descaling";
  }
  if (/(preventive|schedule|maintenance plan|regular)/.test(messageLower)) {
    return "preventive";
  }
  if (/(parts|replace|replacement|component)/.test(messageLower)) {
    return "parts";
  }
  
  return "general";
};

/**
 * Get cleaning procedure
 */
const getCleaningProcedure = (machineNumber?: string): string => {
  return `**Daily Cleaning Procedure:**

**External Cleaning (5 minutes):**
1. Wipe down exterior surfaces with damp cloth
2. Clean drip tray and water reservoir
3. Empty and rinse grounds container

**Internal Cleaning (10 minutes):**
1. Remove and wash portafilter and basket
2. Backflush group head with clean water
3. Clean steam wand if present
4. Wipe down internal surfaces

**Weekly Deep Clean (30 minutes):**
1. Remove all removable parts
2. Soak components in cleaning solution
3. Clean grinder chamber and burrs
4. Run cleaning cycle with machine cleaner

Please start with the external cleaning and let me know when you've completed each step.`;
};

/**
 * Get descaling procedure
 */
const getDescalingProcedure = (machineNumber?: string): string => {
  return `**Descaling Procedure (45 minutes):**

**Preparation:**
1. Empty water reservoir and refill with descaling solution
2. Place large container under brew head and steam wand
3. Ensure machine is at operating temperature

**Descaling Process:**
1. Start descaling cycle (or manual process)
2. Allow solution to circulate through all components
3. Let solution sit in system for 15 minutes
4. Complete the cycle and flush thoroughly

**Final Rinse:**
1. Refill reservoir with fresh water
2. Run 3-4 complete rinse cycles
3. Taste test water to ensure no residual flavor
4. Clean all external surfaces

**Important:** Use only manufacturer-approved descaling solution. How often do you typically descale this machine?`;
};

/**
 * Get preventive maintenance schedule
 */
const getPreventiveMaintenanceSchedule = (machineNumber?: string): string => {
  return `**Preventive Maintenance Schedule:**

**Daily (5 minutes):**
• External cleaning and wipe-down
• Empty drip tray and grounds container
• Check water level and quality

**Weekly (30 minutes):**
• Deep cleaning of brewing components
• Clean and calibrate grinder
• Check steam wand operation

**Monthly (60 minutes):**
• Complete system cleaning cycle
• Inspect seals and gaskets
• Check pressure and temperature
• Clean internal water lines

**Quarterly (2 hours):**
• Professional descaling
• Replace water filter
• Inspect electrical connections
• Update maintenance log

**Annually (4 hours):**
• Complete overhaul by technician
• Replace wear components
• Recalibrate all systems
• Update equipment records

Would you like me to create a customized schedule for your specific usage patterns?`;
};

/**
 * Get maintenance media
 */
const getMaintenanceMedia = (maintenanceType: string): { images: string[], videos: string[] } => {
  // Map maintenance types to relevant images from MAINTENANCE_IMAGES
  const getMaintenanceTypeImages = (type: string): string[] => {
    const typeLower = type.toLowerCase();
    const images: string[] = [];
    
    // Check for specific maintenance types in MAINTENANCE_IMAGES keys
    Object.entries(MAINTENANCE_IMAGES).forEach(([topic, imagePath]) => {
      if (typeLower.includes(topic) || topic.includes(typeLower)) {
        images.push(imagePath);
      }
    });
    
    // Default fallbacks for common maintenance types
    if (images.length === 0) {
      if (typeLower.includes('clean')) {
        images.push(MAINTENANCE_IMAGES['steam wand']);
        images.push(MAINTENANCE_IMAGES['espresso machine']);
      } else if (typeLower.includes('grind') || typeLower.includes('coffee')) {
        images.push(MAINTENANCE_IMAGES['grinder']);
      }
    }
    
    return images;
  };
  
  const relevantImages = getMaintenanceTypeImages(maintenanceType);
  
  const mediaMap: Record<string, { images: string[], videos: string[] }> = {
    "cleaning": {
      images: relevantImages.length > 0 ? relevantImages : [demoConfig.placeholderMedia.images.cleaning],
      videos: [demoConfig.placeholderMedia.videos.cleaning]
    },
    "descaling": {
      images: relevantImages.length > 0 ? relevantImages : [demoConfig.placeholderMedia.images.maintenance],
      videos: [demoConfig.placeholderMedia.videos.maintenance]
    },
    "preventive": {
      images: relevantImages.length > 0 ? relevantImages : [demoConfig.placeholderMedia.images.maintenance],
      videos: [demoConfig.placeholderMedia.videos.overview]
    }
  };
  
  return mediaMap[maintenanceType] || { 
    images: relevantImages.length > 0 ? relevantImages : [], 
    videos: [] 
  };
};

/**
 * Get relevant parts for issue
 */
const getRelevantParts = (issue: string, machineNumber?: string): string => {
  const partsMap: Record<string, string> = {
    "machine won't start": "**Potentially needed parts:**\n• Power cord or internal fuses\n• Control board or switches\n• Safety interlocks\n• Internal wiring harness",
    "poor coffee quality": "**Potentially needed parts:**\n• Water filter (CM-WF-002)\n• Grinder burr set (CM-UB-004)\n• Shower screen and seals\n• Temperature sensor (CM-TS-008)",
    "strange noises": "**Potentially needed parts:**\n• Grinder burr set (CM-UB-004)\n• Pump mounting hardware\n• Steam valve seals (CM-SVS-014)\n• Internal dampening materials"
  };
  
  return partsMap[issue.toLowerCase()] || "Please specify what type of part you need or what issue you're trying to resolve.";
};

/**
 * Categorize documentation request
 */
const categorizeDocumentationRequest = (message: string): string => {
  const messageLower = message.toLowerCase();
  
  if (/(manual|guide|instruction|procedure)/.test(messageLower)) {
    return "manual";
  }
  if (/(video|tutorial|demonstration|show me)/.test(messageLower)) {
    return "video";
  }
  if (/(safety|protocol|osha|hazard)/.test(messageLower)) {
    return "safety";
  }
  if (/(spec|specification|technical|detail)/.test(messageLower)) {
    return "technical";
  }
  
  return "general";
};

/**
 * Get safety procedures
 */
const getSafetyProcedures = (): string => {
  return `**Essential Safety Protocols:**

**Before Starting Any Work:**
⚠️ Disconnect power and wait for cooldown
⚠️ Wear appropriate PPE (gloves, safety glasses)
⚠️ Clear work area of obstacles
⚠️ Have spill cleanup materials ready

**During Maintenance:**
⚠️ Never bypass safety interlocks
⚠️ Use proper tools for each task
⚠️ Follow lockout/tagout procedures
⚠️ Work with adequate lighting

**Emergency Procedures:**
⚠️ Know location of emergency stops
⚠️ Keep first aid kit accessible
⚠️ Know emergency contact numbers
⚠️ Report all incidents immediately

**Chemical Safety:**
⚠️ Read all cleaning product labels
⚠️ Use proper ventilation
⚠️ Never mix cleaning chemicals
⚠️ Store chemicals properly

Always prioritize safety over speed. If you're unsure about any procedure, stop and ask for guidance.`;
};

/**
 * Get documentation media
 */
const getDocumentationMedia = (docType: string): { images: string[], videos: string[] } => {
  const mediaMap: Record<string, { images: string[], videos: string[] }> = {
    "manual": {
      images: [demoConfig.placeholderMedia.images.diagnostic],
      videos: []
    },
    "video": {
      images: [],
      videos: [demoConfig.placeholderMedia.videos.overview, demoConfig.placeholderMedia.videos.maintenance]
    },
    "safety": {
      images: [demoConfig.placeholderMedia.images.maintenance],
      videos: [demoConfig.placeholderMedia.videos.safety]
    }
  };
  
  return mediaMap[docType] || { images: [], videos: [] };
};

/**
 * Update conversation context based on user message with enhanced detection
 */
export const updateContextFromMessage = (
  message: string,
  currentContext: ConversationContext
): ConversationContext => {
  const messageLower = message.toLowerCase();
  const updatedContext = { ...currentContext };
  
  // Enhanced machine selection detection
  const machineSelection = detectMachineSelection(message);
  if (machineSelection) {
    updatedContext.selectedMachine = machineSelection;
    console.log(`🔧 Machine selected: ${machineSelection}`);
  }
  
  // Enhanced issue detection with more patterns
  const issueDetection = detectIssueFromMessage(message);
  if (issueDetection && !updatedContext.currentIssue) {
    updatedContext.currentIssue = issueDetection;
    console.log(`🔍 Issue detected: ${issueDetection}`);
  }
  
  // Parts request detection
  if (/(water filter|part number|replace|order|grinder|burr)/.test(messageLower)) {
    if (!updatedContext.currentIssue) {
      updatedContext.currentIssue = "parts needed";
    }
  }
  
  // Cleaning/maintenance request detection
  if (/(clean|maintenance|descal|service)/.test(messageLower)) {
    if (!updatedContext.currentIssue) {
      updatedContext.currentIssue = "cleaning needed";
    }
  }
  
  // Troubleshooting step progression
  if (messageLower.includes('done') || messageLower.includes('completed') || messageLower.includes('yes')) {
    if (updatedContext.troubleshootingStep) {
      updatedContext.troubleshootingStep += 1;
    }
  }
  
  // Work order creation context
  if (/(create|new).*(work order|ticket)/.test(messageLower) || /(work order|ticket).*(create|new)/.test(messageLower)) {
    if (updatedContext.selectedMachine && updatedContext.currentIssue) {
      // Ready to create work order
      console.log('📋 Ready to create work order');
    }
  }
  
  return updatedContext;
};

/**
 * Detect machine selection from user message with enhanced patterns
 */
const detectMachineSelection = (message: string): string | null => {
  const messageLower = message.toLowerCase();
  
  // Direct ID patterns - highest priority
  const idMatch = message.match(/cm-2000-(\d+)/i);
  if (idMatch) {
    return `CM-2000-00${idMatch[1]}`;
  }
  
  // Exact machine selection patterns (user selecting from list)
  const exactPatterns = [
    /1\.?\s*(kitchen station a|kitchen.*a)/i,
    /2\.?\s*(kitchen station b|kitchen.*b)/i,
    /3\.?\s*(kitchen station c|kitchen.*c)/i,
    /4\.?\s*(break room)/i,
    /5\.?\s*(conference room)/i
  ];
  
  const machineIds = ['CM-2000-001', 'CM-2000-002', 'CM-2000-003', 'CM-2000-004', 'CM-2000-005'];
  
  for (let i = 0; i < exactPatterns.length; i++) {
    if (exactPatterns[i].test(message)) {
      return machineIds[i];
    }
  }
  
  // Number selection patterns
  const numberMatch = message.match(/^(\d+)\.?\s|machine\s*(\d+)|select\s*(\d+)/i);
  if (numberMatch) {
    const num = parseInt(numberMatch[1] || numberMatch[2] || numberMatch[3]);
    const machineIndex = num - 1;
    if (machineIndex >= 0 && machineIndex < demoMachineOptions.length) {
      return demoMachineOptions[machineIndex].machineNumber;
    }
  }
  
  // Letter selections (A, B, C)
  const letterMatch = message.match(/station\s*([a-c])|machine\s*([a-c])/i);
  if (letterMatch) {
    const letter = (letterMatch[1] || letterMatch[2]).toLowerCase();
    const letterIndex = letter.charCodeAt(0) - 'a'.charCodeAt(0);
    if (letterIndex >= 0 && letterIndex < demoMachineOptions.length) {
      return demoMachineOptions[letterIndex].machineNumber;
    }
  }
  
  // Location-based patterns
  if (messageLower.includes('kitchen station a') || messageLower.includes('kitchen a')) return 'CM-2000-001';
  if (messageLower.includes('kitchen station b') || messageLower.includes('kitchen b')) return 'CM-2000-002';
  if (messageLower.includes('kitchen station c') || messageLower.includes('kitchen c')) return 'CM-2000-003';
  if (messageLower.includes('break room')) return 'CM-2000-004';
  if (messageLower.includes('conference room')) return 'CM-2000-005';
  
  return null;
};

/**
 * Detect issue from user message
 */
const detectIssueFromMessage = (message: string): string | null => {
  const messageLower = message.toLowerCase();
  
  if (/(won't start|not starting|no power|dead)/.test(messageLower)) {
    return "machine won't start";
  }
  if (/(taste|flavor|quality|bitter|weak)/.test(messageLower)) {
    return "poor coffee quality";
  }
  if (/(noise|sound|grinding|clicking|loud)/.test(messageLower)) {
    return "strange noises";
  }
  if (/(clean|cleaning|maintenance)/.test(messageLower)) {
    return "cleaning needed";
  }
  if (/(water filter|filter|part)/.test(messageLower)) {
    return "parts needed";
  }
  
  return null;
};

/**
 * Check if response requires user action
 */
const needsUserAction = (text: string, context: ConversationContext): boolean => {
  const actionIndicators = [
    'select', 'choose', 'click', 'tell me', 'which', 'what type',
    'please', 'next step', 'continue', 'would you like', 
    'should i', 'can you', 'do you want', 'need', 'require'
  ];
  
  const textLower = text.toLowerCase();
  return actionIndicators.some(indicator => textLower.includes(indicator));
};

export default {
  getOpenAIResponse,
  buildContextualPrompt,
  updateContextFromMessage
};
