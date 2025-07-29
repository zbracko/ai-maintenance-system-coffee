/**
 * Runtime Configuration Service
 * 
 * This service attempts to fetch configuration at runtime,
 * which can be useful when build-time environment variables aren't available.
 */

interface RuntimeConfig {
  VITE_OPENAI_API_KEY?: string;
  // Add other config as needed
}

class ConfigService {
  private static instance: ConfigService;
  private config: RuntimeConfig | null = null;
  private configPromise: Promise<RuntimeConfig> | null = null;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async getConfig(): Promise<RuntimeConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.configPromise) {
      return this.configPromise;
    }

    this.configPromise = this.fetchConfig();
    return this.configPromise;
  }

  private async fetchConfig(): Promise<RuntimeConfig> {
    console.log('🔧 Attempting to fetch runtime configuration...');

    // Try multiple sources for configuration
    const config: RuntimeConfig = {};

    // 1. Try window environment variables (injected by Amplify)
    if (typeof window !== 'undefined') {
      // Check ENV_CONFIG object
      if ((window as any).ENV_CONFIG) {
        config.VITE_OPENAI_API_KEY = (window as any).ENV_CONFIG.VITE_OPENAI_API_KEY;
        console.log('✅ Found config in window.ENV_CONFIG');
      }
      
      // Check direct window properties
      if (!config.VITE_OPENAI_API_KEY && (window as any).VITE_OPENAI_API_KEY) {
        config.VITE_OPENAI_API_KEY = (window as any).VITE_OPENAI_API_KEY;
        console.log('✅ Found config in window.VITE_OPENAI_API_KEY');
      }

      // Check legacy React app variables
      if (!config.VITE_OPENAI_API_KEY && (window as any).REACT_APP_OPENAI_API_KEY) {
        config.VITE_OPENAI_API_KEY = (window as any).REACT_APP_OPENAI_API_KEY;
        console.log('✅ Found config in window.REACT_APP_OPENAI_API_KEY');
      }
    }

    // 2. Try fetching from a configuration endpoint (if available)
    if (!config.VITE_OPENAI_API_KEY) {
      try {
        console.log('🌐 Attempting to fetch config from /api/config...');
        const response = await fetch('/api/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const remoteConfig = await response.json();
          Object.assign(config, remoteConfig);
          console.log('✅ Fetched configuration from API endpoint');
        } else {
          console.log('⚠️ Config API endpoint not available:', response.status);
        }
      } catch (error) {
        console.log('⚠️ Failed to fetch config from API:', error);
      }
    }

    // 3. For development: check if there's a local config file
    if (!config.VITE_OPENAI_API_KEY && import.meta.env.DEV) {
      console.log('🔧 Development mode: checking for local configuration...');
      // In development, you could load from a local config file
    }

    this.config = config;
    console.log('📋 Final runtime configuration:', {
      hasOpenAIKey: !!config.VITE_OPENAI_API_KEY,
      keyLength: config.VITE_OPENAI_API_KEY?.length || 0,
    });

    return config;
  }

  async getOpenAIApiKey(): Promise<string> {
    const config = await this.getConfig();
    return config.VITE_OPENAI_API_KEY || '';
  }
}

export const configService = ConfigService.getInstance();
export default configService;
