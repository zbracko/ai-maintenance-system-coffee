# AI Maintenance System

A modern, intelligent maintenance management system built with React, TypeScript, and AWS services. This system provides comprehensive tools for equipment maintenance, work order management, and intelligent assistance through AI-powered features.

## 🚀 Live Demo

Visit the live application: [https://main.d2ovr9sbd9u6pc.amplifyapp.com](https://main.d2ovr9sbd9u6pc.amplifyapp.com)

## Features

- 🔧 **Equipment Management**: Track and manage industrial equipment and machinery
- 📋 **Work Orders**: Create, assign, and monitor maintenance work orders
- 🤖 **AI Assistant**: Intelligent chat interface for maintenance guidance
- 📱 **QR Code Scanning**: Quick equipment identification and access
- 📚 **Digital Manuals**: Access equipment manuals and documentation
- 🔐 **Secure Authentication**: AWS Cognito-based user management
- 🌍 **Multi-language Support**: International localization support
- 📊 **Maintenance Logs**: Comprehensive tracking and reporting

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Material-UI (MUI)
- **Authentication**: AWS Cognito
- **Deployment**: AWS (via GitHub Actions)
- **Styling**: Emotion, CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account (for deployment)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zbracko/ai-maintenance-system-coffee.git
cd ai-maintenance-system-coffee
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Mode

To run in demo mode with sample data:
```bash
npm run dev
```
The application will automatically run in demo mode when the `REACT_APP_DEMO_MODE` environment variable is set.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

This project is configured for deployment on AWS using GitHub Actions. The deployment process includes:

1. **Frontend**: Static website hosting on AWS S3 + CloudFront
2. **Backend**: Serverless functions using AWS Lambda
3. **Authentication**: AWS Cognito User Pools
4. **CI/CD**: Automated deployment via GitHub Actions

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_AWS_REGION=your-aws-region
REACT_APP_USER_POOL_ID=your-cognito-user-pool-id
REACT_APP_USER_POOL_WEB_CLIENT_ID=your-cognito-app-client-id
REACT_APP_API_URL=your-api-gateway-url
REACT_APP_DEMO_MODE=false
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── context/            # React context providers
├── services/           # API and external services
├── assets/             # Static assets
├── config/             # Configuration files
└── data/               # Sample data and constants
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
