'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UserIcon } from 'lucide-react';

export interface FetchProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onFetch: () => Promise<void>;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fetchText?: string;
  fetchingText?: string;
}

export function FetchProfileButton({
  onFetch,
  className,
  variant = 'outline',
  size = 'default',
  fetchText = 'Fetch from Profile',
  fetchingText = 'Fetching...',
  ...props
}: FetchProfileButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'fetching'>('idle');

  const handleFetch = async () => {
    try {
      setStatus('fetching');
      await onFetch();
      toast.success('Profile details fetched successfully!');
      setStatus('idle');
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch profile details');
      setStatus('idle');
    }
  };

  const fetchIcon = (
    <UserIcon className="h-4 w-4 mr-2" />
  );

  const fetchingIcon = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
  );

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
      {status === 'fetching' ? fetchingText : fetchText}
    </Button>
  );
}
