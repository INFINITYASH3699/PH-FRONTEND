'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Plus, Trash2, Upload, Link2, Github } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';

// Define project item interface
interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
}

interface ProjectsContent {
  items: ProjectItem[];
}

// Updated props to match how it's being used in EditorSidebar
interface ProjectsEditorProps {
  data: any; // Changed from content to data
  onChange: (content: ProjectsContent) => void; // Changed from onSave to onChange
  isLoading?: boolean;
}

export default function ProjectsEditor({ data, onChange, isLoading = false }: ProjectsEditorProps) {
  // Consistently initialize projects state with data?.items || []
  const [projects, setProjects] = useState<ProjectItem[]>(data?.items || []);
  const [currentProject, setCurrentProject] = useState<ProjectItem>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    githubUrl: '',
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentProject.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!currentProject.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    // Validate URLs if they are provided
    if (currentProject.projectUrl && !/^https?:\/\/.+/.test(currentProject.projectUrl)) {
      newErrors.projectUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    if (currentProject.githubUrl && !/^https?:\/\/.+/.test(currentProject.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a new project or update an existing one
  const handleAddOrUpdateProject = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    const updatedProjects = [...projects];

    if (editingIndex !== null) {
      // Update existing project
      updatedProjects[editingIndex] = {
        ...currentProject,
        id: updatedProjects[editingIndex].id || `project_${Date.now()}_${editingIndex}`,
      };
      toast.success('Project updated successfully');
    } else {
      // Add new project
      updatedProjects.push({
        ...currentProject,
        id: `project_${Date.now()}`,
      });
      toast.success('Project added successfully');
    }

    // Update state
    setProjects(updatedProjects);

    // Reset form
    setCurrentProject({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      githubUrl: '',
      tags: [],
    });
    setEditingIndex(null);
    setErrors({});

    // Save changes
    onChange({ items: updatedProjects });
  };

  // Delete a project
  const handleDeleteProject = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
    onChange({ items: updatedProjects });
    toast.success('Project deleted successfully');

    // If we're editing this project, reset the form
    if (editingIndex === index) {
      setCurrentProject({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        githubUrl: '',
        tags: [],
      });
      setEditingIndex(null);
      setErrors({});
    }
  };

  // Edit an existing project
  const handleEditProject = (index: number) => {
    setCurrentProject(projects[index]);
    setEditingIndex(index);
    setErrors({});
  };

  // Add a tag to the current project
  const handleAddTag = () => {
    if (!currentTag.trim()) return;

    // Check if tag already exists
    if (currentProject.tags.includes(currentTag.trim())) {
      toast.error('Tag already added');
      return;
    }

    setCurrentProject({
      ...currentProject,
      tags: [...currentProject.tags, currentTag.trim()],
    });
    setCurrentTag('');
  };

  // Remove a tag from the current project
  const handleRemoveTag = (tag: string) => {
    setCurrentProject({
      ...currentProject,
      tags: currentProject.tags.filter(t => t !== tag),
    });
  };

  // Handle fetching projects data from profile
  const handleFetchFromProfile = (profileData: ProjectsContent) => {
    if (profileData.items && profileData.items.length > 0) {
      const processedProjects = profileData.items.map(project => ({
        ...project,
        id: project.id || `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tags: project.tags || [],
      }));

      setProjects(processedProjects);
      onChange({ items: processedProjects });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      const result = await apiClient.uploadImage(file, 'project');

      if (result.success && result.image?.url) {
        setCurrentProject({
          ...currentProject,
          imageUrl: result.image.url,
        });
        toast.success('Project image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Projects</h3>
          <FetchProfileButton
            onFetch={handleFetchFromProfile}
            section="projects"
            disabled={isLoading || uploadLoading}
          />
        </div>
        <p className="text-muted-foreground">
          Add projects to showcase your work. Include details, images, and links.
        </p>
      </div>

      {/* Current projects list */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <Card key={project.id || index} className="overflow-hidden">
              {project.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-xl">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {project.description}
                </p>
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-muted text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProject(index)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProject(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium mb-2">No projects yet</h4>
          <p className="text-muted-foreground mb-4">
            Add your first project to showcase your work.
          </p>
        </div>
      )}

      {/* Add/Edit Project Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingIndex !== null ? 'Update Project' : 'Add New Project'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Title */}
          <div className="space-y-2">
            <label htmlFor="projectTitle" className="text-sm font-medium">
              Project Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="projectTitle"
              placeholder="E.g., E-commerce Website"
              value={currentProject.title}
              onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label htmlFor="projectDescription" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your project..."
              value={currentProject.description}
              onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
              className={`min-h-24 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Project Image */}
          <div className="space-y-2">
            <label htmlFor="projectImage" className="text-sm font-medium">
              Project Image
            </label>
            <div className="flex items-center gap-4">
              {currentProject.imageUrl ? (
                <div className="relative w-24 h-24 rounded border overflow-hidden">
                  <Image
                    src={currentProject.imageUrl}
                    alt={currentProject.title || 'Project image'}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                    onClick={() => setCurrentProject({ ...currentProject, imageUrl: '' })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 bg-muted rounded">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    {uploadLoading ? 'Uploading...' : 'Upload Image'}
                  </div>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadLoading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Project URL */}
          <div className="space-y-2">
            <label htmlFor="projectUrl" className="text-sm font-medium flex items-center">
              <Link2 className="h-4 w-4 mr-1" />
              Project URL
            </label>
            <Input
              id="projectUrl"
              placeholder="https://example.com"
              value={currentProject.projectUrl || ''}
              onChange={(e) => setCurrentProject({ ...currentProject, projectUrl: e.target.value })}
              className={errors.projectUrl ? "border-red-500" : ""}
            />
            {errors.projectUrl && <p className="text-red-500 text-xs mt-1">{errors.projectUrl}</p>}
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <label htmlFor="githubUrl" className="text-sm font-medium flex items-center">
              <Github className="h-4 w-4 mr-1" />
              GitHub URL
            </label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/yourusername/repo"
              value={currentProject.githubUrl || ''}
              onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
              className={errors.githubUrl ? "border-red-500" : ""}
            />
            {errors.githubUrl && <p className="text-red-500 text-xs mt-1">{errors.githubUrl}</p>}
          </div>

          {/* Project Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="E.g., React"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
                variant="outline"
              >
                Add
              </Button>
            </div>
            {currentProject.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {currentProject.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingIndex !== null && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentProject({
                  title: '',
                  description: '',
                  imageUrl: '',
                  projectUrl: '',
                  githubUrl: '',
                  tags: [],
                });
                setEditingIndex(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAddOrUpdateProject}
            disabled={isLoading || uploadLoading}
            className={editingIndex === null ? "ml-auto" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            {editingIndex !== null ? 'Update Project' : 'Add Project'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
