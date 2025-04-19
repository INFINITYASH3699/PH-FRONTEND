'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SaveDraftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSave: () => Promise<void>;
  saveText?: string;
  savingText?: string;
  savedText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  showToast?: boolean;
  toastMessage?: string;
}

export function SaveDraftButton({
  onSave,
  saveText = 'Save as Draft',
  savingText = 'Saving...',
  savedText = 'Saved',
  className,
  variant = 'outline',
  size = 'default',
  icon,
  showToast = true,
  toastMessage = 'Draft saved successfully',
  ...props
}: SaveDraftButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [disabled, setDisabled] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      setStatus('saving');
      setDisabled(true);

      await onSave();

      setStatus('saved');
      if (showToast) {
        toast.success(toastMessage);
      }

      // Reset to idle after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setStatus('idle');
        setDisabled(false);
      }, 2000);
    } catch (error) {
      console.error('Save draft error:', error);
      setStatus('idle');
      setDisabled(false);
      toast.error('Failed to save draft');
    }
  };

  const defaultSaveIcon = (
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );

  const savingIcon = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
  );

  const savedIcon = (
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
      className="h-4 w-4 mr-2 text-green-500"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );

  let displayIcon;
  let displayText;

  switch (status) {
    case 'saving':
      displayIcon = savingIcon;
      displayText = savingText;
      break;
    case 'saved':
      displayIcon = savedIcon;
      displayText = savedText;
      break;
    default:
      displayIcon = icon || defaultSaveIcon;
      displayText = saveText;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        status === 'saved' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800' : '',
        className
      )}
      onClick={handleSave}
      disabled={disabled}
      {...props}
    >
      {displayIcon}
      {displayText}
    </Button>
  );
}
