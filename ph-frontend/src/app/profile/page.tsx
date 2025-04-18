'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthContext';
import apiClient, { SocialLinks, User, UserProfile } from '@/lib/apiClient';

export default function ProfilePage() {
  const { user, isLoading, updateProfile, uploadProfilePicture } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    avatar: 'https://ui-avatars.com/api/?background=6d28d9&color=fff',
    title: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Split fullName into firstName and lastName
      const nameParts = user.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Initialize form data with user data
      setProfileData({
        fullName: user.fullName,
        firstName,
        lastName,
        email: user.email,
        username: user.username,
        avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6d28d9&color=fff`,
        title: user.profile?.title || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        socialLinks: {
          github: user.profile?.socialLinks?.github || '',
          twitter: user.profile?.socialLinks?.twitter || '',
          linkedin: user.profile?.socialLinks?.linkedin || '',
          instagram: user.profile?.socialLinks?.instagram || '',
        }
      });

      // Update char count for bio
      setCharCount(user.profile?.bio?.length || 0);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'bio') {
      setCharCount(value.length);
    }

    // Handle social links
    if (['github', 'twitter', 'linkedin', 'instagram'].includes(id)) {
      setProfileData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [id]: value
        }
      }));
    } else if (id === 'first-name' || id === 'last-name') {
      // Special handling for first/last name that will update fullName
      const firstName = id === 'first-name' ? value : profileData.firstName;
      const lastName = id === 'last-name' ? value : profileData.lastName;
      setProfileData(prev => ({
        ...prev,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim()
      }));
    } else {
      // For other fields, update them directly
      setProfileData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      // Create a local object URL for immediate display
      const localUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        avatar: localUrl
      }));

      // Upload the file to the server
      toast.loading('Uploading profile picture...');
      const uploadedUrl = await uploadProfilePicture(file);

      // Update with the real URL from the server
      setProfileData(prev => ({
        ...prev,
        avatar: uploadedUrl
      }));

      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      setProfileData(prev => ({
        ...prev,
        avatar: user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff`
      }));

      const message = error instanceof Error ? error.message : 'Failed to upload profile picture';
      toast.error(message);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff`;

      // Update UI immediately
      setProfileData(prev => ({
        ...prev,
        avatar: defaultAvatar
      }));

      // Update on server
      await updateProfile({ profilePicture: '' });
      toast.success('Profile picture removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove profile picture';
      toast.error(message);

      // Restore previous avatar if there's an error
      if (user?.profilePicture) {
        setProfileData(prev => ({
          ...prev,
          avatar: user.profilePicture || ''
        }));
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      // Prepare data for API
      const updateData = {
        fullName: profileData.fullName,
        profilePicture: profileData.avatar !== `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff` ? profileData.avatar : undefined,
        title: profileData.title,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        socialLinks: profileData.socialLinks
      };

      // Call context method to update profile
      await updateProfile(updateData);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your profile</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view this page</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information and how you present yourself on PortfolioHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Your profile picture will be used on your profile and throughout the site.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <Image
                      src={profileData.avatar}
                      alt={profileData.fullName}
                      fill
                      className="rounded-full object-cover"
                    />
                    <button className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-md" onClick={triggerFileUpload}>
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
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                      Upload New Picture
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveProfilePicture}
                      disabled={!user?.profilePicture || profileData.avatar === `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff`}
                    >
                      Remove Picture
                    </Button>
                  </div>
                </CardContent>
                <CardHeader className="border-t mt-4">
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{profileData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm">@{profileData.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Password</span>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    This information will be displayed publicly on your profile and portfolio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First Name
                      </label>
                      <Input
                        id="first-name"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last Name
                      </label>
                      <Input
                        id="last-name"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Professional Title
                    </label>
                    <Input
                      id="title"
                      value={profileData.title}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      For example: Full Stack Developer, UX Designer, Photographer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <div className="relative">
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        className="min-h-32 resize-none"
                        maxLength={500}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {charCount} / 500
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Write a short introduction about yourself, your skills, and expertise.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      City, Country or Remote
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium">
                      Website
                    </label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>

                <CardHeader className="border-t mt-4">
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>
                    Connect your social accounts to display them on your portfolio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="github" className="text-sm font-medium flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.48C19.138 20.162 22 16.417 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GitHub
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        github.com/
                      </div>
                      <Input
                        id="github"
                        className="pl-24"
                        value={profileData.socialLinks.github}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="twitter" className="text-sm font-medium flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-[#1DA1F2]"
                      >
                        <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 4.9 4.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z" />
                      </svg>
                      Twitter
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        twitter.com/
                      </div>
                      <Input
                        id="twitter"
                        className="pl-24"
                        value={profileData.socialLinks.twitter}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-[#0077B5]"
                      >
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                      </svg>
                      LinkedIn
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        linkedin.com/in/
                      </div>
                      <Input
                        id="linkedin"
                        className="pl-28"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-[#E1306C]"
                      >
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.054-.059 1.37-.059 4.04 0 2.672.01 2.987.059 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.047 1.37.059 4.04.059 2.672 0 2.987-.01 4.04-.059.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.054.059-1.37.059-4.04 0-2.672-.01-2.987-.059-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.054-.047-1.37-.059-4.04-.059zm0 3.064a5.136 5.136 0 15.134 5.137 5.136 5.136 0 01-5.134 5.134 5.136 5.136 0 010-10.27zm0 8.468a3.334 3.334 0 100-6.67 3.334 3.334 0 000 6.67zm6.538-8.669a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                      </svg>
                      Instagram
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        instagram.com/
                      </div>
                      <Input
                        id="instagram"
                        className="pl-28"
                        value={profileData.socialLinks.instagram}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-4 border-t mt-4 pt-6">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
