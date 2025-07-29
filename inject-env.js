#!/usr/bin/env node

/**
 * Script to inject environment variables into the built HTML file
 * This is more reliable than using sed with complex string replacements
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, 'dist', 'index.html');

console.log('🔧 Injecting environment variables into HTML...');

// Check if the HTML file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error('❌ HTML file not found at:', htmlFilePath);
  process.exit(1);
}

// Read the HTML file
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Environment variables to inject
const envVars = {
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
  // Add other environment variables as needed
};

console.log('📋 Environment variables to inject:');
Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  console.log(`   - ${key}: ${value ? '✅ Set (' + value.length + ' chars)' : '❌ Empty'}`);
});

// Replace placeholders with actual values
Object.keys(envVars).forEach(key => {
  const placeholder = `%%${key}%%`;
  const value = envVars[key];
  
  if (htmlContent.includes(placeholder)) {
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    console.log(`✅ Replaced ${placeholder} with ${value ? 'actual value' : 'empty string'}`);
  } else {
    console.log(`⚠️ Placeholder ${placeholder} not found in HTML`);
  }
});

// Write the updated HTML file
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

console.log('✅ Environment variable injection completed!');

// Verify the injection by checking the final content
if (htmlContent.includes('VITE_OPENAI_API_KEY')) {
  const match = htmlContent.match(/VITE_OPENAI_API_KEY['"]\s*:\s*['"]([^'"]*)['"]/);
  if (match) {
    const injectedValue = match[1];
    console.log(`🔍 Verification: VITE_OPENAI_API_KEY = "${injectedValue.length > 0 ? '[REDACTED]' : 'EMPTY'}" (${injectedValue.length} chars)`);
  }
}
