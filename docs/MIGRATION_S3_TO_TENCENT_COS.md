# Migration from AWS S3 to Tencent COS - Summary

## ✅ What Was Changed

### 1. **New Dependencies**
- ✅ Installed `cos-js-sdk-v5` (Tencent COS SDK)

### 2. **New Files Created**
- ✅ `src/lib/tencent-cos-upload.ts` - Tencent COS upload utility
- ✅ `docs/TENCENT_COS_SETUP.md` - Complete setup guide

### 3. **Modified Files**
- ✅ `src/components/ImageUpload.tsx` - Updated to use Tencent COS
- ✅ `src/components/admin/modals/CreateQuestionModal.tsx` - Updated button text
- ✅ `src/components/admin/modals/EditQuestionModal.tsx` - Updated button text
- ✅ `.env.local.example` - Updated environment variables

### 4. **Old Files (Can Be Removed)**
- 🗑️ `src/lib/s3-upload.ts` - AWS S3 utility (no longer used)
- 🗑️ Can uninstall: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`

## 🚀 Quick Start

### Step 1: Install Dependencies
Already done! ✅

### Step 2: Set Up Tencent COS
Follow the guide: `docs/TENCENT_COS_SETUP.md`

### Step 3: Configure Environment Variables
Update your `.env.local` file:

```bash
# Remove old AWS S3 variables (optional)
# NEXT_PUBLIC_AWS_REGION=...
# NEXT_PUBLIC_AWS_ACCESS_KEY_ID=...
# NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=...
# NEXT_PUBLIC_S3_BUCKET_NAME=...

# Add new Tencent COS variables
NEXT_PUBLIC_TENCENT_SECRET_ID=your-secret-id
NEXT_PUBLIC_TENCENT_SECRET_KEY=your-secret-key
NEXT_PUBLIC_TENCENT_COS_BUCKET=your-bucket-name
NEXT_PUBLIC_TENCENT_COS_REGION=ap-guangzhou
```

### Step 4: Test the Upload
1. Start dev server: `npm run dev`
2. Go to Admin > Questions > Create Question
3. Upload an image
4. Verify it appears in Tencent COS Console

## 🔄 API Compatibility

The API interface remains identical! Only the implementation changed.

### Before (S3)
```typescript
import { uploadToS3 } from "@/lib/s3-upload";
const result = await uploadToS3(file, "questions", onProgress);
// Returns: { url, key, bucket }
```

### After (Tencent COS)
```typescript
import { uploadToTencentCOS } from "@/lib/tencent-cos-upload";
const result = await uploadToTencentCOS(file, "questions", onProgress);
// Returns: { url, key, bucket } - Same interface!
```

## 📊 Feature Comparison

| Feature | AWS S3 | Tencent COS | Status |
|---------|--------|-------------|--------|
| Upload | ✅ | ✅ | Implemented |
| Progress tracking | ✅ | ✅ | Implemented |
| Delete | ✅ | ✅ | Implemented |
| Public URLs | ✅ | ✅ | Implemented |
| Signed URLs | ✅ | ✅ | Implemented |
| File validation | ✅ | ✅ | Implemented |
| CORS support | ✅ | ✅ | Needs configuration |

## 🌏 URL Format Changes

### AWS S3 URL Format
```
https://bucket-name.s3.us-east-1.amazonaws.com/questions/123-abc.jpg
```

### Tencent COS URL Format
```
https://bucket-name.cos.ap-guangzhou.myqcloud.com/questions/123-abc.jpg
```

## 💡 Key Differences

### 1. **SDK Initialization**
- **S3**: Uses `S3Client` with region and credentials
- **COS**: Uses `COS` constructor with SecretId and SecretKey

### 2. **Upload Method**
- **S3**: `putObject()` with async/await
- **COS**: `putObject()` with callback pattern (wrapped in Promise)

### 3. **Progress Callback**
- **S3**: Manual progress simulation
- **COS**: Native progress events via `onProgress` parameter

### 4. **URL Construction**
- **S3**: `https://{bucket}.s3.{region}.amazonaws.com/{key}`
- **COS**: `https://{bucket}.cos.{region}.myqcloud.com/{key}`

## 🔐 Security Improvements

Tencent COS offers:
1. ✅ Built-in hotlink protection
2. ✅ More granular access control
3. ✅ Better regional data compliance
4. ✅ Temporary security credentials (STS)

## 💰 Cost Comparison (Approximate)

| Service | Storage (GB/month) | GET Requests (10k) | PUT Requests (10k) |
|---------|-------------------|-------------------|-------------------|
| AWS S3 Standard | $0.023 | $0.0004 | $0.005 |
| Tencent COS Standard | $0.024 | $0.0004 | $0.005 |

**Note**: Prices vary by region. Tencent COS may be cheaper in Asia-Pacific regions.

## 📝 TODO (Optional Cleanup)

- [ ] Remove `src/lib/s3-upload.ts` if no longer needed
- [ ] Uninstall AWS SDK packages: `npm uninstall @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- [ ] Update any documentation referencing S3
- [ ] Migrate existing S3 images to Tencent COS (if needed)

## 🐛 Known Issues

None currently. If you encounter issues:
1. Check `docs/TENCENT_COS_SETUP.md` troubleshooting section
2. Verify CORS configuration
3. Check bucket permissions

## 📞 Support Resources

- [Tencent COS Setup Guide](./TENCENT_COS_SETUP.md)
- [Tencent Cloud Console](https://console.cloud.tencent.com/)
- [Official Documentation](https://www.tencentcloud.com/document/product/436)

---

**Migration Status**: ✅ Complete and ready to use!

**Next Steps**: Configure your Tencent COS bucket and test the upload functionality.
