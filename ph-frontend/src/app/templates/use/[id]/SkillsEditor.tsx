'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';

// Define skill item interface
interface SkillItem {
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

interface SkillsEditorProps {
  content: SkillsContent;
  onSave: (content: SkillsContent) => void;
  isLoading?: boolean;
}

export default function SkillsEditor({ content, onSave, isLoading = false }: SkillsEditorProps) {
  const [categories, setCategories] = useState<SkillCategory[]>(content.categories || []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(75);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ categoryIndex: number; skillIndex: number } | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Add a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setErrors({ categoryName: 'Category name is required' });
      return;
    }

    // Check if category name already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setErrors({ categoryName: 'Category with this name already exists' });
      return;
    }

    setErrors({});
    const updatedCategories = [
      ...categories,
      {
        name: newCategoryName.trim(),
        skills: []
      }
    ];

    setCategories(updatedCategories);
    setNewCategoryName('');
    setActiveCategoryIndex(updatedCategories.length - 1);
    toast.success('Category added successfully');

    // Save changes
    onSave({ categories: updatedCategories });
  };

  // Delete a category
  const handleDeleteCategory = (index: number) => {
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
    onSave({ categories: updatedCategories });
  };

  // Add or update a skill in a category
  const handleAddSkill = (categoryIndex: number) => {
    if (!newSkillName.trim()) {
      setErrors({ skillName: 'Skill name is required' });
      return;
    }

    // Check if skill already exists in this category (if we're not editing it)
    if (!editingSkill && categories[categoryIndex].skills.some(skill =>
      skill.name.toLowerCase() === newSkillName.trim().toLowerCase()
    )) {
      setErrors({ skillName: 'Skill already exists in this category' });
      return;
    }

    setErrors({});
    const updatedCategories = [...categories];
    let successMessage = '';

    if (editingSkill && editingSkill.categoryIndex === categoryIndex) {
      // Update existing skill
      updatedCategories[categoryIndex].skills[editingSkill.skillIndex] = {
        name: newSkillName.trim(),
        proficiency: newSkillProficiency
      };

      successMessage = `"${newSkillName.trim()}" skill updated`;
      setEditingSkill(null);
    } else {
      // Add new skill
      updatedCategories[categoryIndex].skills.push({
        name: newSkillName.trim(),
        proficiency: newSkillProficiency
      });

      successMessage = `"${newSkillName.trim()}" skill added`;
    }

    setCategories(updatedCategories);
    setNewSkillName('');
    setNewSkillProficiency(75);
    toast.success(successMessage);

    // Save changes
    onSave({ categories: updatedCategories });
  };

  // Delete a skill
  const handleDeleteSkill = (categoryIndex: number, skillIndex: number) => {
    const updatedCategories = [...categories];
    const skillName = updatedCategories[categoryIndex].skills[skillIndex].name;
    updatedCategories[categoryIndex].skills.splice(skillIndex, 1);
    setCategories(updatedCategories);

    // Reset editing state if we were editing this skill
    if (editingSkill &&
        editingSkill.categoryIndex === categoryIndex &&
        editingSkill.skillIndex === skillIndex) {
      setEditingSkill(null);
      setNewSkillName('');
      setNewSkillProficiency(75);
    }

    toast.success(`"${skillName}" skill deleted`);

    // Save changes
    onSave({ categories: updatedCategories });
  };

  // Start editing a skill
  const handleEditSkill = (categoryIndex: number, skillIndex: number) => {
    const skill = categories[categoryIndex].skills[skillIndex];
    setNewSkillName(skill.name);
    setNewSkillProficiency(skill.proficiency);
    setEditingSkill({ categoryIndex, skillIndex });
    setErrors({});
  };

  // Handle fetching skills from profile
  const handleFetchFromProfile = (profileData: SkillsContent) => {
    if (profileData.categories && profileData.categories.length > 0) {
      setCategories(profileData.categories);
      if (profileData.categories.length > 0) {
        setActiveCategoryIndex(0);
      }
      onSave(profileData);
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
          <FetchProfileButton
            onFetch={handleFetchFromProfile}
            section="skills"
            disabled={isLoading}
          />
        </div>
        <p className="text-muted-foreground">
          Add and organize your skills into categories.
        </p>
      </div>

      {/* Category management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Skill Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="w-full">
              <Input
                placeholder="New Category (e.g., Frontend)"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className={errors.categoryName ? "border-red-500" : ""}
              />
              {errors.categoryName && (
                <p className="text-red-500 text-xs mt-1">{errors.categoryName}</p>
              )}
            </div>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim() || isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-md flex justify-between items-center cursor-pointer transition-colors ${
                    activeCategoryIndex === index ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveCategoryIndex(index)}
                >
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({category.skills.length} skills)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(index);
                    }}
                    className="p-1 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No categories yet. Add your first skill category.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills management for selected category */}
      {activeCategoryIndex !== null && categories[activeCategoryIndex] && (
        <Card>
          <CardHeader>
            <CardTitle>Skills in {categories[activeCategoryIndex].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add/edit skill form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="skillName" className="text-sm font-medium">
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="skillName"
                  placeholder="E.g., React"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className={errors.skillName ? "border-red-500" : ""}
                />
                {errors.skillName && (
                  <p className="text-red-500 text-xs mt-1">{errors.skillName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="skillProficiency" className="text-sm font-medium">
                  Proficiency Level: {newSkillProficiency}%
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0%</span>
                  <input
                    id="skillProficiency"
                    type="range"
                    min="0"
                    max="100"
                    value={newSkillProficiency}
                    onChange={e => setNewSkillProficiency(parseInt(e.target.value))}
                    className="flex-grow"
                  />
                  <span className="text-xs">100%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${getProficiencyColor(newSkillProficiency)}`}
                    style={{ width: `${newSkillProficiency}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {editingSkill && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSkill(null);
                      setNewSkillName('');
                      setNewSkillProficiency(75);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => handleAddSkill(activeCategoryIndex)}
                  disabled={!newSkillName.trim() || isLoading}
                >
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </Button>
              </div>
            </div>

            {/* Skills list */}
            {categories[activeCategoryIndex].skills.length > 0 ? (
              <div className="space-y-3">
                {categories[activeCategoryIndex].skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditSkill(activeCategoryIndex, skillIndex)}
                          className="p-1 hover:text-blue-500"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(activeCategoryIndex, skillIndex)}
                          className="p-1 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProficiencyColor(skill.proficiency)}`}
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-muted-foreground">
                      {skill.proficiency}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">No skills in this category yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
