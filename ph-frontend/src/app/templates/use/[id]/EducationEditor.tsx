'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Calendar, GraduationCap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';

// Define education item interface
interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface EducationContent {
  items: EducationItem[];
}

// Updated props to match how it's being used in EditorSidebar
interface EducationEditorProps {
  data: any; // Changed from content to data
  onChange: (content: EducationContent) => void; // Changed from onSave to onChange
  isLoading?: boolean;
}

export default function EducationEditor({ data, onChange, isLoading = false }: EducationEditorProps) {
  const [educationItems, setEducationItems] = useState<EducationItem[]>(data?.items || []);
  const [currentEducation, setCurrentEducation] = useState<EducationItem>({
    degree: '',
    institution: '',
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

    if (!currentEducation.degree.trim()) {
      newErrors.degree = 'Degree/Certificate is required';
    }

    if (!currentEducation.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }

    if (!currentEducation.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!currentEducation.current && !currentEducation.endDate) {
      newErrors.endDate = 'End date is required if not current';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a new education item or update an existing one
  const handleAddOrUpdateEducation = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    const updatedEducationItems = [...educationItems];

    if (editingIndex !== null) {
      // Update existing education
      updatedEducationItems[editingIndex] = {
        ...currentEducation,
        id: updatedEducationItems[editingIndex].id || `education_${Date.now()}_${editingIndex}`,
      };
      toast.success('Education updated successfully');
    } else {
      // Add new education
      updatedEducationItems.push({
        ...currentEducation,
        id: `education_${Date.now()}`,
      });
      toast.success('Education added successfully');
    }

    // Update state
    setEducationItems(updatedEducationItems);

    // Reset form
    setCurrentEducation({
      degree: '',
      institution: '',
      location: '',
      startDate: new Date().toISOString().substring(0, 10),
      current: false,
      description: '',
    });
    setEditingIndex(null);
    setErrors({});

    // Save changes
    onChange({ items: updatedEducationItems });
  };

  // Delete an education item
  const handleDeleteEducation = (index: number) => {
    const updatedEducationItems = [...educationItems];
    updatedEducationItems.splice(index, 1);
    setEducationItems(updatedEducationItems);
    onChange({ items: updatedEducationItems });
    toast.success('Education deleted successfully');

    // If we're editing this education, reset the form
    if (editingIndex === index) {
      setCurrentEducation({
        degree: '',
        institution: '',
        location: '',
        startDate: new Date().toISOString().substring(0, 10),
        current: false,
        description: '',
      });
      setEditingIndex(null);
      setErrors({});
    }
  };

  // Edit an existing education item
  const handleEditEducation = (index: number) => {
    const education = educationItems[index];
    // Format dates for input fields
    const startDate = education.startDate
      ? new Date(education.startDate).toISOString().substring(0, 10)
      : '';
    const endDate = education.endDate
      ? new Date(education.endDate).toISOString().substring(0, 10)
      : '';

    setCurrentEducation({
      ...education,
      startDate,
      endDate,
    });
    setEditingIndex(index);
    setErrors({});
  };

  // Handle fetching education data from profile
  const handleFetchFromProfile = (profileData: EducationContent) => {
    if (profileData.items && profileData.items.length > 0) {
      // Process fetched education to ensure dates are in correct format
      const processedEducationItems = profileData.items.map(edu => {
        // Make sure we have proper date formats for form compatibility
        let startDate = edu.startDate;
        let endDate = edu.endDate;

        // Try to format dates if they're not in YYYY-MM-DD format
        if (startDate && !startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            startDate = new Date(startDate).toISOString().substring(0, 10);
          } catch (e) {
            console.error('Error formatting start date:', e);
          }
        }

        if (endDate && !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            endDate = new Date(endDate).toISOString().substring(0, 10);
          } catch (e) {
            console.error('Error formatting end date:', e);
          }
        }

        return {
          ...edu,
          id: edu.id || `education_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startDate,
          endDate,
        };
      });

      setEducationItems(processedEducationItems);
      onChange({ items: processedEducationItems });
    }
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Education</h3>
          <FetchProfileButton
            onFetch={handleFetchFromProfile}
            section="education"
            disabled={isLoading}
          />
        </div>
        <p className="text-muted-foreground">
          Add your educational background to highlight your academic achievements.
        </p>
      </div>

      {educationItems.length > 0 ? (
        <div className="space-y-4">
          {educationItems.map((education, index) => (
            <Card key={education.id || index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{education.degree}</CardTitle>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {education.institution}
                      {education.location && `, ${education.location}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEducation(index)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEducation(index)}
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
                  {formatDate(education.startDate)} - {education.current ? 'Present' : formatDate(education.endDate || '')}
                </div>
                {education.description && (
                  <p className="text-sm">{education.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium mb-2">No education added yet</h4>
          <p className="text-muted-foreground mb-4">
            Add your educational background to highlight your academic achievements.
          </p>
        </div>
      )}

      {/* Add/Edit Education Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Update Education' : 'Add New Education'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Degree */}
          <div className="space-y-2">
            <label htmlFor="degree" className="text-sm font-medium">
              Degree / Certificate <span className="text-red-500">*</span>
            </label>
            <Input
              id="degree"
              placeholder="E.g., Bachelor of Science in Computer Science"
              value={currentEducation.degree}
              onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
              className={errors.degree ? "border-red-500" : ""}
            />
            {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <label htmlFor="institution" className="text-sm font-medium">
              Institution <span className="text-red-500">*</span>
            </label>
            <Input
              id="institution"
              placeholder="E.g., University of California"
              value={currentEducation.institution}
              onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
              className={errors.institution ? "border-red-500" : ""}
            />
            {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location"
              placeholder="E.g., Berkeley, CA"
              value={currentEducation.location || ''}
              onChange={(e) => setCurrentEducation({ ...currentEducation, location: e.target.value })}
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
                value={currentEducation.startDate}
                onChange={(e) => setCurrentEducation({ ...currentEducation, startDate: e.target.value })}
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
                    id="current-education"
                    checked={currentEducation.current || false}
                    onCheckedChange={(checked) => setCurrentEducation({
                      ...currentEducation,
                      current: checked,
                      // Clear end date if current
                      endDate: checked ? undefined : currentEducation.endDate
                    })}
                  />
                  <Label htmlFor="current-education" className="text-xs">
                    Currently Studying
                  </Label>
                </div>
              </div>
              <Input
                id="endDate"
                type="date"
                value={currentEducation.endDate || ''}
                onChange={(e) => setCurrentEducation({ ...currentEducation, endDate: e.target.value })}
                disabled={currentEducation.current}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="eduDescription" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="eduDescription"
              placeholder="Add relevant information about your studies, achievements, coursework, etc."
              value={currentEducation.description || ''}
              onChange={(e) => setCurrentEducation({ ...currentEducation, description: e.target.value })}
              className="min-h-24"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingIndex !== null && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentEducation({
                  degree: '',
                  institution: '',
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
            onClick={handleAddOrUpdateEducation}
            disabled={isLoading}
            className={editingIndex === null ? "ml-auto" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            {editingIndex !== null ? 'Update Education' : 'Add Education'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
