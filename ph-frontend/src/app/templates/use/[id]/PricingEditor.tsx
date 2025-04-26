import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, MoveUp, MoveDown, Check, X } from 'lucide-react';

interface PricingFeature {
  id: string;
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceUnit: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

interface PricingEditorProps {
  data: {
    title?: string;
    description?: string;
    items?: PricingPlan[];
    showBilling?: boolean;
    billingOptions?: {
      monthly: string;
      yearly: string;
      discount?: string;
    };
  };
  onChange: (data: any) => void;
}

export default function PricingEditor({ data, onChange }: PricingEditorProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  // Helper functions
  const handleSectionDataChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleBillingOptionsChange = (key: string, value: string) => {
    onChange({
      ...data,
      billingOptions: {
        ...(data.billingOptions || { monthly: 'Monthly', yearly: 'Yearly' }),
        [key]: value
      }
    });
  };

  const handleAddPlan = () => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      name: 'New Plan',
      description: 'Description of this plan',
      price: '$99',
      priceUnit: '/month',
      isPopular: false,
      buttonText: 'Get Started',
      buttonLink: '#',
      features: [
        { id: `feature-${Date.now()}-1`, name: 'Basic feature', included: true },
        { id: `feature-${Date.now()}-2`, name: 'Medium feature', included: true },
        { id: `feature-${Date.now()}-3`, name: 'Advanced feature', included: false },
      ]
    };

    onChange({
      ...data,
      items: [...(data.items || []), newPlan]
    });

    setActiveItem(newPlan.id);
  };

  const handleDeletePlan = (id: string) => {
    onChange({
      ...data,
      items: (data.items || []).filter(item => item.id !== id)
    });

    if (activeItem === id) {
      setActiveItem(null);
    }
  };

  const handlePlanChange = (id: string, key: string, value: any) => {
    onChange({
      ...data,
      items: (data.items || []).map(item =>
        item.id === id ? { ...item, [key]: value } : item
      )
    });
  };

  const handleMovePlan = (id: string, direction: 'up' | 'down') => {
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

  const handleTogglePopular = (id: string) => {
    const plan = (data.items || []).find(item => item.id === id);
    if (!plan) return;

    handlePlanChange(id, 'isPopular', !plan.isPopular);
  };

  const handleAddFeature = (planId: string) => {
    if (!featureInput || featureInput.trim() === '') return;

    const plan = (data.items || []).find(item => item.id === planId);
    if (!plan) return;

    const newFeature = {
      id: `feature-${Date.now()}`,
      name: featureInput.trim(),
      included: true
    };

    handlePlanChange(planId, 'features', [...(plan.features || []), newFeature]);
    setFeatureInput('');
  };

  const handleUpdateAllPlansWithFeature = (featureName: string) => {
    const updatedItems = (data.items || []).map(plan => {
      // Check if this feature already exists by name
      const featureExists = plan.features.some(f => f.name.toLowerCase() === featureName.toLowerCase());

      if (featureExists) {
        return plan;
      }

      // Add the new feature to this plan
      const newFeature = {
        id: `feature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: featureName,
        included: false
      };

      return {
        ...plan,
        features: [...plan.features, newFeature]
      };
    });

    onChange({
      ...data,
      items: updatedItems
    });

    setFeatureInput('');
  };

  const handleDeleteFeature = (planId: string, featureId: string) => {
    const plan = (data.items || []).find(item => item.id === planId);
    if (!plan || !plan.features) return;

    handlePlanChange(
      planId,
      'features',
      plan.features.filter(f => f.id !== featureId)
    );
  };

  const handleToggleFeature = (planId: string, featureId: string) => {
    const plan = (data.items || []).find(item => item.id === planId);
    if (!plan || !plan.features) return;

    handlePlanChange(
      planId,
      'features',
      plan.features.map(f =>
        f.id === featureId ? { ...f, included: !f.included } : f
      )
    );
  };

  // Get a list of all unique features across all plans
  const getAllFeatures = () => {
    const allFeatures = new Set<string>();

    (data.items || []).forEach(plan => {
      plan.features.forEach(feature => {
        allFeatures.add(feature.name);
      });
    });

    return Array.from(allFeatures);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Section Title</label>
        <Input
          value={data.title || ''}
          onChange={(e) => handleSectionDataChange('title', e.target.value)}
          placeholder="Pricing Plans"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Section Description</label>
        <Textarea
          value={data.description || ''}
          onChange={(e) => handleSectionDataChange('description', e.target.value)}
          placeholder="Choose the plan that fits your needs"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input
          type="checkbox"
          id="showBilling"
          checked={!!data.showBilling}
          onChange={(e) => handleSectionDataChange('showBilling', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="showBilling" className="text-sm">Show billing toggle (monthly/yearly)</label>
      </div>

      {data.showBilling && (
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-md">
          <div className="space-y-1">
            <label className="text-xs font-medium">Monthly Label</label>
            <Input
              value={(data.billingOptions?.monthly) || 'Monthly'}
              onChange={(e) => handleBillingOptionsChange('monthly', e.target.value)}
              placeholder="Monthly"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Yearly Label</label>
            <Input
              value={(data.billingOptions?.yearly) || 'Yearly'}
              onChange={(e) => handleBillingOptionsChange('yearly', e.target.value)}
              placeholder="Yearly"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Discount Text (Optional)</label>
            <Input
              value={(data.billingOptions?.discount) || ''}
              onChange={(e) => handleBillingOptionsChange('discount', e.target.value)}
              placeholder="Save 20%"
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Pricing Plans</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddPlan}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Plan
          </Button>
        </div>

        <div className="space-y-2">
          {(data.items || []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md">
              No pricing plans added yet. Click "Add Plan" to create your first pricing plan.
            </div>
          ) : (
            <>
              {/* Feature management section */}
              <div className="mb-4 p-3 border rounded-md bg-muted/10">
                <h4 className="text-sm font-medium mb-2">Add Feature to All Plans</h4>
                <div className="flex items-center space-x-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Enter a feature name"
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && data.items && data.items.length > 0) {
                        e.preventDefault();
                        handleUpdateAllPlansWithFeature(featureInput);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (data.items && data.items.length > 0) {
                        handleUpdateAllPlansWithFeature(featureInput);
                      }
                    }}
                    disabled={!data.items || data.items.length === 0}
                  >
                    Add to All
                  </Button>
                </div>

                {getAllFeatures().length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">All features used across plans:</p>
                    <div className="flex flex-wrap gap-1">
                      {getAllFeatures().map((feature, index) => (
                        <div key={index} className="bg-muted px-2 py-1 rounded-md text-xs">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                {(data.items || []).map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-md ${activeItem === plan.id ? 'border-primary' : ''} ${plan.isPopular ? 'border-amber-300 dark:border-amber-700' : ''}`}
                  >
                    <div
                      className="p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => setActiveItem(activeItem === plan.id ? null : plan.id)}
                    >
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium">{plan.name}</h4>
                            {plan.isPopular && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-xs">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {plan.price} {plan.priceUnit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePlan(plan.id, 'up');
                          }}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePlan(plan.id, 'down');
                          }}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={plan.isPopular ? "secondary" : "ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePopular(plan.id);
                          }}
                          title={plan.isPopular ? "Remove popular badge" : "Mark as popular"}
                          className="text-amber-600"
                        >
                          {plan.isPopular ? "Popular" : "⭐"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {activeItem === plan.id && (
                      <div className="p-3 pt-0 border-t">
                        <div className="grid gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Plan Name</label>
                            <Input
                              value={plan.name}
                              onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                              placeholder="Plan name"
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">Description</label>
                            <Textarea
                              value={plan.description}
                              onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                              placeholder="Describe this plan"
                              className="text-sm"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Price</label>
                              <Input
                                value={plan.price}
                                onChange={(e) => handlePlanChange(plan.id, 'price', e.target.value)}
                                placeholder="e.g. $99"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Price Unit</label>
                              <Input
                                value={plan.priceUnit}
                                onChange={(e) => handlePlanChange(plan.id, 'priceUnit', e.target.value)}
                                placeholder="e.g. /month"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Button Text</label>
                              <Input
                                value={plan.buttonText || 'Get Started'}
                                onChange={(e) => handlePlanChange(plan.id, 'buttonText', e.target.value)}
                                placeholder="e.g. Sign Up"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Button Link</label>
                              <Input
                                value={plan.buttonLink || '#'}
                                onChange={(e) => handlePlanChange(plan.id, 'buttonLink', e.target.value)}
                                placeholder="https://..."
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium">Features</label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={featureInput}
                                  onChange={(e) => setFeatureInput(e.target.value)}
                                  placeholder="Add a feature"
                                  className="h-7 text-xs w-40"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddFeature(plan.id);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleAddFeature(plan.id)}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>

                            {(plan.features || []).length > 0 && (
                              <div className="space-y-1 mt-2">
                                {plan.features.map((feature) => (
                                  <div key={feature.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleFeature(plan.id, feature.id)}
                                        className={`p-1 h-6 w-6 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`}
                                      >
                                        {feature.included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                      </Button>
                                      <span className="text-sm">{feature.name}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteFeature(plan.id, feature.id)}
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
