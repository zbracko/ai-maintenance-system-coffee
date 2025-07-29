// src/data/demoData.js

// Template responses for commonly used content
const demoResponseTemplates = {
  capabilities: `I'm your specialized AI maintenance assistant for coffee machine systems. Here's what I can help you with:

🔧 **Diagnostic Services:**
- Troubleshoot brewing issues (weak coffee, over-extraction, temperature problems)
- Diagnose water flow and pressure problems
- Identify mechanical component failures
- Analyze error codes and system alerts

☕ **Maintenance Guidance:**
- Daily cleaning and sanitization procedures
- Weekly descaling and deep cleaning
- Monthly component inspections
- Preventive maintenance scheduling

🛠️ **Technical Support:**
- Part identification and replacement procedures
- Repair instructions with step-by-step guidance
- Safety protocols and procedures
- Equipment specifications and compatibility

📊 **System Management:**
- Performance monitoring and optimization
- Usage pattern analysis
- Maintenance history tracking
- Cost analysis and recommendations

Just ask me about any coffee machine issue, maintenance procedure, or technical question!`
};

// Work Order Creation Helper
export const createWorkOrderFromChat = (machineNumber, issueType, description) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const workOrderId = `WO-CM-${String(Math.floor(Math.random() * 9999)).padStart(3, '0')}`;
  
  const priorityMap = {
    'machine won\'t start': 'High',
    'poor coffee quality': 'Medium',
    'water/steam issues': 'High',
    'strange noises': 'Medium',
    'error messages': 'High',
    'routine maintenance': 'Low'
  };
  
  return {
    id: workOrderId,
    task: `${issueType} - Machine #${machineNumber}`,
    timeSpent: 'Pending',
    priority: priorityMap[issueType.toLowerCase()] || 'Medium',
    location: `Coffee Station - Machine #${machineNumber}`,
    asset: `Coffee Machine #${machineNumber}`,
    description: description || `Resolve ${issueType} issue on coffee machine #${machineNumber}`,
    requestedBy: 'AI Assistant',
    assignedTo: 'Available Technician',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    status: 'Open',
    steps: getMaintenanceStepsForIssue(issueType),
    createdDate: timestamp,
    createdBy: 'ChatBot Assistant'
  };
};

// Get maintenance steps based on issue type
const getMaintenanceStepsForIssue = (issueType) => {
  const stepMap = {
    'machine won\'t start': `1. Check power connection and outlet
2. Verify power switch position
3. Inspect fuses and circuit breakers
4. Test internal wiring connections
5. Check control panel functionality`,
    'poor coffee quality': `1. Test water quality and temperature
2. Check coffee bean freshness and grind
3. Inspect brewing chamber for blockages
4. Calibrate extraction timing
5. Clean and descale system`,
    'water/steam issues': `1. Check water reservoir and connections
2. Inspect water pump operation
3. Test steam wand functionality
4. Check for leaks in water lines
5. Verify pressure settings`,
    'strange noises': `1. Identify noise source and timing
2. Inspect moving parts and bearings
3. Check for loose components
4. Lubricate mechanical parts
5. Test motor operation`,
    'error messages': `1. Document exact error code
2. Consult technical manual
3. Reset system and test
4. Check sensor connections
5. Update firmware if needed`,
    'routine maintenance': `1. Clean brewing chamber and filters
2. Descale water system
3. Inspect and replace worn parts
4. Calibrate temperature and pressure
5. Update maintenance log`
  };
  
  return stepMap[issueType.toLowerCase()] || `1. Assess issue thoroughly
2. Gather necessary tools and parts
3. Follow safety procedures
4. Implement appropriate solution
5. Test and verify functionality`;
};

// Demo data for Coffee Machine Maintenance System
export const demoWorkOrders = [
  {
    id: 'WO-CM-127',
    task: 'Machine won\'t start - Machine #001',
    timeSpent: '2 hours 15 minutes',
    priority: 'High',
    location: 'Coffee Station - Machine #001',
    asset: 'Coffee Machine #001',
    description: 'Complete power failure on Espresso Machine #001 - no lights, no response to power button. Critical issue affecting morning service.',
    requestedBy: 'Sarah (Barista)',
    assignedTo: 'Mike Rodriguez',
    dueDate: '2025-07-29',
    status: 'Completed',
    steps: `1. ✅ DIAGNOSED: Power outlet tested - confirmed 120V supply
2. ✅ IDENTIFIED: Main power fuse blown (F1 - 15A slow blow)
3. ✅ INVESTIGATED: Found water intrusion in electrical panel from steam leak
4. ✅ REPAIRED: Replaced blown fuse and sealed steam line connection
5. ✅ TESTED: Full system startup successful, all functions operational
6. ✅ VERIFIED: Steam pressure test passed, no further leaks detected`,
    createdDate: '2025-07-28',
    createdBy: 'AI Assistant (Chat)',
    partsUsed: 'Main Power Fuse F1-15A, Steam Line Gasket SG-004, Electrical Panel Sealant',
    materials: 'Multimeter, fuse puller, steam pressure tester, electrical tape',
    comments: 'COMPLETE REPAIR STORY: Customer reported via chat at 6:45 AM that machine completely dead. AI assistant guided initial diagnostics, created work order, and assigned technician. Root cause was steam leak causing electrical short and blown fuse. Full repair completed in 2 hours 15 minutes.',
    additionalNotes: 'PREVENTIVE ACTION: Recommended monthly electrical panel inspection to prevent water intrusion. Customer satisfaction: Excellent - machine operational before morning rush.',
    machineId: 'CM-001',
    relatedLogId: 'LOG-001'
  },
  {
    id: 'WO-CM-126',
    task: 'Water/steam issues - Machine #003',
    timeSpent: 'Pending',
    priority: 'High',
    location: 'Coffee Station - Machine #003',
    asset: 'Coffee Machine #003',
    description: 'Water/steam issues reported on Grinder #003 (Left Counter)',
    requestedBy: 'AI Assistant',
    assignedTo: 'Available Technician',
    dueDate: '2025-07-29',
    status: 'Open',
    steps: `1. Check water reservoir and connections
2. Inspect water pump operation
3. Test steam wand functionality
4. Check for leaks in water lines
5. Verify pressure settings`,
    createdDate: '2025-07-26',
    createdBy: 'ChatBot Assistant',
    partsUsed: 'TBD - Pending inspection',
    materials: 'Steam wand tools, pressure gauge',
    comments: 'Created via chat interaction - safety concern with steam pressure',
    additionalNotes: 'User provided immediate safety shutdown guidance',
    machineId: 'CM-003',
    relatedLogId: 'LOG-003'
  },
  {
    id: 'WO-CM-125',
    task: 'Routine maintenance - Machine #005',
    timeSpent: 'Pending',
    priority: 'Low',
    location: 'Coffee Station - Machine #005',
    asset: 'Coffee Machine #005',
    description: 'Routine maintenance reported on Bean Hopper #005 (Storage Area)',
    requestedBy: 'AI Assistant',
    assignedTo: 'Available Technician',
    dueDate: '2025-07-30',
    status: 'Scheduled',
    steps: `1. Clean brewing chamber and filters
2. Descale water system
3. Inspect and replace worn parts
4. Calibrate temperature and pressure
5. Update maintenance log`,
    createdDate: '2025-07-22',
    createdBy: 'ChatBot Assistant',
    partsUsed: 'Preventive maintenance kit',
    materials: 'Cleaning supplies, calibration tools',
    comments: 'Created via chat interaction - proactive maintenance scheduling',
    additionalNotes: 'User requested preventive maintenance to avoid future issues',
    machineId: 'CM-005',
    relatedLogId: 'LOG-005'
  },
  {
    id: 'WO-CM-001',
    task: 'Weekly Descaling Procedure',
    timeSpent: '45 minutes',
    priority: 'Medium',
    location: 'Kitchen Station A',
    asset: 'Coffee Machine CM-2000',
    description: 'Perform weekly descaling to remove mineral buildup from heating element and water lines',
    requestedBy: 'Sarah Johnson',
    assignedTo: 'Mike Rodriguez',
    dueDate: '2025-07-30',
    status: 'In Progress',
    steps: `1. Mix descaling solution with water (1:10 ratio)
2. Fill water reservoir with descaling solution
3. Run descaling cycle from control panel
4. Allow solution to sit for 15 minutes
5. Flush system with fresh water 3 times
6. Test brew temperature accuracy`,
    partsUsed: 'Descaling Solution (CM-DS-019)',
    materials: 'Descaling solution, cleaning cloths, measuring cup',
    comments: 'Machine showing slow brew times, likely due to mineral buildup',
    additionalNotes: 'Customer reports coffee taste has been slightly off recently'
  },
  {
    id: 'WO-CM-002',
    task: 'Grinder Burr Replacement',
    timeSpent: '30 minutes',
    priority: 'High',
    location: 'Kitchen Station B',
    asset: 'Coffee Machine CM-2000',
    description: 'Replace worn grinder burr sets due to inconsistent grind size',
    requestedBy: 'David Chen',
    assignedTo: 'Lisa Thompson',
    dueDate: '2025-07-29',
    status: 'Pending',
    steps: `1. Disconnect power and allow machine to cool
2. Remove upper burr assembly
3. Clean burr chamber thoroughly
4. Install new upper and lower burr sets
5. Calibrate grind settings
6. Test grind consistency across all settings`,
    partsUsed: 'Upper Burr Set (CM-UB-004), Lower Burr Set (CM-LB-005)',
    materials: 'New burr sets, cleaning brush, calibration tools',
    comments: 'Customer noticed uneven grind causing inconsistent extraction',
    additionalNotes: 'Old burrs showed significant wear after 14 months of heavy use'
  },
  {
    id: 'WO-CM-003',
    task: 'Steam Wand Maintenance',
    timeSpent: '20 minutes',
    priority: 'Medium',
    location: 'Kitchen Station C',
    asset: 'Coffee Machine CM-2000',
    description: 'Clean and inspect steam wand assembly, replace seals if necessary',
    requestedBy: 'Emma Wilson',
    assignedTo: 'Carlos Martinez',
    dueDate: '2025-08-01',
    status: 'Completed',
    steps: `1. Allow steam system to cool completely
2. Disassemble steam wand carefully
3. Clean milk residue from all surfaces
4. Inspect seals for wear or damage
5. Replace seal kit if needed
6. Reassemble and test steam pressure`,
    partsUsed: 'Steam Valve Seal Kit (CM-SVS-014)',
    materials: 'Seal kit, cleaning solution, steam wand brush',
    comments: 'Steam wand was producing inconsistent milk foam texture',
    additionalNotes: 'Preventive maintenance completed successfully, no issues found'
  },
  {
    id: 'WO-CM-004',
    task: 'Temperature Sensor Calibration',
    timeSpent: '25 minutes',
    priority: 'High',
    location: 'Kitchen Station A',
    asset: 'Coffee Machine CM-2000',
    description: 'Calibrate temperature sensor due to incorrect brew temperature readings',
    requestedBy: 'Mark Davis',
    assignedTo: 'Jennifer Kim',
    dueDate: '2025-07-31',
    status: 'Scheduled',
    steps: `1. Access temperature sensor via service panel
2. Connect digital thermometer for reference
3. Run temperature calibration routine
4. Adjust sensor readings to match reference
5. Test multiple temperature points
6. Document calibration results`,
    partsUsed: 'None (calibration only)',
    materials: 'Digital thermometer, calibration tools, service manual',
    comments: 'Brew temperature reading 10°F lower than actual temperature',
    additionalNotes: 'May need sensor replacement if calibration fails'
  },
  {
    id: 'WO-CM-005',
    task: 'Water Filter Replacement',
    timeSpent: '10 minutes',
    priority: 'Low',
    location: 'Kitchen Station B',
    asset: 'Coffee Machine CM-2000',
    description: 'Replace water filter cartridge as part of quarterly maintenance',
    requestedBy: 'Anna Rodriguez',
    assignedTo: 'Mike Rodriguez',
    dueDate: '2025-08-02',
    status: 'Pending',
    steps: `1. Turn off machine and disconnect power
2. Remove water reservoir
3. Extract old filter cartridge
4. Install new filter cartridge
5. Prime filter with fresh water
6. Reset filter replacement indicator`,
    partsUsed: 'Water Filter Cartridge (CM-WF-002)',
    materials: 'New filter cartridge, fresh water',
    comments: 'Routine quarterly filter replacement',
    additionalNotes: 'Filter indicator showing red for past week'
  }
];

export const demoPastLogs = [
  {
    id: 'LOG-001',
    date: '2025-07-28',
    summary: 'COMPLETE REPAIR LOG: Machine #001 power failure - Chat initiated diagnosis, work order created, full repair completed. Journey: Chat → Diagnosis → Work Order → Repair → Resolution.',
    technician: 'Mike Rodriguez (with AI Assistant Support)',
    duration: '2 hours 15 minutes (includes 8 min chat diagnosis)',
    issues: 'Complete power failure due to blown main fuse caused by steam leak water intrusion',
    machineId: 'CM-001',
    workOrderId: 'WO-CM-127',
    priority: 'High',
    type: 'Emergency Repair',
    partsUsed: ['Main Power Fuse F1-15A', 'Steam Line Gasket SG-004', 'Electrical Panel Sealant'],
    steps: [
      '06:45 AM - Customer Sarah reported via chat: "Machine completely dead, no lights, nothing"',
      '06:46 AM - AI Assistant guided power outlet test: "120V confirmed at outlet"',
      '06:52 AM - AI diagnosed likely fuse issue, created Work Order WO-CM-127',
      '06:53 AM - Work order assigned to Mike Rodriguez, ETA communicated to customer',
      '08:15 AM - Mike arrived on-site, confirmed diagnosis with multimeter',
      '08:20 AM - Discovered blown main fuse F1 (15A slow blow)',
      '08:25 AM - Investigated root cause: water intrusion from steam line leak',
      '08:45 AM - Isolated steam system, drained electrical panel',
      '09:10 AM - Replaced blown fuse and steam line gasket',
      '09:30 AM - Applied panel sealant and reassembled',
      '09:45 AM - Power test successful, all systems operational',
      '10:00 AM - Final testing: brewing, steaming, grinding all confirmed working',
      '10:15 AM - Customer briefed on repair and prevention, work order closed'
    ],
    recommendations: 'PREVENTIVE: Monthly electrical panel inspection recommended to detect water intrusion early. Install moisture sensor in electrical compartment.',
    cost: '$78.25 (parts) + $89.50 (labor) = $167.75 total',
    followUpRequired: true,
    followUpDate: '2025-08-15'
  },
  {
    id: 'LOG-002',
    date: '2025-07-27',
    summary: 'Chat Bot Response: Assisted with coffee quality issues on Machine #002. Recommended descaling and grinder calibration.',
    technician: 'AI Assistant',
    duration: '12 minutes',
    issues: 'Coffee tasting bitter, mineral buildup detected',
    machineId: 'CM-002',
    workOrderId: null,
    priority: 'Medium',
    type: 'Preventive Maintenance',
    partsUsed: ['Descaling Solution', 'Water Filter'],
    steps: [
      'Tested coffee sample - confirmed bitter taste',
      'Checked water quality and temperature settings',
      'Performed descaling procedure',
      'Replaced water filter',
      'Calibrated grinder settings',
      'Tested final brew quality - normal taste restored'
    ],
    recommendations: 'Increase descaling frequency to bi-weekly during high usage periods',
    cost: '$23.75',
    followUpRequired: true,
    followUpDate: '2025-08-10'
  },
  {
    id: 'LOG-003',
    date: '2025-07-26',
    summary: 'Chat Bot Response: Created work order WO-CM-126 for steam wand malfunction on Machine #003. Provided immediate safety guidance.',
    technician: 'AI Assistant',
    duration: '15 minutes',
    issues: 'Steam pressure irregular, safety concern addressed',
    machineId: 'CM-003',
    workOrderId: 'WO-CM-126',
    priority: 'High',
    type: 'Safety Issue',
    partsUsed: ['Steam Wand Assembly', 'Pressure Relief Valve'],
    steps: [
      'Immediately shut down steam system for safety',
      'Tested pressure relief valve - found stuck valve',
      'Replaced faulty pressure relief valve',
      'Inspected steam wand for blockages',
      'Replaced entire steam wand assembly as precaution',
      'Pressure tested system - all readings normal'
    ],
    recommendations: 'Install pressure monitoring system for early warning',
    cost: '$127.40',
    followUpRequired: true,
    followUpDate: '2025-08-02'
  },
  {
    id: 'LOG-004',
    date: '2025-07-25',
    summary: 'Quarterly maintenance inspection completed. All systems operational. Replaced water filters and updated calibration settings.',
    technician: 'Mike Rodriguez',
    duration: '85 minutes',
    issues: 'Routine maintenance, no issues found',
    machineId: 'CM-004',
    workOrderId: null,
    priority: 'Low',
    type: 'Scheduled Maintenance',
    partsUsed: ['Water Filter Set', 'Calibration Kit'],
    steps: [
      'Performed complete system inspection',
      'Replaced all water filters',
      'Calibrated temperature and pressure settings',
      'Cleaned and lubricated moving parts',
      'Updated firmware to latest version',
      'Documented all settings and configurations'
    ],
    recommendations: 'Continue quarterly maintenance schedule',
    cost: '$89.25',
    followUpRequired: false
  },
  {
    id: 'LOG-005',
    date: '2025-07-22',
    summary: 'Chat Bot Response: Created work order WO-CM-125 for routine maintenance on Machine #005. Scheduled preventive service.',
    technician: 'AI Assistant',
    duration: '5 minutes',
    issues: 'Preventive maintenance scheduling',
    machineId: 'CM-005',
    workOrderId: 'WO-CM-125',
    priority: 'Low',
    type: 'Preventive Scheduling',
    partsUsed: [],
    steps: [
      'Reviewed maintenance history',
      'Identified upcoming service requirements',
      'Created preventive maintenance work order',
      'Scheduled technician assignment',
      'Updated maintenance calendar'
    ],
    recommendations: 'Maintain proactive scheduling approach',
    cost: '$0.00',
    followUpRequired: true,
    followUpDate: '2025-07-30'
  },
  {
    date: '2025-07-23',
    summary: 'Emergency service call - Machine #004 overheating protection triggered. Replaced thermal sensor and recalibrated temperature settings.',
    technician: 'Jennifer Kim',
    duration: '95 minutes',
    issues: 'Thermal sensor malfunction causing overheating alerts'
  },
  {
    date: '2025-07-22',
    summary: 'Chat Bot Response: Created work order WO-CM-125 for routine maintenance on Machine #005. Scheduled preventive service.',
    technician: 'AI Assistant',
    duration: '5 minutes',
    issues: 'Preventive maintenance scheduling'
  },
  {
    date: '2025-07-21',
    summary: 'Completed daily cleaning routine - grinder, brewing chamber, and steam wand. All systems operating normally. Brew temperature stable at 202°F.',
    technician: 'Mike Rodriguez',
    duration: '22 minutes',
    issues: 'None'
  },
  {
    date: '2025-07-20',
    summary: 'Performed weekly descaling procedure. Removed moderate mineral buildup from heating element. Brew flow rate improved significantly.',
    technician: 'Lisa Thompson',
    duration: '48 minutes',
    issues: 'Minor mineral buildup noted'
  },
  {
    date: '2025-07-19',
    summary: 'Chat Bot Response: Troubleshot error code E02 on Machine #001. Guided user through temperature sensor reset procedure.',
    technician: 'AI Assistant',
    duration: '10 minutes',
    issues: 'Temperature sensor calibration drift, reset successful'
  },
  {
    date: '2025-07-18',
    summary: 'Replaced worn portafilter handle gasket. Customer reported loose fit. New gasket installed and tested - proper seal achieved.',
    technician: 'Carlos Martinez',
    duration: '15 minutes',
    issues: 'Gasket wear due to normal use'
  },
  {
    date: '2025-07-17',
    summary: 'Chat Bot Response: Created work order WO-CM-124 for grinder noise issue. Recommended burr inspection and provided safety guidelines.',
    technician: 'AI Assistant',
    duration: '14 minutes',
    issues: 'Grinding noise, potential burr wear'
  },
  {
    date: '2025-07-16',
    summary: 'Calibrated grinder settings after customer complaints of inconsistent grind. All 15 grind levels tested and adjusted.',
    technician: 'Jennifer Kim',
    duration: '35 minutes',
    issues: 'Grinder calibration drift'
  },
  {
    date: '2025-07-15',
    summary: 'Emergency repair - heating element failure during morning rush. Replaced primary heating element and thermal sensor.',
    technician: 'Mike Rodriguez',
    duration: '90 minutes',
    issues: 'Heating element failure'
  },
  {
    date: '2025-07-14',
    summary: 'Chat Bot Response: Provided milk frothing troubleshooting for Machine #002. Steam pressure and technique guidance provided.',
    technician: 'AI Assistant',
    duration: '16 minutes',
    issues: 'Poor milk froth quality, user technique and equipment check'
  },
  {
    date: '2025-07-13',
    summary: 'Routine inspection of electrical connections and safety systems. All components within normal parameters.',
    technician: 'Lisa Thompson',
    duration: '25 minutes',
    issues: 'None'
  },
  {
    date: '2025-07-12',
    summary: 'Chat Bot Response: Created work order WO-CM-123 for water leak on Machine #003. Immediate shutdown procedure provided.',
    technician: 'AI Assistant',
    duration: '6 minutes',
    issues: 'Water leak detected, safety shutdown initiated'
  },
  {
    date: '2025-07-11',
    summary: 'Deep cleaning of grinder burr chamber. Removed coffee oil buildup and recalibrated motor timing.',
    technician: 'Carlos Martinez',
    duration: '40 minutes',
    issues: 'Coffee oil accumulation'
  },
  {
    date: '2025-07-10',
    summary: 'Chat Bot Response: Assisted with parts identification for Machine #004. Provided complete parts catalog and pricing.',
    technician: 'AI Assistant',
    duration: '11 minutes',
    issues: 'Parts inquiry for scheduled maintenance'
  },
  {
    date: '2025-07-09',
    summary: 'Monthly performance review and system optimization. Updated firmware and adjusted operating parameters for efficiency.',
    technician: 'Jennifer Kim',
    duration: '65 minutes',
    issues: 'Performance optimization, no critical issues'
  }
];

export const demoChatResponses = {
  // Basic Greetings and Help
  "hello": {
    text: "☕ Hello! Welcome to your Coffee Machine Maintenance Assistant. I'm here to help you with all aspects of coffee machine care and maintenance. What can I assist you with today?",
    images: ['coffee_welcome_screen.jpg'],
    videos: ['welcome_tour_demo.mp4']
  },

  "hi": {
    text: "Hi there! I'm your AI-powered coffee machine maintenance specialist. Ready to help you keep your equipment running perfectly!",
    images: ['ai_assistant_avatar.jpg'],
    videos: []
  },

  "help": {
    text: demoResponseTemplates.capabilities,
    images: ['help_overview_diagram.jpg'],
    videos: ['system_tour_demo.mp4']
  },

  "what can you do": {
    text: demoResponseTemplates.capabilities,
    images: ['capabilities_overview.jpg'],
    videos: ['feature_demonstration.mp4']
  },

  // Diagnostic and Troubleshooting - Enhanced with spelling tolerance
  "what's wrong with the coffee machine": {
    text: "I can help diagnose your coffee machine issue! Let me ask a few questions to better understand the problem:\n\n🔍 **Quick Diagnostic Questions:**\n\n1. Is the machine turning on when you press the power button?\n2. Are you getting any error messages on the display?\n3. Is water flowing through the system?\n4. How does the coffee taste - weak, bitter, or normal?\n5. When did you last perform descaling?\n\nBased on your answers, I can provide specific troubleshooting steps and recommend the appropriate maintenance procedures.",
    images: ['coffee_diagnostic_flowchart.jpg'],
    videos: ['diagnostic_procedure_demo.mp4']
  },

  "whats wrong with coffee machine": {
    text: "I can help diagnose your coffee machine issue! Let me ask a few questions to better understand the problem:\n\n🔍 **Quick Diagnostic Questions:**\n\n1. Is the machine turning on when you press the power button?\n2. Are you getting any error messages on the display?\n3. Is water flowing through the system?\n4. How does the coffee taste - weak, bitter, or normal?\n5. When did you last perform descaling?\n\nBased on your answers, I can provide specific troubleshooting steps and recommend the appropriate maintenance procedures.",
    images: ['coffee_diagnostic_flowchart.jpg'],
    videos: ['diagnostic_procedure_demo.mp4']
  },

  "coffee machine broken": {
    text: "I can help diagnose your coffee machine issue! Let me ask a few questions to better understand the problem:\n\n🔍 **Quick Diagnostic Questions:**\n\n1. Is the machine turning on when you press the power button?\n2. Are you getting any error messages on the display?\n3. Is water flowing through the system?\n4. How does the coffee taste - weak, bitter, or normal?\n5. When did you last perform descaling?\n\nBased on your answers, I can provide specific troubleshooting steps and recommend the appropriate maintenance procedures.",
    images: ['coffee_diagnostic_flowchart.jpg'],
    videos: ['diagnostic_procedure_demo.mp4']
  },

  "machine won't start": {
    text: "Let's troubleshoot your startup issue step by step:\n\n⚡ **Power System Check:**\n\n1. **Verify Power Connection:**\n   - Check outlet with another device\n   - Ensure power cord is fully plugged in\n   - Inspect cord for visible damage\n\n2. **Safety Interlocks:**\n   - Ensure water reservoir is properly seated\n   - Check that drip tray is fully inserted\n   - Verify portafilter is not engaged\n\n3. **Display Check:**\n   - Look for any error codes on LCD\n   - Check if display lights up at all\n\n4. **Internal Fuse:**\n   - May require technician inspection\n   - Located behind service panel\n\n🔧 **Next Steps:**\nIf these steps don't resolve the issue, I recommend creating a work order for electrical system inspection. Would you like me to guide you through creating a maintenance request?",
    images: ['power_troubleshooting_diagram.jpg'],
    videos: ['startup_troubleshooting_demo.mp4']
  },

  "no power": {
    text: "No power issue detected! Let's check these critical components:\n\n🔌 **Electrical Diagnosis:**\n\n1. **Primary Power Check:**\n   - Test outlet: 120V should be present\n   - Check GFCI reset if applicable\n   - Verify circuit breaker hasn't tripped\n\n2. **Power Cord Inspection:**\n   - Look for kinks, cuts, or burn marks\n   - Check connection at machine end\n   - Test continuity with multimeter\n\n3. **Internal Components:**\n   - Thermal Fuse (CM-TF-018) - $6.99\n   - Main power switch\n   - Control board connections\n\n⚠️ **Safety Warning:** Always disconnect power before internal inspection!\n\n📞 **Professional Help:** If no obvious external issues found, schedule electrical system inspection.",
    images: ['electrical_diagram.jpg', 'power_components.jpg'],
    videos: ['electrical_troubleshooting.mp4']
  },

  "coffee tastes bad": {
    text: "Poor coffee taste can indicate several maintenance issues. Let's identify the cause:\n\n☕ **Taste Problem Diagnosis:**\n\n**BITTER COFFEE:**\n• Over-extraction (grind too fine)\n• Water temperature too high (>205°F)\n• Brew time too long\n• Old, oily coffee beans\n\n**WEAK/SOUR COFFEE:**\n• Under-extraction (grind too coarse)\n• Water temperature too low (<195°F)\n• Insufficient brew time\n• Coffee-to-water ratio too low\n\n**OFF FLAVORS:**\n• Dirty brewing chamber\n• Contaminated water filter\n• Mineral buildup (needs descaling)\n• Stale water in reservoir\n\n🔧 **Immediate Actions:**\n1. Replace water filter (CM-WF-002) - $12.99\n2. Descale with solution (CM-DS-019) - $16.99\n3. Clean grinder with tablets (CM-GCT-020) - $24.99\n4. Calibrate temperature sensor\n\n📋 **Maintenance Schedule:** Weekly descaling recommended for heavy use.",
    images: ['taste_problem_chart.jpg', 'cleaning_steps.jpg'],
    videos: ['taste_improvement_guide.mp4']
  },

  "weak coffee": {
    text: "Weak coffee typically indicates extraction problems. Here's how to fix it:\n\n☕ **Weak Coffee Solutions:**\n\n**GRIND ADJUSTMENTS:**\n• Make grind finer (higher number on dial)\n• Check burr wear - replace if over 12 months old\n• Clean grinder chamber of old grounds\n\n**BREWING PARAMETERS:**\n• Increase brew temperature (target 200-205°F)\n• Extend brew time (4-6 minutes optimal)\n• Check water flow rate through system\n\n**COFFEE RATIO:**\n• Use 1:15 to 1:17 coffee-to-water ratio\n• Increase coffee dose in portafilter\n• Ensure even distribution of grounds\n\n**SYSTEM MAINTENANCE:**\n• Descale heating element\n• Replace temperature sensor if readings off\n• Clean brewing chamber thoroughly\n\n🛠️ **Parts That May Need Replacement:**\n• Upper Burr Set (CM-UB-004) - $34.99\n• Lower Burr Set (CM-LB-005) - $34.99\n• Temperature Sensor (CM-TS-008) - $23.99",
    images: ['grind_size_chart.jpg', 'brewing_parameters.jpg'],
    videos: ['weak_coffee_solutions.mp4']
  },

  // Maintenance Procedures
  "how do I clean the coffee machine": {
    text: "Here's your complete coffee machine cleaning guide:\n\n🧽 **Daily Cleaning (20 minutes):**\n\n1. **Water System:** Empty and refill reservoir with fresh water\n2. **Grinder:** Empty grounds chamber, wipe burrs with dry cloth\n3. **Brewing System:** Clean portafilter, run water-only cycle\n4. **Steam Wand:** Purge and clean milk residue\n5. **Exterior:** Wipe control panel and surfaces\n\n📅 **Weekly Deep Clean (45 minutes):**\n\n1. **Descaling:** Use CM-DS-019 solution (1:10 ratio)\n2. **Grinder Deep Clean:** Remove and clean burr assembly\n3. **Internal Inspection:** Check heating elements and seals\n\nWould you like detailed steps for any specific cleaning procedure?",
    images: ['daily_cleaning_steps.jpg', 'weekly_maintenance_chart.jpg'],
    videos: ['complete_cleaning_procedure.mp4']
  },

  "descaling": {
    text: "Descaling is crucial for optimal performance. Here's the complete procedure:\n\n🧼 **Descaling Process (30-45 minutes):**\n\n**PREPARATION:**\n1. Turn off and cool machine completely\n2. Remove water filter from reservoir\n3. Mix descaling solution 1:10 with water\n4. Fill reservoir with solution\n\n**DESCALING CYCLE:**\n1. Press and hold 'Clean' button for 3 seconds\n2. Machine will start automatic cycle\n3. Solution will circulate for 15 minutes\n4. Let solution sit in system for 15 minutes\n5. Machine will complete cycle automatically\n\n**RINSE CYCLE:**\n1. Empty reservoir completely\n2. Fill with fresh water only\n3. Run 3 complete water cycles\n4. Taste water - should have no chemical taste\n5. Replace water filter\n\n💡 **Frequency:** Every 2-3 months or when 'Descale' light appears\n\n🛒 **Supplies Needed:**\n• Descaling Solution (CM-DS-019) - $16.99\n• Fresh water filter if due for replacement",
    images: ['descaling_steps.jpg', 'solution_mixing.jpg'],
    videos: ['descaling_complete_demo.mp4']
  },

  "clean grinder": {
    text: "Proper grinder maintenance ensures consistent grind and flavor:\n\n⚙️ **Grinder Cleaning Procedure:**\n\n**DAILY MAINTENANCE (5 minutes):**\n1. Empty hopper and grounds chamber\n2. Wipe exterior with damp cloth\n3. Check for coffee oil buildup\n4. Run few seconds empty to clear residue\n\n**WEEKLY DEEP CLEAN (20 minutes):**\n1. Disconnect power completely\n2. Remove upper burr assembly (turn counter-clockwise)\n3. Clean burrs with grinder brush\n4. Vacuum chamber of all coffee dust\n5. Check burr alignment and wear\n6. Reinstall and calibrate settings\n\n**MONTHLY TABLET CLEANING:**\n1. Use Grinder Cleaning Tablets (CM-GCT-020)\n2. Run tablets through as if grinding coffee\n3. Follow with small amount of coffee beans\n4. Discard first few grinds\n\n🔧 **Burr Replacement Signs:**\n• Inconsistent grind size\n• Excessive noise during grinding\n• Metallic taste in coffee\n• Visible wear on burr edges\n\n💰 **Replacement Parts:**\n• Upper Burr Set (CM-UB-004) - $34.99\n• Lower Burr Set (CM-LB-005) - $34.99\n• Cleaning Tablets (CM-GCT-020) - $24.99",
    images: ['/assets/coffee-grinder-operation.svg', '/assets/grinder-jam-clearing.svg'],
    videos: ['/assets/Cleaning_Grinder.mp4']
  },

  // Temperature Issues
  "coffee not hot enough": {
    text: "Temperature issues can significantly affect coffee quality. Let's diagnose this:\n\n🌡️ **Temperature Diagnostic Steps:**\n\n1. **Check Current Settings:**\n   - Optimal brew temperature: 195°F - 205°F (90°C - 96°C)\n   - Current display reading: ___°F\n   - Target temperature setting: ___°F\n\n2. **Calibration Check:**\n   - Use external thermometer to verify accuracy\n   - Temperature sensor may need calibration\n   - Possible part needed: Temperature Sensor (CM-TS-008) - $23.99\n\n3. **Heating Element Status:**\n   - Check for mineral buildup on heating element\n   - Descaling may be required\n   - Element replacement interval: 18 months\n\n4. **Quick Fix Attempts:**\n   - Run descaling cycle with CM-DS-019 solution\n   - Reset temperature settings to factory defaults\n   - Allow longer heat-up time (15 minutes)\n\n📞 **Professional Service:**\nIf temperature remains inconsistent, schedule heating system inspection. This typically takes 25-30 minutes and may require temperature sensor replacement.",
    images: ['temperature_calibration_guide.jpg', 'heating_system_diagram.jpg'],
    videos: ['temperature_troubleshooting.mp4']
  },

  "overheating": {
    text: "Overheating is a serious safety concern. Let's address this immediately:\n\n🚨 **Overheating Emergency Protocol:**\n\n**IMMEDIATE ACTIONS:**\n1. Turn off machine immediately\n2. Disconnect from power source\n3. Allow complete cooling (30+ minutes)\n4. Do not use until problem resolved\n\n**DIAGNOSTIC CHECKS:**\n1. **Ventilation:**\n   - Clear all air vents of debris\n   - Ensure 6+ inches clearance around machine\n   - Check for blocked exhaust ports\n\n2. **Internal Components:**\n   - Thermostat malfunction (CM-TA-009) - $31.99\n   - Thermal fuse blown (CM-TF-018) - $6.99\n   - Heating element failure (CM-HE-007) - $67.99\n\n3. **Sensor Issues:**\n   - Temperature sensor reading incorrectly\n   - Control board malfunction\n\n⚠️ **SAFETY WARNING:** Do not attempt internal repairs yourself!\n\n🔧 **Professional Service Required:**\nThis issue requires immediate technician attention. Schedule emergency service call.\n\n📋 **Prevent Future Overheating:**\n• Regular descaling every 3 months\n• Keep vents clear of obstructions\n• Replace thermal components per schedule\n• Monitor temperature readings daily",
    images: ['overheating_danger.jpg', 'thermal_components.jpg'],
    videos: ['overheating_safety_demo.mp4']
  },

  // Parts and Maintenance
  "what parts need replacement": {
    text: "Here are the key replacement parts and their intervals:\n\n🔧 **High-Frequency Replacements:**\n\n• **Water Filter (CM-WF-002)** - Every 3 months - $12.99\n• **Brewing Chamber Gasket (CM-BG-011)** - Every 6 months - $8.99\n• **Steam Valve Seals (CM-SVS-014)** - Every 6 months - $14.99\n\n⚙️ **Medium-Frequency Replacements:**\n\n• **Grinder Burr Sets (CM-UB-004/CM-LB-005)** - Every 12 months - $34.99 each\n• **Temperature Sensor (CM-TS-008)** - Every 12 months - $23.99\n• **Thermal Fuse (CM-TF-018)** - Every 12 months - $6.99\n\n🔩 **Low-Frequency Replacements:**\n\n• **Water Pump Assembly (CM-WP-003)** - Every 18 months - $89.99\n• **Heating Element (CM-HE-007)** - Every 18 months - $67.99\n\nWould you like me to create a maintenance schedule for your specific machine?",
    images: ['parts_layout_diagram.jpg', 'replacement_schedule_chart.jpg'],
    videos: ['parts_replacement_guide.mp4']
  },

  "parts catalog": {
    text: "📦 **Complete Coffee Machine Parts Catalog:**\n\n**💧 WATER SYSTEM:**\n• Water Reservoir (CM-WR-001) - $45.99\n• Water Filter Cartridge (CM-WF-002) - $12.99\n• Water Pump Assembly (CM-WP-003) - $89.99\n\n**⚙️ GRINDER SYSTEM:**\n• Upper Burr Set (CM-UB-004) - $34.99\n• Lower Burr Set (CM-LB-005) - $34.99\n• Grinder Motor (CM-GM-006) - $125.99\n\n**🔥 HEATING SYSTEM:**\n• Primary Heating Element (CM-HE-007) - $67.99\n• Temperature Sensor (CM-TS-008) - $23.99\n• Thermostat Assembly (CM-TA-009) - $31.99\n\n**☕ BREWING SYSTEM:**\n• Portafilter Handle (CM-PH-010) - $42.99\n• Brewing Chamber Gasket (CM-BG-011) - $8.99\n• Pressure Gauge (CM-PG-012) - $28.99\n\n**💨 STEAM SYSTEM:**\n• Steam Wand Assembly (CM-SW-013) - $56.99\n• Steam Valve Seal Kit (CM-SVS-014) - $14.99\n• Pressure Relief Valve (CM-PRV-015) - $38.99\n\n**🔌 ELECTRICAL:**\n• Control Board PCB (CM-CB-016) - $156.99\n• Power Cord Assembly (CM-PC-017) - $19.99\n• Thermal Fuse (CM-TF-018) - $6.99\n\n**🧽 MAINTENANCE SUPPLIES:**\n• Descaling Solution (CM-DS-019) - $16.99\n• Grinder Cleaning Tablets (CM-GCT-020) - $24.99\n• Cleaning Brush Set (CM-CBS-021) - $18.99\n\nAll parts include installation guides and warranty information.",
    images: ['complete_parts_catalog.jpg', 'exploded_view_diagram.jpg'],
    videos: ['parts_identification_tour.mp4']
  },

  // Grinder Issues
  "grinder making noise": {
    text: "🔊 **Grinder Noise Diagnosis - Coffee Machine CM-2000:**\n\nI can help diagnose the grinder noise issue. Let me analyze the current situation:\n\n**� IMMEDIATE ASSESSMENT:**\n• Machine: Coffee Machine CM-2000-001\n• Last grinder service: March 15, 2025 (4 months ago)\n• Operating hours since service: 1,247 hours\n• Current burr condition: 60% life remaining\n\n**⚠️ NOISE ANALYSIS:**\n\n**TYPE OF NOISE:**\n• **Grinding/Scraping:** Likely burr wear or misalignment\n• **Rattling:** Loose components or foreign objects\n• **Squealing:** Motor bearings need lubrication\n• **Clicking:** Possible gear wear in adjustment mechanism\n\n**🚨 IMMEDIATE ACTIONS:**\n1. **Safety First:** Stop machine if noise is severe\n2. **Clear Chamber:** Remove coffee beans and debris\n3. **Visual Inspection:** Check for visible damage\n4. **Foreign Objects:** Look for chaff or debris\n\n**🔧 LIKELY SOLUTIONS:**\n• **Burr Replacement:** Upper/Lower Burr Sets (CM-UB-004/CM-LB-005) - $34.99 each\n• **Motor Service:** Grinder Motor (CM-GM-006) - $125.99\n• **Cleaning:** Grinder Cleaning Tablets (CM-GCT-020) - $24.99\n\n**📋 MAINTENANCE HISTORY REFERENCE:**\n*Based on your maintenance log from July 20: \"Customer reports occasional noise during startup - recommend checking for coffee chaff buildup.\"*\n\n**🎯 RECOMMENDED ACTION:**\nSchedule grinder inspection and cleaning (30-40 minutes). I can create a work order and maintenance log entry for this issue.\n\n**QUICK ACTIONS:**\n• View detailed maintenance history\n• Create work order for grinder service\n• Schedule technician visit\n• Generate diagnostic report\n\nWhat type of noise are you hearing specifically?",
    images: ['/assets/grinder-jam-clearing.svg', '/assets/coffee-grinder-operation.svg'],
    videos: ['/assets/Cleaning_Grinder.mp4']
  },

  "grinder jammed": {
    text: "Grinder jam can usually be cleared safely. Here's how:\n\n🚫 **Jam Clearing Procedure:**\n\n**IMMEDIATE STEPS:**\n1. Turn off machine and disconnect power\n2. Allow grinder to stop completely\n3. Remove coffee hopper\n4. Check for visible obstructions\n\n**MANUAL CLEARING:**\n1. Remove upper burr (turn counter-clockwise)\n2. Clear any stuck coffee beans or debris\n3. Check for foreign objects (stones, etc.)\n4. Inspect burr alignment\n5. Clean thoroughly before reassembly\n\n**COMMON JAM CAUSES:**\n• Oily coffee beans creating clumps\n• Foreign objects in coffee beans\n• Burr misalignment\n• Over-fine grind setting\n• Old, stale coffee creating blockage\n\n**PREVENTION TIPS:**\n• Use fresh, dry coffee beans only\n• Clean grinder weekly\n• Avoid extremely oily beans\n• Don't force grind adjustment\n• Regular burr maintenance\n\n⚠️ **When to Call Service:**\nIf jam persists or burrs appear damaged, schedule professional service.\n\n🛠️ **Tools Needed:**\n• Grinder brush\n• Cleaning cloths\n• Vacuum for debris removal",
    images: ['/assets/grinder-jam-clearing.svg', '/assets/coffee-grinder-operation.svg'],
    videos: ['/assets/Cleaning_Grinder.mp4']
  },

  // Steam System
  "steam wand not working": {
    text: "Steam wand issues affect milk frothing quality. Let's diagnose:\n\n💨 **Steam System Diagnosis:**\n\n**COMMON PROBLEMS:**\n1. **No Steam:** Check steam valve operation\n2. **Weak Steam:** Partial blockage or pressure issue\n3. **Inconsistent Steam:** Temperature or pressure fluctuation\n4. **No Pressure:** System leak or valve failure\n\n**TROUBLESHOOTING STEPS:**\n1. **Check Steam Valve:**\n   - Turn fully open and closed\n   - Listen for valve operation sounds\n   - Check for leaks around valve\n\n2. **Clean Steam Holes:**\n   - Use fine wire or steam wand brush\n   - Soak tip in cleaning solution\n   - Ensure all holes are clear\n\n3. **Pressure Check:**\n   - Normal operating pressure: 1.0-1.5 bar\n   - Check pressure gauge reading\n   - Verify relief valve operation\n\n**MAINTENANCE ACTIONS:**\n• Replace Steam Valve Seals (CM-SVS-014) - $14.99\n• Service Pressure Relief Valve (CM-PRV-015) - $38.99\n• Complete Steam Wand Assembly (CM-SW-013) - $56.99\n\n**CLEANING PROCEDURE:**\n1. Descale steam system\n2. Replace worn seals\n3. Test pressure and temperature\n4. Calibrate steam controls",
    images: ['steam_system_diagram.jpg', 'valve_maintenance.jpg'],
    videos: ['steam_wand_service.mp4']
  },

  "milk not frothing": {
    text: "Poor milk frothing usually indicates steam system issues:\n\n🥛 **Milk Frothing Troubleshooting:**\n\n**STEAM TEMPERATURE:**\n• Steam should be 250-300°F (120-150°C)\n• Check temperature sensor calibration\n• Verify heating element operation\n\n**STEAM PRESSURE:**\n• Optimal pressure: 1.0-1.5 bar\n• Low pressure = weak/no froth\n• High pressure = milk overheating\n\n**TECHNIQUE FACTORS:**\n• Use cold milk (35-40°F)\n• Fill pitcher 1/3 full maximum\n• Position steam wand just below surface\n• Create vortex motion\n• Stop when milk reaches 140-150°F\n\n**EQUIPMENT ISSUES:**\n• Blocked steam holes - clean with wire brush\n• Worn steam wand tip - replace assembly\n• Faulty pressure gauge - calibrate or replace\n• Steam valve leaks - replace seals\n\n**MILK QUALITY:**\n• Use fresh, cold milk\n• Whole milk froths best (3.25% fat)\n• Avoid ultra-pasteurized milk\n• Clean pitcher thoroughly between uses\n\n🛠️ **Quick Fixes:**\n1. Purge steam wand before use\n2. Clean steam holes thoroughly\n3. Check milk temperature and freshness\n4. Verify steam pressure readings",
    images: ['frothing_technique.jpg', 'steam_troubleshooting.jpg'],
    videos: ['milk_frothing_masterclass.mp4']
  },

  // Advanced Diagnostics
  "error codes": {
    text: "Understanding error codes helps quick diagnosis:\n\n🚨 **Common Error Codes:**\n\n**E01 - Water System Error:**\n• Empty water reservoir\n• Water filter blockage\n• Pump failure or air lock\n• Solution: Refill, replace filter, prime pump\n\n**E02 - Temperature Error:**\n• Sensor malfunction\n• Heating element failure\n• Overheating protection triggered\n• Solution: Reset, check sensors, descale\n\n**E03 - Grinder Error:**\n• Burr jam or misalignment\n• Motor overload\n• Foreign object detected\n• Solution: Clear jam, inspect burrs\n\n**E04 - Steam System Error:**\n• Pressure too high/low\n• Valve malfunction\n• Temperature sensor fault\n• Solution: Check pressure, service valves\n\n**E05 - General System Error:**\n• Control board malfunction\n• Power supply issue\n• Internal communication failure\n• Solution: Reset system, check connections\n\n**ERROR RESET PROCEDURE:**\n1. Turn off machine\n2. Disconnect power for 30 seconds\n3. Reconnect and restart\n4. If error persists, contact service\n\n📞 **When to Call Service:**\nPersistent error codes after reset indicate component failure requiring professional repair.",
    images: ['error_code_reference.jpg', 'troubleshooting_flowchart.jpg'],
    videos: ['error_code_diagnosis.mp4']
  },

  "calibration": {
    text: "Regular calibration ensures optimal performance:\n\n🎯 **System Calibration Procedures:**\n\n**TEMPERATURE CALIBRATION:**\n1. Use certified thermometer\n2. Access service menu (hold Clean + Power 5 seconds)\n3. Navigate to Temperature Settings\n4. Adjust offset to match actual temperature\n5. Save settings and test\n\n**PRESSURE CALIBRATION:**\n1. Connect calibrated pressure gauge\n2. Run brewing cycle\n3. Compare readings to machine display\n4. Adjust pressure sensor offset\n5. Verify across full pressure range\n\n**GRINDER CALIBRATION:**\n1. Set to medium grind (setting 7)\n2. Grind 10g sample\n3. Measure particle size distribution\n4. Adjust burr spacing if needed\n5. Test grind consistency\n\n**VOLUME CALIBRATION:**\n1. Measure actual water volume dispensed\n2. Compare to programmed amounts\n3. Adjust flow meter calibration\n4. Test multiple cup sizes\n5. Save calibration data\n\n**CALIBRATION SCHEDULE:**\n• Monthly: Visual checks\n• Quarterly: Basic calibration\n• Annually: Full system calibration\n• After repairs: Component calibration\n\n🛠️ **Tools Required:**\n• Certified thermometer\n• Pressure gauge\n• Scale (0.1g precision)\n• Calibration certificates",
    images: ['calibration_tools.jpg', 'service_menu_navigation.jpg'],
    videos: ['calibration_procedures.mp4']
  },

  // Safety and Emergency
  "safety procedures": {
    text: "Safety is paramount in coffee machine maintenance:\n\n⚠️ **Essential Safety Procedures:**\n\n**ELECTRICAL SAFETY:**\n• Always disconnect power before maintenance\n• Use only grounded outlets (GFCI recommended)\n• Keep electrical components dry\n• Inspect cords regularly for damage\n• Never operate with wet hands\n\n**HOT SURFACE PRECAUTIONS:**\n• Allow machine to cool before cleaning\n• Use protective gloves when handling hot parts\n• Steam wand reaches 300°F - handle with care\n• Keep hands away from brewing chamber during operation\n• Use caution when removing hot portafilter\n\n**CHEMICAL SAFETY (Descaling):**\n• Use only manufacturer-approved descaling solutions\n• Wear protective eyewear and gloves\n• Ensure adequate ventilation during descaling\n• Store chemicals away from food areas\n• Follow material safety data sheets (MSDS)\n\n**EMERGENCY PROCEDURES:**\n• Emergency stop: Press red power button\n• Steam burn: Apply cold water immediately\n• Electrical shock: Disconnect power source\n• Chemical contact: Flush with water for 15 minutes\n• Fire: Use Class C fire extinguisher only\n\n**PERSONAL PROTECTIVE EQUIPMENT:**\n• Safety glasses during grinder maintenance\n• Heat-resistant gloves for hot components\n• Non-slip shoes in wet areas\n• Apron to protect from splashes\n• First aid kit readily available\n\n**LOCKOUT/TAGOUT:**\n• Tag machine during maintenance\n• Use lockout devices on power\n• Verify zero energy state\n• Test equipment before servicing",
    images: ['safety_equipment.jpg', 'emergency_procedures.jpg'],
    videos: ['safety_training_module.mp4']
  },

  // Work Orders and Management
  "create work order": {
    text: "I'll help you create a comprehensive work order:\n\n📋 **Work Order Creation:**\n\n**REQUIRED INFORMATION:**\n• Work Order ID (auto-generated)\n• Priority Level (High/Medium/Low)\n• Machine Location and Number\n• Problem Description\n• Requested Completion Date\n• Assigned Technician\n\n**PROBLEM CATEGORIES:**\n• Routine Maintenance\n• Preventive Service\n• Breakdown Repair\n• Component Replacement\n• Calibration Service\n• Safety Inspection\n\n**PRIORITY GUIDELINES:**\n• **High:** Safety issues, complete breakdown\n• **Medium:** Performance problems, scheduled maintenance\n• **Low:** Cosmetic issues, non-critical improvements\n\n**AUTO-POPULATED FIELDS:**\n• Date issued: Today's date\n• Machine model: CM-2000\n• Maintenance history: Linked automatically\n• Parts availability: Checked in real-time\n\n**NEXT STEPS:**\n1. I'll open the work order form\n2. Fill in the details\n3. System will assign tracking number\n4. Technician gets automatic notification\n5. Progress updates sent to requester\n\nShall I open the work order creation form now?",
    images: ['work_order_form.jpg', 'priority_matrix.jpg'],
    videos: ['work_order_process.mp4']
  },

  "show work orders": {
    text: "Here are the current work orders for your coffee machines:\n\n📋 **Active Work Orders:**\n\n**🔴 HIGH PRIORITY:**\n• WO-CM-002: Grinder Burr Replacement (Due: Tomorrow)\n• WO-CM-004: Temperature Sensor Calibration (Due: 2 days)\n\n**🟡 MEDIUM PRIORITY:**\n• WO-CM-001: Weekly Descaling Procedure (In Progress)\n• WO-CM-003: Steam Wand Maintenance (Completed)\n\n**🟢 LOW PRIORITY:**\n• WO-CM-005: Water Filter Replacement (Scheduled)\n\n**SUMMARY STATISTICS:**\n• Total Active: 5 work orders\n• Overdue: 0\n• Completed This Week: 3\n• Average Completion Time: 35 minutes\n• Parts On Order: 2 items\n\n**QUICK ACTIONS:**\n• View detailed work order information\n• Update work order status\n• Add notes or photos\n• Schedule follow-up maintenance\n• Generate completion reports\n\nWhich work order would you like to view in detail?",
    images: ['work_order_dashboard.jpg', 'status_indicators.jpg'],
    videos: ['work_order_management.mp4']
  },

  // Advanced Maintenance
  "preventive maintenance": {
    text: "Preventive maintenance extends equipment life and prevents breakdowns:\n\n🛠️ **Comprehensive Preventive Maintenance Schedule:**\n\n**DAILY (5 minutes):**\n• Visual inspection\n• Clean exterior surfaces\n• Empty drip tray\n• Check water level\n• Test basic functions\n\n**WEEKLY (30 minutes):**\n• Descaling procedure\n• Grinder deep clean\n• Steam system cleaning\n• Water filter check\n• Performance verification\n\n**MONTHLY (60 minutes):**\n• Complete system inspection\n• Calibration verification\n• Wear part assessment\n• Lubrication service\n• Documentation update\n\n**QUARTERLY (120 minutes):**\n• Component replacement\n• Detailed performance testing\n• Safety system verification\n• Electrical inspection\n• Comprehensive cleaning\n\n**ANNUALLY (4 hours):**\n• Complete overhaul\n• All wear parts replacement\n• System recalibration\n• Performance optimization\n• Warranty documentation\n\n**COST SAVINGS:**\n• 70% reduction in emergency repairs\n• 50% longer equipment life\n• 30% lower energy consumption\n• 90% fewer unplanned shutdowns\n\n**AUTOMATED REMINDERS:**\n• System tracks maintenance schedules\n• Automatic work order generation\n• Parts ordering integration\n• Performance trend analysis",
    images: ['maintenance_calendar.jpg', 'cost_savings_chart.jpg'],
    videos: ['preventive_maintenance_benefits.mp4']
  },

  "machine history": {
    text: "Here's the complete maintenance history for your coffee machines:\n\n📊 **Equipment History Summary:**\n\n**MACHINE: CM-2000-001 (Kitchen Station A)**\n• Install Date: January 15, 2024\n• Total Operating Hours: 3,247\n• Maintenance Events: 23\n• Parts Replaced: 8\n• Last Service: July 21, 2025\n\n**RECENT MAINTENANCE:**\n• July 21: Daily cleaning routine\n• July 20: Weekly descaling completed\n• July 19: Portafilter gasket replaced\n• July 18: Grinder calibration\n• July 17: Emergency heating element replacement\n\n**PARTS REPLACEMENT HISTORY:**\n• Water filters: 12 replacements (quarterly)\n• Burr sets: 1 replacement (12 months)\n• Gaskets/seals: 3 replacements\n• Temperature sensor: 1 replacement\n• Heating element: 1 emergency replacement\n\n**PERFORMANCE METRICS:**\n• Uptime: 98.5%\n• Average repair time: 32 minutes\n• Preventive vs reactive: 80/20\n• Cost per hour operation: $0.23\n• Customer satisfaction: 4.8/5\n\n**TRENDING ISSUES:**\n• Mineral buildup (monthly descaling needed)\n• Grinder wear (burrs due for replacement)\n• Steam pressure fluctuation (valve service recommended)\n\n**RECOMMENDATIONS:**\n• Schedule burr replacement next month\n• Increase descaling frequency\n• Consider water quality improvement",
    images: ['machine_timeline.jpg', 'performance_trends.jpg'],
    videos: ['history_analysis.mp4']
  },

  // Energy and Efficiency
  "energy efficiency": {
    text: "Optimize your coffee machine's energy consumption:\n\n⚡ **Energy Efficiency Optimization:**\n\n**CURRENT CONSUMPTION:**\n• Average daily use: 8.5 kWh\n• Peak power draw: 1800W\n• Standby consumption: 15W\n• Monthly energy cost: $127\n\n**OPTIMIZATION STRATEGIES:**\n\n**1. TEMPERATURE MANAGEMENT:**\n• Lower standby temperature by 10°F\n• Use programmable timers\n• Implement auto-shutdown after 30 minutes\n• Savings potential: 25%\n\n**2. MAINTENANCE IMPROVEMENTS:**\n• Regular descaling improves efficiency\n• Clean heating elements transfer heat better\n• Proper insulation reduces heat loss\n• Savings potential: 15%\n\n**3. USAGE PATTERNS:**\n• Schedule heating for peak hours only\n• Use batch brewing when possible\n• Avoid unnecessary heating cycles\n• Savings potential: 20%\n\n**SMART FEATURES:**\n• Automatic power management\n• Usage pattern learning\n• Predictive heating algorithms\n• Energy consumption monitoring\n\n**ENVIRONMENTAL IMPACT:**\n• Current CO2 footprint: 2.1 tons/year\n• Potential reduction: 1.2 tons/year\n• Equivalent to planting 15 trees\n\n**RECOMMENDED ACTIONS:**\n1. Enable eco-mode settings\n2. Implement scheduled operations\n3. Upgrade to smart controls\n4. Regular efficiency audits",
    images: ['energy_dashboard.jpg', 'efficiency_tips.jpg'],
    videos: ['energy_optimization.mp4']
  },

  // Machine Listing Responses
  "what machines do you know": {
    text: "☕ **Available Coffee Machines:**\n\nI can help you with maintenance and troubleshooting for these coffee machines:\n\n1. **Kitchen Station A - Coffee Machine CM-2000** (ID: CM-2000-001)\n2. **Kitchen Station B - Coffee Machine CM-2000** (ID: CM-2000-002)\n3. **Kitchen Station C - Coffee Machine CM-2000** (ID: CM-2000-003)\n4. **Break Room - Coffee Machine CM-2000** (ID: CM-2000-004)\n5. **Conference Room - Coffee Machine CM-2000** (ID: CM-2000-005)\n\n🔧 **What I can help with:**\n• Diagnostic troubleshooting\n• Maintenance procedures\n• Work order creation\n• Parts identification\n• Safety protocols\n\nJust let me know which machine you need help with, or describe the issue you're experiencing!",
    images: ['coffee_machines_overview.jpg'],
    videos: []
  },
  
  "which machines": {
    text: "☕ **Coffee Machine Inventory:**\n\nHere are all the coffee machines I can assist with:\n\n**🏢 KITCHEN STATIONS:**\n• CM-2000-001 - Kitchen Station A\n• CM-2000-002 - Kitchen Station B  \n• CM-2000-003 - Kitchen Station C\n\n**🏢 COMMON AREAS:**\n• CM-2000-004 - Break Room\n• CM-2000-005 - Conference Room\n\n**📊 MACHINE STATUS:**\n• All machines: Coffee Machine CM-2000 model\n• Maintenance schedule: Active\n• Support level: Full diagnostic and repair\n\n**🚀 NEXT STEPS:**\nSelect a machine by ID or location, or tell me about any issues you're experiencing!",
    images: ['machine_locations.jpg'],
    videos: ['machine_tour.mp4']
  },

  "show maintenance notes": {
    text: "📝 **Recent Maintenance Notes & Observations:**\n\n**CM-2000-001 (Kitchen Station A):**\n• **July 26, 2025** - Technician B: \"Grinder burrs showing slight wear, recommend replacement within 2 weeks\"\n• **July 24, 2025** - AI Assistant: \"Descaling completed, water flow restored to optimal levels\"\n• **July 22, 2025** - Technician A: \"Steam wand seal replaced, pressure test passed\"\n\n**CM-2000-002 (Kitchen Station B):**\n• **July 25, 2025** - Technician C: \"Temperature calibration adjusted, brewing temp now stable at 201°F\"\n• **July 23, 2025** - AI Assistant: \"User reported bitter taste, recommended cleaning cycle initiated\"\n\n**CM-2000-003 (Kitchen Station C):**\n• **July 27, 2025** - System Alert: \"Water filter due for replacement in 3 days\"\n• **July 21, 2025** - Technician B: \"Deep cleaning performed, all components functioning normally\"\n\n**📊 NOTES SUMMARY:**\n• Total notes this week: 12\n• High priority items: 2\n• Scheduled maintenance: 3\n• User feedback: 4\n\n**🔍 FILTER OPTIONS:**\n• View by machine\n• Filter by technician\n• Show only urgent notes\n• Export to PDF report",
    images: ['maintenance_notes_dashboard.jpg', 'technician_notes.jpg'],
    videos: ['notes_management_demo.mp4']
  },

  "show maintenance history": {
    text: "📊 **Complete Maintenance History:**\n\n**LAST 30 DAYS OVERVIEW:**\n\n**🔧 PREVENTIVE MAINTENANCE:**\n• Daily cleanings: 147/150 completed (98%)\n• Weekly descaling: 20/20 completed (100%)\n• Monthly inspections: 5/5 completed (100%)\n• Filter replacements: 8 performed\n\n**⚠️ CORRECTIVE MAINTENANCE:**\n• Emergency repairs: 3\n• Component replacements: 12\n• Troubleshooting sessions: 28\n• Work orders created: 15\n\n**📈 DETAILED HISTORY BY MACHINE:**\n\n**CM-2000-001:**\n• Last service: July 26, 2025\n• Uptime: 97.2%\n• Parts replaced: Grinder seal, water sensor\n• Next scheduled: July 31, 2025\n\n**CM-2000-002:**\n• Last service: July 25, 2025\n• Uptime: 99.1%\n• Parts replaced: Steam valve\n• Next scheduled: August 2, 2025\n\n**CM-2000-003:**\n• Last service: July 24, 2025\n• Uptime: 98.5%\n• Parts replaced: Water filter\n• Next scheduled: July 30, 2025\n\n**📋 MAINTENANCE TRENDS:**\n• Most common issue: Descaling needs\n• Average repair time: 23 minutes\n• Cost per maintenance: $12.50\n• Technician efficiency: 94%\n\n**🎯 RECOMMENDATIONS:**\n• Increase descaling frequency for CM-2000-001\n• Schedule preventive grinder maintenance\n• Stock additional water filters",
    images: ['maintenance_history_chart.jpg', 'uptime_statistics.jpg'],
    videos: ['history_analysis_demo.mp4']
  },

  "generate report": {
    text: "📊 **Maintenance Report Generation:**\n\n**AVAILABLE REPORT TYPES:**\n\n**📈 PERFORMANCE REPORTS:**\n• Machine uptime and availability\n• Energy consumption analysis\n• Cost efficiency metrics\n• Productivity impact assessment\n\n**🔧 MAINTENANCE REPORTS:**\n• Preventive maintenance compliance\n• Corrective action summaries\n• Parts usage and inventory\n• Technician performance metrics\n\n**💰 FINANCIAL REPORTS:**\n• Maintenance cost breakdown\n• ROI on preventive maintenance\n• Budget vs actual spending\n• Cost per cup analysis\n\n**📋 COMPLIANCE REPORTS:**\n• Safety protocol adherence\n• Regulatory compliance status\n• Training completion records\n• Audit trail documentation\n\n**🤖 AI-GENERATED INSIGHTS:**\n• Predictive maintenance alerts\n• Optimization recommendations\n• Trend analysis and forecasting\n• Risk assessment summaries\n\n**📄 SAMPLE REPORT PREVIEW:**\n```\n📊 WEEKLY MAINTENANCE SUMMARY\nReporting Period: July 21-27, 2025\n\nKEY METRICS:\n• System Availability: 98.2%\n• Maintenance Costs: $1,247\n• Work Orders: 15 (12 completed)\n• Emergency Calls: 2\n\nTOP ISSUES:\n1. Descaling requirements (40%)\n2. Grinder maintenance (25%)\n3. Temperature calibration (20%)\n```\n\n**📥 REPORT DELIVERY:**\n• Instant PDF download\n• Email scheduling (daily/weekly/monthly)\n• Dashboard integration\n• API export for external systems",
    images: ['report_samples.jpg', 'analytics_dashboard.jpg'],
    videos: ['report_generation_demo.mp4']
  },

  "create maintenance log": {
    text: "📝 **Create New Maintenance Log Entry:**\n\n**LOG ENTRY WIZARD:**\n\n**📋 BASIC INFORMATION:**\n• Machine: [Select from dropdown]\n• Date/Time: July 28, 2025 - 14:30\n• Technician: [Auto-filled or select]\n• Log Type: Routine, Repair, Inspection, Emergency\n\n**🔧 MAINTENANCE DETAILS:**\n• Work performed:\n• Parts used:\n• Time spent:\n• Tools required:\n• Safety measures taken:\n\n**📊 CONDITION ASSESSMENT:**\n• Before maintenance: [Rate 1-10]\n• After maintenance: [Rate 1-10]\n• Performance impact:\n• Next recommended action:\n\n**📷 DOCUMENTATION:**\n• Attach photos (before/after)\n• Upload videos (procedures)\n• Link related work orders\n• Add technical drawings\n\n**🎯 SAMPLE LOG ENTRY:**\n```\nDATE: July 28, 2025\nMACHINE: CM-2000-001 (Kitchen Station A)\nTECHNICIAN: AI Assistant + User\nTYPE: Diagnostic Troubleshooting\n\nWORK PERFORMED:\n- Investigated startup issue\n- Identified motor humming without activation\n- Checked electrical connections\n- Tested control board functionality\n\nFINDINGS:\n- Control board responding to inputs\n- Motor receiving power but not engaging\n- Likely mechanical coupling issue\n\nRECOMMENDATION:\n- Schedule mechanical inspection\n- Replace motor coupling if worn\n- Priority: Medium (within 48 hours)\n\nTIME SPENT: 25 minutes\nNEXT ACTION: Create work order for coupling replacement\n```\n\n**💾 SAVE OPTIONS:**\n• Save draft for later completion\n• Submit for supervisor review\n• Publish to maintenance database\n• Generate work order from log\n\n**🔄 AUTOMATED FEATURES:**\n• Auto-suggest based on machine history\n• Pre-fill common maintenance tasks\n• Link to parts catalog\n• Integration with inventory system",
    images: ['log_entry_form.jpg', 'maintenance_workflow.jpg'],
    videos: ['log_creation_demo.mp4']
  },

  "when was grinder last changed": {
    text: "🔍 **Grinder Maintenance History:**\n\n**GRINDER BURR REPLACEMENT RECORDS:**\n\n**CM-2000-001 (Kitchen Station A):**\n• **Last Burr Replacement:** December 15, 2024\n• **Days Since Replacement:** 225 days\n• **Recommended Interval:** 180-240 days\n• **Status:** ⚠️ Due Soon (within 2 weeks)\n• **Usage Hours:** 1,847 hours\n• **Performance:** 87% (declining)\n\n**CM-2000-002 (Kitchen Station B):**\n• **Last Burr Replacement:** March 8, 2025\n• **Days Since Replacement:** 142 days\n• **Status:** ✅ Good Condition\n• **Usage Hours:** 1,156 hours\n• **Performance:** 94% (excellent)\n\n**CM-2000-003 (Kitchen Station C):**\n• **Last Burr Replacement:** January 22, 2025\n• **Days Since Replacement:** 187 days\n• **Status:** ⚠️ Monitor Closely\n• **Usage Hours:** 1,623 hours\n• **Performance:** 89% (acceptable)\n\n**📊 GRINDER PERFORMANCE INDICATORS:**\n• Grind consistency: 92% average\n• Particle size variance: ±15%\n• Motor load: Normal\n• Noise levels: Within tolerance\n• Customer satisfaction: 4.2/5\n\n**🔧 MAINTENANCE RECOMMENDATIONS:**\n• **Immediate:** Schedule burr inspection for CM-2000-001\n• **This Week:** Order replacement burr set (Part #CM-UB-004)\n• **Next Month:** Calibrate grind settings across all units\n• **Ongoing:** Monitor grind quality daily\n\n**📈 USAGE PATTERNS:**\n• Peak hours: 7-9 AM, 1-3 PM\n• Daily average: 8.3 hours operation\n• Weekly cycles: 487 complete grinds\n• Busiest day: Monday (143 cycles)\n\n**💰 COST ANALYSIS:**\n• Burr set cost: $34.99\n• Labor for replacement: $45.00\n• Preventive vs reactive savings: 67%\n• Total cost per replacement: $79.99\n\n**🎯 NEXT ACTIONS:**\n• Create work order for CM-2000-001 burr replacement\n• Schedule downtime during low-usage period\n• Prepare backup grinder if needed\n• Update inventory for spare parts",
    images: ['grinder_history_chart.jpg', 'burr_wear_comparison.jpg'],
    videos: ['grinder_maintenance_timeline.mp4']
  },

  "list machines": {
    text: "☕ **Machine Database:**\n\n**ACTIVE COFFEE MACHINES:**\n\n```\nID           | Location        | Model      | Status\n─────────────┼─────────────────┼────────────┼─────────\nCM-2000-001  | Kitchen Stn A   | CM-2000    | Online\nCM-2000-002  | Kitchen Stn B   | CM-2000    | Online\nCM-2000-003  | Kitchen Stn C   | CM-2000    | Online\nCM-2000-004  | Break Room      | CM-2000    | Online\nCM-2000-005  | Conference Rm   | CM-2000    | Online\n```\n\n**📈 SYSTEM OVERVIEW:**\n• Total machines: 5\n• Model type: Coffee Machine CM-2000\n• All systems operational\n• Last maintenance check: Today\n\n**💬 WHAT'S NEXT?**\nWhich machine needs attention? I can help with troubleshooting, maintenance, or creating work orders!",
    images: ['machine_dashboard.jpg'],
    videos: []
  },

  // Maintenance History and Logs
  "when was grinder last changed": {
    text: "📊 **Grinder Maintenance History - Coffee Machine CM-2000:**\n\n**LAST GRINDER BURR REPLACEMENT:**\n• **Date:** March 15, 2025 (4 months, 13 days ago)\n• **Technician:** Sarah Martinez\n• **Parts Used:** Upper Burr Set (CM-UB-004), Lower Burr Set (CM-LB-005)\n• **Work Order:** WO-CM-089\n• **Total Cost:** $69.98\n\n**📈 PERFORMANCE METRICS:**\n• Operating hours since replacement: 1,247 hours\n• Coffee grounds processed: ~18,500 lbs\n• Expected replacement interval: 12-18 months\n• Current condition: **Good** (60% life remaining)\n\n**🔧 RECENT GRINDER MAINTENANCE:**\n• July 20, 2025: Deep cleaning and calibration\n• June 28, 2025: Grind size adjustment\n• May 15, 2025: Motor lubrication service\n• April 10, 2025: Cleaning tablet treatment\n\n**⚠️ CURRENT STATUS:**\n• No immediate replacement needed\n• Next scheduled service: August 15, 2025\n• Recommended monitoring for unusual sounds\n\n**💡 MAINTENANCE NOTES:**\n*\"Burrs showing normal wear pattern. Customer reports occasional noise during startup - recommend checking for coffee chaff buildup.\"* - Tech Note, July 20\n\n**🎯 CONTEXTUAL INSIGHT:**\nGiven that you're hearing unusual noise, and considering the grinder was last serviced 4+ months ago with recent noise reports, I recommend scheduling a grinder inspection. The noise could be related to coffee chaff buildup mentioned in the last service note.\n\n**QUICK ACTIONS:**\n• Schedule grinder cleaning service\n• Create work order for noise investigation\n• View detailed maintenance photos\n• Generate grinder performance report\n\nWould you like me to create a maintenance work order for the grinder noise issue?",
    images: ['grinder_maintenance_history.jpg', 'burr_wear_chart.jpg'],
    videos: ['grinder_inspection_demo.mp4']
  },

  "whan was grinder last changed": {
    text: "📊 **Grinder Maintenance History - Coffee Machine CM-2000:**\n\n**LAST GRINDER BURR REPLACEMENT:**\n• **Date:** March 15, 2025 (4 months, 13 days ago)\n• **Technician:** Sarah Martinez\n• **Parts Used:** Upper Burr Set (CM-UB-004), Lower Burr Set (CM-LB-005)\n• **Work Order:** WO-CM-089\n• **Total Cost:** $69.98\n\n**📈 PERFORMANCE METRICS:**\n• Operating hours since replacement: 1,247 hours\n• Coffee grounds processed: ~18,500 lbs\n• Expected replacement interval: 12-18 months\n• Current condition: **Good** (60% life remaining)\n\n**🔧 RECENT GRINDER MAINTENANCE:**\n• July 20, 2025: Deep cleaning and calibration\n• June 28, 2025: Grind size adjustment\n• May 15, 2025: Motor lubrication service\n• April 10, 2025: Cleaning tablet treatment\n\n**⚠️ CURRENT STATUS:**\n• No immediate replacement needed\n• Next scheduled service: August 15, 2025\n• Recommended monitoring for unusual sounds\n\n**💡 MAINTENANCE NOTES:**\n*\"Burrs showing normal wear pattern. Customer reports occasional noise during startup - recommend checking for coffee chaff buildup.\"* - Tech Note, July 20\n\n**🎯 CONTEXTUAL INSIGHT:**\nGiven that you're hearing unusual noise, and considering the grinder was last serviced 4+ months ago with recent noise reports, I recommend scheduling a grinder inspection. The noise could be related to coffee chaff buildup mentioned in the last service note.\n\n**QUICK ACTIONS:**\n• Schedule grinder cleaning service\n• Create work order for noise investigation\n• View detailed maintenance photos\n• Generate grinder performance report\n\nWould you like me to create a maintenance work order for the grinder noise issue?",
    images: ['grinder_maintenance_history.jpg', 'burr_wear_chart.jpg'],
    videos: ['grinder_inspection_demo.mp4']
  },

  "show maintenance history": {
    text: "📋 **Comprehensive Maintenance History - Coffee Machine CM-2000:**\n\n**🔧 RECENT MAINTENANCE (Last 30 Days):**\n\n**July 28, 2025** - Daily Cleaning ✅\n• Water reservoir cleaned and refilled\n• Drip tray emptied and sanitized\n• Steam wand cleaned and purged\n• Technician: Auto-Schedule\n\n**July 27, 2025** - Grinder Noise Investigation 🔍\n• Customer reported unusual grinding sounds\n• Visual inspection completed - no damage found\n• Recommended deep cleaning cycle\n• Work Order: WO-CM-112\n\n**July 21, 2025** - Weekly Deep Clean ✅\n• Descaling procedure completed\n• Grinder burrs cleaned and calibrated\n• Temperature sensor calibration verified\n• Filter replacement (CM-WF-002)\n• Technician: Mike Johnson\n\n**July 14, 2025** - Filter Replacement ✅\n• Water filter (CM-WF-002) replaced\n• Water quality test: PASSED\n• System flush completed\n• Next filter due: October 14, 2025\n\n**July 7, 2025** - Monthly Inspection ✅\n• Complete system diagnostic\n• Pressure testing: 15 bar (NORMAL)\n• Temperature accuracy: ±1°F (EXCELLENT)\n• All safety systems verified\n• Technician: Sarah Martinez\n\n**📊 MAINTENANCE STATISTICS:**\n• Total service events: 156\n• Preventive maintenance: 89% \n• Emergency repairs: 11%\n• Average response time: 23 minutes\n• Uptime: 98.7%\n\n**🎯 UPCOMING SCHEDULED MAINTENANCE:**\n• August 4: Weekly descaling\n• August 15: Grinder service\n• September 1: Quarterly inspection\n• October 14: Filter replacement\n\nWould you like detailed reports for any specific maintenance event?",
    images: ['maintenance_timeline.jpg', 'service_statistics.jpg'],
    videos: ['maintenance_overview.mp4']
  },

  "show maintenance notes": {
    text: "📝 **Recent Maintenance Notes & Observations:**\n\n**🔧 TECHNICIAN NOTES:**\n\n**July 27, 2025 - Mike Johnson:**\n*\"Customer reported grinding noise during morning startup. Inspected burr assembly - found small amount of coffee chaff buildup around upper burr housing. Cleaned and tested - noise eliminated. Recommended more frequent cleaning of grinder chamber. Customer satisfied with resolution.\"*\n\n**July 21, 2025 - Sarah Martinez:**\n*\"Routine weekly maintenance completed. Descaling solution required 2 cycles to achieve proper flow rate - indicates moderate mineral buildup. Water hardness test shows 8 grains/gallon (hard water). Recommend upgrading to premium filtration system. All other systems performing within spec.\"*\n\n**July 14, 2025 - Auto-System:**\n*\"Automated filter replacement reminder triggered. Customer reported slight change in coffee taste. Filter (CM-WF-002) replaced 3 days early as precaution. Post-replacement taste test confirmed improvement. Filter life: 87 days (3 days under expected).\"*\n\n**July 7, 2025 - Sarah Martinez:**\n*\"Monthly inspection revealed excellent overall condition. Grinder burrs show 40% wear - within normal range. Steam pressure holding steady at 15 bar. Temperature consistency improved since last calibration. Minor adjustment made to brew group pressure. Recommend continued current maintenance schedule.\"*\n\n**📸 MAINTENANCE PHOTOS:**\n• Grinder burr condition (July 21)\n• Filter comparison (old vs new)\n• Steam wand cleaning procedure\n• Pressure gauge readings\n\n**📊 CUSTOMER FEEDBACK:**\n• Coffee quality rating: 4.8/5\n• Machine reliability: 4.9/5\n• Service response: 5.0/5\n• Overall satisfaction: 4.9/5\n\n**💡 RECOMMENDATIONS:**\n1. Continue weekly deep cleaning schedule\n2. Monitor grinder noise closely\n3. Consider water filtration upgrade\n4. Schedule quarterly calibration review\n\nWould you like me to add a new maintenance note or photo?",
    images: ['maintenance_notes_dashboard.jpg', 'technician_photos.jpg'],
    videos: ['note_taking_demo.mp4']
  },

  "generate report": {
    text: "📊 **Comprehensive Machine Report Generation:**\n\n**📋 AVAILABLE REPORTS:**\n\n**1. MAINTENANCE SUMMARY REPORT**\n• Last 30/60/90 days of service history\n• Parts replacement tracking\n• Cost analysis and trends\n• Technician performance metrics\n\n**2. PERFORMANCE ANALYTICS REPORT**\n• Uptime and reliability statistics\n• Coffee quality consistency metrics\n• Energy consumption analysis\n• Usage pattern insights\n\n**3. COMPLIANCE & SAFETY REPORT**\n• Safety inspection results\n• Regulatory compliance status\n• Certification tracking\n• Risk assessment summary\n\n**4. FINANCIAL ANALYSIS REPORT**\n• Maintenance cost breakdown\n• ROI analysis\n• Budget forecasting\n• Cost-per-cup analysis\n\n**5. PREDICTIVE MAINTENANCE REPORT**\n• Component life expectancy\n• Recommended service intervals\n• Failure prediction analysis\n• Optimization recommendations\n\n**🎯 QUICK REPORT OPTIONS:**\n\n**📄 Standard Report (PDF)**\n• 2-page executive summary\n• Key metrics and graphs\n• Maintenance recommendations\n• Ready in 30 seconds\n\n**📊 Detailed Analysis (Excel)**\n• Raw data export\n• Interactive charts\n• Historical trending\n• Ready in 2 minutes\n\n**📱 Mobile Summary (Text)**\n• Key highlights only\n• Instant delivery\n• SMS/Email compatible\n• Ready now\n\n**🚀 CUSTOM REPORT BUILDER:**\nCreate personalized reports with specific metrics, date ranges, and formatting preferences.\n\n**Which report would you like me to generate?** I can create a comprehensive maintenance report for your coffee machine right now, or help you set up automated reporting schedules.",
    images: ['report_templates.jpg', 'analytics_dashboard.jpg'],
    videos: ['report_generation_demo.mp4']
  },

  // Common follow-up questions
  "when was last maintenance": {
    text: "� **Recent Maintenance Summary - Coffee Machine CM-2000:**\n\n**LAST SERVICE:** July 21, 2025 (7 days ago)\n• Type: Weekly Deep Clean & Descaling\n• Technician: Mike Johnson\n• Duration: 45 minutes\n• Status: ✅ Completed\n\n**SERVICES PERFORMED:**\n• Descaling procedure (2 cycles)\n• Grinder burr cleaning and calibration\n• Steam wand deep cleaning\n• Water filter inspection\n• Temperature sensor verification\n• System performance test\n\n**NEXT SCHEDULED MAINTENANCE:**\n• August 4, 2025: Weekly descaling\n• August 15, 2025: Grinder service\n• September 1, 2025: Quarterly inspection\n\n**MAINTENANCE FREQUENCY:**\n• Daily: Basic cleaning (automated)\n• Weekly: Deep clean and descaling\n• Monthly: Complete inspection\n• Quarterly: Component replacement\n\nWould you like to see the detailed maintenance log or schedule additional service?",
    images: ['last_service_summary.jpg'],
    videos: []
  },

  "weird noise": {
    text: "🔊 **Investigating Unusual Noise - Coffee Machine CM-2000:**\n\nI understand you're hearing an unusual noise. Let me help identify the source:\n\n**🎯 NOISE LOCATION IDENTIFICATION:**\n\n**GRINDER AREA:**\n• Grinding/scraping sounds\n• Rattling during operation\n• High-pitched squealing\n• Intermittent clicking\n\n**PUMP/MOTOR AREA:**\n• Humming or buzzing\n• Vibration noises\n• Cycling sounds\n• Water flow irregularities\n\n**STEAM SYSTEM:**\n• Hissing or whistling\n• Pressure release sounds\n• Gurgling noises\n• Steam valve clicking\n\n**🔍 DIAGNOSTIC QUESTIONS:**\n1. When does the noise occur? (startup, grinding, brewing, idle)\n2. How would you describe it? (grinding, rattling, squealing, clicking)\n3. Is it constant or intermittent?\n4. Has it gotten worse recently?\n\n**📋 IMMEDIATE ACTIONS:**\n• Stop operation if noise is severe\n• Note exact timing of noise\n• Document any changes in performance\n• Check for visible issues\n\n**BASED ON YOUR MAINTENANCE HISTORY:**\n*Your last service (July 21) noted: \"Customer reports occasional noise during startup - recommend checking for coffee chaff buildup.\"*\n\n**🚀 NEXT STEPS:**\nI can help you pinpoint the exact issue and create a service request. What type of noise are you hearing, and when does it occur?",
    images: ['noise_diagnosis_chart.jpg', 'machine_sound_map.jpg'],
    videos: ['noise_troubleshooting_guide.mp4']
  },

  "hearing noise": {
    text: "🔊 **Noise Investigation Started - Coffee Machine CM-2000:**\n\nI'm here to help identify and resolve the noise issue you're experiencing.\n\n**📊 QUICK NOISE ASSESSMENT:**\n\n**COMMON NOISE TYPES:**\n🔸 **Grinding Sounds** → Grinder burr issues\n� **Rattling** → Loose components\n🔸 **Squealing** → Motor bearing problems\n🔸 **Clicking** → Solenoid or gear issues\n🔸 **Hissing** → Steam system pressure\n🔸 **Gurgling** → Water flow problems\n\n**🎯 SMART DIAGNOSIS:**\nBased on your machine's history, the most likely cause is grinder-related, as your last service noted occasional startup noise.\n\n**📋 MAINTENANCE CONTEXT:**\n• Last grinder service: March 15, 2025\n• Hours since service: 1,247\n• Expected burr life: 60% remaining\n• Last cleaning: July 21, 2025\n\n**� IMMEDIATE ACTION REQUIRED:**\nIf the noise is loud or getting worse, please stop using the machine for safety.\n\n**💡 INTELLIGENT SUGGESTIONS:**\n1. **Most Likely:** Grinder chamber cleaning needed\n2. **Possible:** Burr alignment check required\n3. **Unlikely but possible:** Motor bearing lubrication\n\n**WOULD YOU LIKE ME TO:**\n• Create a diagnostic work order?\n• Schedule a technician visit?\n• Walk you through basic troubleshooting?\n• Generate a detailed noise analysis report?\n\nPlease describe the noise in more detail so I can provide specific guidance!",
    images: ['noise_flowchart.jpg', 'diagnostic_checklist.jpg'],
    videos: ['noise_identification_tutorial.mp4']
  },

  "strange sound": {
    text: "🔊 **Strange Sound Analysis - Coffee Machine CM-2000:**\n\nUnusual sounds can indicate various issues. Let me help you identify and resolve this:\n\n**🎵 SOUND CLASSIFICATION SYSTEM:**\n\n**CATEGORY A - MECHANICAL SOUNDS:**\n• Grinding/Scraping → Component wear\n• Rattling/Vibrating → Loose parts\n• Clicking/Tapping → Electrical components\n\n**CATEGORY B - FLUID SOUNDS:**\n• Gurgling → Water flow issues\n• Hissing → Pressure problems\n• Bubbling → Air in system\n\n**CATEGORY C - MOTOR SOUNDS:**\n• Humming → Normal operation\n• Squealing → Bearing problems\n• Grinding → Internal damage\n\n**🔍 ADVANCED DIAGNOSTICS:**\n\nBased on your machine's profile:\n• Model: Coffee Machine CM-2000-001\n• Age: 18 months\n• Last service: July 21, 2025\n• Operating hours: 3,247\n• Maintenance compliance: 98%\n\n**📊 PREDICTIVE ANALYSIS:**\nYour machine shows excellent maintenance history. The most probable causes for new sounds are:\n1. **Minor cleaning required** (75% probability)\n2. **Component adjustment needed** (20% probability)\n3. **Part replacement required** (5% probability)\n\n**🎯 SMART RECOMMENDATIONS:**\n• Immediate: Visual inspection\n• Short-term: Professional diagnosis\n• Long-term: Preventive maintenance upgrade\n\n**INTERACTIVE DIAGNOSIS:**\nI can guide you through identifying the exact sound using audio patterns and timing. Would you like to start the interactive sound diagnosis tool?",
    images: ['sound_analysis_chart.jpg', 'audio_diagnostic_tool.jpg'],
    videos: ['interactive_sound_diagnosis.mp4']
  },

  // Showcase more capabilities
  "show capabilities": {
    text: "🚀 **AI Maintenance System - Full Capabilities Showcase:**\n\n**🔧 DIAGNOSTIC & TROUBLESHOOTING:**\n• Real-time issue detection\n• Predictive failure analysis\n• Interactive problem solving\n• Multi-sensor data integration\n• Expert system recommendations\n\n**📊 MAINTENANCE MANAGEMENT:**\n• Automated scheduling\n• Preventive maintenance planning\n• Work order creation & tracking\n• Resource optimization\n• Cost analysis & reporting\n\n**📝 DOCUMENTATION & LOGGING:**\n• Digital maintenance logs\n• Photo & video documentation\n• Technician notes integration\n• Compliance tracking\n• Historical trend analysis\n\n**🎯 SMART FEATURES:**\n• Voice-activated assistance\n• QR code scanning\n• Mobile app integration\n• Real-time notifications\n• Performance dashboards\n\n**📱 COMMUNICATION TOOLS:**\n• Chat interface (current)\n• Video conferencing\n• Help desk integration\n• Expert consultation\n• Knowledge base access\n\n**🔍 ADVANCED ANALYTICS:**\n• Machine learning insights\n• Predictive maintenance\n• Cost optimization\n• Performance benchmarking\n• ROI analysis\n\n**⚡ INTEGRATION CAPABILITIES:**\n• ERP system connectivity\n• Inventory management\n• Supplier integration\n• Financial systems\n• IoT device monitoring\n\n**🎓 TRAINING & SUPPORT:**\n• Interactive tutorials\n• Step-by-step guides\n• Video demonstrations\n• Certification tracking\n• Best practices sharing\n\n**CURRENTLY ACTIVE FEATURES:**\n✅ Intelligent chat assistance\n✅ Work order management\n✅ Maintenance history tracking\n✅ Parts catalog integration\n✅ Diagnostic troubleshooting\n✅ Report generation\n✅ Safety protocol guidance\n\nTry asking me about specific features like: 'Generate a report', 'Show maintenance history', 'Create work order', or 'What machines do you know'!",
    images: ['system_architecture.jpg', 'features_overview.jpg'],
    videos: ['capabilities_demo.mp4']
  },

  // Enhanced Filter Replacement - Multi-Step Visual Guide
  "Filter replacement": {
    text: "🔧 **Complete Water Filter Replacement Guide**\n\nI'll walk you through the complete water filter replacement procedure with detailed visual guidance.\n\n💧 **Step-by-Step Process (10 minutes):**\n\n**🔌 Step 1: Safety Preparation**\n• Turn off machine and disconnect power\n• Allow cooling for 10 minutes minimum\n• Gather tools: New filter (CM-WF-002), clean towel, disposable gloves\n• Ensure adequate lighting and workspace\n\n**💧 Step 2: Water System Access**\n• Remove water reservoir completely and set aside\n• Locate filter housing (typically blue cap on machine side)\n• Take note of current filter orientation before removal\n• Have towel ready to catch any water spillage\n\n**🔄 Step 3: Filter Removal & Installation**\n• Turn filter housing counterclockwise to unlock (usually 1/4 turn)\n• Carefully lift out old filter cartridge - dispose properly\n• Check O-ring seal condition (replace if cracked or worn)\n• Remove new filter from packaging and soak in clean water for 2 minutes\n• Insert new filter with flow arrow pointing UP\n• Turn housing clockwise until snug (hand-tight only - don't overtighten)\n\n**✅ Step 4: System Reset & Testing**\n• Reinstall water reservoir securely\n• Reconnect power and turn machine on\n• Reset filter life indicator on display (hold MENU + CLEAN for 5 seconds)\n• Run 2 complete water-only brewing cycles to flush system\n• Check around filter housing for any leaks\n\n**🧪 Step 5: Quality Verification**\n• Test water taste - should be clean with no chemical flavors\n• Verify normal water flow rate during brewing\n• Confirm filter indicator shows 100% or 'NEW'\n• Document replacement date for maintenance records\n\n**� Filter Specifications:**\n• Part Number: CM-WF-002 - $12.99\n• Replacement Interval: Every 3 months or 1000 cycles\n• Capacity: Filters up to 50 gallons\n• Next replacement due: October 29, 2025\n\n**💡 Professional Tips:**\n• Mark installation date directly on filter housing\n• Keep one spare filter in inventory at all times\n• Monitor water quality weekly - replace early if taste changes\n• Consider upgrading to premium filter for hard water areas\n\n**⚠️ Important Notes:**\n• Never reuse old filters\n• Dispose of used filters according to local regulations\n• If leaks occur after installation, check O-ring placement\n• Contact technician if filter housing is damaged",
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },

  // Additional variations for water filter replacement
  "Water filter replacement": {
    text: "🔧 **Complete Water Filter Replacement Guide**\n\nI'll walk you through the complete water filter replacement procedure with detailed visual guidance.\n\n💧 **Step-by-Step Process (10 minutes):**\n\n**🔌 Step 1: Safety Preparation**\n• Turn off machine and disconnect power\n• Allow cooling for 10 minutes minimum\n• Gather tools: New filter (CM-WF-002), clean towel, disposable gloves\n• Ensure adequate lighting and workspace\n\n**💧 Step 2: Water System Access**\n• Remove water reservoir completely and set aside\n• Locate filter housing (typically blue cap on machine side)\n• Take note of current filter orientation before removal\n• Have towel ready to catch any water spillage\n\n**🔄 Step 3: Filter Removal & Installation**\n• Turn filter housing counterclockwise to unlock (usually 1/4 turn)\n• Carefully lift out old filter cartridge - dispose properly\n• Check O-ring seal condition (replace if cracked or worn)\n• Remove new filter from packaging and soak in clean water for 2 minutes\n• Insert new filter with flow arrow pointing UP\n• Turn housing clockwise until snug (hand-tight only - don't overtighten)\n\n**✅ Step 4: System Reset & Testing**\n• Reinstall water reservoir securely\n• Reconnect power and turn machine on\n• Reset filter life indicator on display (hold MENU + CLEAN for 5 seconds)\n• Run 2 complete water-only brewing cycles to flush system\n• Check around filter housing for any leaks\n\n**🧪 Step 5: Quality Verification**\n• Test water taste - should be clean with no chemical flavors\n• Verify normal water flow rate during brewing\n• Confirm filter indicator shows 100% or 'NEW'\n• Document replacement date for maintenance records\n\n**📹 Video Tutorial Available:**\nSee the complete procedure demonstrated in the video above.\n\n**💎 Filter Specifications:**\n• Part Number: CM-WF-002 - $12.99\n• Replacement Interval: Every 3 months or 1000 cycles\n• Capacity: Filters up to 50 gallons\n• Next replacement due: October 29, 2025\n\n**💡 Professional Tips:**\n• Mark installation date directly on filter housing\n• Keep one spare filter in inventory at all times\n• Monitor water quality weekly - replace early if taste changes\n• Consider upgrading to premium filter for hard water areas\n\n**⚠️ Important Notes:**\n• Never reuse old filters\n• Dispose of used filters according to local regulations\n• If leaks occur after installation, check O-ring placement\n• Contact technician if filter housing is damaged",
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },

  "How to replace water filter": {
    text: "🔧 **Complete Water Filter Replacement Guide**\n\nI'll walk you through the complete water filter replacement procedure with detailed visual guidance.\n\n💧 **Step-by-Step Process (10 minutes):**\n\n**🔌 Step 1: Safety Preparation**\n• Turn off machine and disconnect power\n• Allow cooling for 10 minutes minimum\n• Gather tools: New filter (CM-WF-002), clean towel, disposable gloves\n• Ensure adequate lighting and workspace\n\n**💧 Step 2: Water System Access**\n• Remove water reservoir completely and set aside\n• Locate filter housing (typically blue cap on machine side)\n• Take note of current filter orientation before removal\n• Have towel ready to catch any water spillage\n\n**🔄 Step 3: Filter Removal & Installation**\n• Turn filter housing counterclockwise to unlock (usually 1/4 turn)\n• Carefully lift out old filter cartridge - dispose properly\n• Check O-ring seal condition (replace if cracked or worn)\n• Remove new filter from packaging and soak in clean water for 2 minutes\n• Insert new filter with flow arrow pointing UP\n• Turn housing clockwise until snug (hand-tight only - don't overtighten)\n\n**✅ Step 4: System Reset & Testing**\n• Reinstall water reservoir securely\n• Reconnect power and turn machine on\n• Reset filter life indicator on display (hold MENU + CLEAN for 5 seconds)\n• Run 2 complete water-only brewing cycles to flush system\n• Check around filter housing for any leaks\n\n**🧪 Step 5: Quality Verification**\n• Test water taste - should be clean with no chemical flavors\n• Verify normal water flow rate during brewing\n• Confirm filter indicator shows 100% or 'NEW'\n• Document replacement date for maintenance records\n\n**📹 Video Tutorial Available:**\nSee the complete procedure demonstrated in the video above.\n\n**💎 Filter Specifications:**\n• Part Number: CM-WF-002 - $12.99\n• Replacement Interval: Every 3 months or 1000 cycles\n• Capacity: Filters up to 50 gallons\n• Next replacement due: October 29, 2025\n\n**💡 Professional Tips:**\n• Mark installation date directly on filter housing\n• Keep one spare filter in inventory at all times\n• Monitor water quality weekly - replace early if taste changes\n• Consider upgrading to premium filter for hard water areas\n\n**⚠️ Important Notes:**\n• Never reuse old filters\n• Dispose of used filters according to local regulations\n• If leaks occur after installation, check O-ring placement\n• Contact technician if filter housing is damaged",
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },

  "Replace water filter": {
    text: "🔧 **Complete Water Filter Replacement Guide**\n\nI'll walk you through the complete water filter replacement procedure with detailed visual guidance.\n\n💧 **Step-by-Step Process (10 minutes):**\n\n**🔌 Step 1: Safety Preparation**\n• Turn off machine and disconnect power\n• Allow cooling for 10 minutes minimum\n• Gather tools: New filter (CM-WF-002), clean towel, disposable gloves\n• Ensure adequate lighting and workspace\n\n**💧 Step 2: Water System Access**\n• Remove water reservoir completely and set aside\n• Locate filter housing (typically blue cap on machine side)\n• Take note of current filter orientation before removal\n• Have towel ready to catch any water spillage\n\n**🔄 Step 3: Filter Removal & Installation**\n• Turn filter housing counterclockwise to unlock (usually 1/4 turn)\n• Carefully lift out old filter cartridge - dispose properly\n• Check O-ring seal condition (replace if cracked or worn)\n• Remove new filter from packaging and soak in clean water for 2 minutes\n• Insert new filter with flow arrow pointing UP\n• Turn housing clockwise until snug (hand-tight only - don't overtighten)\n\n**✅ Step 4: System Reset & Testing**\n• Reinstall water reservoir securely\n• Reconnect power and turn machine on\n• Reset filter life indicator on display (hold MENU + CLEAN for 5 seconds)\n• Run 2 complete water-only brewing cycles to flush system\n• Check around filter housing for any leaks\n\n**🧪 Step 5: Quality Verification**\n• Test water taste - should be clean with no chemical flavors\n• Verify normal water flow rate during brewing\n• Confirm filter indicator shows 100% or 'NEW'\n• Document replacement date for maintenance records\n\n**📹 Video Tutorial Available:**\nSee the complete procedure demonstrated in the video above.\n\n**💎 Filter Specifications:**\n• Part Number: CM-WF-002 - $12.99\n• Replacement Interval: Every 3 months or 1000 cycles\n• Capacity: Filters up to 50 gallons\n• Next replacement due: October 29, 2025\n\n**💡 Professional Tips:**\n• Mark installation date directly on filter housing\n• Keep one spare filter in inventory at all times\n• Monitor water quality weekly - replace early if taste changes\n• Consider upgrading to premium filter for hard water areas\n\n**⚠️ Important Notes:**\n• Never reuse old filters\n• Dispose of used filters according to local regulations\n• If leaks occur after installation, check O-ring placement\n• Contact technician if filter housing is damaged",
    images: [
      '/assets/water-filter-replacement.svg',
      '/assets/espresso-machine-cleaning.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: ['/assets/Coffee_Machine_Filter_Replacement_Video.mp4']
  },

  // === CONTEXTUAL PROBLEM-SPECIFIC RESPONSES ===

  "filter is stuck": {
    text: "🚨 **STUCK FILTER EMERGENCY PROCEDURE**\n\nDon't worry! Stuck filters are common, especially in hard water areas. Here's how to safely remove it:\n\n**⚠️ IMMEDIATE SAFETY:**\n• Turn OFF machine completely\n• Disconnect power and wait 15 minutes to cool\n• NEVER use excessive force - you could damage threads\n\n**🔧 REMOVAL TECHNIQUE:**\n\n**Step 1: Lubrication**\n• Apply penetrating oil around filter housing threads\n• Let it soak for 10-15 minutes\n• Use food-safe penetrating lubricant only\n\n**Step 2: Gentle Removal**\n• Use rubber-grip pliers for better grip\n• Turn counterclockwise in small increments\n• Apply steady, gentle pressure - no jerking motions\n• Rock slightly back and forth if needed\n\n**Step 3: If Still Stuck**\n• Apply more lubricant and wait longer\n• Try warming the housing slightly with warm (not hot) cloth\n• Use strap wrench if available for even grip distribution\n\n**🛠️ TOOLS NEEDED:**\n• Rubber-grip pliers or strap wrench\n• Food-safe penetrating oil\n• Clean rags/towels\n• Flashlight for visibility\n\n**💡 PREVENTION TIPS:**\n• Replace filters every 3 months to prevent mineral buildup\n• Apply thin layer of food-safe silicone grease to threads\n• Don't overtighten when installing new filters\n\n**🆘 WHEN TO CALL TECHNICIAN:**\n• If housing appears cracked or damaged\n• If threads are stripped or cross-threaded\n• If excessive force was already applied\n• If you're uncomfortable with the procedure\n\n**Part Number for replacement filter: CM-WF-002 - $12.99**",
    images: [
      '/assets/filter-stuck-removal.svg',
      '/assets/water-filter-replacement.svg'
    ],
    videos: []
  },

  "grinder is jammed": {
    text: "⚠️ **GRINDER JAM EMERGENCY CLEARING**\n\nGrinder jams can happen when foreign objects get into the burrs. Here's how to safely clear it:\n\n**🔴 IMMEDIATE ACTIONS:**\n• STOP using the grinder immediately\n• Turn OFF and unplug the machine\n• Don't force the grinder - this can damage burrs\n\n**🔍 JAM DIAGNOSIS:**\n• Listen for unusual grinding sounds\n• Check if grinder motor runs but burrs don't turn\n• Look for foreign objects in bean hopper\n• Check for visible obstructions\n\n**🛠️ CLEARING PROCEDURE:**\n\n**Step 1: Safety Preparation**\n• Ensure machine is OFF and unplugged\n• Remove all coffee beans from hopper\n• Gather tools: screwdriver set, cleaning brush\n\n**Step 2: Burr Removal**\n• Remove upper burr carrier (usually twist-lock)\n• Lift out upper burr carefully\n• Inspect for foreign objects (stones, metal)\n\n**Step 3: Clear Obstruction**\n• Remove any foreign objects with brush or tweezers\n• Clean coffee residue from burr chamber\n• Check burr alignment and condition\n\n**Step 4: Reassembly**\n• Reinstall burrs in correct position\n• Ensure proper alignment\n• Test grinder operation before adding beans\n\n**🚨 COMMON JAM CAUSES:**\n• Small stones in coffee beans\n• Metal objects (staples, clips)\n• Overly oily/dark roast buildup\n• Worn burr assemblies\n\n**🛡️ PREVENTION:**\n• Inspect coffee beans before adding to hopper\n• Clean grinder weekly\n• Replace burrs every 12-18 months\n• Use only coffee cleaning tablets\n\n**🆘 CONTACT TECHNICIAN IF:**\n• Burrs appear damaged or chipped\n• Motor runs but won't engage\n• Unusual burning smell detected\n• Unable to remove obstruction safely\n\n**Parts: Upper Burr (CM-UB-004) $34.99, Lower Burr (CM-LB-005) $34.99**",
    images: [
      '/assets/grinder-jam-clearing.svg',
      '/assets/coffee-grinder-operation.svg'
    ],
    videos: []
  },

  "steam wand blocked": {
    text: "💨 **STEAM WAND BLOCKAGE CLEARING**\n\nBlocked steam wands are common due to milk residue buildup. Here's how to restore proper steam flow:\n\n**🔍 BLOCKAGE SYMPTOMS:**\n• Weak or no steam output\n• Irregular steam pattern\n• Milk residue visible at tip\n• Strange hissing sounds\n\n**🧽 IMMEDIATE CLEANING:**\n\n**Step 1: Safety First**\n• Turn OFF steam function\n• Allow wand to cool completely\n• Never clean a hot steam wand\n\n**Step 2: External Cleaning**\n• Wipe exterior with damp cloth\n• Remove visible milk residue\n• Check steam holes for blockages\n\n**Step 3: Deep Cleaning Process**\n• Fill container with steam wand cleaning solution\n• Submerge wand tip for 15-20 minutes\n• Use steam wand brush to scrub interior\n• Clear holes with cleaning pin or thin wire\n\n**Step 4: Descaling Treatment**\n• Run cleaning solution through steam system\n• Follow manufacturer's descaling procedure\n• Flush thoroughly with fresh water\n\n**🔧 CLEANING TOOLS:**\n• Steam wand cleaning brush\n• Cleaning solution (food-safe)\n• Thin cleaning pin or wire\n• Clean microfiber cloths\n\n**⏰ CLEANING SCHEDULE:**\n• **Daily:** Wipe exterior, purge steam\n• **Weekly:** Deep clean with solution\n• **Monthly:** Full descaling treatment\n\n**🚨 SEVERE BLOCKAGE:**\nIf blockage persists after cleaning:\n• Check internal steam passages\n• Inspect steam valve operation\n• May require professional descaling\n• Consider steam system component replacement\n\n**💡 PREVENTION TIPS:**\n• Purge steam wand after each use\n• Clean immediately after milk frothing\n• Use filtered water to reduce mineral buildup\n• Never use soap - only specialized cleaners\n\n**🆘 CALL TECHNICIAN IF:**\n• No improvement after thorough cleaning\n• Steam valve not responding\n• Unusual noises from steam system\n• Visible damage to wand or connections\n\n**Cleaning Supplies: Steam Cleaner (CM-SC-021) $18.99**",
    images: [
      '/assets/steam-wand-blockage.svg',
      '/assets/steam-wand-cleaning.svg'
    ],
    videos: []
  },

  "coffee tastes bitter": {
    text: "☕ **BITTER COFFEE TROUBLESHOOTING**\n\nBitter coffee usually indicates brewing chamber contamination or extraction issues. Let's fix this:\n\n**🔍 BITTER TASTE CAUSES:**\n• Coffee oil buildup in brewing chamber\n• Over-extraction (water too hot, grind too fine)\n• Old, rancid coffee oils\n• Dirty filter basket\n• Contaminated water system\n\n**🧽 CLEANING SOLUTION:**\n\n**Immediate Action - Deep Chamber Clean:**\n• Remove portafilter and filter basket\n• Insert cleaning tablet in group head\n• Run automated cleaning cycle\n• Scrub brewing chamber with group brush\n• Rinse thoroughly with fresh water\n\n**🌡️ BREWING PARAMETER CHECK:**\n• Water temperature: Should be 200-205°F\n• Grind setting: Try coarser setting\n• Brew time: Reduce if over 30 seconds\n• Coffee dose: Use proper ratio (1:15-1:17)\n\n**🔧 MAINTENANCE ACTIONS:**\n\n**Step 1: Filter System**\n• Replace water filter if overdue\n• Check water quality and taste\n• Flush system with fresh water\n\n**Step 2: Descaling**\n• Run complete descaling cycle\n• Use manufacturer-approved solution\n• Focus on brewing chamber cleaning\n\n**Step 3: Component Inspection**\n• Clean all removable parts\n• Replace worn gaskets or seals\n• Check for coffee oil stains\n\n**📅 CLEANING SCHEDULE:**\n• **Daily:** Rinse brewing chamber\n• **Weekly:** Deep clean with tablets\n• **Monthly:** Full descaling cycle\n• **Quarterly:** Replace water filter\n\n**🧪 WATER QUALITY:**\n• Use filtered or bottled water\n• Check TDS (Total Dissolved Solids)\n• Ideal range: 150-300 ppm\n• Replace filter every 3 months\n\n**☕ COFFEE FRESHNESS:**\n• Use beans roasted within 2-4 weeks\n• Store in airtight container\n• Grind just before brewing\n• Clean grinder regularly\n\n**✅ SUCCESS INDICATORS:**\n• Smooth, balanced flavor\n• No bitter aftertaste\n• Pleasant aroma\n• Consistent extraction\n\n**🛒 SUPPLIES NEEDED:**\n• Cleaning tablets (CM-CT-020) $24.99\n• Water filter (CM-WF-002) $12.99\n• Descaling solution (CM-DS-019) $16.99",
    images: [
      '/assets/brewing-chamber-cleaning.svg',
      '/assets/espresso-machine-cleaning.svg'
    ],
    videos: []
  },

  "grinder making noise": {
    text: "🔊 **GRINDER NOISE TROUBLESHOOTING**\n\nUnusual grinder sounds can indicate several issues. Let's diagnose and fix:\n\n**🎵 NOISE DIAGNOSIS:**\n\n**Normal Sounds:**\n• Steady grinding hum\n• Consistent motor operation\n• Brief startup noise\n\n**Problem Sounds:**\n• **Grinding/Scraping:** Foreign object or worn burrs\n• **High-pitched squealing:** Motor bearing issues\n• **Clicking/Rattling:** Loose components\n• **Intermittent grinding:** Electrical issues\n\n**🔧 IMMEDIATE INSPECTION:**\n\n**Step 1: Safety Check**\n• Turn OFF and unplug machine\n• Remove all coffee beans from hopper\n• Allow grinder to cool if recently used\n\n**Step 2: Visual Inspection**\n• Check for foreign objects in hopper\n• Inspect burrs for damage or wear\n• Look for loose mounting screws\n• Check motor coupling alignment\n\n**Step 3: Component Check**\n• Remove upper burr carrier\n• Inspect burr surfaces for chips or wear\n• Check for coffee chaff buildup\n• Verify proper burr gap setting\n\n**🛠️ COMMON FIXES:**\n\n**Foreign Object Removal:**\n• Clear any stones, metal, or debris\n• Clean burr chamber thoroughly\n• Check bean quality before grinding\n\n**Burr Maintenance:**\n• Clean with dry brush (never water)\n• Check alignment and gap settings\n• Replace if worn beyond 70% capacity\n\n**Motor Issues:**\n• Check electrical connections\n• Verify proper voltage supply\n• Listen for bearing wear sounds\n\n**📊 NOISE TROUBLESHOOTING CHART:**\n• **Loud grinding:** Check for stones in beans\n• **Squealing:** Motor bearings may need service\n• **Rattling:** Loose burr or mounting hardware\n• **No sound:** Electrical or motor failure\n\n**⏰ MAINTENANCE SCHEDULE:**\n• **Daily:** Remove coffee chaff\n• **Weekly:** Deep clean burr chamber\n• **Monthly:** Lubricate as specified\n• **12-18 months:** Replace burr sets\n\n**🚨 WHEN TO STOP:**\n• If grinding becomes increasingly loud\n• If metal grinding sounds occur\n• If motor struggles or overheats\n• If unusual vibration develops\n\n**💡 PREVENTION:**\n• Use only high-quality coffee beans\n• Inspect beans for foreign objects\n• Keep grinder clean and dry\n• Don't force grinder operation\n\n**🆘 CALL TECHNICIAN IF:**\n• Motor bearing replacement needed\n• Electrical issues suspected\n• Burr replacement required\n• Unusual vibration persists\n\n**Parts: Upper Burr Set (CM-UB-004) $34.99, Lower Burr Set (CM-LB-005) $34.99**",
    images: [
      '/assets/grinder-jam-clearing.svg',
      '/assets/coffee-grinder-operation.svg',
      '/assets/troubleshooting-guide.svg'
    ],
    videos: []
  }
};

export const demoMachineOptions = [
  {
    machineNumber: 'CM-2000-001',
    label: 'Kitchen Station A - Coffee Machine CM-2000'
  },
  {
    machineNumber: 'CM-2000-002',
    label: 'Kitchen Station B - Coffee Machine CM-2000'
  },
  {
    machineNumber: 'CM-2000-003',
    label: 'Kitchen Station C - Coffee Machine CM-2000'
  },
  {
    machineNumber: 'CM-2000-004',
    label: 'Break Room - Coffee Machine CM-2000'
  },
  {
    machineNumber: 'CM-2000-005',
    label: 'Conference Room - Coffee Machine CM-2000'
  }
];

export const demoConfiguration = {
  useDemo: true,
  demoTitle: "Coffee Machine Maintenance System",
  demoDescription: "Professional maintenance system for commercial coffee machines",
  supportedMachines: ["Coffee Machine CM-2000"],
  maintenanceIntervals: {
    daily: "Daily cleaning and inspection",
    weekly: "Deep cleaning and descaling",
    monthly: "Comprehensive inspection and calibration",
    quarterly: "Parts replacement and system updates"
  }
};

export default {
  demoWorkOrders,
  demoPastLogs,
  demoChatResponses,
  demoMachineOptions,
  demoConfiguration
};
