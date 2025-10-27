# Image Upload Configuration

## Overview

The StudyBuddy application now uses **Tencent Cloud Object Storage (COS)** for handling image uploads. Images are used for:
- Question images (in quiz questions)
- Course materials (if applicable)

## Quick Setup

### 1. Get Tencent Cloud Credentials
1. Sign up for [Tencent Cloud](https://intl.cloud.tencent.com/)
2. Create a COS bucket
3. Get your API credentials (SecretId and SecretKey)

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_TENCENT_SECRET_ID=your-secret-id-here
NEXT_PUBLIC_TENCENT_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_TENCENT_COS_BUCKET=your-bucket-name
NEXT_PUBLIC_TENCENT_COS_REGION=ap-guangzhou
```

### 3. Test Upload
```bash
npm run dev
```
Navigate to Admin panel and try uploading an image to a question.

## Documentation

- **[Complete Setup Guide](./TENCENT_COS_SETUP.md)** - Detailed instructions for setting up Tencent COS
- **[Migration Guide](./MIGRATION_S3_TO_TENCENT_COS.md)** - Details about the migration from AWS S3

## Features

✅ Upload images to Tencent COS
✅ Real-time progress tracking
✅ File validation (type, size)
✅ Image preview
✅ Public and private access
✅ Signed URLs for temporary access
✅ Delete uploaded images

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

**Max file size**: 5MB

## API Usage

```typescript
import { uploadToTencentCOS } from "@/lib/tencent-cos-upload";

// Upload a file
const result = await uploadToTencentCOS(
  file,
  "questions", // folder
  (progress) => {
    console.log(`${progress.percentage}% uploaded`);
  }
);

console.log(result.url); // Public URL
```

## File Organization

```
your-bucket/
├── questions/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.png
└── courses/
    └── 1234567892-ghi789.jpg
```

## Security

- Images are stored in a public-read bucket by default
- API credentials are stored in environment variables (never committed)
- Temporary signed URLs available for private files
- File validation prevents malicious uploads

## Cost

Tencent COS pricing is competitive with AWS S3. Typical costs:
- Storage: ~$0.024/GB/month
- Bandwidth: First 10GB free
- Requests: Very low per-request cost

[Calculate your costs](https://buy.intl.cloud.tencent.com/price/cos)

## Troubleshooting

**Upload fails**: Check CORS configuration in COS bucket settings
**Permission denied**: Verify SecretId and SecretKey are correct
**Image not loading**: Ensure bucket has public read access

See [TENCENT_COS_SETUP.md](./TENCENT_COS_SETUP.md) for detailed troubleshooting.

## Support

- [Tencent COS Documentation](https://www.tencentcloud.com/document/product/436)
- [JavaScript SDK Guide](https://www.tencentcloud.com/document/product/436/11459)
