'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// Define about content interface
interface AboutContent {
  title?: string;
  bio?: string;
  profileImage?: string;
}

interface AboutEditorProps {
  content: AboutContent;
  onSave: (content: AboutContent) => void;
  isLoading?: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AboutEditor({ content, onSave, isLoading = false, onImageUpload }: AboutEditorProps) {
  const [aboutInfo, setAboutInfo] = useState<AboutContent>(content || {
    title: 'About Me',
    bio: '',
    profileImage: ''
  });

  // Handle basic input changes
  const handleInputChange = (field: keyof AboutContent, value: string) => {
    const updatedAboutInfo = { ...aboutInfo, [field]: value };
    setAboutInfo(updatedAboutInfo);
    onSave(updatedAboutInfo);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    const updatedAboutInfo = { ...aboutInfo, profileImage: '' };
    setAboutInfo(updatedAboutInfo);
    onSave(updatedAboutInfo);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">About Section</h3>
        <p className="text-muted-foreground">
          Tell visitors about yourself. This is typically the first section visitors will see.
        </p>
      </div>

      {/* About Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <Input
              placeholder="About Me"
              value={aboutInfo.title || 'About Me'}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              className="min-h-32"
              placeholder="Write something about yourself..."
              value={aboutInfo.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Introduce yourself, your expertise, and what makes you unique.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {aboutInfo.profileImage ? (
                  <Image
                    src={aboutInfo.profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 text-muted-foreground"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="profileImage" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Upload Image
                  </div>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageUpload}
                  />
                </label>
                {aboutInfo.profileImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
