import React from 'react';
import Image from 'next/image';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';
import { fixImageUrl } from '@/lib/utils';

interface AboutSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    bio?: string;
    image?: string;
    skills?: string[];
    highlights?: Array<{ title: string; description: string }>;
    ctaText?: string;
    ctaLink?: string;
    variant?: 'standard' | 'with-image' | 'with-highlights' | 'minimal';
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 300, bgColor = '6366f1') => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&size=${size}&background=${bgColor.replace('#', '')}&color=ffffff`;
};

const AboutSection: React.FC<AboutSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'with-image' :
      template.category === 'developer' ? 'with-highlights' : 'standard');

  // Determine alignment
  const alignment = data.alignment || 'left';

  // Get image with fallback, and fix url for next/image
  const aboutImage = fixImageUrl(
    data.image || createPlaceholderImage('About', 300)
  );

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

  // Handle highlight updates
  const handleHighlightUpdate = (index: number, field: string, value: string) => {
    if (onUpdate && editable) {
      const newHighlights = [...(data.highlights || [])];

      if (!newHighlights[index]) {
        newHighlights[index] = { title: '', description: '' };
      }

      newHighlights[index] = {
        ...newHighlights[index],
        [field]: value
      };

      onUpdate({
        ...data,
        highlights: newHighlights
      });
    }
  };

  // Handle adding a new highlight
  const handleAddHighlight = () => {
    if (onUpdate && editable) {
      const newHighlights = [...(data.highlights || []), { title: 'New Highlight', description: 'Description goes here' }];

      onUpdate({
        ...data,
        highlights: newHighlights
      });
    }
  };

  // Handle removing a highlight
  const handleRemoveHighlight = (index: number) => {
    if (onUpdate && editable) {
      const newHighlights = [...(data.highlights || [])];
      newHighlights.splice(index, 1);

      onUpdate({
        ...data,
        highlights: newHighlights
      });
    }
  };

  // Get text alignment classes
  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center':
        return 'text-center items-center';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-left items-start';
    }
  };

  // Render about section based on variant
  const renderAboutSection = () => {
    switch (variant) {
      case 'with-image':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image column */}
            <div className={`relative ${alignment === 'right' ? 'md:order-2' : ''}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {aboutImage && (
                  <Image
                    src={aboutImage}
                    alt="About me"
                    fill
                    className="object-cover"
                  />
                )}
                {editable && (
                  <div className="absolute bottom-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/80 text-xs"
                      onClick={() => {
                        const url = prompt('Enter image URL:', data.image);
                        if (url) handleImageUpdate('image', url);
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Text column */}
            <div className={`flex flex-col ${getAlignmentClasses()}`}>
              <EditableText
                value={data.title || 'About Me'}
                onChange={(value) => handleTextUpdate('title', value)}
                editable={editable}
                className="text-3xl font-bold mb-4"
              />

              {data.subtitle && (
                <EditableText
                  value={data.subtitle}
                  onChange={(value) => handleTextUpdate('subtitle', value)}
                  editable={editable}
                  className="text-xl text-muted-foreground mb-4"
                />
              )}

              <EditableText
                value={data.bio || 'Tell your story here. Share your background, experience, and what drives you. This is your chance to connect with visitors on a personal level.'}
                onChange={(value) => handleTextUpdate('bio', value)}
                editable={editable}
                multiline
                className="text-muted-foreground mb-6"
              />

              {data.ctaText && (
                <Button className="mt-2 self-start">
                  {data.ctaText}
                </Button>
              )}
            </div>
          </div>
        );

      case 'with-highlights':
        return (
          <div className="space-y-8">
            <div className={`flex flex-col ${getAlignmentClasses()}`}>
              <EditableText
                value={data.title || 'About Me'}
                onChange={(value) => handleTextUpdate('title', value)}
                editable={editable}
                className="text-3xl font-bold mb-4"
              />

              {data.subtitle && (
                <EditableText
                  value={data.subtitle}
                  onChange={(value) => handleTextUpdate('subtitle', value)}
                  editable={editable}
                  className="text-xl text-muted-foreground mb-4"
                />
              )}

              <EditableText
                value={data.bio || 'Tell your story here. Share your background, experience, and what drives you. This is your chance to connect with visitors on a personal level.'}
                onChange={(value) => handleTextUpdate('bio', value)}
                editable={editable}
                multiline
                className="text-muted-foreground mb-6"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {(data.highlights || []).map((highlight, index) => (
                <div key={index} className="p-6 border rounded-lg bg-muted/30 relative">
                  {editable && (
                    <button
                      className="absolute top-2 right-2 text-red-500 font-bold p-1 rounded-full hover:bg-red-50"
                      onClick={() => handleRemoveHighlight(index)}
                    >
                      ✕
                    </button>
                  )}
                  <EditableText
                    value={highlight.title || `Highlight ${index + 1}`}
                    onChange={(value) => handleHighlightUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-lg mb-2"
                  />
                  <EditableText
                    value={highlight.description || 'Description'}
                    onChange={(value) => handleHighlightUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground"
                  />
                </div>
              ))}

              {editable && (
                <div
                  className="p-6 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                  onClick={handleAddHighlight}
                >
                  <span className="text-muted-foreground">+ Add Highlight</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={`max-w-2xl mx-auto ${getAlignmentClasses()}`}>
            <EditableText
              value={data.title || 'About Me'}
              onChange={(value) => handleTextUpdate('title', value)}
              editable={editable}
              className="text-3xl font-bold mb-4"
            />

            <EditableText
              value={data.bio || 'Tell your story here. Share your background, experience, and what drives you. This is your chance to connect with visitors on a personal level.'}
              onChange={(value) => handleTextUpdate('bio', value)}
              editable={editable}
              multiline
              className="text-muted-foreground"
            />
          </div>
        );

      case 'standard':
      default:
        return (
          <div className={`flex flex-col ${getAlignmentClasses()}`}>
            <EditableText
              value={data.title || 'About Me'}
              onChange={(value) => handleTextUpdate('title', value)}
              editable={editable}
              className="text-3xl font-bold mb-4"
            />

            {data.subtitle && (
              <EditableText
                value={data.subtitle}
                onChange={(value) => handleTextUpdate('subtitle', value)}
                editable={editable}
                className="text-xl text-muted-foreground mb-4"
              />
            )}

            <EditableText
              value={data.bio || 'Tell your story here. Share your background, experience, and what drives you. This is your chance to connect with visitors on a personal level.'}
              onChange={(value) => handleTextUpdate('bio', value)}
              editable={editable}
              multiline
              className="text-muted-foreground mb-6"
            />

            {(data.skills && data.skills.length > 0) && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.ctaText && (
              <Button className="mt-6 self-start">
                {data.ctaText}
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="about"
    >
      <div className="container px-4 md:px-6">
        {renderAboutSection()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">About Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="standard">Standard</option>
            <option value="with-image">With Image</option>
            <option value="with-highlights">With Highlights</option>
            <option value="minimal">Minimal</option>
          </select>

          <div className="text-xs font-medium mb-1">Alignment</div>
          <select
            value={alignment}
            onChange={(e) => onUpdate?.({ ...data, alignment: e.target.value })}
            className="text-xs p-1 border rounded w-full"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}
    </section>
  );
};

export default AboutSection;
