# Quick Start: Question Images with S3

## ⚡ 5-Minute Setup

### 1. Install Dependencies (Already Done ✅)
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Bucket name: `studybuddy-questions` (or your choice)
4. Region: `us-east-1` (or your preference)
5. **Uncheck** "Block all public access"
6. Click **"Create bucket"**

### 3. Configure Bucket

#### Add Bucket Policy
1. Select your bucket → **Permissions** → **Bucket Policy**
2. Paste this (replace `YOUR-BUCKET-NAME`):

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

#### Add CORS Configuration
1. Same bucket → **Permissions** → **CORS**
2. Paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. **Users** → **Add user**
3. Username: `studybuddy-uploader`
4. Check ✅ **Programmatic access**
5. **Attach existing policies** → Select **AmazonS3FullAccess**
6. **Create user**
7. **⚠️ SAVE YOUR KEYS:**
   - Access Key ID
   - Secret Access Key

### 5. Configure Environment

Create `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=AKIA...your-key...
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=...your-secret...
NEXT_PUBLIC_S3_BUCKET_NAME=studybuddy-questions
```

### 6. Run Database Migration

```bash
cd studybuddy-server
npx prisma migrate dev
```

### 7. Start Development Server

```bash
cd studybuddy-web
npm run dev
```

### 8. Test Upload

1. Open http://localhost:3000
2. Login as admin
3. Navigate to any course
4. Click **"Create New Question"**
5. Fill in question details
6. Click **"Upload Image to S3"**
7. Select an image (JPEG, PNG, GIF, or WebP)
8. Watch upload progress
9. See preview
10. Submit question
11. ✅ Done!

## 🎉 You're Ready!

Images will now:
- Upload to S3 automatically
- Display in admin question list
- Display in student practice mode
- Be publicly accessible via HTTPS URL

## 📚 Need More Details?

See the full guides:
- `docs/S3_SETUP_GUIDE.md` - Complete AWS setup
- `docs/QUESTION_IMAGE_FEATURE.md` - Technical documentation

## 🐛 Troubleshooting

**Upload fails?**
- Check `.env.local` has correct credentials
- Restart dev server after changing `.env.local`
- Verify bucket policy is set
- Check browser console for errors

**Images don't display?**
- Verify bucket has public read access
- Check CORS configuration
- Test S3 URL directly in browser

**"Bucket not configured" error?**
- Make sure `NEXT_PUBLIC_S3_BUCKET_NAME` is set
- Restart server

## 💡 Pro Tips

- Free tier includes 5GB storage and 20K requests/month
- Keep credentials secret (never commit `.env.local`)
- Use unique bucket names (must be globally unique)
- Choose region close to your users for better performance

---

**Need help?** Check the full documentation in `docs/S3_SETUP_GUIDE.md`
