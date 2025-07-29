# Setting Up OpenAI API Key in AWS Amplify

## Method 1: AWS Amplify Console (Recommended)

### Step-by-Step Instructions:

1. **Access Amplify Console**
   - Go to https://console.aws.amazon.com/amplify/
   - Sign in to your AWS account
   - Select your app: `ai-maintenance-system-coffee`

2. **Navigate to Environment Variables**
   - In the left sidebar, click **App settings**
   - Click **Environment variables**

3. **Add the OpenAI API Key**
   - Click **Manage variables**
   - Click **Add variable**
   - Enter:
     - **Variable name**: `VITE_OPENAI_API_KEY`
     - **Value**: `sk-your-actual-openai-api-key-here`
   - Click **Save**

4. **Redeploy the Application**
   - Go back to the main app dashboard
   - Click on the **main** branch
   - Click **Redeploy this version**
   - Wait for deployment to complete

## Method 2: AWS CLI

If you have AWS CLI configured:

```bash
# Set environment variable for your Amplify app
aws amplify put-backend-environment \
  --app-id d14n5e2r6l7wau \
  --environment-name main \
  --deployment-artifacts deployment-artifacts \
  --stack-name amplify-aimaintenancesystemcoffe-main \
  --environment-variables VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Trigger a new deployment
aws amplify start-job \
  --app-id d14n5e2r6l7wau \
  --branch-name main \
  --job-type RELEASE
```

## Method 3: Environment Variable in amplify.yml (Not Recommended for API Keys)

**⚠️ WARNING: Never put API keys directly in amplify.yml as it's version controlled**

## Getting Your OpenAI API Key

1. **Sign up/Login to OpenAI**
   - Go to https://platform.openai.com/
   - Create an account or sign in

2. **Generate API Key**
   - Click on your profile (top right)
   - Select **View API keys**
   - Click **Create new secret key**
   - Copy the key (starts with `sk-...`)
   - **IMPORTANT**: Store it securely - you won't see it again

3. **Set Usage Limits (Recommended)**
   - Go to **Settings** → **Billing**
   - Set monthly usage limits to control costs
   - Start with a low limit like $5-10 for testing

## Verification

After setting up the environment variable and redeploying:

1. **Check the Console Logs**
   - Open your deployed app
   - Press F12 to open developer tools
   - Look for these logs:
     ```
     🔑 Using build-time VITE_OPENAI_API_KEY
     🤖 Using OpenAI for contextual response...
     ✅ OpenAI response received successfully
     ```

2. **Test the Chat Interface**
   - Try asking a maintenance question
   - You should get AI-powered responses instead of demo responses

## Troubleshooting

### Issue: Still seeing "No valid API key found"
- **Solution**: Verify the variable name is exactly `VITE_OPENAI_API_KEY`
- **Solution**: Redeploy the application after adding the variable
- **Solution**: Check that the API key starts with `sk-` and is valid

### Issue: API key is showing as empty string
- **Solution**: Make sure you didn't accidentally add spaces
- **Solution**: Regenerate the API key from OpenAI dashboard

### Issue: Getting API errors
- **Solution**: Check your OpenAI account has credits/billing set up
- **Solution**: Verify API key hasn't expired
- **Solution**: Check rate limits in OpenAI dashboard

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Set up billing alerts in OpenAI dashboard**
4. **Regenerate API keys periodically**
5. **Monitor usage in OpenAI dashboard**
6. **Use least-privilege access (API keys have different scopes)**

## Cost Management

- **Start Small**: Set low usage limits initially
- **Monitor Usage**: Check OpenAI dashboard regularly
- **Set Alerts**: Configure billing alerts
- **Optimize Prompts**: Shorter prompts = lower costs
- **Cache Responses**: Consider caching for repeated queries

## Next Steps

Once the API key is configured:
1. Test the system thoroughly
2. Monitor costs and usage
3. Consider implementing response caching
4. Add error handling for API failures
5. Set up monitoring and logging
