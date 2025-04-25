'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UserIcon } from 'lucide-react';
import apiClient from '@/lib/apiClient';

export interface FetchProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onFetch: (data: any) => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fetchText?: string;
  fetchingText?: string;
  section?: string; // Which profile section to fetch (skills, experience, education, etc.)
}

export function FetchProfileButton({
  onFetch,
  className,
  variant = 'outline',
  size = 'default',
  fetchText = 'Fetch from Profile',
  fetchingText = 'Fetching...',
  section,
  ...props
}: FetchProfileButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'fetching'>('idle');

  const handleFetch = async () => {
    try {
      setStatus('fetching');

      // Fetch user profile data
      const response = await apiClient.user.getProfile();

      if (!response || !response.user) {
        throw new Error('Failed to fetch profile data');
      }

      // Pass the user data to the onFetch callback
      await onFetch(response.user);

      toast.success('Profile details fetched successfully!');
      setStatus('idle');
    } catch (error) {
      console.error('Fetch error:', error);
      let errorMessage = 'Failed to fetch profile details';

      // Check if it's an authentication issue or other known errors
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Please log in to access your profile data';
        } else if (error.message.includes('Not Found') || error.message.includes('404')) {
          errorMessage = 'Profile not found. Have you added profile information?';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again';
        } else {
          errorMessage = `Failed to fetch profile data: ${error.message}`;
        }
      }

      toast.error(errorMessage);
      setStatus('idle');
    }
  };

  const fetchIcon = (
    <UserIcon className="h-4 w-4 mr-2" />
  );

  const fetchingIcon = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
  );

  // Generate the button text based on section prop
  const buttonText = section
    ? `${status === 'fetching' ? fetchingText : `Auto-fill ${section}`}`
    : `${status === 'fetching' ? fetchingText : fetchText}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        status === 'fetching' ? 'opacity-80' : '',
        className
      )}
      onClick={handleFetch}
      disabled={status === 'fetching'}
      {...props}
    >
      {status === 'fetching' ? fetchingIcon : fetchIcon}
      {buttonText}
    </Button>
  );
}
