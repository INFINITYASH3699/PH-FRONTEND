'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, PlusCircle, ArrowUpDown, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/apiClient';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Define skill item interface
interface SkillItem {
  id?: string; // Add id for drag-and-drop
  name: string;
  proficiency: number;
}

// Define skill category interface
interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

interface SkillsContent {
  categories: SkillCategory[];
}

// Updated props to match how it's being used in EditorSidebar
interface SkillsEditorProps {
  data: SkillsContent;
  onChange: (content: SkillsContent) => void;
  isLoading?: boolean;
}

export default function SkillsEditor({ data, onChange, isLoading = false }: SkillsEditorProps) {
  const [categories, setCategories] = useState<SkillCategory[]>(
    Array.isArray(data?.categories)
      ? data.categories.map(category => ({
          ...category,
          skills: category.skills.map(skill => ({
            ...skill,
            id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}` // Ensure each skill has an ID
          }))
        }))
      : []
  );

  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(75);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ categoryIndex: number; skillIndex: number } | null>(null);
  const [editCategoryIndex, setEditCategoryIndex] = useState<number>(-1);
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>({ name: '', skills: [] });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFetching, setIsFetching] = useState(false);

  // Function to add or update a skill category
  const handleAddSkillCategory = () => {
    if (!newSkillCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (newSkillCategory.skills.length === 0) {
      toast.error('Add at least one skill to this category');
      return;
    }

    let updatedCategories = [...categories];

    if (editCategoryIndex >= 0) {
      // Update existing category
      updatedCategories[editCategoryIndex] = { ...newSkillCategory };
      toast.success(`"${newSkillCategory.name}" category updated`);
    } else {
      // Add new category
      updatedCategories.push({ ...newSkillCategory });
      toast.success(`"${newSkillCategory.name}" category added`);
    }

    setCategories(updatedCategories);
    setIsSkillsDialogOpen(false);
    setNewSkillCategory({ name: '', skills: [] });
    setNewSkillName('');
    setNewSkillProficiency(75);
    setEditCategoryIndex(-1);

    // Save changes to parent component
    onChange({ categories: updatedCategories });
  };

  // Function to edit a category
  const handleEditSkillCategory = (index: number) => {
    // Ensure all skills have IDs before editing
    const categoryToEdit = {
      ...categories[index],
      skills: categories[index].skills.map(skill => ({
        ...skill,
        id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`
      }))
    };
    setEditCategoryIndex(index);
    setNewSkillCategory(categoryToEdit);
    setIsSkillsDialogOpen(true);
  };

  // Function to delete a category
  const handleDeleteSkillCategory = (index: number) => {
    if (!window.confirm(`Are you sure you want to delete the "${categories[index].name}" category and all its skills?`)) {
      return;
    }

    const updatedCategories = [...categories];
    const categoryName = categories[index].name;
    updatedCategories.splice(index, 1);
    setCategories(updatedCategories);

    // Reset active category if it was deleted
    if (activeCategoryIndex === index) {
      setActiveCategoryIndex(null);
    } else if (activeCategoryIndex !== null && activeCategoryIndex > index) {
      // Adjust active index if a category before it was deleted
      setActiveCategoryIndex(activeCategoryIndex - 1);
    }

    toast.success(`"${categoryName}" category deleted`);

    // Save changes
    onChange({ categories: updatedCategories });
  };

  // Add a skill to the current category in the dialog
  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name is required');
      return;
    }

    const editingIndex = editingSkill ? editingSkill.skillIndex : -1;
    const updatedSkills = [...newSkillCategory.skills];

    if (editingIndex >= 0) {
      // Update existing skill
      updatedSkills[editingIndex] = {
        ...updatedSkills[editingIndex],
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
      };
    } else {
      // Check if skill already exists in this category
      if (updatedSkills.some(skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
        toast.error('A skill with this name already exists in this category');
        return;
      }

      // Add new skill
      updatedSkills.push({
        id: `skill-${Math.random().toString(36).substring(2, 9)}`,
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
      });
    }

    setNewSkillCategory({
      ...newSkillCategory,
      skills: updatedSkills,
    });

    setNewSkillName('');
    setNewSkillProficiency(75);
    setEditingSkill(null);
  };

  // Edit a skill within the dialog
  const handleEditSkill = (index: number) => {
    const skill = newSkillCategory.skills[index];
    setNewSkillName(skill.name);
    setNewSkillProficiency(skill.proficiency);
    setEditingSkill({ categoryIndex: -1, skillIndex: index });
  };

  // Delete a skill within the dialog
  const handleDeleteSkill = (index: number) => {
    const updatedSkills = [...newSkillCategory.skills];
    updatedSkills.splice(index, 1);

    setNewSkillCategory({
      ...newSkillCategory,
      skills: updatedSkills,
    });

    if (editingSkill && editingSkill.skillIndex === index) {
      setEditingSkill(null);
      setNewSkillName('');
      setNewSkillProficiency(75);
    } else if (editingSkill && editingSkill.skillIndex > index) {
      setEditingSkill({
        categoryIndex: editingSkill.categoryIndex,
        skillIndex: editingSkill.skillIndex - 1
      });
    }
  };

  // Handle drag end for skills in the dialog
  const handleDialogDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or dropped at the same position
    if (!destination || (destination.index === source.index)) {
      return;
    }

    const reorderedSkills = [...newSkillCategory.skills];
    const [movedSkill] = reorderedSkills.splice(source.index, 1);
    reorderedSkills.splice(destination.index, 0, movedSkill);

    setNewSkillCategory({
      ...newSkillCategory,
      skills: reorderedSkills
    });
  };

  // Handle drag end for skills in the main display
  const handleMainDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside the list or no destination
    if (!destination) {
      return;
    }

    // Extract the category index from the droppable ID (format: "category-{index}")
    const categoryIndex = parseInt(source.droppableId.split('-')[1]);

    // If the item was dropped in a different category or dropped at the same position
    if (destination.droppableId !== source.droppableId || destination.index === source.index) {
      return;
    }

    // Clone the categories array
    const updatedCategories = [...categories];
    const categorySkills = [...updatedCategories[categoryIndex].skills];

    // Reorder skills within the category
    const [movedSkill] = categorySkills.splice(source.index, 1);
    categorySkills.splice(destination.index, 0, movedSkill);

    // Update the category with reordered skills
    updatedCategories[categoryIndex].skills = categorySkills;

    // Update state
    setCategories(updatedCategories);

    // Notify parent component of changes
    onChange({ categories: updatedCategories });

    // Show success toast
    toast.success('Skill order updated');
  };

  // Handle fetching skills from profile
  const handleFetchFromProfile = async () => {
    try {
      setIsFetching(true);
      // Fetch user profile data
      const response = await apiClient.user.getProfile();

      if (!response || !response.user) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData = response.user;

      // Check if profile has skills data
      if (profileData.profile?.skills && profileData.profile.skills.length > 0) {
        // Group skills by category (if profile skills are already categorized)
        if (Array.isArray(profileData.profile.skills) &&
            profileData.profile.skills.length > 0 &&
            'name' in profileData.profile.skills[0] &&
            'skills' in profileData.profile.skills[0]) {
          // Already in category format - clone the data structure
          const skillCategories = JSON.parse(JSON.stringify(profileData.profile.skills));

          // Add IDs to each skill for drag-and-drop functionality
          const categoriesWithIds = skillCategories.map((category: SkillCategory) => ({
            ...category,
            skills: category.skills.map((skill: SkillItem) => ({
              ...skill,
              id: `skill-${Math.random().toString(36).substring(2, 9)}`
            }))
          }));

          setCategories(categoriesWithIds);
          onChange({ categories: categoriesWithIds });
          toast.success('Skills successfully imported from your profile');
        }
        // Handle flat skill array with category property
        else if (Array.isArray(profileData.profile.skills)) {
          // Group skills by category
          const skillsByCategory: Record<string, SkillItem[]> = {};

          profileData.profile.skills.forEach((skill: any) => {
            // Extract category name, default to 'Technical' if not provided
            const categoryName = skill.category || 'Technical';

            // Create category array if it doesn't exist
            if (!skillsByCategory[categoryName]) {
              skillsByCategory[categoryName] = [];
            }

            // Add skill to appropriate category
            skillsByCategory[categoryName].push({
              id: `skill-${Math.random().toString(36).substring(2, 9)}`,
              name: skill.name,
              // Use level if available, otherwise use proficiency, default to 75
              proficiency: skill.level || skill.proficiency || 75
            });
          });

          // Convert the grouped skills to the categories format
          const newCategories = Object.keys(skillsByCategory).map(categoryName => ({
            name: categoryName,
            skills: skillsByCategory[categoryName]
          }));

          // Update state
          setCategories(newCategories);

          // Call onChange to update parent component
          onChange({ categories: newCategories });

          toast.success('Skills successfully imported from your profile');
        } else {
          toast.warning('Skills data format in your profile is not recognized');
        }
      } else {
        toast.warning('No skills found in your profile. Please add skills to your profile first.');
      }
    } catch (error) {
      console.error('Error fetching profile skills:', error);
      toast.error('Failed to fetch skills from your profile');
    } finally {
      setIsFetching(false);
    }
  };

  // Calculate the appropriate color for proficiency level
  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 90) return 'bg-green-500';
    if (proficiency >= 70) return 'bg-blue-500';
    if (proficiency >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Skills</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchFromProfile}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Fetching...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Auto-fill from Profile
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Organize your skills into categories to showcase your expertise. Drag skills to reorder them.
        </p>
      </div>

      {/* Dialog for adding/editing skill categories */}
      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_80px] gap-2 items-end mb-4">
                <div>
                  <Label htmlFor="skill-name" className="text-xs mb-1 block">Skill Name</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g., React, JavaScript"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="skill-proficiency" className="text-xs mb-1 block">Level (%)</Label>
                  <Input
                    id="skill-proficiency"
                    type="number"
                    min="0"
                    max="100"
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(parseInt(e.target.value) || 0)}
                  />
                </div>
                <Button onClick={handleAddSkill}>
                  {editingSkill ? 'Update' : 'Add Skill'}
                </Button>
              </div>

              <div className="w-full mt-2">
                <Label className="text-sm font-medium">Preview:</Label>
                {newSkillName && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{newSkillName}</span>
                      <span className="text-sm text-muted-foreground">{newSkillProficiency}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProficiencyColor(newSkillProficiency)}`}
                        style={{ width: `${newSkillProficiency}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium mb-2 block">Skills in this category:</Label>
                <DragDropContext onDragEnd={handleDialogDragEnd}>
                  <Droppable droppableId="dialog-skills">
                    {(provided) => (
                      <div
                        className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-2"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {newSkillCategory.skills.length > 0 ? (
                          newSkillCategory.skills.map((skill, idx) => (
                            <Draggable
                              key={skill.id || `dialog-skill-${idx}`}
                              draggableId={skill.id || `dialog-skill-${idx}`}
                              index={idx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mr-2 cursor-move text-muted-foreground flex-shrink-0"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  <div className="flex-1 pr-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium">{skill.name}</span>
                                      <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`h-full ${getProficiencyColor(skill.proficiency)}`}
                                        style={{ width: `${skill.proficiency}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="ghost" onClick={() => handleEditSkill(idx)}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteSkill(idx)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center p-4 text-muted-foreground text-sm">
                            No skills added yet. Add some skills above.
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsSkillsDialogOpen(false);
              setNewSkillCategory({ name: '', skills: [] });
              setEditCategoryIndex(-1);
              setEditingSkill(null);
              setNewSkillName('');
              setNewSkillProficiency(75);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddSkillCategory}>
              {editCategoryIndex >= 0 ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content area */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Skill Categories</CardTitle>
            <CardDescription>
              Group your skills by categories such as Frontend, Backend, Design, etc.
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setIsSkillsDialogOpen(true);
                setNewSkillCategory({ name: '', skills: [] });
                setEditCategoryIndex(-1);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleMainDragEnd}>
            {categories.length > 0 ? (
              <div className="space-y-6">
                {categories.map((category, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditSkillCategory(idx)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteSkillCategory(idx)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <Droppable droppableId={`category-${idx}`}>
                      {(provided) => (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {category.skills.map((skill, skillIdx) => (
                            <Draggable
                              key={skill.id || `skill-${idx}-${skillIdx}`}
                              draggableId={skill.id || `skill-${idx}-${skillIdx}`}
                              index={skillIdx}
                            >
                              {(provided) => (
                                <div
                                  className="p-3 bg-muted rounded-md flex items-center"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mr-2 cursor-move text-muted-foreground"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium">{skill.name}</span>
                                      <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-full ${getProficiencyColor(skill.proficiency)}`}
                                        style={{ width: `${skill.proficiency}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No skills added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your professional skills and rate your proficiency to showcase your expertise.
                </p>
                <Button onClick={() => setIsSkillsDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Skills
                </Button>
              </div>
            )}
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}
