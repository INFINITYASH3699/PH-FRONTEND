import React from 'react';
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  muted: string;
  accent: string;
}

interface ColorScheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

interface ThemeColorEditorProps {
  colorSchemes: ColorScheme[];
  activeColorSchemeId: string;
  onChange: (schemeId: string, updatedColors?: ThemeColors) => void;
  onSaveCustomScheme: (name: string, colors: ThemeColors) => void;
}

// Some predefined color schemes
const DEFAULT_COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#6366f1',
      background: '#ffffff',
      text: '#0f172a',
      muted: '#f1f5f9',
      accent: '#8b5cf6',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#8b5cf6',
      background: '#0f172a',
      text: '#f8fafc',
      muted: '#1e293b',
      accent: '#ec4899',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: {
      primary: '#f97316',
      background: '#fffbeb',
      text: '#1e293b',
      muted: '#fef3c7',
      accent: '#f59e0b',
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    colors: {
      primary: '#06b6d4',
      background: '#f0fdfa',
      text: '#0f172a',
      muted: '#ccfbf1',
      accent: '#10b981',
    },
  },
  {
    id: 'mono',
    name: 'Monochrome',
    colors: {
      primary: '#000000',
      background: '#ffffff',
      text: '#000000',
      muted: '#e5e5e5',
      accent: '#666666',
    },
  },
];

export function ThemeColorEditor({
  colorSchemes = DEFAULT_COLOR_SCHEMES,
  activeColorSchemeId = 'default',
  onChange,
  onSaveCustomScheme,
}: ThemeColorEditorProps) {
  // Get the active color scheme
  const activeScheme = colorSchemes.find(s => s.id === activeColorSchemeId) || colorSchemes[0];

  // State for tracking custom scheme colors and whether we're editing
  const [customColors, setCustomColors] = React.useState<ThemeColors>(activeScheme.colors);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newSchemeName, setNewSchemeName] = React.useState('');

  // Update custom colors when active scheme changes
  React.useEffect(() => {
    setCustomColors(activeScheme.colors);
  }, [activeColorSchemeId, activeScheme]);

  // Handle color changes
  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setCustomColors(prev => {
      const updated = { ...prev, [colorKey]: value };
      onChange(activeColorSchemeId, updated);
      return updated;
    });
  };

  // Handle color scheme selection
  const handleSchemeSelect = (schemeId: string) => {
    setIsEditing(false);
    onChange(schemeId);
  };

  // Handle saving a custom scheme
  const handleSaveCustomScheme = () => {
    if (newSchemeName.trim()) {
      onSaveCustomScheme(newSchemeName, customColors);
      setNewSchemeName('');
      setIsEditing(false);
    }
  };

  // Preview component that shows text in the selected colors
  const ColorPreview = ({ colors }: { colors: ThemeColors }) => (
    <div
      className="p-4 rounded-md"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        border: `1px solid ${colors.muted}`
      }}
    >
      <h4 style={{ color: colors.primary }}>Theme Preview</h4>
      <p className="text-sm mt-1" style={{ color: colors.text }}>Primary text</p>
      <p className="text-xs mt-1" style={{ color: colors.accent }}>Accent text</p>
      <div
        className="mt-2 px-2 py-1 text-xs inline-block rounded"
        style={{
          backgroundColor: colors.primary,
          color: '#ffffff'
        }}
      >
        Button
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Colors</CardTitle>
        <CardDescription>
          Customize the colors used in your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Color Scheme Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.id}
              className={`p-2 rounded-md text-sm text-center transition-colors ${
                activeColorSchemeId === scheme.id
                  ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleSchemeSelect(scheme.id)}
            >
              <div
                className="w-full h-8 rounded mb-1 border"
                style={{ backgroundColor: scheme.colors.primary }}
              />
              {scheme.name}
            </button>
          ))}
          <button
            className="p-2 rounded-md text-sm text-center border border-dashed hover:bg-muted/20"
            onClick={() => setIsEditing(true)}
          >
            + Custom
          </button>
        </div>

        {/* Color Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <ColorPreview colors={isEditing ? customColors : activeScheme.colors} />
        </div>

        {/* Color Editing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            {isEditing ? 'Customize Colors' : 'Active Theme: ' + activeScheme.name}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1">Primary Color</label>
              <ColorPicker
                value={customColors.primary}
                onChange={(color) => handleColorChange('primary', color)}
              />
            </div>

            <div>
              <label className="text-xs block mb-1">Background Color</label>
              <ColorPicker
                value={customColors.background}
                onChange={(color) => handleColorChange('background', color)}
              />
            </div>

            <div>
              <label className="text-xs block mb-1">Text Color</label>
              <ColorPicker
                value={customColors.text}
                onChange={(color) => handleColorChange('text', color)}
              />
            </div>

            <div>
              <label className="text-xs block mb-1">Muted/Secondary Color</label>
              <ColorPicker
                value={customColors.muted}
                onChange={(color) => handleColorChange('muted', color)}
              />
            </div>

            <div>
              <label className="text-xs block mb-1">Accent Color</label>
              <ColorPicker
                value={customColors.accent}
                onChange={(color) => handleColorChange('accent', color)}
              />
            </div>
          </div>

          {/* Save Custom Scheme UI */}
          {isEditing && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                  placeholder="Custom scheme name"
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  onClick={handleSaveCustomScheme}
                  disabled={!newSchemeName.trim()}
                >
                  Save
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
