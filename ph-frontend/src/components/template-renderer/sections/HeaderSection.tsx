import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable/EditableText';
import { fixImageUrl } from '@/lib/utils';

interface HeaderSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    profileImage?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
    navigation?: string[];
    socialLinks?: Record<string, string>;
    variant?: 'centered' | 'split' | 'minimal' | 'hero';
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 200, bgColor = '6366f1') => {
  // Use ui-avatars.com which is more reliable than placehold.co
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&size=${size}&background=${bgColor.replace('#', '')}&color=ffffff`;
};

const HeaderSection: React.FC<HeaderSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine the variant to use, default to template category or 'centered'
  const variant = data.variant ||
    (template.category === 'photographer' ? 'hero' :
     template.category === 'designer' ? 'split' : 'centered');

  // Get profile image with fallback and fix URL
  const profileImage = fixImageUrl(
    data.profileImage || createPlaceholderImage(
      data.title?.charAt(0) || 'P',
      200
    )
  );

  // Get background image URL fixed
  const backgroundImage = fixImageUrl(data.backgroundImage || '');

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle image updates
  const handleImageUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Render different header variants
  const renderHeader = () => {
    switch (variant) {
      case 'hero':
        // Full-width hero style header (good for photographers)
        return (
          <div className="relative min-h-[70vh] flex items-center justify-center text-white">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 overflow-hidden">
              {backgroundImage ? (
                <Image
                  src={backgroundImage}
                  alt="Header background"
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600" />
              )}
              <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl px-4 md:px-8">
              <EditableText
                value={data.title || 'Your Name'}
                onChange={(value) => handleTextUpdate('title', value)}
                editable={editable}
                className="text-4xl md:text-6xl font-bold mb-4 text-white"
              />
              <EditableText
                value={data.subtitle || 'Photographer & Visual Storyteller'}
                onChange={(value) => handleTextUpdate('subtitle', value)}
                editable={editable}
                className="text-xl md:text-2xl mb-8 text-white/90"
              />
              {data.ctaText && (
                <Button
                  className="bg-white text-indigo-600 hover:bg-white/90"
                  onClick={() => window.location.href = data.ctaLink || '#'}
                >
                  {data.ctaText}
                </Button>
              )}
            </div>
          </div>
        );

      case 'split':
        // Split layout (image on one side, text on other)
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
            {/* Image Side */}
            <div className="bg-indigo-50 flex items-center justify-center p-8">
              <div className="relative w-48 h-48 md:w-80 md:h-80 rounded-full overflow-hidden bg-indigo-100">
                {profileImage && (
                  <Image
                    src={profileImage}
                    alt={data.title || 'Profile'}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Text Side */}
            <div className="flex flex-col justify-center p-8">
              <EditableText
                value={data.title || 'Your Name'}
                onChange={(value) => handleTextUpdate('title', value)}
                editable={editable}
                className="text-4xl font-bold mb-4"
              />
              <EditableText
                value={data.subtitle || 'Designer & Creative Director'}
                onChange={(value) => handleTextUpdate('subtitle', value)}
                editable={editable}
                className="text-xl text-muted-foreground mb-6"
              />

              {/* Social Links */}
              {data.socialLinks && Object.keys(data.socialLinks).length > 0 && (
                <div className="flex space-x-4 mt-4">
                  {Object.entries(data.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'minimal':
        // Minimal header with just text
        return (
          <div className="py-12 md:py-24 border-b">
            <div className="container px-4 md:px-8">
              <EditableText
                value={data.title || 'Your Name'}
                onChange={(value) => handleTextUpdate('title', value)}
                editable={editable}
                className="text-4xl font-bold mb-2"
              />
              <EditableText
                value={data.subtitle || 'Developer & Problem Solver'}
                onChange={(value) => handleTextUpdate('subtitle', value)}
                editable={editable}
                className="text-xl text-muted-foreground"
              />
            </div>
          </div>
        );

      case 'centered':
      default:
        // Standard centered header
        return (
          <div className="py-20 text-center">
            <div className="container px-4 md:px-8">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-8 bg-indigo-100">
                  {profileImage && (
                    <Image
                      src={profileImage}
                      alt={data.title || 'Profile'}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>

                {/* Name & Title */}
                <EditableText
                  value={data.title || 'Your Name'}
                  onChange={(value) => handleTextUpdate('title', value)}
                  editable={editable}
                  className="text-4xl font-bold mb-4"
                />
                <EditableText
                  value={data.subtitle || 'Full Stack Developer'}
                  onChange={(value) => handleTextUpdate('subtitle', value)}
                  editable={editable}
                  className="text-xl text-muted-foreground mb-6"
                />

                {/* Navigation */}
                {data.navigation && data.navigation.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {data.navigation.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.toLowerCase()}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <header
      className="relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
    >
      {renderHeader()}

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-20">
          <div className="text-xs font-medium mb-1">Header Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full"
          >
            <option value="centered">Centered</option>
            <option value="split">Split</option>
            <option value="minimal">Minimal</option>
            <option value="hero">Hero</option>
          </select>
        </div>
      )}
    </header>
  );
};

export default HeaderSection;
