import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Play, Pause, Zap, Clock, ArrowRight } from 'lucide-react';

interface AnimationsEditorProps {
  data: {
    enabled?: boolean;
    preloader?: {
      enabled?: boolean;
      duration?: number;
      animation?: string;
    };
    scrollAnimations?: {
      enabled?: boolean;
      type?: string;
      distance?: number;
      duration?: number;
      easing?: string;
      staggering?: boolean;
      staggerAmount?: number;
    };
    pageTransitions?: {
      enabled?: boolean;
      type?: string;
      duration?: number;
    };
    hoverEffects?: {
      enabled?: boolean;
      scale?: number;
      lift?: boolean;
      glow?: boolean;
      glowColor?: string;
    };
  };
  onChange: (data: any) => void;
}

export default function AnimationsEditor({ data, onChange }: AnimationsEditorProps) {
  const [activeTab, setActiveTab] = useState<'preloader' | 'scroll' | 'page' | 'hover'>('scroll');
  const [previewAnimating, setPreviewAnimating] = useState(false);

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

  const toggleAnimationPreview = () => {
    setPreviewAnimating(!previewAnimating);
    // Preview animations would be handled by a timer to reset after a short period
    if (!previewAnimating) {
      setTimeout(() => {
        setPreviewAnimating(false);
      }, 1500);
    }
  };

  // Common animation options
  const scrollAnimationTypes = [
    { value: 'fade-up', label: 'Fade Up' },
    { value: 'fade-down', label: 'Fade Down' },
    { value: 'fade-left', label: 'Fade Left' },
    { value: 'fade-right', label: 'Fade Right' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'flip-up', label: 'Flip Up' },
    { value: 'flip-down', label: 'Flip Down' },
  ];

  const pageTransitionTypes = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-down', label: 'Slide Down' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
  ];

  const easingOptions = [
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'linear', label: 'Linear' },
    { value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', label: 'Custom' },
  ];

  const preloaderAnimations = [
    { value: 'spinner', label: 'Spinner' },
    { value: 'dots', label: 'Dots' },
    { value: 'progress', label: 'Progress Bar' },
    { value: 'fade', label: 'Simple Fade' },
    { value: 'logo', label: 'Logo Animation' },
  ];

  // Animation preview demo elements
  const renderAnimationPreview = () => {
    let animationClass = '';

    if (activeTab === 'scroll') {
      animationClass = previewAnimating ? `animate-${data.scrollAnimations?.type || 'fade-up'}` : '';
    } else if (activeTab === 'hover') {
      if (previewAnimating) {
        animationClass = 'scale-105 shadow-lg';
      }
    } else if (activeTab === 'page') {
      animationClass = previewAnimating ? `animate-${data.pageTransitions?.type || 'fade'}` : '';
    }

    return (
      <div className="mb-4 flex justify-center">
        <div
          className={`relative w-24 h-24 bg-primary/20 rounded-md flex items-center justify-center transition-all duration-300 ${animationClass}`}
        >
          Preview
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="animations-enabled"
            checked={data.enabled !== false}
            onCheckedChange={(checked) => handleChange('enabled', checked)}
          />
          <Label htmlFor="animations-enabled" className="font-medium">Enable animations</Label>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={toggleAnimationPreview}
          className="flex items-center gap-1"
        >
          {previewAnimating ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Preview</span>
            </>
          )}
        </Button>
      </div>

      {renderAnimationPreview()}

      {data.enabled !== false && (
        <>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'scroll' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('scroll')}
            >
              Scroll
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'page' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('page')}
            >
              Page Transitions
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'hover' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('hover')}
            >
              Hover Effects
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'preloader' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('preloader')}
            >
              Preloader
            </button>
          </div>

          {activeTab === 'scroll' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="scroll-enabled"
                  checked={data.scrollAnimations?.enabled !== false}
                  onCheckedChange={(checked) => handleNestedChange('scrollAnimations', 'enabled', checked)}
                />
                <Label htmlFor="scroll-enabled">Enable scroll animations</Label>
              </div>

              {data.scrollAnimations?.enabled !== false && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Animation Type</label>
                    <Select
                      value={data.scrollAnimations?.type || 'fade-up'}
                      onValueChange={(value) => handleNestedChange('scrollAnimations', 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scrollAnimationTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Animation Distance</label>
                      <span className="text-xs text-muted-foreground">{data.scrollAnimations?.distance || 50}px</span>
                    </div>
                    <Slider
                      value={[data.scrollAnimations?.distance || 50]}
                      min={0}
                      max={200}
                      step={10}
                      onValueChange={(value) => handleNestedChange('scrollAnimations', 'distance', value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Animation Duration</label>
                      <span className="text-xs text-muted-foreground">{data.scrollAnimations?.duration || 800}ms</span>
                    </div>
                    <Slider
                      value={[data.scrollAnimations?.duration || 800]}
                      min={200}
                      max={2000}
                      step={100}
                      onValueChange={(value) => handleNestedChange('scrollAnimations', 'duration', value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Easing Function</label>
                    <Select
                      value={data.scrollAnimations?.easing || 'ease-out'}
                      onValueChange={(value) => handleNestedChange('scrollAnimations', 'easing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select easing function" />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="stagger-enabled"
                      checked={data.scrollAnimations?.staggering}
                      onCheckedChange={(checked) => handleNestedChange('scrollAnimations', 'staggering', checked)}
                    />
                    <Label htmlFor="stagger-enabled">Enable staggered animations</Label>
                  </div>

                  {data.scrollAnimations?.staggering && (
                    <div className="pl-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Stagger Amount</label>
                        <span className="text-xs text-muted-foreground">{data.scrollAnimations?.staggerAmount || 100}ms</span>
                      </div>
                      <Slider
                        value={[data.scrollAnimations?.staggerAmount || 100]}
                        min={50}
                        max={500}
                        step={25}
                        onValueChange={(value) => handleNestedChange('scrollAnimations', 'staggerAmount', value[0])}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'page' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="page-transitions-enabled"
                  checked={data.pageTransitions?.enabled !== false}
                  onCheckedChange={(checked) => handleNestedChange('pageTransitions', 'enabled', checked)}
                />
                <Label htmlFor="page-transitions-enabled">Enable page transitions</Label>
              </div>

              {data.pageTransitions?.enabled !== false && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transition Type</label>
                    <Select
                      value={data.pageTransitions?.type || 'fade'}
                      onValueChange={(value) => handleNestedChange('pageTransitions', 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transition type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTransitionTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Transition Duration</label>
                      <span className="text-xs text-muted-foreground">{data.pageTransitions?.duration || 400}ms</span>
                    </div>
                    <Slider
                      value={[data.pageTransitions?.duration || 400]}
                      min={100}
                      max={1000}
                      step={50}
                      onValueChange={(value) => handleNestedChange('pageTransitions', 'duration', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Shorter durations (300-500ms) provide the best user experience
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'hover' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="hover-effects-enabled"
                  checked={data.hoverEffects?.enabled !== false}
                  onCheckedChange={(checked) => handleNestedChange('hoverEffects', 'enabled', checked)}
                />
                <Label htmlFor="hover-effects-enabled">Enable hover effects</Label>
              </div>

              {data.hoverEffects?.enabled !== false && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hover-scale"
                        checked={data.hoverEffects?.scale !== 0 && data.hoverEffects?.scale !== undefined}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleNestedChange('hoverEffects', 'scale', 0);
                          } else {
                            handleNestedChange('hoverEffects', 'scale', 1.05);
                          }
                        }}
                      />
                      <Label htmlFor="hover-scale">Scale effect</Label>
                    </div>

                    {data.hoverEffects?.scale !== 0 && data.hoverEffects?.scale !== undefined && (
                      <div className="pl-6 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium">Scale Amount</label>
                          <span className="text-xs text-muted-foreground">{data.hoverEffects?.scale || 1.05}x</span>
                        </div>
                        <Slider
                          value={[data.hoverEffects?.scale ? data.hoverEffects.scale * 100 : 105]}
                          min={101}
                          max={120}
                          step={1}
                          onValueChange={(value) => handleNestedChange('hoverEffects', 'scale', value[0] / 100)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hover-lift"
                        checked={data.hoverEffects?.lift}
                        onCheckedChange={(checked) => handleNestedChange('hoverEffects', 'lift', checked)}
                      />
                      <Label htmlFor="hover-lift">Lift effect (shadow)</Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hover-glow"
                        checked={data.hoverEffects?.glow}
                        onCheckedChange={(checked) => handleNestedChange('hoverEffects', 'glow', checked)}
                      />
                      <Label htmlFor="hover-glow">Glow effect</Label>
                    </div>

                    {data.hoverEffects?.glow && (
                      <div className="pl-6 space-y-2">
                        <label className="text-xs font-medium">Glow Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={data.hoverEffects?.glowColor || '#3b82f6'}
                            onChange={(e) => handleNestedChange('hoverEffects', 'glowColor', e.target.value)}
                            className="w-8 h-8 rounded-md border p-0"
                          />
                          <Input
                            value={data.hoverEffects?.glowColor || '#3b82f6'}
                            onChange={(e) => handleNestedChange('hoverEffects', 'glowColor', e.target.value)}
                            className="h-8 w-28"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'preloader' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="preloader-enabled"
                  checked={data.preloader?.enabled}
                  onCheckedChange={(checked) => handleNestedChange('preloader', 'enabled', checked)}
                />
                <Label htmlFor="preloader-enabled">Enable preloader screen</Label>
              </div>

              {data.preloader?.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preloader Animation</label>
                    <Select
                      value={data.preloader?.animation || 'spinner'}
                      onValueChange={(value) => handleNestedChange('preloader', 'animation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                      <SelectContent>
                        {preloaderAnimations.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Minimum Duration</label>
                      <span className="text-xs text-muted-foreground">{data.preloader?.duration || 1000}ms</span>
                    </div>
                    <Slider
                      value={[data.preloader?.duration || 1000]}
                      min={0}
                      max={3000}
                      step={100}
                      onValueChange={(value) => handleNestedChange('preloader', 'duration', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      <Zap className="inline h-3 w-3 mr-1" />
                      Set to 0 to disable minimum duration (preloader will close as soon as page loads)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
