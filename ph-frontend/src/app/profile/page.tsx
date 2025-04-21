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
import apiClient, { SocialLinks, User, UserProfile, SkillCategory, Experience, Education, Project, Skill } from '@/lib/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, X, ArrowUpDown, Calendar, Edit, Lock, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
    },
    // New profile fields
    skills: [] as SkillCategory[],
    education: [] as Education[],
    experience: [] as Experience[],
    projects: [] as Project[],
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state to track editing mode
  const [charCount, setCharCount] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');

  // Dialog states for new items
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // States for new items being added
  const [newSkillCategory, setNewSkillCategory] = useState({ name: '', skills: [] as Skill[] });
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 50 });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    githubUrl: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  // Editing states
  const [editIndex, setEditIndex] = useState(-1);
  const [editCategoryIndex, setEditCategoryIndex] = useState(-1);

  // Toggle editing mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If switching from editing to view mode, save changes
      handleSaveProfile();
    }
    setIsEditing(!isEditing);
  };

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
        },
        // Initialize new profile fields
        skills: user.profile?.skills || [],
        education: user.profile?.education || [],
        experience: user.profile?.experience || [],
        projects: user.profile?.projects || [],
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

  // Add new skill category
  const handleAddSkillCategory = () => {
    if (!newSkillCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (newSkillCategory.skills.length === 0) {
      toast.error('Add at least one skill to the category');
      return;
    }

    if (editCategoryIndex >= 0) {
      // Update existing category
      setProfileData(prev => {
        const updatedSkills = [...prev.skills];
        updatedSkills[editCategoryIndex] = { ...newSkillCategory };
        return { ...prev, skills: updatedSkills };
      });
      toast.success('Skill category updated');
    } else {
      // Add new category
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkillCategory }]
      }));
      toast.success('New skill category added');
    }

    // Reset form
    setNewSkillCategory({ name: '', skills: [] });
    setIsSkillsDialogOpen(false);
    setEditCategoryIndex(-1);
  };

  // Add skill to current category
  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    if (editIndex >= 0) {
      // Update existing skill
      setNewSkillCategory(prev => {
        const updatedSkills = [...prev.skills];
        updatedSkills[editIndex] = { ...newSkill };
        return { ...prev, skills: updatedSkills };
      });
      setEditIndex(-1);
    } else {
      // Add new skill
      setNewSkillCategory(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }]
      }));
    }

    // Reset skill form
    setNewSkill({ name: '', proficiency: 50 });
  };

  // Edit skill category
  const handleEditSkillCategory = (index: number) => {
    setEditCategoryIndex(index);
    setNewSkillCategory({ ...profileData.skills[index] });
    setIsSkillsDialogOpen(true);
  };

  // Edit skill within category
  const handleEditSkill = (skillIndex: number) => {
    setEditIndex(skillIndex);
    setNewSkill({ ...newSkillCategory.skills[skillIndex] });
  };

  // Delete skill category
  const handleDeleteSkillCategory = (index: number) => {
    setProfileData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills.splice(index, 1);
      return { ...prev, skills: updatedSkills };
    });
    toast.success('Skill category deleted');
  };

  // Delete skill within category in the dialog
  const handleDeleteSkill = (index: number) => {
    setNewSkillCategory(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills.splice(index, 1);
      return { ...prev, skills: updatedSkills };
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      toast.error('Degree and Institution are required');
      return;
    }

    if (editIndex >= 0) {
      // Update existing education
      setProfileData(prev => {
        const updatedEducation = [...prev.education];
        updatedEducation[editIndex] = { ...newEducation };
        return { ...prev, education: updatedEducation };
      });
      toast.success('Education updated');
    } else {
      // Add new education
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      toast.success('New education added');
    }

    // Reset form
    setNewEducation({
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setIsEducationDialogOpen(false);
    setEditIndex(-1);
  };

  const handleEditEducation = (index: number) => {
    setEditIndex(index);
    setNewEducation({ ...profileData.education[index] });
    setIsEducationDialogOpen(true);
  };

  const handleDeleteEducation = (index: number) => {
    setProfileData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation.splice(index, 1);
      return { ...prev, education: updatedEducation };
    });
    toast.success('Education deleted');
  };

  // Experience handlers
  const handleAddExperience = () => {
    if (!newExperience.title.trim() || !newExperience.company.trim()) {
      toast.error('Job Title and Company are required');
      return;
    }

    if (editIndex >= 0) {
      // Update existing experience
      setProfileData(prev => {
        const updatedExperience = [...prev.experience];
        updatedExperience[editIndex] = { ...newExperience };
        return { ...prev, experience: updatedExperience };
      });
      toast.success('Experience updated');
    } else {
      // Add new experience
      setProfileData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }]
      }));
      toast.success('New experience added');
    }

    // Reset form
    setNewExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setIsExperienceDialogOpen(false);
    setEditIndex(-1);
  };

  const handleEditExperience = (index: number) => {
    setEditIndex(index);
    setNewExperience({ ...profileData.experience[index] });
    setIsExperienceDialogOpen(true);
  };

  const handleDeleteExperience = (index: number) => {
    setProfileData(prev => {
      const updatedExperience = [...prev.experience];
      updatedExperience.splice(index, 1);
      return { ...prev, experience: updatedExperience };
    });
    toast.success('Experience deleted');
  };

  // Project handlers
  const handleAddProject = () => {
    if (!newProject.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (editIndex >= 0) {
      // Update existing project
      setProfileData(prev => {
        const updatedProjects = [...prev.projects];
        updatedProjects[editIndex] = { ...newProject };
        return { ...prev, projects: updatedProjects };
      });
      toast.success('Project updated');
    } else {
      // Add new project
      setProfileData(prev => ({
        ...prev,
        projects: [...prev.projects, { ...newProject }]
      }));
      toast.success('New project added');
    }

    // Reset form
    setNewProject({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      githubUrl: '',
      tags: []
    });
    setNewTag('');
    setIsProjectDialogOpen(false);
    setEditIndex(-1);
  };

  const handleEditProject = (index: number) => {
    setEditIndex(index);
    setNewProject({ ...profileData.projects[index] });
    setIsProjectDialogOpen(true);
  };

  const handleDeleteProject = (index: number) => {
    setProfileData(prev => {
      const updatedProjects = [...prev.projects];
      updatedProjects.splice(index, 1);
      return { ...prev, projects: updatedProjects };
    });
    toast.success('Project deleted');
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
      // console.log("Preparing profile data for update:", {
      //   skills: profileData.skills.length,
      //   education: profileData.education.length,
      //   experience: profileData.experience.length,
      //   projects: profileData.projects.length
      // });

      // Create deep copies of all array data to avoid reference issues
      const updateData = {
        fullName: profileData.fullName,
        profilePicture: profileData.avatar !== `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff` ? profileData.avatar : undefined,
        title: profileData.title,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        socialLinks: profileData.socialLinks ? JSON.parse(JSON.stringify(profileData.socialLinks)) : undefined,

        // Create deep copies of these arrays to ensure they're properly sent
        skills: profileData.skills.length > 0 ? JSON.parse(JSON.stringify(profileData.skills)) : [],
        education: profileData.education.length > 0 ? JSON.parse(JSON.stringify(profileData.education)) : [],
        experience: profileData.experience.length > 0 ? JSON.parse(JSON.stringify(profileData.experience)) : [],
        projects: profileData.projects.length > 0 ? JSON.parse(JSON.stringify(profileData.projects)) : [],
      };

      // console.log("Sending profile update with data:", {
      //   basicInfo: `${updateData.fullName}, ${updateData.title}`,
      //   hasSkills: updateData.skills.length > 0,
      //   hasEducation: updateData.education.length > 0,
      //   hasExperience: updateData.experience.length > 0,
      //   hasProjects: updateData.projects.length > 0,
      // });

      // Call context method to update profile
      const updatedUser = await updateProfile(updateData);
      // console.log("Profile updated successfully:", updatedUser);

      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
      // console.error('Profile update error:', error);
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
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                Update your personal information and how you present yourself on PortfolioHub.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={toggleEditMode}
                disabled={isUpdating}
                className="flex items-center"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to user data, discard changes
                    if (user) {
                      const nameParts = user.fullName.split(' ');
                      const firstName = nameParts[0] || '';
                      const lastName = nameParts.slice(1).join(' ') || '';
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
                        },
                        skills: user.profile?.skills || [],
                        education: user.profile?.education || [],
                        experience: user.profile?.experience || [],
                        projects: user.profile?.projects || [],
                      });
                      setCharCount(user.profile?.bio?.length || 0);
                    }
                    setIsEditing(false);
                  }}
                  className="flex items-center"
                  disabled={isUpdating}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
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
                    {isEditing && (
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
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={!isEditing}
                    />
                    <Button variant="outline" size="sm" onClick={triggerFileUpload} disabled={!isEditing}>
                      Upload New Picture
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveProfilePicture}
                      disabled={!isEditing || !user?.profilePicture || profileData.avatar === `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=6d28d9&color=fff`}
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="social">Social Links</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                          disabled={!isEditing}
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
                            disabled={!isEditing}
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
                          disabled={!isEditing}
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
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-6">
                    <CardHeader>
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>
                          Add your professional skills and rate your proficiency.
                        </CardDescription>
                      </div>
                      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="ml-auto" disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Skill Category
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editCategoryIndex >= 0 ? 'Edit Skill Category' : 'Add Skill Category'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="category-name">Category Name</Label>
                              <Input
                                id="category-name"
                                placeholder="e.g., Frontend, Backend, Design"
                                value={newSkillCategory.name}
                                onChange={(e) => setNewSkillCategory(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Skills in this category</Label>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder="Skill name"
                                    className="w-32"
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-20"
                                    value={newSkill.proficiency}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: parseInt(e.target.value) || 0 }))}
                                  />
                                  <Button size="sm" variant="outline" onClick={handleAddSkill}>
                                    {editIndex >= 0 ? 'Update' : 'Add'}
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {newSkillCategory.skills.map((skill, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div>
                                      <span className="font-medium">{skill.name}</span>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                          className="bg-primary h-1.5 rounded-full"
                                          style={{ width: `${skill.proficiency}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button size="sm" variant="ghost" onClick={() => handleEditSkill(idx)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        </svg>
                                      </Button>
                                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteSkill(idx)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => {
                              setIsSkillsDialogOpen(false);
                              setNewSkillCategory({ name: '', skills: [] });
                              setEditCategoryIndex(-1);
                              setEditIndex(-1);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddSkillCategory}>
                              {editCategoryIndex >= 0 ? 'Update Category' : 'Add Category'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {profileData.skills.length > 0 ? (
                        <div className="space-y-6">
                          {profileData.skills.map((category, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">{category.name}</h3>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditSkillCategory(idx)} disabled={!isEditing}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteSkillCategory(idx)} disabled={!isEditing}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {category.skills.map((skill, skillIdx) => (
                                  <div key={skillIdx} className="p-3 bg-muted rounded-md">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium">{skill.name}</span>
                                      <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${skill.proficiency}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No skills added yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add your professional skills and rate your proficiency to showcase your expertise.
                          </p>
                          <Button onClick={() => setIsSkillsDialogOpen(true)} disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Skills
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>

                  {/* Education Section */}
                  <TabsContent value="education" className="space-y-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>
                          Add your educational background and qualifications.
                        </CardDescription>
                      </div>
                      <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="ml-auto" disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editIndex >= 0 ? 'Edit Education' : 'Add Education'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="degree">Degree / Certificate</Label>
                              <Input
                                id="degree"
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                value={newEducation.degree}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="institution">Institution</Label>
                              <Input
                                id="institution"
                                placeholder="e.g., Stanford University"
                                value={newEducation.institution}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                placeholder="e.g., Stanford, CA"
                                value={newEducation.location}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, location: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                  id="startDate"
                                  placeholder="e.g., 09/2018"
                                  value={newEducation.startDate}
                                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                  id="endDate"
                                  placeholder="e.g., 05/2022 or Present"
                                  value={newEducation.endDate}
                                  onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                placeholder="Describe your studies, achievements, etc."
                                value={newEducation.description || ''}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => {
                              setIsEducationDialogOpen(false);
                              setNewEducation({
                                degree: '',
                                institution: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                description: ''
                              });
                              setEditIndex(-1);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddEducation}>
                              {editIndex >= 0 ? 'Update' : 'Add'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {profileData.education.length > 0 ? (
                        <div className="space-y-4">
                          {profileData.education.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{item.degree}</h3>
                                  <p className="text-muted-foreground">{item.institution}</p>
                                  {item.location && (
                                    <p className="text-sm text-muted-foreground">{item.location}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {item.startDate}
                                      {item.endDate ? ` - ${item.endDate}` : ' - Present'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditEducation(idx)} disabled={!isEditing}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteEducation(idx)} disabled={!isEditing}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              {item.description && (
                                <div className="mt-2 text-sm">
                                  <p>{item.description}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No education added yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add your educational background to showcase your qualifications.
                          </p>
                          <Button onClick={() => setIsEducationDialogOpen(true)} disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>

                  {/* Experience Section */}
                  <TabsContent value="experience" className="space-y-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Experience</CardTitle>
                        <CardDescription>
                          Add your work experience and professional history.
                        </CardDescription>
                      </div>
                      <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="ml-auto" disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editIndex >= 0 ? 'Edit Experience' : 'Add Experience'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="job-title">Job Title</Label>
                              <Input
                                id="job-title"
                                placeholder="e.g., Senior Software Engineer"
                                value={newExperience.title}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company">Company</Label>
                              <Input
                                id="company"
                                placeholder="e.g., Google"
                                value={newExperience.company}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exp-location">Location</Label>
                              <Input
                                id="exp-location"
                                placeholder="e.g., Mountain View, CA or Remote"
                                value={newExperience.location}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="exp-startDate">Start Date</Label>
                                <Input
                                  id="exp-startDate"
                                  placeholder="e.g., 06/2020"
                                  value={newExperience.startDate}
                                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="exp-endDate">End Date</Label>
                                <Input
                                  id="exp-endDate"
                                  placeholder="e.g., 12/2022"
                                  value={newExperience.endDate}
                                  onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                                  disabled={newExperience.current}
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="current-job"
                                checked={newExperience.current}
                                onCheckedChange={(checked) => {
                                  setNewExperience(prev => ({
                                    ...prev,
                                    current: checked,
                                    endDate: checked ? '' : prev.endDate
                                  }));
                                }}
                              />
                              <Label htmlFor="current-job">I currently work here</Label>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exp-description">Description</Label>
                              <Textarea
                                id="exp-description"
                                placeholder="Describe your role, responsibilities, achievements, etc."
                                value={newExperience.description}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => {
                              setIsExperienceDialogOpen(false);
                              setNewExperience({
                                title: '',
                                company: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                current: false,
                                description: ''
                              });
                              setEditIndex(-1);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddExperience}>
                              {editIndex >= 0 ? 'Update' : 'Add'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {profileData.experience.length > 0 ? (
                        <div className="space-y-4">
                          {profileData.experience.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{item.title}</h3>
                                  <p className="text-muted-foreground">{item.company}</p>
                                  {item.location && (
                                    <p className="text-sm text-muted-foreground">{item.location}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {item.startDate}
                                      {item.current ? ' - Present' : item.endDate ? ` - ${item.endDate}` : ''}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditExperience(idx)} disabled={!isEditing}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteExperience(idx)} disabled={!isEditing}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 text-sm">
                                <p>{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No experience added yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add your professional experience to showcase your career history.
                          </p>
                          <Button onClick={() => setIsExperienceDialogOpen(true)} disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>

                  {/* Projects Section */}
                  <TabsContent value="projects" className="space-y-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                          Add your projects, portfolio items, and creative work.
                        </CardDescription>
                      </div>
                      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="ml-auto" disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editIndex >= 0 ? 'Edit Project' : 'Add Project'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="project-title">Project Title</Label>
                              <Input
                                id="project-title"
                                placeholder="e.g., E-commerce Website"
                                value={newProject.title}
                                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="project-description">Description</Label>
                              <Textarea
                                id="project-description"
                                placeholder="Describe the project, technologies used, your role, etc."
                                value={newProject.description}
                                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                className="min-h-[100px] resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="project-image">Image URL</Label>
                              <Input
                                id="project-image"
                                placeholder="https://example.com/image.jpg"
                                value={newProject.imageUrl || ''}
                                onChange={(e) => setNewProject(prev => ({ ...prev, imageUrl: e.target.value }))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Provide a link to an image for your project
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="project-url">Project URL</Label>
                              <Input
                                id="project-url"
                                placeholder="https://example.com"
                                value={newProject.projectUrl || ''}
                                onChange={(e) => setNewProject(prev => ({ ...prev, projectUrl: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="github-url">GitHub URL</Label>
                              <Input
                                id="github-url"
                                placeholder="https://github.com/yourusername/repo"
                                value={newProject.githubUrl || ''}
                                onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tags</Label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {newProject.tags.map((tag, idx) => (
                                  <div key={idx} className="flex items-center bg-muted rounded-full px-3 py-1">
                                    <span className="text-sm">{tag}</span>
                                    <button
                                      type="button"
                                      className="ml-2 text-muted-foreground hover:text-red-500"
                                      onClick={() => {
                                        setNewProject(prev => ({
                                          ...prev,
                                          tags: prev.tags.filter((_, i) => i !== idx)
                                        }));
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Add a tag"
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                      e.preventDefault();
                                      setNewProject(prev => ({
                                        ...prev,
                                        tags: [...prev.tags, newTag.trim()]
                                      }));
                                      setNewTag('');
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (newTag.trim()) {
                                      setNewProject(prev => ({
                                        ...prev,
                                        tags: [...prev.tags, newTag.trim()]
                                      }));
                                      setNewTag('');
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => {
                              setIsProjectDialogOpen(false);
                              setNewProject({
                                title: '',
                                description: '',
                                imageUrl: '',
                                projectUrl: '',
                                githubUrl: '',
                                tags: []
                              });
                              setNewTag('');
                              setEditIndex(-1);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddProject}>
                              {editIndex >= 0 ? 'Update' : 'Add'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {profileData.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {profileData.projects.map((project, idx) => (
                            <div key={idx} className="border rounded-lg overflow-hidden">
                              {project.imageUrl && (
                                <div className="relative h-48">
                                  <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-semibold text-lg">{project.title}</h3>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleEditProject(idx)} disabled={!isEditing}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteProject(idx)} disabled={!isEditing}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{project.description}</p>

                                {project.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {project.tags.map((tag, tagIdx) => (
                                      <span key={tagIdx} className="bg-muted text-xs px-2 py-1 rounded-full">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex mt-4 gap-2">
                                  {project.projectUrl && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                        View Project
                                      </Link>
                                    </Button>
                                  )}
                                  {project.githubUrl && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                        GitHub
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects added yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add your projects to showcase your work and accomplishments.
                          </p>
                          <Button onClick={() => setIsProjectDialogOpen(true)} disabled={!isEditing}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </TabsContent>
                </Tabs>
                {/* Remove Save/Cancel from CardFooter; moved to top Edit Profile button */}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
