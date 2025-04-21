'use client';

import * as React from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from './dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertTriangle, Check } from 'lucide-react';

export interface PublishButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onPublish: () => Promise<void>;
  publishText?: string;
  publishingText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  confirmText?: string;
  confirmDescription?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showConfirmation?: boolean;
  requireValidation?: boolean;
  validationChecks?: Array<{
    condition: boolean;
    message: string;
  }>;
  successRedirectUrl?: string;
  isPremiumUser?: boolean; // New prop to determine if user is premium
  publishedPortfolioTitle?: string; // Add title of currently published portfolio
}

export function PublishButton({
  onPublish,
  publishText = 'Publish',
  publishingText = 'Publishing...',
  className,
  variant = 'default',
  size = 'default',
  confirmText = 'Publish Portfolio',
  confirmDescription = 'Your portfolio will be publicly available after publishing. Are you sure you want to continue?',
  confirmButtonText = 'Publish',
  cancelButtonText = 'Cancel',
  showConfirmation = true,
  requireValidation = true,
  validationChecks = [],
  successRedirectUrl,
  isPremiumUser = false, // Default to free user
  publishedPortfolioTitle,
  ...props
}: PublishButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'publishing' | 'published'>('idle');
  const [showDialog, setShowDialog] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  const handlePublishClick = () => {
    if (requireValidation && validationChecks.length > 0) {
      const errors = validationChecks
        .filter(check => !check.condition)
        .map(check => check.message);

      setValidationErrors(errors);

      if (errors.length > 0) {
        toast.error('Please fix the issues before publishing');
        return;
      }
    }

    if (showConfirmation) {
      setShowDialog(true);
    } else {
      handlePublish();
    }
  };

  const handlePublish = async () => {
    try {
      setStatus('publishing');
      setShowDialog(false);

      await onPublish();

      setStatus('published');
      toast.success('Portfolio published successfully!');

      if (successRedirectUrl) {
        window.location.href = successRedirectUrl;
      } else {
        // Reset to idle after a delay
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Publish error:', error);
      setStatus('idle');
      toast.error('Failed to publish portfolio');
    }
  };

  const publishIcon = (
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
      <path d="M21 2H3v16h5v4l4-4h4l5-5V2zM16 11H8V8h8v3z" />
    </svg>
  );

  const publishingIcon = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
          className
        )}
        onClick={handlePublishClick}
        disabled={status === 'publishing'}
        {...props}
      >
        {status === 'publishing' ? publishingIcon : publishIcon}
        {status === 'publishing' ? publishingText : publishText}
      </Button>

      {showConfirmation && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmText}</DialogTitle>
              <DialogDescription>
                {publishedPortfolioTitle
                  ? `Publishing this portfolio will unpublish your currently published portfolio "${publishedPortfolioTitle}". Continue?`
                  : confirmDescription}
              </DialogDescription>
            </DialogHeader>

            {validationErrors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  Please fix these issues before publishing:
                </div>
                <ul className="list-disc ml-5 text-amber-700 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {!isPremiumUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
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
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Important Note:
                </div>
                <p className="text-blue-700 text-sm ml-5 mb-2">
                  <strong>Free plan users can only have one published portfolio at a time.</strong> Publishing this portfolio will automatically unpublish any other published portfolio you may have.
                </p>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <Check className="h-5 w-5" />
                Publishing Benefits:
              </div>
              <ul className="list-disc ml-5 text-green-700 text-sm">
                <li>Your portfolio will be visible to the public</li>
                <li>You can share the link with potential employers</li>
                <li>Changes made after publishing will be reflected immediately</li>
              </ul>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">{cancelButtonText}</Button>
              </DialogClose>
              <Button
                onClick={handlePublish}
                disabled={validationErrors.length > 0}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              >
                {confirmButtonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
