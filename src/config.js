// src/config.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://c5pnv814u2.execute-api.us-west-1.amazonaws.com';
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://main.d2ovr9sbd9u6pc.amplifyapp.com';
export const S3_BUCKET_NAME = process.env.REACT_APP_S3_BUCKET || 'coffee-machine-maintenance-demo';
export const S3_REGION = process.env.REACT_APP_S3_REGION || 'us-west-1';
export const S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;

// Development vs Production configuration
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isDemo = process.env.REACT_APP_DEMO_MODE === 'true';

export const config = {
  apiBaseUrl: API_BASE_URL,
  frontendUrl: FRONTEND_URL,
  s3BucketName: S3_BUCKET_NAME,
  s3Region: S3_REGION,
  s3BaseUrl: S3_BASE_URL,
  isDevelopment,
  isDemo,
  cors: {
    origin: isDevelopment ? 'http://localhost:5173' : FRONTEND_URL
  }
};
