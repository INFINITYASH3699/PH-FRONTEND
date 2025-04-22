'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, X, ImageIcon, RefreshCw, Edit2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';

// Define gallery item interface
interface GalleryItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
}

interface GalleryContent {
  items: GalleryItem[];
}

// Updated props to match how it's being used in EditorSidebar
interface GalleryEditorProps {
  data: any; // Changed from content to data
  onChange: (content: GalleryContent) => void; // Changed from onSave to onChange
  isLoading?: boolean;
}

export default function GalleryEditor({ data, onChange, isLoading = false }: GalleryEditorProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(data?.items || []);
  const [currentItem, setCurrentItem] = useState<GalleryItem>({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Extract unique categories from gallery items
  useState(() => {
    if (galleryItems.length > 0) {
      const uniqueCategories = galleryItems
        .map(item => item.category)
        .filter((category, index, self) =>
          category && self.indexOf(category) === index
        ) as string[];
      setCategories(uniqueCategories);
    }
  });

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentItem.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!currentItem.imageUrl) {
      newErrors.imageUrl = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a new gallery item or update an existing one
  const handleAddOrUpdateItem = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Add new category if it doesn't exist yet
    if (currentItem.category && !categories.includes(currentItem.category)) {
      setCategories([...categories, currentItem.category]);
    }

    const updatedItems = [...galleryItems];

    if (editingIndex !== null) {
      // Update existing item
      updatedItems[editingIndex] = {
        ...currentItem,
        id: updatedItems[editingIndex].id || `gallery_${Date.now()}_${editingIndex}`,
      };
      toast.success('Gallery item updated successfully');
    } else {
      // Add new item
      updatedItems.push({
        ...currentItem,
        id: `gallery_${Date.now()}`,
      });
      toast.success('Gallery item added successfully');
    }

    // Update state
    setGalleryItems(updatedItems);

    // Reset form
    setCurrentItem({
      title: '',
      description: '',
      imageUrl: '',
      category: '',
    });
    setEditingIndex(null);
    setErrors({});

    // Save changes
    onChange({ items: updatedItems });
  };

  // Delete a gallery item
  const handleDeleteItem = (index: number) => {
    const updatedItems = [...galleryItems];
    updatedItems.splice(index, 1);
    setGalleryItems(updatedItems);
    onChange({ items: updatedItems });
    toast.success('Gallery item deleted successfully');

    // If we're editing this item, reset the form
    if (editingIndex === index) {
      setCurrentItem({
        title: '',
        description: '',
        imageUrl: '',
        category: '',
      });
      setEditingIndex(null);
      setErrors({});
    }
  };

  // Edit an existing gallery item
  const handleEditItem = (index: number) => {
    setCurrentItem(galleryItems[index]);
    setEditingIndex(index);
    setErrors({});
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      const imageData = await apiClient.uploadImage(file, 'portfolio');

      if (imageData && imageData.url) {
        setCurrentItem({
          ...currentItem,
          imageUrl: imageData.url,
        });
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setUploadLoading(false);
    }
  };

  // Add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setCurrentItem({
      ...currentItem,
      category: newCategory.trim()
    });
    setNewCategory('');
  };

  // Filter gallery items by category
  const filteredItems = galleryItems.filter(item =>
    activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Gallery</h3>
        <p className="text-muted-foreground">
          Add images to showcase your work in a visual gallery. Group your images by categories.
        </p>
      </div>

      {/* Category filters */}
      {galleryItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={activeFilter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Gallery items grid */}
      {galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <Card key={item.id || index} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditItem(index)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                {item.category && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium mb-2">No gallery items yet</h4>
          <p className="text-muted-foreground mb-4">
            Add images to create a visual showcase of your work.
          </p>
        </div>
      )}

      {/* Add/Edit Gallery Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Update Gallery Item' : 'Add New Gallery Item'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {currentItem.imageUrl ? (
                <div className="relative w-32 h-32 rounded-md border overflow-hidden">
                  <Image
                    src={currentItem.imageUrl}
                    alt={currentItem.title || 'Gallery image'}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                    onClick={() => setCurrentItem({ ...currentItem, imageUrl: '' })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-32 h-32 bg-muted rounded-md">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <label htmlFor="galleryImage" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    {uploadLoading ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    id="galleryImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadLoading}
                  />
                </label>
              </div>
            </div>
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="galleryTitle" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="galleryTitle"
              placeholder="E.g., Project Mockup"
              value={currentItem.title}
              onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="galleryDescription" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="galleryDescription"
              placeholder="Briefly describe this image..."
              value={currentItem.description || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              className="min-h-24"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="galleryCategory" className="text-sm font-medium">
              Category (Optional)
            </label>
            <div className="flex gap-2">
              {categories.length > 0 ? (
                <div className="flex-1">
                  <select
                    id="galleryCategory"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    value={currentItem.category || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input
                  id="galleryCategory"
                  placeholder="E.g., Web Design"
                  value={currentItem.category || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="flex-1"
                />
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Toggle between adding new category or selecting existing
                  if (categories.length > 0) {
                    // Set state to show input for new category
                    setNewCategory('');
                    setCategories([]);
                  } else {
                    // Add current category
                    if (currentItem.category) {
                      handleAddCategory();
                    }
                  }
                }}
              >
                {categories.length > 0 ? "New Category" : "Add Category"}
              </Button>
            </div>
            {categories.length === 0 && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingIndex !== null && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentItem({
                  title: '',
                  description: '',
                  imageUrl: '',
                  category: '',
                });
                setEditingIndex(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAddOrUpdateItem}
            disabled={isLoading || uploadLoading}
            className={editingIndex === null ? "ml-auto" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            {editingIndex !== null ? 'Update Item' : 'Add Item'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
