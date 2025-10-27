# 🚀 QUICK FIX: CORS Error

## Your Bucket Details
- **Bucket**: `studybuddy-1384371629`
- **Region**: `ap-singapore`
- **URL**: `http://studybuddy-1384371629.cos.ap-singapore.tencentcos.cn`

## ⚡ Fix in 5 Steps

### 1️⃣ Open COS Console
🔗 https://console.cloud.tencent.com/cos/bucket?bucket=studybuddy-1384371629&region=ap-singapore

### 2️⃣ Go to CORS Settings
Click: **Security Management** → **CORS** (or **安全管理** → **跨域访问CORS设置**)

### 3️⃣ Add This CORS Rule

Click **Add Rule** / **添加规则** and enter:

```
Origin: *
Methods: ✅ ALL (GET, PUT, POST, DELETE, HEAD)
Allow-Headers: *
Expose-Headers: ETag, Content-Length
Max Age: 3600
```

**OR paste this XML:**

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

### 4️⃣ Save & Wait
- Click **Save** / **保存**
- Wait 1-2 minutes

### 5️⃣ Test Again
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Refresh your app
- Try uploading an image

## ✅ Expected Result

After CORS is configured, the upload should work and you'll see:
- Progress bar updating
- Image preview appears
- Success message
- Image visible in your app

## 🔍 Verify CORS is Working

Open browser console (F12) and run:

```javascript
fetch('http://studybuddy-1384371629.cos.ap-singapore.tencentcos.cn/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'PUT'
  }
}).then(r => console.log('CORS OK:', r.headers.get('access-control-allow-origin')))
```

Should print: `CORS OK: *`

## 📱 Screenshots

### Where to Find CORS (English Console)
```
COS Console
  └── Bucket List
      └── studybuddy-1384371629
          └── Security Management
              └── CORS (Cross-Origin Resource Sharing)
                  └── Add Rule
```

### Where to Find CORS (Chinese Console)
```
对象存储
  └── 存储桶列表
      └── studybuddy-1384371629
          └── 安全管理
              └── 跨域访问CORS设置
                  └── 添加规则
```

## 🆘 Still Getting Error?

### Check Your .env.local
```bash
NEXT_PUBLIC_TENCENT_SECRET_ID=AKIDxxxxxxxxx
NEXT_PUBLIC_TENCENT_SECRET_KEY=xxxxxxxxxxxxx
NEXT_PUBLIC_TENCENT_COS_BUCKET=studybuddy-1384371629
NEXT_PUBLIC_TENCENT_COS_REGION=ap-singapore
```

### Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Clear Everything
1. Clear browser cache
2. Clear browser console (click 🚫)
3. Refresh page (Ctrl+Shift+R)
4. Try upload again

## 📞 Direct Links

- **COS Console**: https://console.cloud.tencent.com/cos
- **Your Bucket**: https://console.cloud.tencent.com/cos/bucket?bucket=studybuddy-1384371629&region=ap-singapore
- **CORS Guide**: See `TROUBLESHOOTING_CORS.md`

---

**TL;DR**: Go to COS Console → Your Bucket → Security Management → CORS → Add Rule with Origin `*` and ALL methods → Save → Wait 2 mins → Try again ✅
