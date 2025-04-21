import React from 'react';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface ServicesSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    services?: Array<{
      title: string;
      description: string;
      icon?: string;
      price?: string;
      features?: string[];
      cta?: string;
      ctaLink?: string;
      featured?: boolean;
    }>;
    variant?: 'cards' | 'pricing' | 'features' | 'simple';
    columns?: '2' | '3' | '4';
    showPricing?: boolean;
    showCTA?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Icons for services (using simple text characters for this implementation)
const ICONS = [
  '💼', '🔧', '🎨', '📱', '🚀', '💡', '📊', '📝', '🛠️', '📷', '🎬', '🌐'
];

const ServicesSection: React.FC<ServicesSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'cards' :
     template.category === 'photographer' ? 'pricing' : 'features');

  // Determine columns
  const columns = data.columns || '3';

  // Ensure we have services array with at least one placeholder if empty
  const services = data.services?.length ? data.services : editable ?
    Array(3).fill(null).map((_, i) => ({
      title: `Service ${i + 1}`,
      description: 'This is a sample service description. Explain the value and details of your service.',
      icon: ICONS[i % ICONS.length],
      price: i === 0 ? 'Free' : `$${(i * 100) + 99}`,
      features: [
        'Feature 1',
        'Feature 2',
        i > 0 ? 'Feature 3' : '',
        i > 1 ? 'Feature 4' : '',
      ].filter(Boolean),
      cta: 'Get Started',
      ctaLink: '#contact',
      featured: i === 1
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

  // Handle service update
  const handleServiceUpdate = (index: number, field: string, value: string | boolean) => {
    if (onUpdate && editable) {
      const newServices = [...services];

      if (!newServices[index]) {
        newServices[index] = {
          title: '',
          description: ''
        };
      }

      newServices[index] = {
        ...newServices[index],
        [field]: value
      };

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle adding a feature to a service
  const handleAddFeature = (serviceIndex: number) => {
    if (onUpdate && editable) {
      const newServices = [...services];
      const service = { ...newServices[serviceIndex] };
      const features = [...(service.features || [])];

      features.push('New feature');
      service.features = features;
      newServices[serviceIndex] = service;

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle updating a feature
  const handleUpdateFeature = (serviceIndex: number, featureIndex: number, value: string) => {
    if (onUpdate && editable) {
      const newServices = [...services];
      const service = { ...newServices[serviceIndex] };
      const features = [...(service.features || [])];

      features[featureIndex] = value;
      service.features = features;
      newServices[serviceIndex] = service;

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle removing a feature
  const handleRemoveFeature = (serviceIndex: number, featureIndex: number) => {
    if (onUpdate && editable) {
      const newServices = [...services];
      const service = { ...newServices[serviceIndex] };
      const features = [...(service.features || [])];

      features.splice(featureIndex, 1);
      service.features = features;
      newServices[serviceIndex] = service;

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle adding a new service
  const handleAddService = () => {
    if (onUpdate && editable) {
      const newServices = [
        ...services,
        {
          title: 'New Service',
          description: 'Describe your service here',
          icon: ICONS[services.length % ICONS.length],
          price: '$99',
          features: ['Feature 1', 'Feature 2'],
          cta: 'Get Started',
          ctaLink: '#contact'
        }
      ];

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle removing a service
  const handleRemoveService = (index: number) => {
    if (onUpdate && editable) {
      const newServices = [...services];
      newServices.splice(index, 1);

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle toggling the featured status of a service
  const handleToggleFeatured = (index: number) => {
    if (onUpdate && editable) {
      const newServices = [...services];
      const service = { ...newServices[index] };

      service.featured = !service.featured;
      newServices[index] = service;

      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  // Handle icon click to change service icon
  const handleIconClick = (index: number) => {
    if (editable) {
      const currentIcon = services[index].icon || '';
      const iconIndex = ICONS.indexOf(currentIcon);
      const nextIconIndex = (iconIndex + 1) % ICONS.length;

      handleServiceUpdate(index, 'icon', ICONS[nextIconIndex]);
    }
  };

  // Get column class based on columns setting
  const getColumnClass = () => {
    switch (columns) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '4':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case '3':
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Render cards layout
  const renderCardsLayout = () => {
    return (
      <div className={`grid ${getColumnClass()} gap-6`}>
        {services.map((service, index) => (
          <div
            key={index}
            className={`relative rounded-lg p-6 group ${
              service.featured
                ? 'border-2 border-primary bg-primary/5 shadow-md'
                : 'border bg-muted/10'
            }`}
          >
            {editable && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="bg-white text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleToggleFeatured(index)}
                  title={service.featured ? "Unmark as featured" : "Mark as featured"}
                >
                  ★
                </button>
                <button
                  className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveService(index)}
                >
                  ✕
                </button>
              </div>
            )}

            {service.icon && (
              <div
                className={`text-3xl mb-4 inline-block ${
                  editable ? 'cursor-pointer' : ''
                }`}
                onClick={() => editable && handleIconClick(index)}
              >
                {service.icon}
              </div>
            )}

            <EditableText
              value={service.title}
              onChange={(value) => handleServiceUpdate(index, 'title', value)}
              editable={editable}
              className="text-xl font-bold mb-2"
            />

            <EditableText
              value={service.description}
              onChange={(value) => handleServiceUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground mb-4"
            />

            {data.showPricing && service.price && (
              <div className="mb-4">
                <EditableText
                  value={service.price}
                  onChange={(value) => handleServiceUpdate(index, 'price', value)}
                  editable={editable}
                  className="text-xl font-bold"
                />
              </div>
            )}

            {service.features && service.features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 relative group/feature">
                    <span className="text-primary">✓</span>
                    <EditableText
                      value={feature}
                      onChange={(value) => handleUpdateFeature(index, featureIndex, value)}
                      editable={editable}
                      className="text-sm text-muted-foreground"
                    />
                    {editable && (
                      <button
                        className="absolute right-0 top-0 text-red-500 opacity-0 group-hover/feature:opacity-100"
                        onClick={() => handleRemoveFeature(index, featureIndex)}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
                {editable && (
                  <li>
                    <button
                      className="text-primary hover:underline text-sm"
                      onClick={() => handleAddFeature(index)}
                    >
                      + Add Feature
                    </button>
                  </li>
                )}
              </ul>
            )}

            {data.showCTA && service.cta && (
              <Button
                className={service.featured ? "w-full" : ""}
                variant={service.featured ? "default" : "outline"}
              >
                <EditableText
                  value={service.cta}
                  onChange={(value) => handleServiceUpdate(index, 'cta', value)}
                  editable={editable}
                  className={service.featured ? "text-white" : ""}
                />
              </Button>
            )}
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20 h-full min-h-[200px]"
            onClick={handleAddService}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Service</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render pricing layout
  const renderPricingLayout = () => {
    return (
      <div className={`grid ${getColumnClass()} gap-6`}>
        {services.map((service, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-lg border ${
              service.featured
                ? 'border-primary shadow-md border-2'
                : ''
            }`}
          >
            {service.featured && (
              <div className="absolute top-5 right-0 bg-primary text-white text-xs py-1 px-3 -mr-8 rotate-45 transform origin-top-right shadow-sm">
                Popular
              </div>
            )}

            {editable && (
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                <button
                  className="bg-white text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleToggleFeatured(index)}
                  title={service.featured ? "Unmark as featured" : "Mark as featured"}
                >
                  ★
                </button>
                <button
                  className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveService(index)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className={`p-6 ${service.featured ? 'bg-primary/5' : 'bg-muted/5'}`}>
              <EditableText
                value={service.title}
                onChange={(value) => handleServiceUpdate(index, 'title', value)}
                editable={editable}
                className="text-xl font-bold mb-2"
              />

              <EditableText
                value={service.description}
                onChange={(value) => handleServiceUpdate(index, 'description', value)}
                editable={editable}
                multiline
                className="text-sm text-muted-foreground mb-4"
              />

              <div className="mb-4">
                <EditableText
                  value={service.price || '$0'}
                  onChange={(value) => handleServiceUpdate(index, 'price', value)}
                  editable={editable}
                  className="text-3xl font-bold"
                />
              </div>
            </div>

            <div className="p-6 border-t">
              <ul className="space-y-3 mb-6">
                {(service.features || []).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 relative group/feature">
                    <span className="text-primary">✓</span>
                    <EditableText
                      value={feature}
                      onChange={(value) => handleUpdateFeature(index, featureIndex, value)}
                      editable={editable}
                      className="text-sm text-muted-foreground"
                    />
                    {editable && (
                      <button
                        className="absolute right-0 top-0 text-red-500 opacity-0 group-hover/feature:opacity-100"
                        onClick={() => handleRemoveFeature(index, featureIndex)}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
                {editable && (
                  <li>
                    <button
                      className="text-primary hover:underline text-sm"
                      onClick={() => handleAddFeature(index)}
                    >
                      + Add Feature
                    </button>
                  </li>
                )}
              </ul>

              {data.showCTA !== false && service.cta && (
                <Button
                  className="w-full"
                  variant={service.featured ? "default" : "outline"}
                >
                  <EditableText
                    value={service.cta}
                    onChange={(value) => handleServiceUpdate(index, 'cta', value)}
                    editable={editable}
                    className={service.featured ? "text-white" : ""}
                  />
                </Button>
              )}
            </div>
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20 h-full min-h-[200px]"
            onClick={handleAddService}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Pricing Plan</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render features layout
  const renderFeaturesLayout = () => {
    return (
      <div className={`grid ${getColumnClass()} gap-8`}>
        {services.map((service, index) => (
          <div key={index} className="relative flex gap-4 group">
            {editable && (
              <button
                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveService(index)}
              >
                ✕
              </button>
            )}

            {service.icon && (
              <div
                className={`text-3xl h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary ${
                  editable ? 'cursor-pointer' : ''
                }`}
                onClick={() => editable && handleIconClick(index)}
              >
                {service.icon}
              </div>
            )}

            <div>
              <EditableText
                value={service.title}
                onChange={(value) => handleServiceUpdate(index, 'title', value)}
                editable={editable}
                className="text-lg font-semibold mb-1"
              />

              <EditableText
                value={service.description}
                onChange={(value) => handleServiceUpdate(index, 'description', value)}
                editable={editable}
                multiline
                className="text-muted-foreground"
              />

              {data.showPricing && service.price && (
                <div className="mt-2">
                  <EditableText
                    value={service.price}
                    onChange={(value) => handleServiceUpdate(index, 'price', value)}
                    editable={editable}
                    className="font-bold"
                  />
                </div>
              )}

              {data.showCTA && service.cta && (
                <Button
                  className="mt-4"
                  variant="outline"
                  size="sm"
                >
                  <EditableText
                    value={service.cta}
                    onChange={(value) => handleServiceUpdate(index, 'cta', value)}
                    editable={editable}
                  />
                </Button>
              )}
            </div>
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20"
            onClick={handleAddService}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Service</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render simple layout
  const renderSimpleLayout = () => {
    return (
      <div className="space-y-8">
        {services.map((service, index) => (
          <div key={index} className="relative border-b pb-8 last:border-0 group">
            {editable && (
              <button
                className="absolute top-0 right-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveService(index)}
              >
                ✕
              </button>
            )}

            <div className="flex items-center gap-3 mb-3">
              {service.icon && (
                <div
                  className={`text-2xl ${editable ? 'cursor-pointer' : ''}`}
                  onClick={() => editable && handleIconClick(index)}
                >
                  {service.icon}
                </div>
              )}

              <EditableText
                value={service.title}
                onChange={(value) => handleServiceUpdate(index, 'title', value)}
                editable={editable}
                className="text-xl font-bold"
              />

              {data.showPricing && service.price && (
                <div className="ml-auto">
                  <EditableText
                    value={service.price}
                    onChange={(value) => handleServiceUpdate(index, 'price', value)}
                    editable={editable}
                    className="font-bold"
                  />
                </div>
              )}
            </div>

            <EditableText
              value={service.description}
              onChange={(value) => handleServiceUpdate(index, 'description', value)}
              editable={editable}
              multiline
              className="text-muted-foreground"
            />

            {service.features && service.features.length > 0 && (
              <div className="mt-4 pl-2 border-l-2 border-primary/10">
                <h4 className="text-sm font-medium mb-2">Includes:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-muted-foreground flex items-start gap-2 relative group/feature">
                      <span className="text-primary text-xs">•</span>
                      <EditableText
                        value={feature}
                        onChange={(value) => handleUpdateFeature(index, featureIndex, value)}
                        editable={editable}
                        className="text-sm text-muted-foreground"
                      />
                      {editable && (
                        <button
                          className="absolute right-0 top-0 text-red-500 opacity-0 group-hover/feature:opacity-100"
                          onClick={() => handleRemoveFeature(index, featureIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                  {editable && (
                    <li>
                      <button
                        className="text-primary hover:underline text-xs"
                        onClick={() => handleAddFeature(index)}
                      >
                        + Add Feature
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {data.showCTA && service.cta && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                >
                  <EditableText
                    value={service.cta}
                    onChange={(value) => handleServiceUpdate(index, 'cta', value)}
                    editable={editable}
                  />
                </Button>
              </div>
            )}
          </div>
        ))}

        {editable && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={handleAddService}
            >
              + Add Service
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render services based on variant
  const renderServices = () => {
    switch (variant) {
      case 'pricing':
        return renderPricingLayout();
      case 'features':
        return renderFeaturesLayout();
      case 'simple':
        return renderSimpleLayout();
      case 'cards':
      default:
        return renderCardsLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor
      }}
      id="services"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10 text-center">
          <EditableText
            value={data.title || 'My Services'}
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

        {renderServices()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Services Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="cards">Cards</option>
            <option value="pricing">Pricing</option>
            <option value="features">Features</option>
            <option value="simple">Simple</option>
          </select>

          {variant !== 'simple' && (
            <div className="text-xs font-medium mb-1">Columns</div>
          )}
          {variant !== 'simple' && (
            <select
              value={columns}
              onChange={(e) => onUpdate?.({ ...data, columns: e.target.value })}
              className="text-xs p-1 border rounded w-full mb-2"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          )}

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showPricing"
              checked={data.showPricing !== false}
              onChange={(e) => onUpdate?.({ ...data, showPricing: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showPricing" className="text-xs">Show Pricing</label>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showCTA"
              checked={data.showCTA !== false}
              onChange={(e) => onUpdate?.({ ...data, showCTA: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showCTA" className="text-xs">Show CTA Buttons</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
