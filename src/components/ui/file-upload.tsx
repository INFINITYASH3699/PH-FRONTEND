'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Loader2, Upload, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  initialImage?: string;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  uploadingText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function FileUpload({
  onUpload,
  onError,
  initialImage,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
  buttonText = 'Upload Image',
  uploadingText = 'Uploading...',
  variant = 'outline',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (convert maxSizeMB to bytes)
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      onError?.(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Upload to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'File upload failed';
      toast.error(message);
      onError?.(message);

      // Reset preview if upload fails
      if (!initialImage) {
        setPreviewUrl(null);
      } else {
        setPreviewUrl(initialImage);
      }
    } finally {
      setIsUploading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto rounded-md object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant={variant}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-24 flex flex-col gap-2 items-center justify-center border-dashed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{uploadingText}</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>{buttonText}</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
