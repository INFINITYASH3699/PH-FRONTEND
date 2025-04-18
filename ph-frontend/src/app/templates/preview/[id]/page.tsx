'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import apiClient, { Template } from '@/lib/apiClient';
import { templates as fallbackTemplates } from '@/data/templates'; // Use as fallback
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthContext';

// Sample features for templates
const templateFeatures = {
  developer: [
    'Projects showcase with GitHub integration',
    'Skills section with proficiency indicators',
    'Timeline for work experience and education',
    'Dark and light mode support',
    'Responsive design for all devices',
    'Blog section for technical articles',
    'Contact form with validation',
  ],
  designer: [
    'Fullscreen gallery with various layout options',
    'Project case study pages',
    'Client testimonial section',
    'Animated transitions between pages',
    'Instagram feed integration',
    'Contact form with file upload',
    'Custom cursor options',
  ],
  photographer: [
    'Fullscreen photo galleries',
    'Multiple portfolio categories',
    'Image lightbox with zoom capability',
    'Password-protected client galleries',
    'Photo metadata display',
    'Print store integration',
    'Photo shoot booking system',
  ],
  default: [
    'Responsive design for all devices',
    'Customizable sections',
    'Contact form with validation',
    'SEO optimized',
    'Social media integration',
    'Quick loading speed',
    'Modern and clean design',
  ],
};

export default function TemplatePreviewPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [reviews, setReviews] = useState<Template['reviews']>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const { isAuthenticated, user } = useAuth();

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) {
        setNotFoundError(true);
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from API
        const templateData = await apiClient.getTemplateById(id);
        setTemplate(templateData);

        // Fetch reviews
        try {
          const reviewsData = await apiClient.getTemplateReviews(id);
          setReviews(reviewsData);

          // Check if user has reviewed this template
          if (isAuthenticated && user) {
            const userReview = reviewsData.find(review => review.userId === user.id);
            if (userReview) {
              setUserRating(userReview.rating);
              setReviewComment(userReview.comment || '');
            }
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template from API. Using demo data.');

        // Fallback to demo data
        const fallbackTemplate = fallbackTemplates.find(t => t._id === id);
        if (fallbackTemplate) {
          setTemplate({
            _id: fallbackTemplate._id,
            name: fallbackTemplate.name,
            description: fallbackTemplate.description,
            category: fallbackTemplate.category,
            previewImage: fallbackTemplate.previewImage,
            defaultStructure: fallbackTemplate.settings || {},
            isPublished: true,
            longDescription: fallbackTemplate.longDescription,
            rating: { average: 4.5, count: 12 },
            tags: fallbackTemplate.tags || [],
          } as Template);

          // Mock reviews
          setReviews([
            {
              userId: 'user1',
              userName: 'John Doe',
              rating: 5,
              comment: 'Great template, love the design!',
              createdAt: new Date().toISOString()
            },
            {
              userId: 'user2',
              userName: 'Jane Smith',
              rating: 4,
              comment: 'Nice features, could use more color options.',
              createdAt: new Date().toISOString()
            }
          ]);
        } else {
          setNotFoundError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, isAuthenticated, user]);

  // Check if template is in user's favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !template) return;

      try {
        const favorites = await apiClient.getFavoriteTemplates();
        const isFav = favorites.some(fav => fav._id === template._id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [template, isAuthenticated]);

  // Handle toggling favorite status
  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !template) {
      toast.error('Please sign in to save templates to favorites');
      router.push('/auth/signin?callbackUrl=/templates/preview/' + id);
      return;
    }

    try {
      await apiClient.favoriteTemplate(template._id, !isFavorite);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Submit a rating for the template
  const handleSubmitRating = async () => {
    if (!isAuthenticated || !template) {
      toast.error('Please sign in to rate templates');
      setShowRatingDialog(false);
      router.push('/auth/signin?callbackUrl=/templates/preview/' + id);
      return;
    }

    if (userRating < 1) {
      toast.error('Please select a star rating');
      return;
    }

    try {
      setSubmittingRating(true);
      const updatedTemplate = await apiClient.rateTemplate(
        template._id,
        userRating,
        reviewComment
      );

      setTemplate(updatedTemplate);

      // Refresh reviews
      const updatedReviews = await apiClient.getTemplateReviews(template._id);
      setReviews(updatedReviews);

      setShowRatingDialog(false);
      toast.success('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading template preview...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show not found
  if (notFoundError || !template) {
    return notFound();
  }

  // Get features based on category or use default
  const features = templateFeatures[template.category as keyof typeof templateFeatures] || templateFeatures.default;

  // Construct a more detailed description if the template doesn't have one
  const longDescription = template.longDescription ||
    `${template.description} This template is designed to help you create a professional portfolio
    that showcases your work effectively. With a focus on ${template.category} projects, it includes
    all the sections you need to highlight your skills, experience, and achievements.`;

  // Handle clicking "Use This Template"
  const handleUseTemplate = async () => {
    // Track template usage
    if (isAuthenticated && template._id) {
      try {
        await apiClient.request(`/templates/${template._id}/use`, 'POST');
      } catch (error) {
        console.error('Error tracking template usage:', error);
      }
    }

    router.push(`/templates/use/${template._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <div className="inline-block bg-muted px-3 py-1 rounded-full text-sm mb-4">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)} Template
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">{template.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                  {/* Star rating display */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={star <= Math.round(template.rating?.average || 0) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-5 w-5 ${star <= Math.round(template.rating?.average || 0) ? "text-amber-500" : "text-gray-300"}`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {template.rating?.average.toFixed(1) || "0.0"} ({template.rating?.count || 0} reviews)
                  </span>
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowRatingDialog(true)}
                  >
                    Write a review
                  </button>
                </div>
                <p className="text-lg text-muted-foreground">
                  {longDescription}
                </p>
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-xs bg-muted px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={handleUseTemplate}
                  >
                    Use This Template
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100" : ""}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-5 w-5 mr-2 ${isFavorite ? "text-red-500" : ""}`}
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Template Features</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Discover all the features and capabilities that {template.name} has to offer
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 p-4 rounded-lg border">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-violet-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">User Reviews</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                See what other users think about this template
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => setShowRatingDialog(true)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                >
                  Write a Review
                </Button>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {reviews.map((review, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {review.userAvatar ? (
                              <Image
                                src={review.userAvatar}
                                alt={review.userName || 'User'}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{review.userName || 'Anonymous User'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={star <= review.rating ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 ${star <= review.rating ? "text-amber-500" : "text-gray-300"}`}
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 max-w-md mx-auto">
                <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this template!</p>
                <Button
                  onClick={() => setShowRatingDialog(true)}
                  variant="outline"
                >
                  Write a Review
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Template Preview</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Take a closer look at how your portfolio can look with this template
              </p>
            </div>

            <div className="aspect-[16/9] max-w-5xl mx-auto relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src={template.previewImage}
                alt={template.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 text-violet-600 mx-auto mb-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M10 8v8l6-4-6-4z" />
                  </svg>
                  <p className="text-white text-lg font-medium mb-3">Template Preview</p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={handleUseTemplate}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 mr-2"
                    >
                      <path d="M10 8v8l6-4-6-4z" />
                    </svg>
                    Start Customizing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Create Your Portfolio?</h2>
              <p className="text-lg text-muted-foreground">
                Use this template to showcase your work and create a stunning portfolio that stands out.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                  onClick={handleUseTemplate}
                >
                  Use This Template
                </Button>
                <Link href="/templates">
                  <Button size="lg" variant="outline">
                    View All Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate this template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={star <= userRating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-8 w-8 cursor-pointer hover:text-amber-500 ${star <= userRating ? "text-amber-500" : "text-gray-300"}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this template (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitRating}
              disabled={submittingRating || userRating < 1}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
