'use client'

import React, { useCallback, useState } from 'react'
import { Button } from './button'
import { toast } from 'sonner'

export interface FileUploadProps {
  onUploadComplete: (result: { file: File }) => void
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
        // Let the parent component handle the upload process
        // This allows components to decide how to upload the file
        onUploadComplete({ file })
      } catch (error) {
        console.error('File selection error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Selection failed'
        toast.error(`File selection failed: ${errorMsg}`)
        onUploadError?.(errorMsg)
      } finally {
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
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}

export default FileUpload
