import COS from "cos-js-sdk-v5";

// Tencent COS Client Configuration
const cosClient = new COS({
  SecretId: process.env.NEXT_PUBLIC_TENCENT_SECRET_ID || "",
  SecretKey: process.env.NEXT_PUBLIC_TENCENT_SECRET_KEY || "",
});

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Upload a file to Tencent COS bucket
 * @param file - The file to upload
 * @param folder - Optional folder path in the bucket (e.g., 'questions', 'courses')
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the uploaded file's URL and metadata
 */
export async function uploadToTencentCOS(
  file: File,
  folder: string = "questions",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const bucketName = process.env.NEXT_PUBLIC_TENCENT_COS_BUCKET;
  const region = process.env.NEXT_PUBLIC_TENCENT_COS_REGION || "ap-guangzhou";
  
  if (!bucketName) {
    throw new Error("Tencent COS bucket name is not configured. Please set NEXT_PUBLIC_TENCENT_COS_BUCKET in your environment variables.");
  }

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type (images only)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split(".").pop();
  const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

  return new Promise((resolve, reject) => {
    cosClient.putObject(
      {
        Bucket: bucketName,
        Region: region,
        Key: key,
        Body: file,
        ContentType: file.type,
        onProgress: (progressData) => {
          if (onProgress) {
            const percentage = Math.round((progressData.percent || 0) * 100);
            onProgress({
              loaded: progressData.loaded || 0,
              total: progressData.total || file.size,
              percentage: percentage,
            });
          }
        },
      },
      (err, data) => {
        if (err) {
          console.error("Tencent COS upload error:", err);
          reject(new Error(`Failed to upload file: ${err.message || "Unknown error"}`));
          return;
        }

        // Construct the public URL
        // Format: https://{bucket}.cos.{region}.myqcloud.com/{key}
        const url = `https://${bucketName}.cos.${region}.myqcloud.com/${key}`;

        resolve({
          url,
          key,
          bucket: bucketName,
        });
      }
    );
  });
}

/**
 * Delete a file from Tencent COS bucket
 * @param key - The COS object key to delete
 * @returns Promise<void>
 */
export async function deleteFromTencentCOS(key: string): Promise<void> {
  const bucketName = process.env.NEXT_PUBLIC_TENCENT_COS_BUCKET;
  const region = process.env.NEXT_PUBLIC_TENCENT_COS_REGION || "ap-guangzhou";
  
  if (!bucketName) {
    throw new Error("Tencent COS bucket name is not configured");
  }

  return new Promise((resolve, reject) => {
    cosClient.deleteObject(
      {
        Bucket: bucketName,
        Region: region,
        Key: key,
      },
      (err) => {
        if (err) {
          console.error("Tencent COS delete error:", err);
          reject(new Error("Failed to delete file from Tencent COS"));
          return;
        }
        resolve();
      }
    );
  });
}

/**
 * Extract COS key from a full Tencent COS URL
 * @param url - The full COS URL
 * @returns The COS object key or null if not a valid COS URL
 */
export function extractCOSKey(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Remove leading slash
    const key = pathname.startsWith("/") ? pathname.substring(1) : pathname;
    
    return key;
  } catch {
    return null;
  }
}

/**
 * Get a temporary signed URL for private files (valid for 30 minutes)
 * @param key - The COS object key
 * @returns Promise with the signed URL
 */
export async function getSignedUrl(key: string): Promise<string> {
  const bucketName = process.env.NEXT_PUBLIC_TENCENT_COS_BUCKET;
  const region = process.env.NEXT_PUBLIC_TENCENT_COS_REGION || "ap-guangzhou";
  
  if (!bucketName) {
    throw new Error("Tencent COS bucket name is not configured");
  }

  return new Promise((resolve, reject) => {
    cosClient.getObjectUrl(
      {
        Bucket: bucketName,
        Region: region,
        Key: key,
        Sign: true,
        Expires: 1800, // 30 minutes
      },
      (err, data) => {
        if (err) {
          console.error("Tencent COS signed URL error:", err);
          reject(new Error("Failed to generate signed URL"));
          return;
        }
        resolve(data.Url);
      }
    );
  });
}
