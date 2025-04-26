import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  features?: string[];
  link?: string;
  price?: string;
  priceUnit?: string;
}

interface ServicesEditorProps {
  data: {
    title?: string;
    description?: string;
    items?: ServiceItem[];
    showPricing?: boolean;
  };
  onChange: (data: any) => void;
}

export default function ServicesEditor({ data, onChange }: ServicesEditorProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState<{ [key: string]: string }>({});

  const handleSectionDataChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `service-${Date.now()}`,
      title: 'New Service',
      description: 'Description of this service',
      icon: '',
      image: '',
      features: [],
      link: '',
      price: '',
      priceUnit: '',
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

  const handleItemChange = (id: string, key: string, value: any) => {
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

  const handleImageUpload = (id: string, url: string, type: 'icon' | 'image') => {
    handleItemChange(id, type, url);
  };

  const handleAddFeature = (id: string) => {
    if (!featureInput[id] || featureInput[id].trim() === '') return;

    const item = (data.items || []).find(item => item.id === id);
    if (!item) return;

    const updatedFeatures = [...(item.features || []), featureInput[id].trim()];
    handleItemChange(id, 'features', updatedFeatures);
    setFeatureInput({ ...featureInput, [id]: '' });
  };

  const handleRemoveFeature = (id: string, index: number) => {
    const item = (data.items || []).find(item => item.id === id);
    if (!item || !item.features) return;

    const updatedFeatures = [...item.features];
    updatedFeatures.splice(index, 1);
    handleItemChange(id, 'features', updatedFeatures);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Section Title</label>
        <Input
          value={data.title || ''}
          onChange={(e) => handleSectionDataChange('title', e.target.value)}
          placeholder="My Services"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Section Description</label>
        <Textarea
          value={data.description || ''}
          onChange={(e) => handleSectionDataChange('description', e.target.value)}
          placeholder="Description of services I offer"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input
          type="checkbox"
          id="showPricing"
          checked={!!data.showPricing}
          onChange={(e) => handleSectionDataChange('showPricing', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="showPricing" className="text-sm">Show pricing information</label>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Services</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        <div className="space-y-2">
          {(data.items || []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md">
              No services added yet. Click "Add Service" to create your first service.
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
                          {item.icon ? (
                            <img
                              src={item.icon}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{item.title}</h4>
                          {data.showPricing && item.price && (
                            <p className="text-xs text-muted-foreground">
                              {item.price} {item.priceUnit}
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
                            <label className="text-xs font-medium">Service Title</label>
                            <Input
                              value={item.title}
                              onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                              placeholder="Service name"
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Description</label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Describe this service"
                              className="text-sm"
                              rows={3}
                            />
                          </div>

                          {data.showPricing && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Price</label>
                                <Input
                                  value={item.price || ''}
                                  onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                  placeholder="e.g. $99"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium">Price Unit (Optional)</label>
                                <Input
                                  value={item.priceUnit || ''}
                                  onChange={(e) => handleItemChange(item.id, 'priceUnit', e.target.value)}
                                  placeholder="e.g. /hour, /month"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Link (Optional)</label>
                            <Input
                              value={item.link || ''}
                              onChange={(e) => handleItemChange(item.id, 'link', e.target.value)}
                              placeholder="https://..."
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Service Icon (Optional)</label>
                            <div className="flex items-center space-x-3">
                              <div className="w-14 h-14 bg-muted rounded flex items-center justify-center overflow-hidden p-1">
                                {item.icon ? (
                                  <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <FileUpload
                                onUploadComplete={(url) => handleImageUpload(item.id, url, 'icon')}
                                acceptedFileTypes={{
                                  'image/*': ['.jpg', '.jpeg', '.png', '.svg']
                                }}
                                maxSizeInMB={1}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              For best results, use a square image or SVG icon
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Service Image (Optional)</label>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 h-14 bg-muted rounded flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <FileUpload
                                onUploadComplete={(url) => handleImageUpload(item.id, url, 'image')}
                                acceptedFileTypes={{
                                  'image/*': ['.jpg', '.jpeg', '.png']
                                }}
                                maxSizeInMB={2}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-medium">Features/Inclusions</label>

                            <div className="flex items-center space-x-2">
                              <Input
                                value={featureInput[item.id] || ''}
                                onChange={(e) => setFeatureInput({ ...featureInput, [item.id]: e.target.value })}
                                placeholder="Add a feature"
                                className="h-8 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFeature(item.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddFeature(item.id)}
                              >
                                Add
                              </Button>
                            </div>

                            {(item.features || []).length > 0 && (
                              <div className="space-y-1 mt-2">
                                {item.features?.map((feature, index) => (
                                  <div key={index} className="flex items-center justify-between bg-muted/30 px-3 py-1 rounded text-sm">
                                    <span>{feature}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveFeature(item.id, index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
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
