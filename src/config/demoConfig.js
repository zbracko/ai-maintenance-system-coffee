// src/config/demoConfig.js

export const demoConfig = {
  // Demo mode settings
  isDemo: true,
  
  // Application settings
  appTitle: "Coffee Machine Maintenance System",
  appSubtitle: "Professional AI-Powered Maintenance Assistant",
  
  // Machine configuration
  defaultMachine: "Coffee Machine CM-2000",
  machineType: "coffee",
  
  // API settings (disabled for demo)
  useRealAPI: false,
  mockResponses: true,
  
  // Chat configuration
  chatSettings: {
    enableVoice: true,
    enableQRScanner: true,
    enableFileUpload: true,
    enableWorkOrders: true,
    maxChatHistory: 50
  },
  
  // Demo data paths
  dataFiles: {
    workOrders: "/src/data/demoData.js",
    manuals: "/src/data/coffeeManualSections.ts",
    pastLogs: "/src/data/demoData.js"
  },
  
  // Maintenance intervals (in days)
  maintenanceIntervals: {
    waterFilter: 90,        // 3 months
    gaskets: 180,          // 6 months
    burrs: 365,            // 12 months
    heatingElement: 545,   // 18 months
    majorOverhaul: 730     // 24 months
  },
  
  // Demo AI response settings
  aiResponseConfig: {
    responseDelay: 1000,   // 1 second delay to simulate AI processing
    includeImages: true,
    includeVideos: true,
    detailedResponses: true
  },
  
  // Placeholder media paths
  placeholderMedia: {
    images: {
      diagnostic: "coffee_diagnostic_flowchart.jpg",
      cleaning: "daily_cleaning_steps.jpg",
      parts: "parts_layout_diagram.jpg",
      maintenance: "weekly_maintenance_chart.jpg",
      troubleshooting: "power_troubleshooting_diagram.jpg",
      temperature: "temperature_calibration_guide.jpg",
      grinder: "grinder_anatomy_diagram.jpg"
    },
    videos: {
      overview: "demo_video_placeholder_overview.mp4",
      maintenance: "demo_video_placeholder_daily_maintenance.mp4",
      weekly: "demo_video_placeholder_weekly_maintenance.mp4",
      troubleshooting: "demo_video_placeholder_troubleshooting.mp4",
      safety: "demo_video_placeholder_safety.mp4",
      diagnostic: "diagnostic_procedure_demo.mp4",
      cleaning: "complete_cleaning_procedure.mp4",
      parts: "parts_replacement_guide.mp4",
      grinder: "grinder_maintenance_procedure.mp4"
    }
  },
  
  // Features enabled in demo
  features: {
    adminPanel: true,
    workOrders: true,
    maintenanceLogs: true,
    manuals: true,
    safeHandling: true,
    chatInterface: true,
    voiceCommands: true,
    qrScanning: true,
    dataEntry: true,
    videoManuals: true,
    contributors: true,
    settings: true
  },
  
  // Demo user data
  demoUser: {
    name: "Demo Technician",
    role: "Maintenance Specialist",
    department: "Kitchen Operations",
    permissions: ["read", "write", "admin"]
  },
  
  // Notification settings
  notifications: {
    maintenanceReminders: true,
    partsReorderAlerts: true,
    systemWarnings: true,
    completionNotifications: true
  }
};

// Chat response templates for demo
export const demoResponseTemplates = {
  greeting: "Hello! I'm your AI-powered coffee machine maintenance assistant. How can I help you today?",
  
  capabilities: `I can help you with:
  
🔧 **Maintenance Procedures**
• Daily cleaning routines
• Weekly descaling procedures  
• Parts replacement guides
• Preventive maintenance schedules

🔍 **Troubleshooting**
• Diagnostic procedures
• Common problem solutions
• Error code explanations
• Performance optimization

📋 **Work Orders**
• Create maintenance requests
• Track repair progress
• Schedule routine service
• Document completed work

📖 **Technical Manuals**
• Step-by-step procedures
• Parts identification
• Safety protocols
• Maintenance schedules

What specific area would you like assistance with?`,

  workOrderCreated: "✅ Work order created successfully! I've added this to your maintenance queue with the appropriate priority level. You'll receive notifications as the work progresses.",
  
  maintenanceComplete: "🎉 Maintenance procedure completed! I've documented all steps performed and updated the machine's service history. Is there anything else you need help with?",
  
  partsNeeded: "📦 Based on your description, you may need the following parts. I can help you identify the correct part numbers and create a requisition.",
  
  safetyReminder: "⚠️ **Safety First!** Remember to disconnect power and allow the machine to cool before performing any maintenance. Always wear appropriate PPE and follow lockout/tagout procedures."
};

export default demoConfig;
