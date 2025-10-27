# Tencent Cloud Object Storage (COS) Setup Guide

This guide will help you set up Tencent Cloud Object Storage for handling image uploads in the StudyBuddy application.

## 📋 Prerequisites

- A Tencent Cloud account ([Sign up here](https://intl.cloud.tencent.com/))
- Access to Tencent Cloud Console

## 🚀 Setup Steps

### 1. Create a COS Bucket

1. Go to [Tencent Cloud Console](https://console.cloud.tencent.com/)
2. Navigate to **Cloud Object Storage (COS)**
3. Click **Create Bucket**
4. Configure your bucket:
   - **Name**: Choose a unique name (e.g., `studybuddy-images`)
   - **Region**: Select a region close to your users (e.g., `ap-guangzhou`)
   - **Access Permission**: Select **Public Read, Private Write**
   - **Bucket Encryption**: Optional (recommended for production)
   - **Versioning**: Optional

### 2. Get API Credentials

#### Option A: Using Main Account Credentials (Not Recommended for Production)
1. Go to [API Keys](https://console.cloud.tencent.com/cam/capi)
2. Create a new key or use existing one
3. Copy your `SecretId` and `SecretKey`

#### Option B: Using Sub-Account (Recommended)
1. Go to [User List](https://console.cloud.tencent.com/cam)
2. Click **Create User** > **Custom Create**
3. Select **Access via API**
4. Set username and grant COS permissions
5. Copy the `SecretId` and `SecretKey` from the created user

### 3. Configure Bucket Policy (CORS) ⚠️ CRITICAL

For web uploads to work, you MUST configure CORS. Without this, you'll get CORS errors.

**Step-by-step:**

1. Go to [Tencent COS Console](https://console.cloud.tencent.com/cos)
2. Click on your bucket name
3. Click **Security Management** > **CORS (Cross-Origin Resource Sharing)**
4. Click **Add Rule**
5. Fill in the form:

   | Field | Value |
   |-------|-------|
   | **Origin** | `*` (or `http://localhost:3000` for development) |
   | **Allow-Methods** | Select ALL: `GET`, `PUT`, `POST`, `DELETE`, `HEAD` |
   | **Allow-Headers** | `*` |
   | **Expose-Headers** | `ETag`, `Content-Length` |
   | **Max Age** | `3600` |

6. Click **Save**

**Alternative: Manual XML Configuration**

If you prefer to use XML, go to **Security Management** > **CORS Configuration** > **Edit**, and paste:

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <ExposeHeader>Content-Length</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

**For Production:** Replace `*` with your actual domain:
```xml
<AllowedOrigin>https://yourdomain.com</AllowedOrigin>
<AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
```

### 4. Set Up Access Permissions

1. Go to **Permission Settings** in your bucket
2. For **Public Access**:
   - Enable "Public Read, Private Write" to allow anyone to view uploaded images
   - Or keep private and use signed URLs (already implemented in the code)

### 5. Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Tencent Cloud Object Storage (COS) Configuration
NEXT_PUBLIC_TENCENT_SECRET_ID=your-secret-id-here
NEXT_PUBLIC_TENCENT_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_TENCENT_COS_BUCKET=your-bucket-name
NEXT_PUBLIC_TENCENT_COS_REGION=ap-guangzhou
```

**Important Security Notes:**
- ⚠️ **Never commit `.env.local` to version control**
- 🔒 For production, use environment variables in your hosting platform
- 🛡️ Consider using temporary credentials via STS (Security Token Service)

## 🌍 Available Regions

Choose a region close to your users for better performance:

| Region Code | Location |
|------------|----------|
| `ap-guangzhou` | Guangzhou, China |
| `ap-shanghai` | Shanghai, China |
| `ap-beijing` | Beijing, China |
| `ap-chengdu` | Chengdu, China |
| `ap-singapore` | Singapore |
| `ap-hongkong` | Hong Kong, China |
| `na-ashburn` | Virginia, US |
| `na-toronto` | Toronto, Canada |
| `eu-frankfurt` | Frankfurt, Germany |

[Full list of regions](https://www.tencentcloud.com/document/product/436/6224)

## 📁 Folder Structure

Images are organized in the bucket as follows:

```
your-bucket-name/
├── questions/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.png
└── courses/
    └── 1234567892-ghi789.jpg
```

## 🔐 Security Best Practices

### 1. Use Sub-Accounts
Create dedicated sub-accounts with limited permissions:
```json
{
  "version": "2.0",
  "statement": [
    {
      "effect": "allow",
      "action": [
        "name/cos:PutObject",
        "name/cos:GetObject",
        "name/cos:DeleteObject"
      ],
      "resource": [
        "qcs::cos:ap-guangzhou:uid/1234567890:studybuddy-images/*"
      ]
    }
  ]
}
```

### 2. Enable Hotlink Protection
Prevent unauthorized use of your images:
1. Go to **Security Settings** > **Hotlink Protection**
2. Add your domain to the whitelist

### 3. Set Up Lifecycle Rules
Automatically manage storage costs:
1. Go to **Basic Configuration** > **Lifecycle**
2. Create rules to transition or delete old files

### 4. Enable Access Logs
Monitor bucket access:
1. Go to **Logging Management** > **Access Logs**
2. Enable logging to track all requests

## 💰 Cost Optimization

### Storage Classes
- **Standard**: Frequent access (default)
- **Standard_IA**: Infrequent access (30% cheaper)
- **Archive**: Long-term storage (80% cheaper)

### Tips
1. Use image compression before upload
2. Set max file size limits (currently 5MB)
3. Enable CDN for faster delivery and bandwidth savings
4. Clean up unused images with lifecycle policies

## 🔄 Migration from AWS S3

If you're migrating from S3, here's what changed:

### Old (AWS S3)
```typescript
import { uploadToS3 } from "@/lib/s3-upload";
const result = await uploadToS3(file, "questions");
```

### New (Tencent COS)
```typescript
import { uploadToTencentCOS } from "@/lib/tencent-cos-upload";
const result = await uploadToTencentCOS(file, "questions");
```

The interface remains the same, so minimal code changes needed!

## 🧪 Testing

### Test Upload
1. Start your development server: `npm run dev`
2. Go to Admin panel > Questions > Create Question
3. Try uploading an image
4. Check the Tencent COS Console to verify the file appears

### Test Direct Access
Visit the generated URL in your browser:
```
https://your-bucket-name.cos.ap-guangzhou.myqcloud.com/questions/123456-abc.jpg
```

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Check CORS configuration in bucket settings. Make sure your domain is in `allowedOrigin`.

### Issue: Permission Denied
**Solution**: Verify your SecretId and SecretKey are correct. Check sub-account permissions.

### Issue: Image Not Loading
**Solution**: 
- Check if bucket is set to "Public Read"
- Verify the generated URL is accessible
- Check if the file actually uploaded (check COS Console)

### Issue: Upload Fails
**Solution**:
- Check file size (max 5MB by default)
- Verify file type is supported (JPEG, PNG, GIF, WebP)
- Check browser console for detailed error messages

## 📚 Additional Resources

- [Tencent COS Official Documentation](https://www.tencentcloud.com/document/product/436)
- [JavaScript SDK Guide](https://www.tencentcloud.com/document/product/436/11459)
- [API Reference](https://www.tencentcloud.com/document/product/436/7751)
- [Pricing Calculator](https://buy.intl.cloud.tencent.com/price/cos)

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test API credentials using Tencent Cloud Console
4. Check COS Console logs for detailed error information

## 📄 Related Files

- `/src/lib/tencent-cos-upload.ts` - Upload utility functions
- `/src/components/ImageUpload.tsx` - Image upload component
- `/.env.local.example` - Environment variable template
- `/docs/TENCENT_COS_SETUP.md` - This guide
