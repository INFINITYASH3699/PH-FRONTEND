import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditableText } from '../editable/EditableText';
import FileUpload from '@/components/ui/file-upload';

interface ClientsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    clients?: Array<{
      name: string;
      logo?: string;
      description?: string;
      link?: string;
      featured?: boolean;
    }>;
    variant?: 'grid' | 'logos' | 'testimonials';
    columns?: '3' | '4' | '5' | '6';
    backgroundColor?: string;
    textColor?: string;
    logoSize?: 'small' | 'medium' | 'large';
    showNames?: boolean;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder image URL
const createPlaceholderImage = (text: string, size = 200, bgColor = 'eeeeee') => {
  return `https://placehold.co/${size}x${size}/${bgColor}/666666?text=${encodeURIComponent(text)}`;
};

const ClientsSection: React.FC<ClientsSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Add upload loading state
  const [uploadingLogoIndex, setUploadingLogoIndex] = useState<number | null>(null);

  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'photographer' ? 'logos' : 'grid');

  // Determine columns
  const columns = data.columns || '4';

  // Determine logo size
  const logoSize = data.logoSize || 'medium';

  // Ensure we have clients array
  const clients = data.clients?.length ? data.clients : editable ?
    Array(6).fill(null).map((_, i) => ({
      name: `Client ${i + 1}`,
      logo: createPlaceholderImage(`Client ${i + 1}`),
      description: i < 2 ? 'This client has been with us for many years. We have completed multiple successful projects together.' : '',
      featured: i === 0
    })) : [];

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle client update
  const handleClientUpdate = (index: number, field: string, value: string | boolean) => {
    if (onUpdate && editable) {
      const newClients = [...clients];

      if (!newClients[index]) {
        newClients[index] = { name: '' };
      }

      newClients[index] = {
        ...newClients[index],
        [field]: value
      };

      onUpdate({
        ...data,
        clients: newClients
      });
    }
  };

  // Handle logo update for a client with proper file upload
  const handleLogoUpdate = (index: number, result: { url: string; publicId: string }) => {
    if (onUpdate && editable) {
      handleClientUpdate(index, 'logo', result.url);
      setUploadingLogoIndex(null);
    }
  };

  // Handle logo upload error
  const handleLogoUploadError = (error: string) => {
    console.error("Logo upload error:", error);
    setUploadingLogoIndex(null);
  };

  // Handle adding a new client
  const handleAddClient = () => {
    if (onUpdate && editable) {
      const newClients = [
        ...clients,
        {
          name: 'New Client',
          logo: createPlaceholderImage('New Client'),
          description: 'Client description goes here',
          link: '',
          featured: false
        }
      ];

      onUpdate({
        ...data,
        clients: newClients
      });
    }
  };

  // Handle removing a client
  const handleRemoveClient = (index: number) => {
    if (onUpdate && editable) {
      const newClients = [...clients];
      newClients.splice(index, 1);

      onUpdate({
        ...data,
        clients: newClients
      });
    }
  };

  // Handle toggling the featured status of a client
  const handleToggleFeatured = (index: number) => {
    if (onUpdate && editable) {
      const client = clients[index];
      handleClientUpdate(index, 'featured', !client.featured);
    }
  };

  // Get column class based on columns setting
  const getColumnClass = () => {
    switch (columns) {
      case '3':
        return 'grid-cols-2 md:grid-cols-3';
      case '5':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case '6':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      case '4':
      default:
        return 'grid-cols-2 md:grid-cols-4';
    }
  };

  // Get logo size class
  const getLogoSizeClass = () => {
    switch (logoSize) {
      case 'small':
        return 'h-16 max-w-[120px]';
      case 'large':
        return 'h-28 max-w-[200px]';
      case 'medium':
      default:
        return 'h-20 max-w-[160px]';
    }
  };

  // Render logos layout - simple grid of client logos
  const renderLogosLayout = () => {
    return (
      <div className={`grid ${getColumnClass()} gap-8 md:gap-12 items-center justify-items-center`}>
        {clients.map((client, index) => (
          <div key={index} className="relative group">
            {editable && (
              <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveClient(index)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative flex flex-col items-center">
              <div className={`relative ${getLogoSizeClass()} flex items-center justify-center mb-2`}>
                {client.logo ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={client.logo}
                      alt={client.name}
                      fill
                      className="object-contain"
                    />
                    {editable && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div
                          onClick={() => setUploadingLogoIndex(index)}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <FileUpload
                            onUploadComplete={(result) => handleLogoUpdate(index, result)}
                            onUploadError={handleLogoUploadError}
                            buttonText="Change Logo"
                            uploading={uploadingLogoIndex === index}
                            variant="secondary"
                            className="bg-white/90 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                    {editable ? (
                      <div
                        onClick={() => setUploadingLogoIndex(index)}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <FileUpload
                          onUploadComplete={(result) => handleLogoUpdate(index, result)}
                          onUploadError={handleLogoUploadError}
                          buttonText="Upload Logo"
                          uploading={uploadingLogoIndex === index}
                          variant="secondary"
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      "No Logo"
                    )}
                  </div>
                )}
              </div>

              {(data.showNames || editable) && (
                <EditableText
                  value={client.name}
                  onChange={(value) => handleClientUpdate(index, 'name', value)}
                  editable={editable}
                  className="text-center text-sm font-medium"
                />
              )}

              {client.link && (
                <a
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  Visit Website
                </a>
              )}
              {editable && !client.link && (
                <button
                  className="text-xs text-primary mt-1 hover:underline"
                  onClick={() => {
                    const url = prompt('Enter client website URL:');
                    if (url) handleClientUpdate(index, 'link', url);
                  }}
                >
                  + Add Website Link
                </button>
              )}
            </div>
          </div>
        ))}

        {editable && (
          <div
            className={`${getLogoSizeClass()} border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/20 min-w-[160px]`}
            onClick={handleAddClient}
          >
            <span className="text-muted-foreground text-sm">+ Add Client</span>
          </div>
        )}
      </div>
    );
  };

  // Render grid layout - more detailed client cards with descriptions
  const renderGridLayout = () => {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${
        columns === '3' ? 'lg:grid-cols-3' : columns === '4' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      } gap-6`}>
        {clients.map((client, index) => (
          <div
            key={index}
            className={`border rounded-lg p-6 relative group ${client.featured ? 'border-primary bg-primary/5' : ''}`}
          >
            {editable && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="bg-white text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleToggleFeatured(index)}
                  title={client.featured ? "Unmark as featured" : "Mark as featured"}
                >
                  ★
                </button>
                <button
                  className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveClient(index)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col items-center">
              {client.logo ? (
                <div className="relative h-20 w-40 mb-4 flex items-center justify-center">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />

                  {editable && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div
                        onClick={() => setUploadingLogoIndex(index)}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <FileUpload
                          onUploadComplete={(result) => handleLogoUpdate(index, result)}
                          onUploadError={handleLogoUploadError}
                          buttonText="Change Logo"
                          uploading={uploadingLogoIndex === index}
                          variant="secondary"
                          className="bg-white/90 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : editable && (
                <div className="h-20 w-40 mb-4 flex items-center justify-center bg-muted rounded-md">
                  <div
                    onClick={() => setUploadingLogoIndex(index)}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <FileUpload
                      onUploadComplete={(result) => handleLogoUpdate(index, result)}
                      onUploadError={handleLogoUploadError}
                      buttonText="Upload Logo"
                      uploading={uploadingLogoIndex === index}
                      variant="outline"
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              <EditableText
                value={client.name}
                onChange={(value) => handleClientUpdate(index, 'name', value)}
                editable={editable}
                className="text-center font-bold text-lg mb-2"
              />

              {client.description && (
                <EditableText
                  value={client.description}
                  onChange={(value) => handleClientUpdate(index, 'description', value)}
                  editable={editable}
                  multiline
                  className="text-center text-muted-foreground text-sm mb-4"
                />
              )}

              {client.link && (
                <a
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website →
                </a>
              )}
              {editable && !client.link && (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    const url = prompt('Enter client website URL:');
                    if (url) handleClientUpdate(index, 'link', url);
                  }}
                >
                  + Add Website Link
                </button>
              )}
            </div>
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20 min-h-[200px]"
            onClick={handleAddClient}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Client</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render testimonials layout - client logos with testimonials
  const renderTestimonialsLayout = () => {
    return (
      <div className="space-y-12">
        {clients.map((client, index) => (
          <div key={index} className="relative group">
            {editable && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveClient(index)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {client.logo ? (
                <div className="relative h-24 w-40 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />

                  {editable && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div
                        onClick={() => setUploadingLogoIndex(index)}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <FileUpload
                          onUploadComplete={(result) => handleLogoUpdate(index, result)}
                          onUploadError={handleLogoUploadError}
                          buttonText="Change Logo"
                          uploading={uploadingLogoIndex === index}
                          variant="secondary"
                          className="bg-white/90 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : editable && (
                <div className="h-24 w-40 flex-shrink-0 flex items-center justify-center bg-muted rounded-md">
                  <div
                    onClick={() => setUploadingLogoIndex(index)}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <FileUpload
                      onUploadComplete={(result) => handleLogoUpdate(index, result)}
                      onUploadError={handleLogoUploadError}
                      buttonText="Upload Logo"
                      uploading={uploadingLogoIndex === index}
                      variant="outline"
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1">
                <div className="text-3xl text-primary mb-2">❞</div>
                <EditableText
                  value={client.description || "Add a testimonial or description for this client."}
                  onChange={(value) => handleClientUpdate(index, 'description', value)}
                  editable={editable}
                  multiline
                  className="text-muted-foreground italic mb-4"
                />

                <div className="flex items-center justify-between">
                  <EditableText
                    value={client.name}
                    onChange={(value) => handleClientUpdate(index, 'name', value)}
                    editable={editable}
                    className="font-bold"
                  />

                  {client.link && (
                    <a
                      href={client.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Website →
                    </a>
                  )}
                  {editable && !client.link && (
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => {
                        const url = prompt('Enter client website URL:');
                        if (url) handleClientUpdate(index, 'link', url);
                      }}
                    >
                      + Add Website Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddClient}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Client</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render clients based on variant
  const renderClients = () => {
    switch (variant) {
      case 'logos':
        return renderLogosLayout();
      case 'testimonials':
        return renderTestimonialsLayout();
      case 'grid':
      default:
        return renderGridLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="clients"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10 text-center">
          <EditableText
            value={data.title || 'Our Clients'}
            onChange={(value) => handleTextUpdate('title', value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />
          {data.subtitle && (
            <EditableText
              value={data.subtitle}
              onChange={(value) => handleTextUpdate('subtitle', value)}
              editable={editable}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            />
          )}
        </div>

        {renderClients()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Client Display</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="logos">Logo Grid</option>
            <option value="grid">Client Cards</option>
            <option value="testimonials">Testimonials</option>
          </select>

          {variant === 'logos' && (
            <>
              <div className="text-xs font-medium mb-1">Columns</div>
              <select
                value={columns}
                onChange={(e) => onUpdate?.({ ...data, columns: e.target.value })}
                className="text-xs p-1 border rounded w-full mb-2"
              >
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="5">5 Columns</option>
                <option value="6">6 Columns</option>
              </select>

              <div className="text-xs font-medium mb-1">Logo Size</div>
              <select
                value={logoSize}
                onChange={(e) => onUpdate?.({ ...data, logoSize: e.target.value })}
                className="text-xs p-1 border rounded w-full mb-2"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="showNames"
                  checked={data.showNames === true}
                  onChange={(e) => onUpdate?.({ ...data, showNames: e.target.checked })}
                  className="w-3 h-3"
                />
                <label htmlFor="showNames" className="text-xs">Show Client Names</label>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ClientsSection;
