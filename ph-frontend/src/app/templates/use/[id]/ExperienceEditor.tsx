'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, X, Edit2, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define experience item interface
interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperienceContent {
  items: ExperienceItem[];
}

interface ExperienceEditorProps {
  content: ExperienceContent;
  onSave: (content: ExperienceContent) => void;
  isLoading?: boolean;
}

export default function ExperienceEditor({ content, onSave, isLoading = false }: ExperienceEditorProps) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(content.items || []);
  const [currentExperience, setCurrentExperience] = useState<ExperienceItem>({
    title: '',
    company: '',
    location: '',
    startDate: new Date().toISOString().substring(0, 10), // YYYY-MM-DD format
    current: false,
    description: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!currentExperience.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!currentExperience.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!currentExperience.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!currentExperience.current && !currentExperience.endDate) {
      newErrors.endDate = 'End date is required if not current position';
    }

    if (!currentExperience.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a new experience or update an existing one
  const handleAddOrUpdateExperience = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    const updatedExperiences = [...experiences];

    if (editingIndex !== null) {
      // Update existing experience
      updatedExperiences[editingIndex] = {
        ...currentExperience,
        id: updatedExperiences[editingIndex].id || `experience_${Date.now()}_${editingIndex}`,
      };
      toast.success('Experience updated successfully');
    } else {
      // Add new experience
      updatedExperiences.push({
        ...currentExperience,
        id: `experience_${Date.now()}`,
      });
      toast.success('Experience added successfully');
    }

    // Update state
    setExperiences(updatedExperiences);

    // Reset form
    setCurrentExperience({
      title: '',
      company: '',
      location: '',
      startDate: new Date().toISOString().substring(0, 10),
      current: false,
      description: '',
    });
    setEditingIndex(null);
    setErrors({});

    // Save changes
    onSave({ items: updatedExperiences });
  };

  // Delete an experience
  const handleDeleteExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
    onSave({ items: updatedExperiences });
    toast.success('Experience deleted successfully');

    // If we're editing this experience, reset the form
    if (editingIndex === index) {
      setCurrentExperience({
        title: '',
        company: '',
        location: '',
        startDate: new Date().toISOString().substring(0, 10),
        current: false,
        description: '',
      });
      setEditingIndex(null);
      setErrors({});
    }
  };

  // Edit an existing experience
  const handleEditExperience = (index: number) => {
    const experience = experiences[index];
    // Format dates for input fields
    const startDate = experience.startDate
      ? new Date(experience.startDate).toISOString().substring(0, 10)
      : '';
    const endDate = experience.endDate
      ? new Date(experience.endDate).toISOString().substring(0, 10)
      : '';

    setCurrentExperience({
      ...experience,
      startDate,
      endDate,
    });
    setEditingIndex(index);
    setErrors({});
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <p className="text-muted-foreground">
          Add your professional experience to showcase your career journey.
        </p>
      </div>

      {/* Current experiences list */}
      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <Card key={experience.id || index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl">{experience.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {experience.company}
                      {experience.location && `, ${experience.location}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditExperience(index)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteExperience(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate || '')}
                </div>
                <p className="text-sm">{experience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium mb-2">No work experience yet</h4>
          <p className="text-muted-foreground mb-4">
            Add your professional experience to showcase your career journey.
          </p>
        </div>
      )}

      {/* Add/Edit Experience Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Update Experience' : 'Add New Experience'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Title */}
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="jobTitle"
              placeholder="E.g., Senior Frontend Developer"
              value={currentExperience.title}
              onChange={(e) => setCurrentExperience({ ...currentExperience, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">
              Company <span className="text-red-500">*</span>
            </label>
            <Input
              id="company"
              placeholder="E.g., Acme Inc."
              value={currentExperience.company}
              onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location"
              placeholder="E.g., New York, NY"
              value={currentExperience.location || ''}
              onChange={(e) => setCurrentExperience({ ...currentExperience, location: e.target.value })}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="startDate"
                type="date"
                value={currentExperience.startDate}
                onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="current-position"
                    checked={currentExperience.current}
                    onCheckedChange={(checked) => setCurrentExperience({
                      ...currentExperience,
                      current: checked,
                      // Clear end date if current position
                      endDate: checked ? undefined : currentExperience.endDate
                    })}
                  />
                  <Label htmlFor="current-position" className="text-xs">
                    Current Position
                  </Label>
                </div>
              </div>
              <Input
                id="endDate"
                type="date"
                value={currentExperience.endDate || ''}
                onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
                disabled={currentExperience.current}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              placeholder="Describe your responsibilities, achievements, and skills used in this role..."
              value={currentExperience.description}
              onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
              className={`min-h-24 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingIndex !== null && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentExperience({
                  title: '',
                  company: '',
                  location: '',
                  startDate: new Date().toISOString().substring(0, 10),
                  current: false,
                  description: '',
                });
                setEditingIndex(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAddOrUpdateExperience}
            disabled={isLoading}
            className={editingIndex === null ? "ml-auto" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            {editingIndex !== null ? 'Update Experience' : 'Add Experience'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
