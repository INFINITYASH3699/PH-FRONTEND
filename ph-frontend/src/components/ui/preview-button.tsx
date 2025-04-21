'use client';

import * as React from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { cn } from '@/lib/utils';

export interface PreviewButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onPreview: () => Promise<string | null>; // Should return the URL to preview
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  previewText?: string;
  loadingText?: string;
  fullscreen?: boolean;
}

export function PreviewButton({
  onPreview,
  className,
  variant = 'outline',
  size = 'default',
  previewText = 'Preview',
  loadingText = 'Loading Preview...',
  fullscreen = false,
  ...props
}: PreviewButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'preview'>('idle');
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [showDialog, setShowDialog] = React.useState(false);

  // Helper to get auth token from localStorage or cookies as needed
  const getAuthToken = (): string | null => {
    // Use the same key as in apiClient.ts (ph_auth_token)
    try {
      return localStorage.getItem('ph_auth_token');
    } catch {
      return null;
    }
  };

  const handlePreview = async () => {
    try {
      setStatus('loading');

      const url = await onPreview();

      if (url) {
        // Ensure URL is absolute
        const absoluteUrl = url.startsWith('http')
          ? url
          : window.location.origin + url;

        // Append auth token as query param to ensure auth is passed
        const authToken = getAuthToken();
        let urlObj: URL;
        try {
          urlObj = new URL(absoluteUrl);
        } catch {
          // fallback: if absoluteUrl is malformed, fallback to original url string
          urlObj = null as any;
        }

        let finalUrl = absoluteUrl;
        if (urlObj && authToken) {
          // Append or overwrite the auth token param
          urlObj.searchParams.set('authToken', authToken);
          finalUrl = urlObj.toString();
        }

        setPreviewUrl(finalUrl);
        setStatus('preview');

        if (fullscreen) {
          // Open in new tab/window
          window.open(finalUrl, '_blank');
        } else {
          // Show in dialog
          setShowDialog(true);
        }
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Preview error:', error);
      setStatus('idle');
    }
  };

  const handleClosePreview = () => {
    setShowDialog(false);
    setStatus('idle');
  };

  const previewIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 mr-2"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const loadingIcon = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handlePreview}
        disabled={status === 'loading'}
        {...props}
      >
        {status === 'loading' ? loadingIcon : previewIcon}
        {status === 'loading' ? loadingText : previewText}
      </Button>

      {!fullscreen && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[90%] sm:h-[90vh] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Portfolio Preview</DialogTitle>
              <DialogDescription>
                This is a preview of how your portfolio will look when published
              </DialogDescription>
            </DialogHeader>
            <div className="relative flex-1 h-full min-h-[70vh]">
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Portfolio Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Remember to save your changes before publishing
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleClosePreview}
                  variant="outline"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
