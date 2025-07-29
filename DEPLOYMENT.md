# AWS Deployment Guide

This guide explains how to deploy the AI Maintenance System to AWS using GitHub Actions.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** with this code
3. **AWS Services Setup**:
   - S3 Bucket for static hosting
   - CloudFront Distribution (optional but recommended)
   - AWS Cognito User Pool
   - API Gateway + Lambda (for backend)

## AWS Setup

### 1. Create S3 Bucket for Static Hosting

```bash
# Create bucket (replace with your bucket name)
aws s3 mb s3://your-ai-maintenance-bucket

# Enable static website hosting
aws s3 website s3://your-ai-maintenance-bucket \
  --index-document index.html \
  --error-document index.html
```

### 2. Create CloudFront Distribution (Optional)

1. Go to AWS CloudFront Console
2. Create a new distribution
3. Set origin to your S3 bucket
4. Configure default root object as `index.html`
5. Set error pages to redirect to `index.html` for SPA routing

### 3. Setup AWS Cognito

1. Create a User Pool in AWS Cognito
2. Configure app client settings
3. Note down the User Pool ID and App Client ID

### 4. Setup IAM User for GitHub Actions

Create an IAM user with the following policies:
- S3 access to your bucket
- CloudFront invalidation permissions

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-ai-maintenance-bucket",
                "arn:aws:s3:::your-ai-maintenance-bucket/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        }
    ]
}
```

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `AWS_ACCESS_KEY_ID`: IAM user access key
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key
- `AWS_S3_BUCKET`: Your S3 bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (if using)
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_USER_POOL_ID`: Cognito User Pool ID
- `AWS_USER_POOL_WEB_CLIENT_ID`: Cognito App Client ID
- `AWS_API_URL`: API Gateway URL (when backend is deployed)

## Manual Deployment

If you prefer to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-ai-maintenance-bucket --delete
```

3. Invalidate CloudFront (if using):
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Environment Variables

Create a `.env` file for local development:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
REACT_APP_DEMO_MODE=true
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your S3 bucket has proper CORS configuration
2. **Routing Issues**: Make sure error pages redirect to `index.html`
3. **Authentication Issues**: Verify Cognito configuration and environment variables
4. **Build Failures**: Check that all dependencies are properly installed

### S3 CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## Monitoring

- Use AWS CloudWatch for monitoring
- Enable S3 access logging
- Monitor CloudFront metrics
- Set up alerts for deployment failures
