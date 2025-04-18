import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Check, X } from 'lucide-react';

// Pricing plans data
const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started with your portfolio',
    price: '$0',
    period: 'forever',
    popular: false,
    features: [
      { name: 'Up to 3 portfolio pages', included: true },
      { name: 'Basic templates', included: true },
      { name: 'Custom domain support', included: false },
      { name: 'PortfolioHub subdomain', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Basic SEO tools', included: true },
      { name: 'Community support', included: true },
      { name: 'Premium templates', included: false },
      { name: 'Advanced customization', included: false },
      { name: 'Remove PortfolioHub branding', included: false },
    ],
    ctaText: 'Get Started',
    ctaLink: '/auth/signup',
  },
  {
    name: 'Pro',
    description: 'For professionals who need more features and customization',
    price: '$9',
    period: 'per month',
    popular: true,
    features: [
      { name: 'Unlimited portfolio pages', included: true },
      { name: 'All templates (basic & premium)', included: true },
      { name: 'Custom domain support', included: true },
      { name: 'PortfolioHub subdomain', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Advanced SEO tools', included: true },
      { name: 'Priority support', included: true },
      { name: 'Premium templates', included: true },
      { name: 'Advanced customization', included: true },
      { name: 'Remove PortfolioHub branding', included: true },
    ],
    ctaText: 'Go Pro',
    ctaLink: '/auth/signup?plan=pro',
  },
  {
    name: 'Team',
    description: 'For agencies and teams managing multiple portfolios',
    price: '$49',
    period: 'per month',
    popular: false,
    features: [
      { name: 'Unlimited portfolio pages', included: true },
      { name: 'All templates (basic & premium)', included: true },
      { name: 'Custom domain support', included: true },
      { name: 'PortfolioHub subdomain', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Advanced SEO tools', included: true },
      { name: 'Priority support', included: true },
      { name: 'Premium templates', included: true },
      { name: 'Advanced customization', included: true },
      { name: 'Remove PortfolioHub branding', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'Client management', included: true },
      { name: 'API access', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h1>
              <p className="text-lg text-muted-foreground">
                Choose the plan that's right for you. All plans include a 14-day free trial.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex flex-col ${
                    plan.popular
                      ? 'border-violet-500 shadow-lg relative'
                      : 'shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-start">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                          )}
                          <span className={feature.included ? '' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={plan.ctaLink}>{plan.ctaText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <p className="text-sm text-muted-foreground">
                Need a custom plan for your business?{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact our sales team
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Find answers to common questions about our plans and features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Yes, you can change your plan at any time. When upgrading, you'll be billed the prorated amount for the remainder of your billing cycle.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and Apple Pay.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Is there a contract or commitment?</h3>
                <p className="text-muted-foreground">
                  No, all plans are monthly or annual subscriptions that you can cancel at any time.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">What happens when my trial ends?</h3>
                <p className="text-muted-foreground">
                  At the end of your trial, you'll be automatically switched to the Free plan unless you choose to upgrade.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I use my own custom domain?</h3>
                <p className="text-muted-foreground">
                  Yes, all paid plans allow you to use your own custom domain. Our Free plan offers a subdomain (username.portfoliohub.com).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Do you offer discounts for students?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 50% discount on our Pro plan for students and educators. Contact our support team with your valid school email to apply.
                </p>
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
                Start with our free plan today and upgrade when you need more features.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline">
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
