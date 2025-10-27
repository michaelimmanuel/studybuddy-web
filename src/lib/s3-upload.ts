import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
  ...(process.env.NEXT_PUBLIC_S3_ENDPOINT && {
    endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    forcePathStyle: true, // Required for LocalStack/MinIO
  }),
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
 * Upload a file to S3 bucket
 * @param file - The file to upload
 * @param folder - Optional folder path in the bucket (e.g., 'questions', 'courses')
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the uploaded file's URL and metadata
 */
export async function uploadToS3(
  file: File,
  folder: string = "questions",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error("S3 bucket name is not configured. Please set NEXT_PUBLIC_S3_BUCKET_NAME in your environment variables.");
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

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Simulate progress for user feedback
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Make the file publicly accessible
    });

    await s3Client.send(command);

    // Update progress to 100%
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    // Construct the public URL
    const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
    const endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT;
    
    let url: string;
    if (endpoint) {
      // For LocalStack or custom endpoints
      url = `${endpoint}/${bucketName}/${key}`;
    } else {
      // Standard AWS S3 URL
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    return {
      url,
      key,
      bucket: bucketName,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Delete a file from S3 bucket
 * @param key - The S3 object key to delete
 * @returns Promise<void>
 */
export async function deleteFromS3(key: string): Promise<void> {
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error("S3 bucket name is not configured");
  }

  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Extract S3 key from a full S3 URL
 * @param url - The full S3 URL
 * @returns The S3 object key or null if not a valid S3 URL
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Remove leading slash
    const key = pathname.startsWith("/") ? pathname.substring(1) : pathname;
    
    // Remove bucket name if it's in the path
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    if (bucketName && key.startsWith(`${bucketName}/`)) {
      return key.substring(bucketName.length + 1);
    }
    
    return key;
  } catch {
    return null;
  }
}
