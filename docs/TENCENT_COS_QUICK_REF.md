# Tencent COS Quick Reference

## 📦 Environment Variables

```bash
NEXT_PUBLIC_TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TENCENT_COS_BUCKET=studybuddy-images-1234567890
NEXT_PUBLIC_TENCENT_COS_REGION=ap-guangzhou
```

## 🌍 Common Regions

| Region | Code | Location |
|--------|------|----------|
| Guangzhou | `ap-guangzhou` | South China |
| Shanghai | `ap-shanghai` | East China |
| Beijing | `ap-beijing` | North China |
| Singapore | `ap-singapore` | Southeast Asia |
| Hong Kong | `ap-hongkong` | Hong Kong |
| Virginia | `na-ashburn` | US East Coast |

## 🔗 URL Format

```
https://{bucket}.cos.{region}.myqcloud.com/{key}
```

Example:
```
https://studybuddy-images.cos.ap-guangzhou.myqcloud.com/questions/12345-abc.jpg
```

## 📝 CORS Configuration (CRITICAL!)

Go to COS Console > Your Bucket > Security Management > CORS

### Option 1: Using Web Form
1. Click **Add Rule**
2. Fill in:
   - **Origin**: `*` (or specific domain)
   - **Methods**: Check ALL boxes (GET, PUT, POST, DELETE, HEAD)
   - **Allow-Headers**: `*`
   - **Expose-Headers**: `ETag, Content-Length`
   - **Max Age**: `3600`
3. Click **Save**

### Option 2: Using XML Configuration
Click "Edit" and paste this:

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

**Production**: Replace `*` with your domain:
```xml
<AllowedOrigin>https://yourdomain.com</AllowedOrigin>
```

## 🔐 IAM Policy (Recommended)

Create a sub-user with these permissions:

```json
{
  "version": "2.0",
  "statement": [
    {
      "effect": "allow",
      "action": [
        "name/cos:PutObject",
        "name/cos:GetObject",
        "name/cos:DeleteObject",
        "name/cos:HeadObject"
      ],
      "resource": [
        "qcs::cos:{region}:uid/{appid}:{bucket}/*"
      ]
    }
  ]
}
```

## 🛠️ Common Commands

### Test Upload (curl)
```bash
curl -X PUT \
  "https://studybuddy-images.cos.ap-guangzhou.myqcloud.com/test.jpg" \
  -H "Authorization: {signature}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @image.jpg
```

### Check Bucket Access
```bash
curl https://studybuddy-images.cos.ap-guangzhou.myqcloud.com/
```

## 💰 Cost Estimation

For 100GB storage + 10,000 uploads + 100,000 downloads:
- Storage: ~$2.40/month
- Requests: ~$0.05/month
- Bandwidth: ~$1.00/month (after free tier)
- **Total**: ~$3.45/month

## 🚨 Common Issues

### Issue: "SignatureDoesNotMatch"
✅ Check SecretId and SecretKey
✅ Verify they're not expired

### Issue: "AccessDenied"
✅ Check bucket permissions
✅ Verify IAM policy

### Issue: "NoSuchBucket"
✅ Verify bucket name
✅ Check region is correct

### Issue: CORS Error
✅ Add CORS configuration to bucket
✅ Include your domain in allowedOrigin

## 📱 Test Checklist

- [ ] Environment variables set
- [ ] Bucket created with public read
- [ ] CORS configured
- [ ] Test upload works
- [ ] Image displays in app
- [ ] Delete function works
- [ ] Progress tracking works

## 🔗 Quick Links

- [Console](https://console.cloud.tencent.com/cos)
- [API Keys](https://console.cloud.tencent.com/cam/capi)
- [Pricing](https://buy.intl.cloud.tencent.com/price/cos)
- [SDK Docs](https://www.tencentcloud.com/document/product/436/11459)

## 📞 Support

- **Documentation**: `/docs/TENCENT_COS_SETUP.md`
- **Migration Guide**: `/docs/MIGRATION_S3_TO_TENCENT_COS.md`
- **Tencent Support**: [Submit Ticket](https://console.cloud.tencent.com/workorder)

---

**Pro Tip**: Use CDN with COS for faster global delivery and reduced costs!
