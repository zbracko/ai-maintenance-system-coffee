// src/data/coffeeManualSections.ts

// Import any images or assets used in the manual content
import Picture2 from '../assets/Picture2.png';
import Picture3 from '../assets/Picture3.png';
import Picture4 from '../assets/Picture4.png';
import Picture5 from '../assets/Picture5.png';

// ---------------------
// Interfaces for Coffee Machine Manual Sections
// ---------------------
export interface CoffeeManualSection {
  id: string;
  title: string;
  content: string[];
  images?: string[];
  videos?: string[];
}

export interface CoffeePart {
  name: string;
  partNumber: string;
  description: string;
  category: string;
  replacementInterval: string;
  price: string;
}

// ---------------------
// Coffee Machine Manual Sections Data
// ---------------------
export const coffeeManualSections: CoffeeManualSection[] = [
  {
    id: 'overview',
    title: 'Coffee Machine Overview',
    content: [
      'Professional Commercial Coffee Machine - Model CM-2000',
      '',
      'SPECIFICATIONS:',
      '• Capacity: 12-cup brewing system',
      '• Power: 1800W, 120V/60Hz',
      '• Water Tank: 2.5L removable reservoir',
      '• Brew Temperature: 195°F - 205°F (90°C - 96°C)',
      '• Grinder: Built-in burr grinder with 15 settings',
      '• Display: LCD with touch controls',
      '• Dimensions: 18" W x 14" D x 16" H',
      '',
      'KEY COMPONENTS:',
      '• Water reservoir and filtration system',
      '• Heating element and temperature control',
      '• Grinder assembly with burr mechanism',
      '• Brewing chamber and portafilter',
      '• Steam wand for milk frothing',
      '• Control panel with programmable settings',
      '• Drip tray and water collection system'
    ],
    images: [Picture2],
    videos: ['demo_video_placeholder_overview.mp4']
  },
  {
    id: 'daily-maintenance',
    title: 'Daily Maintenance Procedures',
    content: [
      'DAILY CLEANING CHECKLIST:',
      '',
      '![Daily Cleaning Overview](/assets/espresso-machine-cleaning.svg)',
      '',
      '1. WATER SYSTEM (5 minutes):',
      '   • Empty and refill water reservoir with fresh water',
      '   • Check water filter indicator - replace if needed',
      '   • Wipe down exterior of water tank',
      '',
      '2. GRINDER MAINTENANCE (3 minutes):',
      '   • Empty coffee grounds from collection chamber',
      '   • Wipe grinder burrs with dry cloth',
      '   • Check for coffee oil buildup on burr surfaces',
      '',
      '![Grinder Operation](/assets/coffee-grinder-operation.svg)',
      '',
      '3. BREWING SYSTEM (7 minutes):',
      '   • Remove and clean portafilter thoroughly',
      '   • Run water-only brew cycle to flush system',
      '   • Clean brewing chamber with damp cloth',
      '   • Inspect brewing temperature gauge',
      '',
      '4. STEAM WAND (4 minutes):',
      '   • Purge steam wand after each use',
      '   • Clean milk residue from wand surface',
      '   • Check steam pressure gauge readings',
      '',
      '![Steam Wand Cleaning](/assets/steam-wand-cleaning.svg)',
      '',
      '5. DRIP TRAY & EXTERIOR (3 minutes):',
      '   • Empty and wash drip tray',
      '   • Wipe down control panel and exterior',
      '   • Check power cord for damage'
    ],
    images: [Picture3, Picture4],
    videos: ['demo_video_placeholder_daily_maintenance.mp4']
  },
  {
    id: 'weekly-maintenance',
    title: 'Weekly Deep Cleaning',
    content: [
      'WEEKLY MAINTENANCE SCHEDULE:',
      '',
      '1. DESCALING PROCEDURE (30 minutes):',
      '   • Mix descaling solution (1:10 ratio with water)',
      '   • Fill water reservoir with descaling solution',
      '   • Run descaling cycle on control panel',
      '   • Allow solution to sit for 15 minutes',
      '   • Flush system with fresh water 3 times',
      '   • Test brew temperature accuracy',
      '',
      '2. GRINDER DEEP CLEAN (20 minutes):',
      '   • Remove upper burr assembly',
      '   • Clean burrs with specialized grinder brush',
      '   • Vacuum coffee dust from grinder chamber',
      '   • Lubricate burr adjustment mechanism',
      '   • Calibrate grind settings',
      '',
      '3. INTERNAL COMPONENT CHECK (15 minutes):',
      '   • Inspect heating element for mineral buildup',
      '   • Check pump pressure settings',
      '   • Test temperature sensor accuracy',
      '   • Verify water flow rates',
      '   • Clean internal water lines',
      '',
      '4. PREVENTIVE INSPECTIONS:',
      '   • Check seal integrity on water reservoir',
      '   • Inspect power connections',
      '   • Test safety shut-off mechanisms',
      '   • Verify grinder motor operation',
      '   • Clean and calibrate pressure gauges'
    ],
    images: [Picture5],
    videos: ['demo_video_placeholder_weekly_maintenance.mp4']
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Guide',
    content: [
      'COMMON ISSUES AND SOLUTIONS:',
      '',
      '![Troubleshooting Guide](/assets/troubleshooting-guide.svg)',
      '',
      '1. MACHINE WON\'T START:',
      '   • Check power connection and outlet',
      '   • Verify water reservoir is properly seated',
      '   • Ensure drip tray is fully inserted',
      '   • Check for error codes on display',
      '   • Inspect internal fuse (requires technician)',
      '',
      '2. WEAK COFFEE OR NO BREWING:',
      '   • Check grind setting - may be too coarse',
      '   • Verify water level in reservoir',
      '   • Clean clogged brew chamber',
      '   • Descale system if brew time is slow',
      '   • Replace water filter if overdue',
      '',
      '3. OVERHEATING OR TEMPERATURE ISSUES:',
      '   • Check heating element for mineral buildup',
      '   • Verify temperature sensor calibration',
      '   • Clean air vents for proper ventilation',
      '   • Check thermal fuse integrity',
      '   • Inspect thermostat operation',
      '',
      '4. GRINDER PROBLEMS:',
      '   • Clear coffee jam from grinder chamber',
      '   • Check burr alignment and wear',
      '   • Lubricate grinder motor bearings',
      '   • Calibrate grind size settings',
      '   • Replace worn burr sets',
      '',
      '5. STEAM WAND ISSUES:',
      '   • Clear milk blockage from steam holes',
      '   • Check steam pressure valve operation',
      '   • Inspect steam wand seals for leaks',
      '   • Descale steam system lines',
      '   • Replace faulty pressure relief valve'
    ],
    images: [Picture2, Picture3],
    videos: ['demo_video_placeholder_troubleshooting.mp4']
  },
  {
    id: 'filter-replacement',
    title: 'Water Filter Replacement',
    content: [
      'WATER FILTER REPLACEMENT PROCEDURE:',
      '',
      '![Water Filter Replacement](/assets/water-filter-replacement.svg)',
      '',
      'REPLACEMENT SCHEDULE:',
      '• Every 3 months under normal use',
      '• Every 1000 brewing cycles',
      '• When filter indicator light turns red',
      '• If water taste changes noticeably',
      '',
      'STEP-BY-STEP REPLACEMENT:',
      '',
      '1. PREPARATION (2 minutes):',
      '   • Turn off machine and unplug power cord',
      '   • Allow machine to cool completely',
      '   • Remove water reservoir from machine',
      '   • Empty any remaining water',
      '',
      '2. FILTER REMOVAL (3 minutes):',
      '   • Locate filter housing at bottom of reservoir',
      '   • Turn filter housing counterclockwise to unlock',
      '   • Carefully lift out old filter cartridge',
      '   • Dispose of old filter properly',
      '',
      '3. INSTALLATION (3 minutes):',
      '   • Remove new filter from packaging',
      '   • Soak new filter in cold water for 5 minutes',
      '   • Insert new filter into housing',
      '   • Turn housing clockwise until firmly seated',
      '',
      '4. SYSTEM RESET (2 minutes):',
      '   • Reinstall water reservoir',
      '   • Fill with fresh cold water',
      '   • Plug in and power on machine',
      '   • Press and hold filter reset button for 3 seconds',
      '   • Run 2 brew cycles with water only to flush system',
      '',
      'FILTER SPECIFICATIONS:',
      '• Part Number: CM-WF-002',
      '• Filtration: Activated carbon with ion exchange',
      '• Capacity: 60 gallons or 1000 brew cycles',
      '• Removes: Chlorine, sediment, odors, bad taste',
      '• Compatible with: All CM-2000 series machines'
    ],
    images: [Picture4],
    videos: ['demo_video_placeholder_filter_replacement.mp4']
  },
  {
    id: 'safety-procedures',
    title: 'Safety Procedures',
    content: [
      'SAFETY GUIDELINES AND PROCEDURES:',
      '',
      '1. ELECTRICAL SAFETY:',
      '   • Always disconnect power before maintenance',
      '   • Use only grounded outlets (GFCI recommended)',
      '   • Keep electrical components dry',
      '   • Inspect cords regularly for damage',
      '   • Never operate with wet hands',
      '',
      '2. HOT SURFACE PRECAUTIONS:',
      '   • Allow machine to cool before cleaning',
      '   • Use protective gloves when handling hot parts',
      '   • Steam wand reaches 300°F - handle with care',
      '   • Keep hands away from brewing chamber during operation',
      '   • Use caution when removing hot portafilter',
      '',
      '3. CHEMICAL SAFETY (Descaling):',
      '   • Use only manufacturer-approved descaling solutions',
      '   • Wear protective eyewear and gloves',
      '   • Ensure adequate ventilation during descaling',
      '   • Store chemicals away from food areas',
      '   • Follow material safety data sheets (MSDS)',
      '',
      '4. EMERGENCY PROCEDURES:',
      '   • Emergency stop: Press red power button',
      '   • Steam burn: Apply cold water immediately',
      '   • Electrical shock: Disconnect power source',
      '   • Chemical contact: Flush with water for 15 minutes',
      '   • Fire: Use Class C fire extinguisher only',
      '',
      '5. PERSONAL PROTECTIVE EQUIPMENT:',
      '   • Safety glasses during grinder maintenance',
      '   • Heat-resistant gloves for hot components',
      '   • Non-slip shoes in wet areas',
      '   • Apron to protect from splashes',
      '   • First aid kit readily available'
    ],
    images: [Picture4, Picture5],
    videos: ['demo_video_placeholder_safety.mp4']
  }
];

// ---------------------
// Coffee Machine Parts List
// ---------------------
export const coffeePartsListFromManual: CoffeePart[] = [
  // Water System Components
  {
    name: 'Water Reservoir',
    partNumber: 'CM-WR-001',
    description: '2.5L removable water tank with level indicator',
    category: 'Water System',
    replacementInterval: '24 months',
    price: '$45.99'
  },
  {
    name: 'Water Filter Cartridge',
    partNumber: 'CM-WF-002',
    description: 'Activated carbon filter for water purification',
    category: 'Water System',
    replacementInterval: '3 months',
    price: '$12.99'
  },
  {
    name: 'Water Pump Assembly',
    partNumber: 'CM-WP-003',
    description: 'High-pressure pump for brewing system',
    category: 'Water System',
    replacementInterval: '18 months',
    price: '$89.99'
  },
  
  // Grinder Components
  {
    name: 'Upper Burr Set',
    partNumber: 'CM-UB-004',
    description: 'Hardened steel upper grinding burr',
    category: 'Grinder',
    replacementInterval: '12 months',
    price: '$34.99'
  },
  {
    name: 'Lower Burr Set',
    partNumber: 'CM-LB-005',
    description: 'Hardened steel lower grinding burr',
    category: 'Grinder',
    replacementInterval: '12 months',
    price: '$34.99'
  },
  {
    name: 'Grinder Motor',
    partNumber: 'CM-GM-006',
    description: '120V DC motor for burr grinder operation',
    category: 'Grinder',
    replacementInterval: '24 months',
    price: '$125.99'
  },
  
  // Heating Elements
  {
    name: 'Primary Heating Element',
    partNumber: 'CM-HE-007',
    description: '1800W heating element for water heating',
    category: 'Heating System',
    replacementInterval: '18 months',
    price: '$67.99'
  },
  {
    name: 'Temperature Sensor',
    partNumber: 'CM-TS-008',
    description: 'Digital temperature probe for brew control',
    category: 'Heating System',
    replacementInterval: '12 months',
    price: '$23.99'
  },
  {
    name: 'Thermostat Assembly',
    partNumber: 'CM-TA-009',
    description: 'Safety thermostat with automatic reset',
    category: 'Heating System',
    replacementInterval: '24 months',
    price: '$31.99'
  },
  
  // Brewing Components
  {
    name: 'Portafilter Handle',
    partNumber: 'CM-PH-010',
    description: 'Professional portafilter with ergonomic handle',
    category: 'Brewing System',
    replacementInterval: '24 months',
    price: '$42.99'
  },
  {
    name: 'Brewing Chamber Gasket',
    partNumber: 'CM-BG-011',
    description: 'Food-grade silicone brewing chamber seal',
    category: 'Brewing System',
    replacementInterval: '6 months',
    price: '$8.99'
  },
  {
    name: 'Pressure Gauge',
    partNumber: 'CM-PG-012',
    description: 'Analog pressure gauge for brew monitoring',
    category: 'Brewing System',
    replacementInterval: '18 months',
    price: '$28.99'
  },
  
  // Steam System
  {
    name: 'Steam Wand Assembly',
    partNumber: 'CM-SW-013',
    description: 'Articulating steam wand with safety valve',
    category: 'Steam System',
    replacementInterval: '12 months',
    price: '$56.99'
  },
  {
    name: 'Steam Valve Seal Kit',
    partNumber: 'CM-SVS-014',
    description: 'Complete seal kit for steam valve assembly',
    category: 'Steam System',
    replacementInterval: '6 months',
    price: '$14.99'
  },
  {
    name: 'Pressure Relief Valve',
    partNumber: 'CM-PRV-015',
    description: 'Safety pressure relief valve for steam system',
    category: 'Steam System',
    replacementInterval: '18 months',
    price: '$38.99'
  },
  
  // Electrical Components
  {
    name: 'Control Board PCB',
    partNumber: 'CM-CB-016',
    description: 'Main control board with LCD interface',
    category: 'Electronics',
    replacementInterval: '36 months',
    price: '$156.99'
  },
  {
    name: 'Power Cord Assembly',
    partNumber: 'CM-PC-017',
    description: 'Heavy-duty power cord with GFCI protection',
    category: 'Electronics',
    replacementInterval: '24 months',
    price: '$19.99'
  },
  {
    name: 'Thermal Fuse',
    partNumber: 'CM-TF-018',
    description: 'Safety thermal fuse 240°F cutoff',
    category: 'Electronics',
    replacementInterval: '12 months',
    price: '$6.99'
  },
  
  // Maintenance Supplies
  {
    name: 'Descaling Solution',
    partNumber: 'CM-DS-019',
    description: 'Biodegradable descaling solution - 32oz bottle',
    category: 'Maintenance',
    replacementInterval: 'As needed',
    price: '$16.99'
  },
  {
    name: 'Grinder Cleaning Tablets',
    partNumber: 'CM-GCT-020',
    description: 'Grinder cleaning tablets - pack of 10',
    category: 'Maintenance',
    replacementInterval: 'As needed',
    price: '$24.99'
  },
  {
    name: 'Cleaning Brush Set',
    partNumber: 'CM-CBS-021',
    description: 'Specialized brush set for coffee machine cleaning',
    category: 'Maintenance',
    replacementInterval: '12 months',
    price: '$18.99'
  }
];

// Export default sections for backward compatibility
export default coffeeManualSections;
