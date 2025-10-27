# Amazon S3 Image Upload Integration

This project uses Amazon S3 for storing question images uploaded through the admin interface.

## Setup Instructions

### 1. AWS Account Setup

1. **Create an AWS Account** (if you don't have one)
   - Visit [https://aws.amazon.com/](https://aws.amazon.com/)
   - Sign up for an account

2. **Create an S3 Bucket**
   - Go to the AWS Console → S3
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `studybuddy-images`)
   - Select your preferred region (e.g., `us-east-1`)
   - **Important**: Under "Block Public Access settings for this bucket"
     - Uncheck "Block all public access" (required for public image URLs)
     - Acknowledge the warning
   - Create the bucket

3. **Configure Bucket Policy for Public Read Access**
   - Select your bucket → Permissions tab → Bucket Policy
   - Add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. **Configure CORS**
   - Select your bucket → Permissions tab → CORS configuration
   - Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 2. Create IAM User for Programmatic Access

1. **Create IAM User**
   - Go to AWS Console → IAM → Users → Add user
   - Username: `studybuddy-s3-uploader`
   - Access type: ✅ Programmatic access
   - Click "Next: Permissions"

2. **Attach S3 Policy**
   - Choose "Attach existing policies directly"
   - Search for and select `AmazonS3FullAccess` (or create a custom policy with limited permissions)
   - Click "Next: Tags" → "Next: Review" → "Create user"

3. **Save Credentials**
   - **Important**: Copy the Access Key ID and Secret Access Key
   - You won't be able to see the secret key again!

### 3. Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your AWS credentials:**
   ```env
   # AWS S3 Configuration
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id-here
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
   NEXT_PUBLIC_S3_BUCKET_NAME=your-bucket-name-here
   ```

3. **Replace with your actual values:**
   - `NEXT_PUBLIC_AWS_REGION`: Your S3 bucket region
   - `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`: IAM user access key ID
   - `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY`: IAM user secret access key
   - `NEXT_PUBLIC_S3_BUCKET_NAME`: Your S3 bucket name

### 4. Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env.local` to version control**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Use IAM Policies with Minimum Required Permissions**
   
   Instead of `AmazonS3FullAccess`, create a custom policy:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       },
       {
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
       }
     ]
   }
   ```

3. **Consider Using Pre-signed URLs** (Future Enhancement)
   - For better security, implement server-side pre-signed URLs
   - This keeps AWS credentials on the server only

4. **Enable S3 Bucket Versioning**
   - Helps recover from accidental deletions
   - Go to bucket → Properties → Bucket Versioning → Enable

## Usage

### For Admins

1. **Creating a Question with Image:**
   - Navigate to Admin Dashboard → Courses → Select Course → Create Question
   - Fill in question text and answers
   - Click "Upload Image to S3" under "Question Image (optional)"
   - Select an image file (JPEG, PNG, GIF, or WebP, max 5MB)
   - The image will upload to S3 with a progress bar
   - Preview appears after upload
   - Submit the question

2. **Editing a Question:**
   - The existing image (if any) will be shown
   - You can replace it by uploading a new image
   - Or remove it by clicking the X button on the preview

### Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

**Maximum file size:** 5MB

### Where Images Are Stored

Images are stored in your S3 bucket under the `questions/` folder with the naming pattern:
```
questions/[timestamp]-[random-string].[extension]
```

Example: `questions/1698345678901-abc123def456.jpg`

## Testing

### Local Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test upload:**
   - Login as admin
   - Create or edit a question
   - Upload a test image
   - Verify the image appears in preview
   - Submit and check that the image displays in the question list

3. **Verify S3:**
   - Go to AWS Console → S3 → Your bucket
   - Navigate to `questions/` folder
   - Verify the uploaded image is there
   - Click the image URL to ensure it's publicly accessible

### Using LocalStack (Optional)

For local development without AWS costs, you can use [LocalStack](https://localstack.cloud/):

1. **Install LocalStack:**
   ```bash
   pip install localstack
   ```

2. **Start LocalStack:**
   ```bash
   localstack start
   ```

3. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_S3_ENDPOINT=http://localhost:4566
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=test
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=test
   NEXT_PUBLIC_S3_BUCKET_NAME=studybuddy-local
   ```

4. **Create local bucket:**
   ```bash
   aws --endpoint-url=http://localhost:4566 s3 mb s3://studybuddy-local
   ```

## Troubleshooting

### Upload Fails with "Access Denied"

- Check IAM user has proper S3 permissions
- Verify bucket policy allows public read access
- Ensure CORS is configured correctly

### Image URLs Don't Work

- Verify bucket has public read access
- Check bucket policy is correctly set
- Ensure the S3 URL format is correct

### "Bucket not configured" Error

- Verify `NEXT_PUBLIC_S3_BUCKET_NAME` is set in `.env.local`
- Restart the development server after changing env variables

### Images Upload but Don't Display

- Check browser console for CORS errors
- Verify the image URL is accessible in a new browser tab
- Check Content-Type header is set correctly

## Cost Estimation

### AWS S3 Pricing (Approximate)

- **Storage:** ~$0.023 per GB/month
- **PUT requests:** $0.005 per 1,000 requests
- **GET requests:** $0.0004 per 1,000 requests

**Example for 1,000 questions with images:**
- Average image size: 200KB
- Total storage: ~200MB = ~$0.005/month
- Uploads: 1,000 PUT requests = ~$0.005
- Views (10,000/month): $0.004

**Estimated monthly cost: ~$0.01 - $0.02**

### Free Tier

AWS Free Tier includes:
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests
- Per month for 12 months

## Future Enhancements

- [ ] Server-side upload with pre-signed URLs
- [ ] Image optimization/compression before upload
- [ ] Automatic thumbnail generation
- [ ] Image deletion when question is deleted
- [ ] CDN integration (CloudFront)
- [ ] Multiple image support per question
- [ ] Image library/gallery for reuse
- [ ] Direct paste from clipboard
- [ ] Drag-and-drop upload

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Verify browser console for errors
3. Test AWS credentials with AWS CLI
4. Review S3 bucket configuration

---

**Last Updated:** October 26, 2025
