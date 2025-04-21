import React from 'react';
import Image from 'next/image';
import { EditableText } from '../editable/EditableText';
import { Button } from '@/components/ui/button';

interface TestimonialsSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    testimonials?: Array<{
      quote: string;
      author: string;
      role?: string;
      company?: string;
      avatar?: string;
      rating?: number;
    }>;
    variant?: 'cards' | 'simple' | 'carousel' | 'featured';
    showRatings?: boolean;
    showAvatars?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

// Helper for creating a placeholder avatar URL
const createPlaceholderAvatar = (index: number) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(`User ${index + 1}`)}&background=6366f1&color=ffffff&size=128`;
};

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate
}) => {
  // Determine variant based on template category or specified variant
  const variant = data.variant ||
    (template.category === 'designer' ? 'cards' :
     template.category === 'photographer' ? 'carousel' : 'simple');

  // Ensure we have testimonials array with at least one placeholder if empty
  const testimonials = data.testimonials?.length ? data.testimonials : editable ?
    Array(3).fill(null).map((_, i) => ({
      quote: 'This is a sample testimonial. Replace this with an actual quote from a client or colleague that highlights your skills and work ethic.',
      author: `Client Name ${i + 1}`,
      role: 'CEO',
      company: 'Example Company',
      avatar: createPlaceholderAvatar(i),
      rating: 5
    })) : [];

  // Current testimonial for carousel (simplified implementation)
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Go to previous testimonial in carousel
  const prevTestimonial = () => {
    setActiveIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Go to next testimonial in carousel
  const nextTestimonial = () => {
    setActiveIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      onUpdate({
        ...data,
        [field]: value
      });
    }
  };

  // Handle testimonial update
  const handleTestimonialUpdate = (index: number, field: string, value: string | number) => {
    if (onUpdate && editable) {
      const newTestimonials = [...testimonials];

      if (!newTestimonials[index]) {
        newTestimonials[index] = {
          quote: '',
          author: ''
        };
      }

      newTestimonials[index] = {
        ...newTestimonials[index],
        [field]: value
      };

      onUpdate({
        ...data,
        testimonials: newTestimonials
      });
    }
  };

  // Handle adding a new testimonial
  const handleAddTestimonial = () => {
    if (onUpdate && editable) {
      const newTestimonials = [
        ...testimonials,
        {
          quote: 'This is a new testimonial. Replace this with an actual quote.',
          author: 'New Client',
          role: 'Position',
          company: 'Company',
          avatar: createPlaceholderAvatar(testimonials.length),
          rating: 5
        }
      ];

      onUpdate({
        ...data,
        testimonials: newTestimonials
      });
    }
  };

  // Handle removing a testimonial
  const handleRemoveTestimonial = (index: number) => {
    if (onUpdate && editable) {
      const newTestimonials = [...testimonials];
      newTestimonials.splice(index, 1);

      onUpdate({
        ...data,
        testimonials: newTestimonials
      });

      // Update active index if needed
      if (index <= activeIndex && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  // Handle avatar click in edit mode to update avatar URL
  const handleAvatarClick = (index: number) => {
    if (editable) {
      const url = prompt('Enter avatar URL:', testimonials[index].avatar);
      if (url) handleTestimonialUpdate(index, 'avatar', url);
    }
  };

  // Render star rating
  const renderRating = (rating: number, maxRating: number = 5) => {
    return (
      <div className="flex gap-1 mb-4">
        {Array.from({ length: maxRating }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={editable ? () => handleTestimonialUpdate(activeIndex, 'rating', i + 1) : undefined}
            style={editable ? { cursor: 'pointer' } : {}}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Render cards layout
  const renderCardsLayout = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-muted/10 p-6 rounded-lg shadow-sm border relative group">
            {editable && (
              <button
                className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveTestimonial(index)}
              >
                ✕
              </button>
            )}

            {data.showRatings && testimonial.rating && (
              <div className="mb-4">
                {renderRating(testimonial.rating)}
              </div>
            )}

            <div className="mb-4">
              <span className="text-4xl text-primary/40 leading-none">"</span>
              <EditableText
                value={testimonial.quote}
                onChange={(value) => handleTestimonialUpdate(index, 'quote', value)}
                editable={editable}
                multiline
                className="text-muted-foreground italic"
              />
              <span className="text-4xl text-primary/40 leading-none">"</span>
            </div>

            <div className="flex items-center mt-4">
              {data.showAvatars !== false && testimonial.avatar && (
                <div
                  className="relative w-12 h-12 rounded-full overflow-hidden mr-4 cursor-pointer"
                  onClick={() => handleAvatarClick(index)}
                >
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <EditableText
                  value={testimonial.author}
                  onChange={(value) => handleTestimonialUpdate(index, 'author', value)}
                  editable={editable}
                  className="font-semibold"
                />

                <div className="text-sm text-muted-foreground">
                  <EditableText
                    value={testimonial.role || ''}
                    onChange={(value) => handleTestimonialUpdate(index, 'role', value)}
                    editable={editable}
                    className="inline"
                  />
                  {testimonial.role && testimonial.company && ', '}
                  <EditableText
                    value={testimonial.company || ''}
                    onChange={(value) => handleTestimonialUpdate(index, 'company', value)}
                    editable={editable}
                    className="inline"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {editable && (
          <div
            className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20 h-full min-h-[200px]"
            onClick={handleAddTestimonial}
          >
            <div className="text-center">
              <span className="block text-muted-foreground text-lg">+</span>
              <span className="block text-muted-foreground">Add Testimonial</span>
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
        {testimonials.map((testimonial, index) => (
          <div key={index} className="max-w-3xl mx-auto relative group">
            {editable && (
              <button
                className="absolute -top-2 -right-2 z-10 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveTestimonial(index)}
              >
                ✕
              </button>
            )}

            <div className="mb-4 text-center">
              <span className="text-5xl text-primary/30 leading-none">"</span>
              <EditableText
                value={testimonial.quote}
                onChange={(value) => handleTestimonialUpdate(index, 'quote', value)}
                editable={editable}
                multiline
                className="text-xl italic text-muted-foreground"
              />
              <span className="text-5xl text-primary/30 leading-none">"</span>
            </div>

            <div className="flex flex-col items-center mt-6">
              {data.showAvatars !== false && testimonial.avatar && (
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden mb-3 cursor-pointer"
                  onClick={() => handleAvatarClick(index)}
                >
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {data.showRatings && testimonial.rating && (
                <div className="mb-2">
                  {renderRating(testimonial.rating)}
                </div>
              )}

              <EditableText
                value={testimonial.author}
                onChange={(value) => handleTestimonialUpdate(index, 'author', value)}
                editable={editable}
                className="font-semibold"
              />

              <div className="text-sm text-muted-foreground">
                <EditableText
                  value={testimonial.role || ''}
                  onChange={(value) => handleTestimonialUpdate(index, 'role', value)}
                  editable={editable}
                  className="inline"
                />
                {testimonial.role && testimonial.company && ', '}
                <EditableText
                  value={testimonial.company || ''}
                  onChange={(value) => handleTestimonialUpdate(index, 'company', value)}
                  editable={editable}
                  className="inline"
                />
              </div>
            </div>
          </div>
        ))}

        {editable && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={handleAddTestimonial}
            >
              + Add Testimonial
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render carousel layout
  const renderCarouselLayout = () => {
    if (!testimonials.length) return null;

    const testimonial = testimonials[activeIndex];

    return (
      <div className="relative max-w-4xl mx-auto">
        <div className="bg-muted/10 p-8 rounded-lg shadow-sm border relative">
          {data.showRatings && testimonial.rating && (
            <div className="mb-4 flex justify-center">
              {renderRating(testimonial.rating)}
            </div>
          )}

          <div className="mb-6 text-center">
            <span className="text-5xl text-primary/30 leading-none">"</span>
            <EditableText
              value={testimonial.quote}
              onChange={(value) => handleTestimonialUpdate(activeIndex, 'quote', value)}
              editable={editable}
              multiline
              className="text-xl italic text-muted-foreground"
            />
            <span className="text-5xl text-primary/30 leading-none">"</span>
          </div>

          <div className="flex flex-col items-center">
            {data.showAvatars !== false && testimonial.avatar && (
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden mb-4 cursor-pointer"
                onClick={() => handleAvatarClick(activeIndex)}
              >
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <EditableText
              value={testimonial.author}
              onChange={(value) => handleTestimonialUpdate(activeIndex, 'author', value)}
              editable={editable}
              className="font-semibold text-lg"
            />

            <div className="text-sm text-muted-foreground">
              <EditableText
                value={testimonial.role || ''}
                onChange={(value) => handleTestimonialUpdate(activeIndex, 'role', value)}
                editable={editable}
                className="inline"
              />
              {testimonial.role && testimonial.company && ', '}
              <EditableText
                value={testimonial.company || ''}
                onChange={(value) => handleTestimonialUpdate(activeIndex, 'company', value)}
                editable={editable}
                className="inline"
              />
            </div>
          </div>

          {editable && (
            <button
              className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1"
              onClick={() => handleRemoveTestimonial(activeIndex)}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full border hover:bg-muted/20"
            aria-label="Previous testimonial"
          >
            ←
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === activeIndex ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full border hover:bg-muted/20"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>

        {editable && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={handleAddTestimonial}
            >
              + Add Testimonial
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render featured layout (large featured testimonial with smaller ones below)
  const renderFeaturedLayout = () => {
    if (!testimonials.length) return null;

    // Featured testimonial is the first one
    const featuredTestimonial = testimonials[0];
    const otherTestimonials = testimonials.slice(1);

    return (
      <div className="space-y-12">
        {/* Featured testimonial */}
        <div className="bg-muted/10 p-8 rounded-lg shadow-sm border relative max-w-4xl mx-auto group">
          {editable && (
            <button
              className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveTestimonial(0)}
            >
              ✕
            </button>
          )}

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {data.showAvatars !== false && featuredTestimonial.avatar && (
              <div className="md:w-1/3 flex justify-center">
                <div
                  className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer"
                  onClick={() => handleAvatarClick(0)}
                >
                  <Image
                    src={featuredTestimonial.avatar}
                    alt={featuredTestimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div className="md:w-2/3">
              {data.showRatings && featuredTestimonial.rating && (
                <div className="mb-4">
                  {renderRating(featuredTestimonial.rating)}
                </div>
              )}

              <div className="mb-4">
                <span className="text-4xl text-primary/30 leading-none">"</span>
                <EditableText
                  value={featuredTestimonial.quote}
                  onChange={(value) => handleTestimonialUpdate(0, 'quote', value)}
                  editable={editable}
                  multiline
                  className="text-xl italic text-muted-foreground"
                />
                <span className="text-4xl text-primary/30 leading-none">"</span>
              </div>

              <div>
                <EditableText
                  value={featuredTestimonial.author}
                  onChange={(value) => handleTestimonialUpdate(0, 'author', value)}
                  editable={editable}
                  className="font-semibold text-lg"
                />

                <div className="text-sm text-muted-foreground">
                  <EditableText
                    value={featuredTestimonial.role || ''}
                    onChange={(value) => handleTestimonialUpdate(0, 'role', value)}
                    editable={editable}
                    className="inline"
                  />
                  {featuredTestimonial.role && featuredTestimonial.company && ', '}
                  <EditableText
                    value={featuredTestimonial.company || ''}
                    onChange={(value) => handleTestimonialUpdate(0, 'company', value)}
                    editable={editable}
                    className="inline"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other testimonials in a grid */}
        {otherTestimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTestimonials.map((testimonial, idx) => {
              const index = idx + 1; // Adjust index for the actual array position
              return (
                <div key={index} className="bg-muted/5 p-5 rounded-lg border relative group">
                  {editable && (
                    <button
                      className="absolute top-2 right-2 z-10 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveTestimonial(index)}
                    >
                      ✕
                    </button>
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    {data.showAvatars !== false && testimonial.avatar && (
                      <div
                        className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => handleAvatarClick(index)}
                      >
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <EditableText
                        value={testimonial.author}
                        onChange={(value) => handleTestimonialUpdate(index, 'author', value)}
                        editable={editable}
                        className="font-semibold"
                      />

                      <div className="text-xs text-muted-foreground">
                        <EditableText
                          value={testimonial.role || ''}
                          onChange={(value) => handleTestimonialUpdate(index, 'role', value)}
                          editable={editable}
                          className="inline"
                        />
                        {testimonial.role && testimonial.company && ', '}
                        <EditableText
                          value={testimonial.company || ''}
                          onChange={(value) => handleTestimonialUpdate(index, 'company', value)}
                          editable={editable}
                          className="inline"
                        />
                      </div>
                    </div>
                  </div>

                  {data.showRatings && testimonial.rating && (
                    <div className="mb-2">
                      {renderRating(testimonial.rating)}
                    </div>
                  )}

                  <div>
                    <EditableText
                      value={testimonial.quote}
                      onChange={(value) => handleTestimonialUpdate(index, 'quote', value)}
                      editable={editable}
                      multiline
                      className="text-sm italic text-muted-foreground"
                    />
                  </div>
                </div>
              );
            })}

            {editable && (
              <div
                className="border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:bg-muted/20 h-full"
                onClick={handleAddTestimonial}
              >
                <div className="text-center">
                  <span className="block text-muted-foreground text-lg">+</span>
                  <span className="block text-muted-foreground">Add Testimonial</span>
                </div>
              </div>
            )}
          </div>
        )}

        {editable && otherTestimonials.length === 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleAddTestimonial}
            >
              + Add More Testimonials
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render testimonials based on variant
  const renderTestimonials = () => {
    switch (variant) {
      case 'simple':
        return renderSimpleLayout();
      case 'carousel':
        return renderCarouselLayout();
      case 'featured':
        return renderFeaturedLayout();
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
      id="testimonials"
    >
      <div className="container px-4 md:px-6">
        <div className="mb-10 text-center">
          <EditableText
            value={data.title || 'Testimonials'}
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

        {renderTestimonials()}
      </div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Testimonials Style</div>
          <select
            value={variant}
            onChange={(e) => onUpdate?.({ ...data, variant: e.target.value })}
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="cards">Cards</option>
            <option value="simple">Simple</option>
            <option value="carousel">Carousel</option>
            <option value="featured">Featured</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showAvatars"
              checked={data.showAvatars !== false}
              onChange={(e) => onUpdate?.({ ...data, showAvatars: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showAvatars" className="text-xs">Show Avatars</label>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showRatings"
              checked={data.showRatings === true}
              onChange={(e) => onUpdate?.({ ...data, showRatings: e.target.checked })}
              className="w-3 h-3"
            />
            <label htmlFor="showRatings" className="text-xs">Show Ratings</label>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
