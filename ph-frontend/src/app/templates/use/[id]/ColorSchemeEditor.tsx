import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Eye, Eyedropper, Palette, Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react';

interface ColorSchemeEditorProps {
  data: {
    name?: string;
    id?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: string;
      muted?: string;
      mutedForeground?: string;
      border?: string;
      ring?: string;
      [key: string]: string | undefined;
    };
    isDark?: boolean;
    addCustomColors?: boolean;
    customColors?: {
      name: string;
      value: string;
      id: string;
    }[];
  };
  presets?: any[];
  onChange: (data: any) => void;
}

export default function ColorSchemeEditor({ data, presets = [], onChange }: ColorSchemeEditorProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'custom' | 'presets'>('main');
  const [colorCopied, setColorCopied] = useState<string | null>(null);
  const [colorPicker, setColorPicker] = useState<string | null>(null);
  const [newCustomColorName, setNewCustomColorName] = useState('');
  const [newCustomColorValue, setNewCustomColorValue] = useState('#000000');

  const handleColorChange = (key: string, value: string) => {
    onChange({
      ...data,
      colors: {
        ...(data.colors || {}),
        [key]: value
      }
    });
  };

  const handleGeneralChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handlePresetSelect = (preset: any) => {
    onChange({
      ...data,
      colors: { ...preset.colors },
      name: data.name || preset.name,
      isDark: preset.isDark
    });
  };

  const handleAddCustomColor = () => {
    if (!newCustomColorName || !newCustomColorValue) return;

    const newColor = {
      name: newCustomColorName,
      value: newCustomColorValue,
      id: `color-${Date.now()}`
    };

    onChange({
      ...data,
      addCustomColors: true,
      customColors: [...(data.customColors || []), newColor]
    });

    setNewCustomColorName('');
    setNewCustomColorValue('#000000');
  };

  const handleDeleteCustomColor = (id: string) => {
    onChange({
      ...data,
      customColors: (data.customColors || []).filter(color => color.id !== id)
    });
  };

  const handleCustomColorChange = (id: string, key: string, value: string) => {
    onChange({
      ...data,
      customColors: (data.customColors || []).map(color =>
        color.id === id ? { ...color, [key]: value } : color
      )
    });
  };

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setColorCopied(color);
    setTimeout(() => {
      setColorCopied(null);
    }, 1500);
  };

  const toggleDarkMode = () => {
    handleGeneralChange('isDark', !data.isDark);
  };

  const autoGenerateSecondaryColors = () => {
    const primary = data.colors?.primary || '#3b82f6';

    // Generate derived colors
    const secondary = adjustColor(primary, { lighten: data.isDark ? 10 : -10 });
    const accent = adjustColor(primary, { rotate: 30, saturate: 10 });
    const background = data.isDark ? '#1f2937' : '#ffffff';
    const foreground = data.isDark ? '#f9fafb' : '#171717';
    const muted = data.isDark ? '#374151' : '#f3f4f6';
    const mutedForeground = data.isDark ? '#9ca3af' : '#6b7280';
    const border = data.isDark ? '#374151' : '#e5e7eb';
    const ring = adjustColor(primary, { opacity: 0.3 });

    onChange({
      ...data,
      colors: {
        ...(data.colors || {}),
        primary,
        secondary,
        accent,
        background,
        foreground,
        muted,
        mutedForeground,
        border,
        ring
      }
    });
  };

  // Color adjustment helper function
  const adjustColor = (color: string, { lighten = 0, darken = 0, saturate = 0, desaturate = 0, rotate = 0, opacity = 1 }) => {
    let r = 0, g = 0, b = 0;

    // Parse hex color
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }

    // Convert to HSL for easier manipulation
    const hsl = rgbToHsl(r, g, b);

    // Apply adjustments
    hsl.h += rotate;
    hsl.h = hsl.h % 360;
    hsl.s += saturate - desaturate;
    hsl.s = Math.max(0, Math.min(100, hsl.s));
    hsl.l += lighten - darken;
    hsl.l = Math.max(0, Math.min(100, hsl.l));

    // Convert back to RGB
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

    // Convert to hex
    return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
  };

  // RGB to HSL conversion
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  };

  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Convert component to hex
  const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Main colors that are always shown
  const mainColors = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Text' },
  ];

  // Secondary colors shown in advanced mode
  const secondaryColors = [
    { key: 'muted', label: 'Muted Background' },
    { key: 'mutedForeground', label: 'Muted Text' },
    { key: 'border', label: 'Border' },
    { key: 'ring', label: 'Focus Ring' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Color Scheme Name</label>
          <Input
            value={data.name || ''}
            onChange={(e) => handleGeneralChange('name', e.target.value)}
            placeholder="Custom Color Scheme"
            className="h-9 w-60"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="dark-mode"
            checked={data.isDark}
            onCheckedChange={toggleDarkMode}
          />
          <Label htmlFor="dark-mode" className="text-sm">{data.isDark ? 'Dark Mode' : 'Light Mode'}</Label>
        </div>
      </div>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'main' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('main')}
        >
          Main Colors
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'custom' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Colors
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'presets' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
      </div>

      {activeTab === 'main' && (
        <div className="space-y-5">
          <Button
            variant="outline"
            size="sm"
            onClick={autoGenerateSecondaryColors}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Auto-Generate Colors</span>
          </Button>

          <div className="grid gap-3">
            {mainColors.map((color) => (
              <div key={color.key} className="flex items-center space-x-3">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium">{color.label}</label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded border cursor-pointer relative"
                      style={{
                        backgroundColor: data.colors?.[color.key] || '#ffffff',
                        borderColor: data.isDark && color.key === 'background' ? '#374151' : '#e5e7eb'
                      }}
                      onClick={() => setColorPicker(color.key)}
                    >
                      {colorPicker === color.key && (
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColorPicker(null);
                          }}
                        />
                      )}
                    </div>
                    <Input
                      value={data.colors?.[color.key] || ''}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      placeholder="#hexcode"
                      className="h-8 w-32"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyColorToClipboard(data.colors?.[color.key] || '')}
                      className="h-8 w-8 p-0"
                      disabled={!data.colors?.[color.key]}
                    >
                      {colorCopied === data.colors?.[color.key] ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="color"
                      value={data.colors?.[color.key] || '#ffffff'}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="w-8 h-8 rounded-md border p-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t">
            <details className="text-sm">
              <summary className="font-medium cursor-pointer">Advanced Colors</summary>
              <div className="grid gap-3 mt-3">
                {secondaryColors.map((color) => (
                  <div key={color.key} className="flex items-center space-x-3">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-medium">{color.label}</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-10 h-10 rounded border cursor-pointer"
                          style={{
                            backgroundColor: data.colors?.[color.key] || '#ffffff',
                            borderColor: data.isDark ? '#374151' : '#e5e7eb'
                          }}
                        />
                        <Input
                          value={data.colors?.[color.key] || ''}
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          placeholder="#hexcode"
                          className="h-8 w-32"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyColorToClipboard(data.colors?.[color.key] || '')}
                          className="h-8 w-8 p-0"
                          disabled={!data.colors?.[color.key]}
                        >
                          {colorCopied === data.colors?.[color.key] ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          type="color"
                          value={data.colors?.[color.key] || '#ffffff'}
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          className="w-8 h-8 rounded-md border p-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div
            className="p-4 rounded-md border mt-4"
            style={{
              backgroundColor: data.colors?.background || (data.isDark ? '#1f2937' : '#ffffff'),
              color: data.colors?.foreground || (data.isDark ? '#f9fafb' : '#171717'),
              borderColor: data.colors?.border || (data.isDark ? '#374151' : '#e5e7eb')
            }}
          >
            <h3 className="font-medium text-sm mb-2">Preview</h3>
            <div className="flex flex-wrap gap-2">
              <div
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: data.colors?.primary || '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Primary
              </div>
              <div
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: data.colors?.secondary || '#1d4ed8',
                  color: '#ffffff'
                }}
              >
                Secondary
              </div>
              <div
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: data.colors?.accent || '#f59e0b',
                  color: '#ffffff'
                }}
              >
                Accent
              </div>
              <div
                className="px-3 py-1 rounded-md text-xs border font-medium"
                style={{
                  backgroundColor: data.colors?.muted || (data.isDark ? '#374151' : '#f3f4f6'),
                  color: data.colors?.mutedForeground || (data.isDark ? '#9ca3af' : '#6b7280'),
                  borderColor: data.colors?.border || (data.isDark ? '#374151' : '#e5e7eb')
                }}
              >
                Muted
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Switch
              id="custom-colors-enabled"
              checked={data.addCustomColors}
              onCheckedChange={(checked) => handleGeneralChange('addCustomColors', checked)}
            />
            <Label htmlFor="custom-colors-enabled">Enable custom colors</Label>
          </div>

          {data.addCustomColors && (
            <>
              <div className="grid gap-3">
                <div className="flex items-center space-x-3">
                  <Input
                    value={newCustomColorName}
                    onChange={(e) => setNewCustomColorName(e.target.value)}
                    placeholder="Color name (e.g. warning)"
                    className="h-9"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newCustomColorValue}
                      onChange={(e) => setNewCustomColorValue(e.target.value)}
                      className="w-9 h-9 rounded-md border p-0"
                    />
                    <Input
                      value={newCustomColorValue}
                      onChange={(e) => setNewCustomColorValue(e.target.value)}
                      placeholder="#hexcode"
                      className="h-9 w-28"
                    />
                  </div>
                  <Button
                    onClick={handleAddCustomColor}
                    disabled={!newCustomColorName || !newCustomColorValue}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {(data.customColors || []).length > 0 ? (
                <div className="border rounded-md p-3 mt-4">
                  <h3 className="font-medium text-sm mb-3">Custom Colors</h3>
                  <div className="space-y-3">
                    {(data.customColors || []).map((color) => (
                      <div key={color.id} className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-md"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Input
                                  value={color.name}
                                  onChange={(e) => handleCustomColorChange(color.id, 'name', e.target.value)}
                                  placeholder="Color name"
                                  className="h-8 w-40"
                                />
                                <code className="ml-2 text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                                  --{color.name}
                                </code>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={color.value}
                                  onChange={(e) => handleCustomColorChange(color.id, 'value', e.target.value)}
                                  className="w-8 h-8 rounded border p-0"
                                />
                                <Input
                                  value={color.value}
                                  onChange={(e) => handleCustomColorChange(color.id, 'value', e.target.value)}
                                  placeholder="#hexcode"
                                  className="h-8 w-28"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomColor(color.id)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground border border-dashed rounded-md">
                  No custom colors added yet. Use the form above to add your first custom color.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {presets.length > 0 ? (
              presets.map((preset, index) => (
                <button
                  key={index}
                  className="border rounded-md p-3 text-left hover:border-primary transition-colors"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="font-medium text-sm mb-2">{preset.name}</div>
                  <div className="flex space-x-1.5">
                    {['primary', 'secondary', 'accent', 'background', 'foreground'].map((colorKey) => (
                      <div
                        key={colorKey}
                        className="w-6 h-6 rounded-full border"
                        style={{
                          backgroundColor: preset.colors[colorKey],
                          borderColor: preset.isDark ? '#374151' : '#e5e7eb'
                        }}
                        title={`${colorKey}: ${preset.colors[colorKey]}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {preset.isDark ? 'Dark Theme' : 'Light Theme'}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 p-6 text-center text-muted-foreground border border-dashed rounded-md">
                No color presets available. You can create and save your own.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
