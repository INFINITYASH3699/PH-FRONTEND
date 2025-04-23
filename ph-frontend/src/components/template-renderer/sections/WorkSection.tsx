import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable/EditableText';
import FileUpload from '@/components/ui/file-upload';

interface WorkSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    works?: Array<{
      title: string;
      description: string;
      client?: string;
      year?: string;
      image?: string;
      link?: string;
      tags?: string[];
      category?: string;
    }>;
    variant?: 'grid' | 'masonry' | 'carousel' | 'list';
    columns?: '2' | '3' | '4';
    showTags?: boolean;
    showFilters?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 400, bgColor = '6366f1') => {
  return `https://placehold.co/${size}x${size}/${bgColor}/ffffff?text=${encodeURIComponent(text)}`;
};

const WorkSection: React.FC<WorkSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Add upload loading state
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'masonry' :
      template.category === 'photographer' ? 'grid' : 'list');

  // Determine columns
  const columns = data.columns || '3';

  // Ensure we have works array
  const works = data.works || [];

  // Filter categories for the filter UI
  const categories = React.useMemo(() => {
    if (!works.length) return [];
    const allCategories = works
      .map(work => work.category)
      .filter(Boolean) as string[];
    return Array.from(new Set(allCategories));
  }, [works]);

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle work update
  const handleWorkUpdate = (index: number, field: string, value: string) => {
    if (onUpdate && editable) {
      const newWorks = [...works];

      if (!newWorks[index]) {
        newWorks[index] = { title: '', description: '' };
      }

      newWorks[index] = {
        ...newWorks[index],
        [field]: value
      };

      onUpdate({
        ...data,
        works: newWorks
      });
    }
  };

  // Handle image update for a work with proper file upload
  const handleImageUpdate = (index: number, result: { url: string; publicId: string }) => {
    if (onUpdate && editable) {
      const newWorks = [...works];

      if (!newWorks[index]) {
        newWorks[index] = { title: '', description: '' };
      }

      newWorks[index] = {
        ...newWorks[index],
        image: result.url
      };

      onUpdate({
        ...data,
        works: newWorks
      });

      // Clear uploading state
      setUploadingImageIndex(null);
    }
  };

  // Handle image upload error
  const handleImageUploadError = (error: string) => {
    console.error("Image upload error:", error);
    setUploadingImageIndex(null);
  };

  // Handle adding a new work
  const handleAddWork = () => {
    if (onUpdate && editable) {
      const newWorks = [
        ...works,
        {
          title: 'New Project',
          description: 'Project description goes here',
          client: 'Client Name',
          year: new Date().getFullYear().toString(),
          image: createPlaceholderImage('Work'),
          category: categories.length > 0 ? categories[0] : 'Design',
          tags: ['design', 'branding']
        }
      ];

      onUpdate({
        ...data,
        works: newWorks
      });
    }
  };

  // Handle removing a work
  const handleRemoveWork = (index: number) => {
    if (onUpdate && editable) {
      const newWorks = [...works];
      newWorks.splice(index, 1);

      onUpdate({
        ...data,
        works: newWorks
      });
    }
  };

  // Handle adding a tag to a work
  const handleAddTag = (workIndex: number) => {
    if (onUpdate && editable) {
      const newWorks = [...works];
      const work = { ...newWorks[workIndex] };
      const tags = [...(work.tags || [])];

      const newTag = prompt('Enter new tag:');
      if (newTag) {
        tags.push(newTag);
        work.tags = tags;
        newWorks[workIndex] = work;

        onUpdate({
          ...data,
          works: newWorks
        });
      }
    }
  };

  // Handle removing a tag from a work
  const handleRemoveTag = (workIndex: number, tagIndex: number) => {
    if (onUpdate && editable) {
      const newWorks = [...works];
      const work = { ...newWorks[workIndex] };
      const tags = [...(work.tags || [])];

      tags.splice(tagIndex, 1);
      work.tags = tags;
      newWorks[workIndex] = work;

      onUpdate({
        ...data,
        works: newWorks
      });
    }
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (onUpdate && editable) {
      const newCategory = prompt('Enter new category name:');
      if (newCategory && !categories.includes(newCategory)) {
        const firstWorkWithoutCategory = works.findIndex(work => !work.category);
        if (firstWorkWithoutCategory >= 0) {
          handleWorkUpdate(firstWorkWithoutCategory, 'category', newCategory);
        } else {
          // If all works have categories, update the first one
          if (works.length > 0) {
            handleWorkUpdate(0, 'category', newCategory);
          }
        }
      }
    }
  };

  // Get column class based on columns setting
  const getColumnClass = () => {
    switch (columns) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '4':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case '3':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Render works based on variant
  const renderWorks = () => {
    switch (variant) {
      case 'grid':
        return (
          <div className={`grid ${getColumnClass()} gap-6`}>
            {works.map((work, index) => (
              <div key={index} className="overflow-hidden rounded-lg bg-muted/30 relative group">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 bg-white/80 rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveWork(index)}
                  >
                    ✕
                  </button>
                )}
                <div className="relative aspect-[4/3] bg-muted">
                  {work.image ? (
                    <Image
                      src={work.image}
                      alt={work.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {editable && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileUpload
                        onUploadComplete={(result) => handleImageUpdate(index, result)}
                        onUploadError={handleImageUploadError}
                        buttonText="Change Image"
                        uploading={uploadingImageIndex === index}
                        variant="secondary"
                        className="bg-white/80 text-xs"
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <EditableText
                    value={work.title}
                    onChange={(value) => handleWorkUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-lg mb-1"
                  />

                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    {work.client && (
                      <EditableText
                        value={work.client}
                        onChange={(value) => handleWorkUpdate(index, 'client', value)}
                        editable={editable}
                        className="font-medium"
                      />
                    )}
                    {work.year && (
                      <EditableText
                        value={work.year}
                        onChange={(value) => handleWorkUpdate(index, 'year', value)}
                        editable={editable}
                      />
                    )}
                  </div>

                  {data.showTags !== false && work.tags && work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {work.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                          {editable && (
                            <button
                              className="text-red-500 ml-1 text-xs"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/70"
                          onClick={() => handleAddTag(index)}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  <EditableText
                    value={work.description}
                    onChange={(value) => handleWorkUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground text-sm"
                  />
                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                  {editable && !work.link && (
                    <button
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                      onClick={() => {
                        const url = prompt('Enter project URL:');
                        if (url) handleWorkUpdate(index, 'link', url);
                      }}
                    >
                      + Add Project Link
                    </button>
                  )}
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="aspect-[4/3] border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddWork}
              >
                <span className="text-muted-foreground">+ Add Work</span>
              </div>
            )}
          </div>
        );

      case 'masonry':
        // For masonry we'll use a simple responsive implementation
        return (
          <div className={`grid ${getColumnClass()} gap-6`}>
            {works.map((work, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-lg bg-muted/30 relative group ${
                  index % 3 === 0 ? 'row-span-2' : ''
                }`}
              >
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 bg-white/80 rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveWork(index)}
                  >
                    ✕
                  </button>
                )}
                <div className={`relative ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'} bg-muted`}>
                  {work.image ? (
                    <Image
                      src={work.image}
                      alt={work.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {editable && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileUpload
                        onUploadComplete={(result) => handleImageUpdate(index, result)}
                        onUploadError={handleImageUploadError}
                        buttonText="Change Image"
                        uploading={uploadingImageIndex === index}
                        variant="secondary"
                        className="bg-white/80 text-xs"
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <EditableText
                    value={work.title}
                    onChange={(value) => handleWorkUpdate(index, 'title', value)}
                    editable={editable}
                    className="font-bold text-lg"
                  />
                  {work.category && (
                    <div className="text-sm text-primary mb-1">
                      <EditableText
                        value={work.category}
                        onChange={(value) => handleWorkUpdate(index, 'category', value)}
                        editable={editable}
                      />
                    </div>
                  )}
                  <EditableText
                    value={work.description}
                    onChange={(value) => handleWorkUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground text-sm"
                  />
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="aspect-square border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddWork}
              >
                <span className="text-muted-foreground">+ Add Work</span>
              </div>
            )}
          </div>
        );

      case 'list':
      default:
        return (
          <div className="space-y-12">
            {works.map((work, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-8 relative group">
                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 text-red-500 bg-white/80 rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveWork(index)}
                  >
                    ✕
                  </button>
                )}
                {work.image ? (
                  <div className="relative w-full md:w-1/3 h-64 rounded-lg bg-muted overflow-hidden">
                    <Image
                      src={work.image}
                      alt={work.title}
                      fill
                      className="object-cover"
                    />
                    {editable && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileUpload
                          onUploadComplete={(result) => handleImageUpdate(index, result)}
                          onUploadError={handleImageUploadError}
                          buttonText="Change Image"
                          uploading={uploadingImageIndex === index}
                          variant="secondary"
                          className="bg-white/80 text-xs"
                        />
                      </div>
                    )}
                  </div>
                ) : editable ? (
                  <div className="relative w-full md:w-1/3 h-64 rounded-lg bg-muted flex items-center justify-center">
                    <FileUpload
                      onUploadComplete={(result) => handleImageUpdate(index, result)}
                      onUploadError={handleImageUploadError}
                      buttonText="Add Image"
                      uploading={uploadingImageIndex === index}
                      variant="secondary"
                    />
                  </div>
                ) : null}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <EditableText
                      value={work.title}
                      onChange={(value) => handleWorkUpdate(index, 'title', value)}
                      editable={editable}
                      className="font-bold text-2xl"
                    />
                    {work.year && (
                      <span className="text-muted-foreground">
                        <EditableText
                          value={work.year}
                          onChange={(value) => handleWorkUpdate(index, 'year', value)}
                          editable={editable}
                        />
                      </span>
                    )}
                  </div>

                  {work.client && (
                    <div className="text-primary font-medium mb-3">
                      <span className="text-muted-foreground mr-2">Client:</span>
                      <EditableText
                        value={work.client}
                        onChange={(value) => handleWorkUpdate(index, 'client', value)}
                        editable={editable}
                      />
                    </div>
                  )}

                  {work.category && (
                    <div className="text-sm text-muted-foreground mb-3">
                      <span className="mr-2">Category:</span>
                      <EditableText
                        value={work.category}
                        onChange={(value) => handleWorkUpdate(index, 'category', value)}
                        editable={editable}
                        className="font-medium text-primary"
                      />
                    </div>
                  )}

                  {data.showTags !== false && work.tags && work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {work.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                          {editable && (
                            <button
                              className="text-red-500 ml-1 text-xs"
                              onClick={() => handleRemoveTag(index, tagIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/70"
                          onClick={() => handleAddTag(index)}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}

                  <EditableText
                    value={work.description}
                    onChange={(value) => handleWorkUpdate(index, 'description', value)}
                    editable={editable}
                    multiline
                    className="text-muted-foreground"
                  />

                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                  {editable && !work.link && (
                    <button
                      className="inline-block mt-4 text-primary hover:underline"
                      onClick={() => {
                        const url = prompt('Enter project URL:');
                        if (url) handleWorkUpdate(index, 'link', url);
                      }}
                    >
                      + Add Project Link
                    </button>
                  )}
                </div>
              </div>
            ))}
            {editable && (
              <div
                className="p-6 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddWork}
              >
                <span className="text-muted-foreground">+ Add Work</span>
              </div>
            )}
          </div>
        );
    }
  };

  // Render filters for categories
  const renderFilters = () => {
    if (!data.showFilters || categories.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 rounded-full bg-primary text-white text-sm">
            All
          </button>
          {categories.map((category, index) => (
            <button
              key={index}
              className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-muted/70"
            >
              {category}
            </button>
          ))}
          {editable && (
            <button
              className="px-4 py-2 rounded-full border border-dashed text-muted-foreground text-sm hover:bg-muted/20"
              onClick={handleAddCategory}
            >
              + Add Category
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="work"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10 text-center">
          <EditableText
            value={data.title || 'My Work'}
            onChange={(value) => handleTextUpdate('title', value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />
          {data.subtitle && (
            <EditableText
              value={data.subtitle}
              onChange={(value) => handleTextUpdate('subtitle', value)}
              editable={editable}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            />
          )}
        </div>

        {renderFilters()}
        {renderWorks()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Work Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="list">List</option>
          </select>

          <div className="text-xs font-medium mb-1">Columns</div>
          <select
            value={columns}
            onChange={(e) => onUpdate?.({ ...data, columns: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showTags"
              checked={data.showTags !== false}
              onChange={(e) => onUpdate?.({ ...data, showTags: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showTags" className="text-xs">Show Tags</label>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showFilters"
              checked={data.showFilters === true}
              onChange={(e) => onUpdate?.({ ...data, showFilters: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showFilters" className="text-xs">Show Filters</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default WorkSection;
