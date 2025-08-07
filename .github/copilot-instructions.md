# AI Maintenance System - Copilot Instructions

## Architecture Overview

This is a React 18 + TypeScript coffee machine maintenance system with dual-mode operation: **demo mode** (default) and **production mode** with AWS backend integration.

### Core Architecture Principles
- **Demo-First Design**: All features work standalone via `demoConfig.isDemo = true`
- **Dual Data Sources**: Components check `demoConfig.isDemo` to switch between mock data and real APIs
- **State-Heavy Admin Panel**: Complex multi-tab interface in `AdminPanel.tsx` managing resources, machines, QR codes, and safety protocols
- **Material-UI Design System**: Glassmorphism aesthetic with rgba backgrounds and backdrop-filter blur effects

## Key Development Patterns

### Demo Mode Pattern
Every component that uses external data follows this pattern:
```typescript
if (demoConfig.isDemo) {
  // Use predefined demo data from /src/data/ or inline mock data
  setUsers(demoUsers);
} else {
  // Real API call for production
  const response = await fetch(`${API_BASE_URL}/api/users`);
}
```

### State Management Architecture
- No global state management (Redux/Zustand) - uses React useState with complex local state
- `AdminPanel.tsx` contains 40+ state variables for different tabs and features
- Context only used for authentication (`AuthContext.tsx`)

### Component Interface Patterns
Define comprehensive TypeScript interfaces for all data structures:
```typescript
interface ResourceItem {
  type: 'directory' | 'file';
  name?: string;
  path?: string;
  prefix?: string;
  children?: ResourceItem[];
}
```

## Critical Files & Workflows

### Essential Configuration
- `src/config/demoConfig.js` - Central demo configuration, feature flags, and mock data paths
- `src/services/configService.ts` - Runtime config service for API keys with multiple fallback sources
- `vite.config.ts` - Polyfills for Buffer/process, SRT assets, dev server config

### Core Components
- `src/components/AdminPanel/AdminPanel.tsx` - Complex 5-tab admin interface (4300+ lines)
- `src/components/ChatInterface/ChatInterface.tsx` - AI chat with safety checks, QR scanning, work orders
- `src/context/AuthContext.tsx` - AWS Cognito authentication wrapper

### Data Layer
- `src/data/` - All demo data sources (demoData.js, coffeeManualSections.ts, manualSections.ts)
- Safety procedures, machine configurations, and parts catalogs defined as TypeScript constants

## Build & Development

### Essential Commands
```bash
npm run dev      # Vite dev server on localhost:5173
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Development Environment
- **Polyfills Required**: Window globals for Buffer, process, and global are set in `main.tsx`
- **Asset Handling**: SVG/video files in `/public/assets/` and `/src/assets/` directories
- **Demo Mode**: Automatically enabled unless explicitly configured otherwise

### Deployment Pipeline
- **GitHub Actions**: `.github/workflows/deploy.yml` builds and deploys to AWS S3 + CloudFront
- **Amplify**: `amplify.yml` handles build with environment variable injection
- **Environment Variables**: Runtime configuration through multiple sources (window.ENV_CONFIG, API endpoints, etc.)

## Project-Specific Conventions

### Safety System Architecture
The application has a sophisticated safety protocol system:
- **General Safety Checks**: Basic PPE and lockout/tagout procedures
- **Grinder-Specific Safety**: Equipment-specific safety protocols
- **Custom Safety Sections**: Configurable safety procedures for different scenarios
- Safety checks are embedded throughout the UI with image references and validation workflows

### QR Code Integration
Dual-type QR code system:
- **Machine QR Codes**: Format `coffee-machine://{model}/{number}?location={location}`
- **Safety QR Codes**: Format `coffee-safety://{type}/{step}?location={location}`

### Resource Management Pattern
Hierarchical resource structure with file/directory trees, inline editing, and attachment systems for manual content management.

### State Synchronization
Large state objects in AdminPanel use spread operators for partial updates:
```typescript
setQrCodes([...qrCodes, newQr]);
setParagraphAttachments(prev => ({ ...prev, [index]: [...oldList, newAtt] }));
```

## Testing & Debugging

### Demo Data Validation
When adding new features, always provide demo data equivalents in `/src/data/` files and ensure the demo mode branch works independently.

### Error Patterns
- **Image Loading**: All images have onError handlers that hide broken image elements
- **API Fallbacks**: Missing API responses default to empty arrays/objects rather than throwing errors
- **TypeScript Nullability**: Heavy use of optional chaining (`?.`) and nullish coalescing (`??`)

### Performance Considerations
- Large component files (AdminPanel.tsx is 4300+ lines) - consider splitting when adding major features
- Inline demo data generation in useEffect hooks - avoid recreating on every render
- Heavy use of Material-UI components - be aware of bundle size impact

## Integration Points

### AWS Services (Production Mode)
- **Cognito**: User authentication with hard-coded pool IDs in AuthContext
- **API Gateway**: RESTful endpoints for resources, work orders, and file management
- **S3**: File storage with presigned URLs for media uploads

### External Libraries
- **html5-qrcode**: QR code scanning functionality
- **jsPDF**: PDF generation for reports and documentation
- **react-i18next**: Internationalization with translation keys
- **qrcode.react**: QR code generation
- **react-slick**: Carousel components for media galleries

Remember: This codebase prioritizes feature completeness and demo functionality over architectural purity. When extending features, maintain the demo/production mode duality and comprehensive TypeScript typing.
