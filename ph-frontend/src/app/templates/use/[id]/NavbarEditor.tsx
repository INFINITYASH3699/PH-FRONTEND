import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, MoveUp, MoveDown, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

interface NavbarEditorProps {
  data: {
    logo?: {
      src?: string;
      alt?: string;
      text?: string;
    };
    items?: NavItem[];
    position?: 'fixed' | 'static' | 'sticky';
    transparent?: boolean;
    enableDarkMode?: boolean;
    colorScheme?: 'light' | 'dark' | 'auto';
    hideOnScroll?: boolean;
    ctaButton?: {
      enabled?: boolean;
      label?: string;
      href?: string;
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    };
  };
  onChange: (data: any) => void;
}

export default function NavbarEditor({ data, onChange }: NavbarEditorProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'appearance' | 'settings'>('items');

  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleNestedChange = (parent: string, key: string, value: any) => {
    onChange({
      ...data,
      [parent]: {
        ...(data[parent as keyof typeof data] as object || {}),
        [key]: value
      }
    });
  };

  const handleAddNavItem = () => {
    const newItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      href: '#',
      isExternal: false
    };

    handleChange('items', [...(data.items || []), newItem]);
  };

  const handleUpdateNavItem = (id: string, key: string, value: any) => {
    handleChange(
      'items',
      (data.items || []).map(item =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  const handleDeleteNavItem = (id: string) => {
    handleChange(
      'items',
      (data.items || []).filter(item => item.id !== id)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(data.items || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    handleChange('items', items);
  };

  const toggleCtaButton = (enabled: boolean) => {
    handleNestedChange('ctaButton', 'enabled', enabled);
    if (enabled && !data.ctaButton) {
      handleChange('ctaButton', {
        enabled: true,
        label: 'Contact Me',
        href: '#contact',
        variant: 'primary'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'items' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Navigation Items
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'appearance' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Logo & Branding
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Navigation Links</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNavItem}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Link
            </Button>
          </div>

          {(data.items || []).length === 0 ? (
            <div className="p-6 text-center text-muted-foreground border border-dashed rounded-md">
              No navigation items added yet. Click "Add Link" to create your first navigation link.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="navbar-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {(data.items || []).map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-md p-3"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNavItem(item.id)}
                                  className="h-7 w-7 p-0 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Link Text</label>
                                <Input
                                  value={item.label}
                                  onChange={(e) => handleUpdateNavItem(item.id, 'label', e.target.value)}
                                  placeholder="Home"
                                  className="h-8"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium">Link URL</label>
                                <Input
                                  value={item.href}
                                  onChange={(e) => handleUpdateNavItem(item.id, 'href', e.target.value)}
                                  placeholder="#home or https://..."
                                  className="h-8"
                                />
                                <div className="flex items-center space-x-2 pt-1">
                                  <Switch
                                    id={`external-${item.id}`}
                                    checked={item.isExternal}
                                    onCheckedChange={(checked) => handleUpdateNavItem(item.id, 'isExternal', checked)}
                                  />
                                  <Label htmlFor={`external-${item.id}`} className="text-xs">Open in new tab</Label>
                                </div>
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
            </DragDropContext>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-3">
              <Switch
                id="cta-enabled"
                checked={data.ctaButton?.enabled}
                onCheckedChange={(checked) => toggleCtaButton(checked)}
              />
              <Label htmlFor="cta-enabled">Enable call-to-action button</Label>
            </div>

            {data.ctaButton?.enabled && (
              <div className="grid gap-3 pl-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Button Text</label>
                  <Input
                    value={data.ctaButton?.label || 'Contact Me'}
                    onChange={(e) => handleNestedChange('ctaButton', 'label', e.target.value)}
                    placeholder="Contact Me"
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Button Link</label>
                  <Input
                    value={data.ctaButton?.href || '#contact'}
                    onChange={(e) => handleNestedChange('ctaButton', 'href', e.target.value)}
                    placeholder="#contact"
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Button Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['primary', 'secondary', 'outline', 'ghost'].map((variant) => (
                      <button
                        key={variant}
                        className={`py-1 px-2 text-xs rounded border ${
                          data.ctaButton?.variant === variant
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-muted bg-background'
                        }`}
                        onClick={() => handleNestedChange('ctaButton', 'variant', variant)}
                      >
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-3">Logo Settings</h3>

          <div className="space-y-2">
            <label className="text-xs font-medium">Logo Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`py-2 px-3 text-sm rounded border ${
                  (data.logo?.text || !data.logo?.src) ? 'border-primary bg-primary/10 text-primary' : 'border-muted bg-background'
                }`}
                onClick={() => handleNestedChange('logo', 'src', '')}
              >
                Text Logo
              </button>
              <button
                className={`py-2 px-3 text-sm rounded border ${
                  data.logo?.src ? 'border-primary bg-primary/10 text-primary' : 'border-muted bg-background'
                }`}
                onClick={() => {
                  if (!data.logo?.src) {
                    handleNestedChange('logo', 'src', 'https://placekitten.com/200/50');
                  }
                }}
              >
                Image Logo
              </button>
            </div>
          </div>

          {!data.logo?.src && (
            <div className="space-y-2">
              <label className="text-xs font-medium">Logo Text</label>
              <Input
                value={data.logo?.text || ''}
                onChange={(e) => handleNestedChange('logo', 'text', e.target.value)}
                placeholder="Your Name"
                className="h-8"
              />
            </div>
          )}

          {data.logo?.src && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium">Logo Image URL</label>
                <Input
                  value={data.logo?.src || ''}
                  onChange={(e) => handleNestedChange('logo', 'src', e.target.value)}
                  placeholder="https://..."
                  className="h-8"
                />
                <div className="mt-2 p-3 border rounded flex items-center justify-center">
                  {data.logo?.src ? (
                    <img
                      src={data.logo.src}
                      alt={data.logo.alt || 'Logo'}
                      className="max-h-10"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">No logo image set</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Alt Text</label>
                <Input
                  value={data.logo?.alt || ''}
                  onChange={(e) => handleNestedChange('logo', 'alt', e.target.value)}
                  placeholder="Logo alt text"
                  className="h-8"
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-3">Navbar Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="navbar-transparent"
                checked={data.transparent}
                onCheckedChange={(checked) => handleChange('transparent', checked)}
              />
              <Label htmlFor="navbar-transparent">Transparent background</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="navbar-sticky"
                checked={data.position === 'sticky'}
                onCheckedChange={(checked) => handleChange('position', checked ? 'sticky' : 'static')}
              />
              <Label htmlFor="navbar-sticky">Sticky navbar (stays at top when scrolling)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="navbar-hide-scroll"
                checked={data.hideOnScroll}
                onCheckedChange={(checked) => handleChange('hideOnScroll', checked)}
              />
              <Label htmlFor="navbar-hide-scroll">Hide on scroll down</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="navbar-dark-mode"
                checked={data.enableDarkMode}
                onCheckedChange={(checked) => handleChange('enableDarkMode', checked)}
              />
              <Label htmlFor="navbar-dark-mode">Enable dark mode toggle</Label>
            </div>

            {data.enableDarkMode && (
              <div className="pl-6 pt-1">
                <label className="text-xs font-medium block mb-2">Default Color Scheme</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'auto'].map((scheme) => (
                    <button
                      key={scheme}
                      className={`py-1 px-2 text-xs rounded border ${
                        data.colorScheme === scheme
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted bg-background'
                      }`}
                      onClick={() => handleChange('colorScheme', scheme)}
                    >
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
