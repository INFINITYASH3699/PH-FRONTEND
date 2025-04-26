import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

interface ClientItem {
  id: string;
  name: string;
  description?: string;
  logo: string;
  link?: string;
}

interface ClientsEditorProps {
  data: {
    title?: string;
    description?: string;
    items?: ClientItem[];
  };
  onChange: (data: any) => void;
}

export default function ClientsEditor({ data, onChange }: ClientsEditorProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleSectionDataChange = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `client-${Date.now()}`,
      name: 'Client Name',
      description: '',
      logo: '',
      link: '',
    };
    onChange({
      ...data,
      items: [...(data.items || []), newItem]
    });
    setActiveItem(newItem.id);
  };

  const handleDeleteItem = (id: string) => {
    onChange({
      ...data,
      items: (data.items || []).filter(item => item.id !== id)
    });
    if (activeItem === id) {
      setActiveItem(null);
    }
  };

  const handleItemChange = (id: string, key: string, value: string) => {
    onChange({
      ...data,
      items: (data.items || []).map(item =>
        item.id === id ? { ...item, [key]: value } : item
      )
    });
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const items = [...(data.items || [])];
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return;

    const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(items.length - 1, index + 1);
    if (newIndex === index) return;

    const item = items[index];
    items.splice(index, 1);
    items.splice(newIndex, 0, item);

    onChange({ ...data, items });
  };

  const handleLogoUpload = (id: string, url: string) => {
    handleItemChange(id, 'logo', url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Section Title</label>
        <Input
          value={data.title || ''}
          onChange={(e) => handleSectionDataChange('title', e.target.value)}
          placeholder="My Clients"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Section Description</label>
        <Textarea
          value={data.description || ''}
          onChange={(e) => handleSectionDataChange('description', e.target.value)}
          placeholder="Companies and organizations I've worked with"
          rows={3}
        />
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Client List</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="space-y-2">
          {(data.items || []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md">
              No clients added yet. Click "Add Client" to start adding your clients.
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                {(data.items || []).map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-md ${activeItem === item.id ? 'border-primary' : ''}`}
                  >
                    <div
                      className="p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-muted mr-3 rounded flex items-center justify-center overflow-hidden">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          {item.link && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.link}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'up');
                          }}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(item.id, 'down');
                          }}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {activeItem === item.id && (
                      <div className="p-3 pt-0 border-t">
                        <div className="grid gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Client Name</label>
                            <Input
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="Client name"
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Description (Optional)</label>
                            <Textarea
                              value={item.description || ''}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Brief description or project focus"
                              className="text-sm"
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Website Link (Optional)</label>
                            <Input
                              value={item.link || ''}
                              onChange={(e) => handleItemChange(item.id, 'link', e.target.value)}
                              placeholder="https://..."
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Client Logo</label>
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden p-1">
                                {item.logo ? (
                                  <img
                                    src={item.logo}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <FileUpload
                                onUploadComplete={(url) => handleLogoUpload(item.id, url)}
                                acceptedFileTypes={{
                                  'image/*': ['.jpg', '.jpeg', '.png', '.svg']
                                }}
                                maxSizeInMB={1}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              For best results, use a transparent PNG or SVG file
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
