'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthContext';

interface FetchProfileButtonProps {
  onFetch: (profileData: any) => void;
  section: 'about' | 'skills' | 'experience' | 'education' | 'projects' | 'all';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  disabled?: boolean;
}

export function FetchProfileButton({
  onFetch,
  section,
  variant = 'outline',
  disabled = false,
}: FetchProfileButtonProps) {
  const { user, isLoading } = useAuth();

  const handleFetchFromProfile = () => {
    if (!user || !user.profile) {
      toast.error('Your profile is empty. Please add information to your profile first.');
      return;
    }

    try {
      let dataToFetch;

      switch (section) {
        case 'about':
          dataToFetch = {
            title: 'About Me',
            bio: user.profile.bio || '',
            profileImage: user.profilePicture || '',
          };
          break;
        case 'skills':
          if (!user.profile.skills || user.profile.skills.length === 0) {
            toast.error('No skills found in your profile.');
            return;
          }
          dataToFetch = {
            categories: [...user.profile.skills],
          };
          break;
        case 'experience':
          if (!user.profile.experience || user.profile.experience.length === 0) {
            toast.error('No experience found in your profile.');
            return;
          }
          dataToFetch = {
            items: [...user.profile.experience],
          };
          break;
        case 'education':
          if (!user.profile.education || user.profile.education.length === 0) {
            toast.error('No education found in your profile.');
            return;
          }
          dataToFetch = {
            items: [...user.profile.education],
          };
          break;
        case 'projects':
          if (!user.profile.projects || user.profile.projects.length === 0) {
            toast.error('No projects found in your profile.');
            return;
          }
          dataToFetch = {
            items: [...user.profile.projects],
          };
          break;
        case 'all':
          dataToFetch = {
            about: {
              title: 'About Me',
              bio: user.profile.bio || '',
              profileImage: user.profilePicture || '',
            },
            skills: user.profile.skills && user.profile.skills.length > 0
              ? { categories: [...user.profile.skills] }
              : undefined,
            experience: user.profile.experience && user.profile.experience.length > 0
              ? { items: [...user.profile.experience] }
              : undefined,
            education: user.profile.education && user.profile.education.length > 0
              ? { items: [...user.profile.education] }
              : undefined,
            projects: user.profile.projects && user.profile.projects.length > 0
              ? { items: [...user.profile.projects] }
              : undefined,
          };
          break;
        default:
          toast.error('Invalid section specified.');
          return;
      }

      onFetch(dataToFetch);
      toast.success(`Successfully fetched ${section === 'all' ? 'profile data' : section + ' data'} from your profile.`);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to fetch profile data. Please try again.');
    }
  };

  return (
    <Button
      onClick={handleFetchFromProfile}
      variant={variant}
      disabled={disabled || isLoading || !user}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {section === 'all' ? 'Fetch From Profile' : `Fetch ${section.charAt(0).toUpperCase() + section.slice(1)}`}
    </Button>
  );
}
