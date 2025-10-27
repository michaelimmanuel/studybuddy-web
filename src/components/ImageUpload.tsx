"use client";

import { useState, useRef } from "react";
import { uploadToTencentCOS, type UploadProgress, type UploadResult } from "@/lib/tencent-cos-upload";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  folder?: string;
  label?: string;
  buttonText?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  folder = "questions",
  label = "Upload Image",
  buttonText = "Choose Image",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setProgress(0);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Tencent COS
    setUploading(true);
    try {
      const result: UploadResult = await uploadToTencentCOS(
        file,
        folder,
        (progressData: UploadProgress) => {
          setProgress(progressData.percentage);
        }
      );

      // Notify parent component
      onUploadComplete(result.url);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMsg);
      setPreviewUrl(null);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : buttonText}
          </button>

          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm font-medium text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP (max {maxSizeMB}MB)
          </p>
        </div>

        {previewUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
