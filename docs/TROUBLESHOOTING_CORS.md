# 🔧 Fixing CORS Error - Tencent COS

## The Error You're Seeing

```
Access to XMLHttpRequest at 'http://studybuddy-1384371629.cos.ap-singapore.tencentcos.cn/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution: Configure CORS in Tencent COS

### Step-by-Step Fix

#### 1. Go to Tencent COS Console
Visit: https://console.cloud.tencent.com/cos

#### 2. Select Your Bucket
Click on your bucket: `studybuddy-1384371629`

#### 3. Navigate to CORS Settings
- Click on **Security Management** (安全管理) in the left sidebar
- Click on **CORS (Cross-Origin Resource Sharing)** or **跨域访问CORS设置**

#### 4. Add CORS Rule

**Option A: Using the Form (Recommended)**

Click **Add Rule** and fill in:

| Field | Value to Enter |
|-------|----------------|
| **Origins (来源 Origin)** | `*` or `http://localhost:3000` |
| **Methods (操作 Methods)** | ✅ Check ALL: GET, PUT, POST, DELETE, HEAD |
| **Allow-Headers (Allow-Headers)** | `*` |
| **Expose-Headers (Expose-Headers)** | `ETag`, `Content-Length` |
| **Max Age (超时 Max-Age-Seconds)** | `3600` |

Then click **OK** or **保存** (Save)

**Option B: Using XML**

Click **Edit** (or **编辑**) and paste this XML:

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

Click **Save** (保存)

#### 5. Wait and Test
- Wait 1-2 minutes for changes to propagate
- Clear your browser cache (Ctrl+Shift+Delete)
- Try uploading again

### 🎯 Quick Test

After configuring CORS, test with curl:

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -I "http://studybuddy-1384371629.cos.ap-singapore.tencentcos.cn/"
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: PUT, GET, POST, DELETE, HEAD
Access-Control-Allow-Headers: *
```

## 🔐 For Production

When deploying to production, replace `*` with your specific domain:

**Development:**
```xml
<AllowedOrigin>http://localhost:3000</AllowedOrigin>
```

**Production:**
```xml
<AllowedOrigin>https://yourdomain.com</AllowedOrigin>
<AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
```

Or keep multiple origins:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
    <AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
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

## 🖼️ Visual Guide

### Finding CORS Settings (English Console)
```
COS Console → Select Bucket → Security Management → CORS
```

### Finding CORS Settings (Chinese Console)
```
对象存储 → 选择存储桶 → 安全管理 → 跨域访问CORS设置
```

## ✅ Verification Checklist

After configuration, verify:

- [ ] CORS rule is saved in COS Console
- [ ] Waited 1-2 minutes for propagation
- [ ] Cleared browser cache
- [ ] Refreshed the page
- [ ] Tried upload again

## 🚨 Still Not Working?

### Check Bucket Name in Code
Verify your `.env.local` has the correct bucket name:

```bash
NEXT_PUBLIC_TENCENT_COS_BUCKET=studybuddy-1384371629
NEXT_PUBLIC_TENCENT_COS_REGION=ap-singapore
```

### Check Region
Your bucket is in `ap-singapore`. Make sure your environment variable matches:
```bash
NEXT_PUBLIC_TENCENT_COS_REGION=ap-singapore
```

### Check SecretId and SecretKey
Make sure they're correct and have permissions:
1. Go to https://console.cloud.tencent.com/cam/capi
2. Verify your credentials are active
3. Check they have COS permissions

### Browser Console
Open browser DevTools (F12) → Network tab → Try upload again → Check the OPTIONS request
- Look for the preflight OPTIONS request
- Check response headers
- Look for error details

## 📞 Need More Help?

1. Check COS Console for CORS configuration
2. Verify bucket permissions (should be Public Read)
3. Make sure credentials have COS access
4. Try in incognito/private browsing mode
5. Check Tencent Cloud status page

## 🎓 Understanding CORS

CORS (Cross-Origin Resource Sharing) is a security feature that prevents websites from making requests to different domains without permission.

- **Your app**: `http://localhost:3000`
- **COS bucket**: `http://studybuddy-1384371629.cos.ap-singapore.tencentcos.cn`

These are different origins, so CORS configuration is required.

---

**Quick Fix Summary:**
1. Go to COS Console
2. Select bucket `studybuddy-1384371629`
3. Security Management → CORS
4. Add rule with origin `*` and all methods
5. Save and wait 1-2 minutes
6. Clear cache and try again ✅
