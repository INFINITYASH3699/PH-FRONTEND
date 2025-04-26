import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, MoveUp, MoveDown, Grid2X2, AlignLeft, ChevronsUp } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterEditorProps {
  data: {
    showFooter?: boolean;
    darkMode?: boolean;
    copyright?: string;
    logo?: {
      src?: string;
      alt?: string;
      text?: string;
    };
    description?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    showScrollToTop?: boolean;
    showCredit?: boolean;
    creditText?: string;
    layout?: 'simple' | 'columns' | 'centered';
  };
  onChange: (data: any) => void;
}

export default function FooterEditor({ data, onChange }: FooterEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'social' | 'settings'>('content');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

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

  // Column management
  const handleAddColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title: 'Navigation',
      links: [
        {
          id: `link-${Date.now()}-1`,
          label: 'Home',
          url: '#'
        }
      ]
    };

    handleChange('columns', [...(data.columns || []), newColumn]);
    setActiveColumn(newColumn.id);
  };

  const handleUpdateColumn = (id: string, key: string, value: any) => {
    handleChange(
      'columns',
      (data.columns || []).map(col =>
        col.id === id ? { ...col, [key]: value } : col
      )
    );
  };

  const handleDeleteColumn = (id: string) => {
    handleChange(
      'columns',
      (data.columns || []).filter(col => col.id !== id)
    );

    if (activeColumn === id) {
      setActiveColumn(null);
    }
  };

  // Link management
  const handleAddLink = (columnId: string) => {
    const column = (data.columns || []).find(col => col.id === columnId);
    if (!column) return;

    const newLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      url: '#'
    };

    handleUpdateColumn(
      columnId,
      'links',
      [...column.links, newLink]
    );
  };

  const handleUpdateLink = (columnId: string, linkId: string, key: string, value: string) => {
    const column = (data.columns || []).find(col => col.id === columnId);
    if (!column) return;

    handleUpdateColumn(
      columnId,
      'links',
      column.links.map(link =>
        link.id === linkId ? { ...link, [key]: value } : link
      )
    );
  };

  const handleDeleteLink = (columnId: string, linkId: string) => {
    const column = (data.columns || []).find(col => col.id === columnId);
    if (!column) return;

    handleUpdateColumn(
      columnId,
      'links',
      column.links.filter(link => link.id !== linkId)
    );
  };

  // Social links management
  const handleAddSocialLink = () => {
    const newSocial = {
      id: `social-${Date.now()}`,
      platform: 'Twitter',
      url: 'https://twitter.com/',
      icon: 'twitter'
    };

    handleChange('socialLinks', [...(data.socialLinks || []), newSocial]);
  };

  const handleUpdateSocialLink = (id: string, key: string, value: string) => {
    handleChange(
      'socialLinks',
      (data.socialLinks || []).map(link =>
        link.id === id ? { ...link, [key]: value } : link
      )
    );
  };

  const handleDeleteSocialLink = (id: string) => {
    handleChange(
      'socialLinks',
      (data.socialLinks || []).filter(link => link.id !== id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="footer-enabled"
          checked={data.showFooter !== false} // Default to true if undefined
          onCheckedChange={(checked) => handleChange('showFooter', checked)}
        />
        <Label htmlFor="footer-enabled" className="font-medium">Show footer section</Label>
      </div>

      {data.showFooter !== false && (
        <>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'content' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'links' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('links')}
            >
              Navigation
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'social' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              Social Links
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Footer Layout</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`p-3 border rounded-md flex flex-col items-center justify-center gap-2 ${data.layout === 'simple' || !data.layout ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleChange('layout', 'simple')}
                  >
                    <AlignLeft className="h-5 w-5" />
                    <span className="text-xs">Simple</span>
                  </button>
                  <button
                    className={`p-3 border rounded-md flex flex-col items-center justify-center gap-2 ${data.layout === 'columns' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleChange('layout', 'columns')}
                  >
                    <Grid2X2 className="h-5 w-5" />
                    <span className="text-xs">Columns</span>
                  </button>
                  <button
                    className={`p-3 border rounded-md flex flex-col items-center justify-center gap-2 ${data.layout === 'centered' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleChange('layout', 'centered')}
                  >
                    <AlignLeft className="h-5 w-5 rotate-180" />
                    <span className="text-xs">Centered</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Copyright Text</label>
                <Input
                  value={data.copyright || ''}
                  onChange={(e) => handleChange('copyright', e.target.value)}
                  placeholder="© 2025 Your Name"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Footer Description</label>
                <Textarea
                  value={data.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of your portfolio or services"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Footer Logo</label>
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

                {!data.logo?.src && (
                  <div className="space-y-2 mt-3">
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
                  <div className="space-y-2 mt-3">
                    <label className="text-xs font-medium">Logo Image URL</label>
                    <Input
                      value={data.logo?.src || ''}
                      onChange={(e) => handleNestedChange('logo', 'src', e.target.value)}
                      placeholder="https://..."
                      className="h-8"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Navigation Columns</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddColumn}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Column
                </Button>
              </div>

              {(data.columns || []).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground border border-dashed rounded-md">
                  No navigation columns added yet. Click "Add Column" to create your first footer navigation.
                </div>
              ) : (
                <div className="space-y-4">
                  {(data.columns || []).map((column) => (
                    <div
                      key={column.id}
                      className={`border rounded-md p-3 ${activeColumn === column.id ? 'border-primary' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">{column.title}</h4>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveColumn(activeColumn === column.id ? null : column.id)}
                            className="h-7 w-7 p-0"
                          >
                            {activeColumn === column.id ? <MoveUp className="h-4 w-4" /> : <MoveDown className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteColumn(column.id)}
                            className="h-7 w-7 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Column Title</label>
                          <Input
                            value={column.title}
                            onChange={(e) => handleUpdateColumn(column.id, 'title', e.target.value)}
                            placeholder="Navigation"
                            className="h-8"
                          />
                        </div>

                        {activeColumn === column.id && (
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium">Links</label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddLink(column.id)}
                                className="h-7 text-xs flex items-center gap-1"
                              >
                                <PlusCircle className="h-3 w-3" />
                                Add Link
                              </Button>
                            </div>

                            {column.links.length === 0 ? (
                              <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded-md">
                                No links added yet.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {column.links.map((link) => (
                                  <div key={link.id} className="border rounded-md p-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium">{link.label}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteLink(column.id, link.id)}
                                        className="h-6 w-6 p-0 text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-xs">Label</label>
                                        <Input
                                          value={link.label}
                                          onChange={(e) => handleUpdateLink(column.id, link.id, 'label', e.target.value)}
                                          placeholder="Home"
                                          className="h-7 text-xs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-xs">URL</label>
                                        <Input
                                          value={link.url}
                                          onChange={(e) => handleUpdateLink(column.id, link.id, 'url', e.target.value)}
                                          placeholder="#"
                                          className="h-7 text-xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Social Media Links</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddSocialLink}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Social Link
                </Button>
              </div>

              {(data.socialLinks || []).length === 0 ? (
                <div className="p-6 text-center text-muted-foreground border border-dashed rounded-md">
                  No social links added yet. Click "Add Social Link" to create your first social media link.
                </div>
              ) : (
                <div className="space-y-2">
                  {(data.socialLinks || []).map((social) => (
                    <div key={social.id} className="border rounded-md p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{social.platform}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSocialLink(social.id)}
                          className="h-7 w-7 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Platform</label>
                          <Input
                            value={social.platform}
                            onChange={(e) => handleUpdateSocialLink(social.id, 'platform', e.target.value)}
                            placeholder="Twitter"
                            className="h-8"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">URL</label>
                          <Input
                            value={social.url}
                            onChange={(e) => handleUpdateSocialLink(social.id, 'url', e.target.value)}
                            placeholder="https://twitter.com/username"
                            className="h-8"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Icon (optional)</label>
                          <Input
                            value={social.icon || ''}
                            onChange={(e) => handleUpdateSocialLink(social.id, 'icon', e.target.value)}
                            placeholder="twitter"
                            className="h-8"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter icon name from LucideIcons or FontAwesome
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-3">Footer Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="footer-dark"
                    checked={data.darkMode}
                    onCheckedChange={(checked) => handleChange('darkMode', checked)}
                  />
                  <Label htmlFor="footer-dark">Dark background</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="scroll-top"
                    checked={data.showScrollToTop}
                    onCheckedChange={(checked) => handleChange('showScrollToTop', checked)}
                  />
                  <Label htmlFor="scroll-top">Show "scroll to top" button</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-credit"
                    checked={data.showCredit}
                    onCheckedChange={(checked) => handleChange('showCredit', checked)}
                  />
                  <Label htmlFor="show-credit">Show credit text</Label>
                </div>

                {data.showCredit && (
                  <div className="pl-6 pt-1 space-y-2">
                    <label className="text-xs font-medium">Credit Text</label>
                    <Input
                      value={data.creditText || ''}
                      onChange={(e) => handleChange('creditText', e.target.value)}
                      placeholder="Made with PortfolioHub"
                      className="h-8"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
