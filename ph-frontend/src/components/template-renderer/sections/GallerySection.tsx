import React from 'react';
import Image from 'next/image';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface GallerySectionProps {
  data: {
    title?: string;
    subtitle?: string;
    images?: Array<{
      src: string;
      alt?: string;
      caption?: string;
      category?: string;
    }>;
    variant?: 'grid' | 'masonry' | 'carousel' | 'featured';
    columns?: '2' | '3' | '4';
    showCaptions?: boolean;
    useFilters?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (index: number, size = 600) => {
  const colors = ['6366f1', '8b5cf6', 'ec4899', 'f43f5e', '14b8a6', '0ea5e9'];
  const color = colors[index % colors.length];
  return `https://placehold.co/${size}x${Math.round(size * (0.7 + Math.random() * 0.6))}/${color}/ffffff?text=Gallery+Image+${index + 1}`;
};

const GallerySection: React.FC<GallerySectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'photographer' ? 'masonry' : 'grid');

  // Determine columns
  const columns = data.columns || '3';

  // Ensure we have images array with at least one placeholder if empty
  const images = data.images?.length ? data.images : editable ?
    Array(6).fill(null).map((_, i) => ({
      src: createPlaceholderImage(i),
      alt: `Sample Image ${i + 1}`,
      caption: `Sample caption ${i + 1}`,
      category: i % 2 === 0 ? 'Nature' : 'Architecture'
    })) : [];

  // Get unique categories from images
  const getCategories = () => {
    const categories = new Set<string>();
    images.forEach(image => {
      if (image.category) {
        categories.add(image.category);
      }
    });
    return Array.from(categories);
  };

  // State for category filter (if useFilters is true)
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  // Filtered images based on active category
  const filteredImages = activeCategory
    ? images.filter(image => image.category === activeCategory)
    : images;

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle image update
  const handleImageUpdate = (index: number, field: string, value: string) => {
    if (onUpdate && editable) {
      const newImages = [...images];

      if (!newImages[index]) {
        newImages[index] = { src: '' };
      }

      newImages[index] = {
        ...newImages[index],
        [field]: value
      };

      onUpdate({
        ...data,
        images: newImages
      });
    }
  };

  // Handle adding a new image
  const handleAddImage = () => {
    if (onUpdate && editable) {
      const newImages = [
        ...images,
        {
          src: createPlaceholderImage(images.length),
          alt: `Image ${images.length + 1}`,
          caption: `Caption ${images.length + 1}`,
          category: 'New'
        }
      ];

      onUpdate({
        ...data,
        images: newImages
      });
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    if (onUpdate && editable) {
      const newImages = [...images];
      newImages.splice(index, 1);

      onUpdate({
        ...data,
        images: newImages
      });
    }
  };

  // Get column class based on columns setting
  const getColumnClass = () => {
    switch (columns) {
      case '2':
        return 'grid-cols-1 sm:grid-cols-2';
      case '4':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case '3':
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  // Handle image click in edit mode to update image
  const handleImageClick = (index: number) => {
    if (editable) {
      const url = prompt('Enter image URL:', images[index].src);
      if (url) handleImageUpdate(index, 'src', url);
    }
  };

  // Render category filters
  const renderFilters = () => {
    if (!data.useFilters) return null;

    const categories = getCategories();
    if (categories.length === 0) return null;

    return (
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm ${
            activeCategory === null
              ? 'bg-primary text-white'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
        {editable && (
          <button
            onClick={() => {
              const newCategory = prompt('Enter new category name:');
              if (newCategory && newCategory.trim() !== '') {
                const newImages = [...images];
                // Add category to the first image without a category
                const index = newImages.findIndex(img => !img.category);
                if (index !== -1) {
                  newImages[index] = { ...newImages[index], category: newCategory };
                  onUpdate?.({
                    ...data,
                    images: newImages
                  });
                }
              }
            }}
            className="px-4 py-2 rounded-full text-sm border border-dashed hover:bg-muted/20"
          >
            + Add Category
          </button>
        )}
      </div>
    );
  };

  // Render grid layout
  const renderGridLayout = () => {
    return (
      <div className={`grid ${getColumnClass()} gap-4`}>
        {filteredImages.map((image, index) => {
          const originalIndex = images.findIndex(img => img === image);
          return (
            <div key={originalIndex} className="group relative overflow-hidden rounded-lg">
              {/* Image */}
              <div
                className="aspect-[4/3] bg-muted relative cursor-pointer"
                onClick={() => handleImageClick(originalIndex)}
              >
                <Image
                  src={image.src}
                  alt={image.alt || `Gallery image ${originalIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {editable && (
                  <button
                    className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(originalIndex);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Caption (optional) */}
              {data.showCaptions !== false && image.caption && (
                <div className="p-3 bg-muted/10">
                  <EditableText
                    value={image.caption}
                    onChange={(value) => handleImageUpdate(originalIndex, 'caption', value)}
                    editable={editable}
                    className="text-sm"
                  />
                  {editable && (
                    <select
                      value={image.category || ''}
                      onChange={(e) => handleImageUpdate(originalIndex, 'category', e.target.value)}
                      className="mt-1 text-xs p-1 border rounded bg-transparent w-full"
                    >
                      <option value="">No Category</option>
                      {getCategories().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="new">+ New Category</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {editable && (
          <div
            className="aspect-[4/3] border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddImage}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Image</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render masonry layout (simulated with CSS)
  const renderMasonryLayout = () => {
    // Get column count based on columns setting
    const columnCount = parseInt(columns, 10);

    // Distribute images into columns for masonry effect
    const getColumnImages = (colIndex: number) => {
      return filteredImages.filter((_, i) => i % columnCount === colIndex);
    };

    return (
      <div className={`grid ${getColumnClass()} gap-4`}>
        {Array.from({ length: columnCount }).map((_, colIndex) => (
          <div key={colIndex} className="space-y-4">
            {getColumnImages(colIndex).map((image) => {
              const originalIndex = images.findIndex(img => img === image);
              return (
                <div key={originalIndex} className="group relative overflow-hidden rounded-lg">
                  {/* Image */}
                  <div
                    className="relative bg-muted cursor-pointer"
                    onClick={() => handleImageClick(originalIndex)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || `Gallery image ${originalIndex + 1}`}
                      width={500}
                      height={Math.floor(300 + Math.random() * 200)} // Random height for masonry effect
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {editable && (
                      <button
                        className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(originalIndex);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Caption (optional) */}
                  {data.showCaptions !== false && image.caption && (
                    <div className="p-3 bg-muted/10">
                      <EditableText
                        value={image.caption}
                        onChange={(value) => handleImageUpdate(originalIndex, 'caption', value)}
                        editable={editable}
                        className="text-sm"
                      />
                      {editable && (
                        <select
                          value={image.category || ''}
                          onChange={(e) => handleImageUpdate(originalIndex, 'category', e.target.value)}
                          className="mt-1 text-xs p-1 border rounded bg-transparent w-full"
                        >
                          <option value="">No Category</option>
                          {getCategories().map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="new">+ New Category</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {editable && (
          <div
            className="aspect-square border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddImage}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Image</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render carousel layout
  const renderCarouselLayout = () => {
    // Simple overflow-x carousel (non-interactive in this implementation)
    return (
      <div className="relative">
        <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {filteredImages.map((image, index) => {
              const originalIndex = images.findIndex(img => img === image);
              return (
                <div
                  key={originalIndex}
                  className="group relative flex-shrink-0 w-72 overflow-hidden rounded-lg"
                >
                  {/* Image */}
                  <div
                    className="aspect-[3/4] bg-muted relative cursor-pointer"
                    onClick={() => handleImageClick(originalIndex)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || `Gallery image ${originalIndex + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {editable && (
                      <button
                        className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(originalIndex);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Caption (optional) */}
                  {data.showCaptions !== false && image.caption && (
                    <div className="p-3 bg-muted/10">
                      <EditableText
                        value={image.caption}
                        onChange={(value) => handleImageUpdate(originalIndex, 'caption', value)}
                        editable={editable}
                        className="text-sm"
                      />
                      {editable && (
                        <select
                          value={image.category || ''}
                          onChange={(e) => handleImageUpdate(originalIndex, 'category', e.target.value)}
                          className="mt-1 text-xs p-1 border rounded bg-transparent w-full"
                        >
                          <option value="">No Category</option>
                          {getCategories().map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="new">+ New Category</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {editable && (
              <div
                className="flex-shrink-0 w-72 aspect-[3/4] border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
                onClick={handleAddImage}
              >
                <div className="text-center">
                  <span className="block text-muted-foreground text-lg">+</span>
                  <span className="block text-muted-foreground">Add Image</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!editable && (
          <div className="absolute left-0 right-0 bottom-0 flex justify-center gap-1 pt-3">
            {filteredImages.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${i === 0 ? 'w-6 bg-primary' : 'w-3 bg-muted'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render featured layout (one large image with smaller ones)
  const renderFeaturedLayout = () => {
    if (filteredImages.length === 0) return null;

    // Featured image is the first one
    const featuredImage = filteredImages[0];
    const featuredIndex = images.findIndex(img => img === featuredImage);
    const remainingImages = filteredImages.slice(1);

    return (
      <div className="space-y-4">
        {/* Featured Image */}
        <div className="group relative overflow-hidden rounded-lg">
          <div
            className="aspect-[21/9] bg-muted relative cursor-pointer"
            onClick={() => handleImageClick(featuredIndex)}
          >
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt || `Featured image`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {editable && (
              <button
                className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(featuredIndex);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Caption for featured image */}
          {data.showCaptions !== false && featuredImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white">
              <EditableText
                value={featuredImage.caption}
                onChange={(value) => handleImageUpdate(featuredIndex, 'caption', value)}
                editable={editable}
                className="text-white text-lg font-medium"
              />
              {editable && (
                <select
                  value={featuredImage.category || ''}
                  onChange={(e) => handleImageUpdate(featuredIndex, 'category', e.target.value)}
                  className="mt-1 text-xs p-1 border rounded bg-gray-800 text-white w-full"
                >
                  <option value="">No Category</option>
                  {getCategories().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="new">+ New Category</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Grid of smaller images */}
        <div className={`grid ${getColumnClass()} gap-4`}>
          {remainingImages.map((image) => {
            const originalIndex = images.findIndex(img => img === image);
            return (
              <div key={originalIndex} className="group relative overflow-hidden rounded-lg">
                {/* Image */}
                <div
                  className="aspect-square bg-muted relative cursor-pointer"
                  onClick={() => handleImageClick(originalIndex)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `Gallery image ${originalIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {editable && (
                    <button
                      className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(originalIndex);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Caption (optional) */}
                {data.showCaptions !== false && image.caption && (
                  <div className="p-3 bg-muted/10">
                    <EditableText
                      value={image.caption}
                      onChange={(value) => handleImageUpdate(originalIndex, 'caption', value)}
                      editable={editable}
                      className="text-sm"
                    />
                    {editable && (
                      <select
                        value={image.category || ''}
                        onChange={(e) => handleImageUpdate(originalIndex, 'category', e.target.value)}
                        className="mt-1 text-xs p-1 border rounded bg-transparent w-full"
                      >
                        <option value="">No Category</option>
                        {getCategories().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="new">+ New Category</option>
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {editable && (
            <div
              className="aspect-square border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20"
              onClick={handleAddImage}
            >
              <div className="text-center">
                <span className="block text-muted-foreground text-lg">+</span>
                <span className="block text-muted-foreground">Add Image</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render gallery based on variant
  const renderGallery = () => {
    switch (variant) {
      case 'masonry':
        return renderMasonryLayout();
      case 'carousel':
        return renderCarouselLayout();
      case 'featured':
        return renderFeaturedLayout();
      case 'grid':
      default:
        return renderGridLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="gallery"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-8 text-center">
          <EditableText
            value={data.title || 'Gallery'}
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
        {renderGallery()}

        {editable && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No images match the selected filter.</p>
            <Button
              variant="outline"
              onClick={() => setActiveCategory(null)}
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Gallery Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="carousel">Carousel</option>
            <option value="featured">Featured</option>
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
              id="showCaptions"
              checked={data.showCaptions !== false}
              onChange={(e) => onUpdate?.({ ...data, showCaptions: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showCaptions" className="text-xs">Show Captions</label>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="useFilters"
              checked={data.useFilters === true}
              onChange={(e) => onUpdate?.({ ...data, useFilters: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="useFilters" className="text-xs">Enable Filters</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
