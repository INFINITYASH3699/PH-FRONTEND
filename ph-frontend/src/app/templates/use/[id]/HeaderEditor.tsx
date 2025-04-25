import { useState, useRef } from 'react';
import { PlusCircle, X, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface HeaderEditorProps {
  data: {
    title?: string;
    subtitle?: string;
    profileImage?: string;
    coverImage?: string;
    navigation?: string[];
  };
  onChange: (data: any) => void;
}

export default function HeaderEditor({ data, onChange }: HeaderEditorProps) {
  const [newNavItem, setNewNavItem] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default values if data is empty
  const headerData = {
    title: data?.title || 'Your Name',
    subtitle: data?.subtitle || 'Your Profession',
    profileImage: data?.profileImage || '',
    coverImage: data?.coverImage || '',
    navigation: data?.navigation || ['Home', 'About', 'Projects', 'Contact']
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...headerData,
      [field]: value
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, 'profile');

      if (result.success && result.image?.url) {
        handleInputChange('profileImage', result.image.url);
        toast.success('Profile image uploaded successfully');
      } else {
        toast.error('Failed to upload profile image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle navigation item addition
  const handleAddNavItem = () => {
    if (!newNavItem.trim()) return;

    const updatedNav = [...headerData.navigation, newNavItem.trim()];
    onChange({
      ...headerData,
      navigation: updatedNav
    });
    setNewNavItem('');
  };

  // Handle navigation item removal
  const handleRemoveNavItem = (index: number) => {
    const updatedNav = [...headerData.navigation];
    updatedNav.splice(index, 1);
    onChange({
      ...headerData,
      navigation: updatedNav
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="header-title">Name/Title</Label>
        <Input
          id="header-title"
          value={headerData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="John Doe"
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed as the main heading in your header section
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="header-subtitle">Subtitle/Role</Label>
        <Input
          id="header-subtitle"
          value={headerData.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          placeholder="Software Developer"
        />
        <p className="text-xs text-muted-foreground">
          Your professional title or a short tagline
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-image">Profile Image</Label>
        <div className="flex gap-2">
          <Input
            id="profile-image"
            value={headerData.profileImage}
            onChange={(e) => handleInputChange('profileImage', e.target.value)}
            placeholder="https://example.com/your-image.jpg"
          />
          <Button
            variant="outline"
            size="icon"
            title="Upload Image"
            onClick={handleUploadButtonClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter an image URL or upload a file (recommended size: 500x500px)
        </p>
        {headerData.profileImage && (
          <div className="mt-2 relative w-16 h-16 rounded-full overflow-hidden border">
            <img
              src={headerData.profileImage}
              alt="Profile Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/150?text=Profile';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover-image">Cover/Background Image URL</Label>
        <div className="flex gap-2">
          <Input
            id="cover-image"
            value={headerData.coverImage}
            onChange={(e) => handleInputChange('coverImage', e.target.value)}
            placeholder="https://example.com/cover-image.jpg"
          />
          <Button variant="outline" size="icon" title="Upload Image">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {headerData.coverImage && (
          <div className="mt-2 relative h-24 rounded-md overflow-hidden border">
            <img
              src={headerData.coverImage}
              alt="Cover Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Cover+Image';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Navigation Menu Items</Label>
        <div className="flex flex-wrap gap-2">
          {headerData.navigation.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveNavItem(i)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={newNavItem}
            onChange={(e) => setNewNavItem(e.target.value)}
            placeholder="Add navigation item"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNavItem();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddNavItem}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          These links will appear in your header navigation menu
        </p>
      </div>
    </div>
  );
}
