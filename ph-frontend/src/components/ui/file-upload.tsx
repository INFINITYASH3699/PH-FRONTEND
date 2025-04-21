'use client'

import React, { useCallback, useState } from 'react'
import { Button } from './button'
import { uploadFileToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'

export interface FileUploadProps {
  onUploadComplete: (result: { url: string; publicId: string }) => void
  onUploadError?: (error: string) => void
  allowedTypes?: string[]
  maxSizeMB?: number
  buttonText?: string
  uploading?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
}

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const DEFAULT_MAX_SIZE = 5 // 5MB

export function FileUpload({
  onUploadComplete,
  onUploadError,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxSizeMB = DEFAULT_MAX_SIZE,
  buttonText = 'Upload Image',
  uploading: externalUploading,
  className = '',
  variant = 'default',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const isUploading = uploading || externalUploading

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        toast.error(errorMsg)
        onUploadError?.(errorMsg)
        e.target.value = ''
        return
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        const errorMsg = `File too large. Maximum size: ${maxSizeMB}MB`
        toast.error(errorMsg)
        onUploadError?.(errorMsg)
        e.target.value = ''
        return
      }

      try {
        setUploading(true)

        // Upload to Cloudinary
        const result = await uploadFileToCloudinary(file)

        if (!result.success) {
          throw new Error(result.error || 'Upload failed')
        }

        onUploadComplete({
          url: result.url,
          publicId: result.publicId
        })

        toast.success('File uploaded successfully')
      } catch (error) {
        console.error('Upload error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Upload failed'
        toast.error(`Upload failed: ${errorMsg}`)
        onUploadError?.(errorMsg)
      } finally {
        setUploading(false)
        // Reset the file input
        e.target.value = ''
      }
    },
    [allowedTypes, maxSizeMB, onUploadComplete, onUploadError]
  )

  return (
    <div className={className}>
      <Button
        variant={variant}
        disabled={isUploading}
        onClick={() => document.getElementById('file-upload-input')?.click()}
        className="relative"
      >
        {isUploading ? 'Uploading...' : buttonText}
      </Button>
      <input
        id="file-upload-input"
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  )
}

export default FileUpload
