import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 -z-10" />
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Create Your Professional Portfolio in Minutes
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-[600px]">
                  Show off your work with a stunning portfolio website. Choose from beautiful templates,
                  customize your design, and publish your portfolio with just a few clicks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/templates">
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/examples">
                    <Button size="lg" variant="outline">
                      View Examples
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 rounded-full blur-3xl opacity-70" />
                <Image
                  src="https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/peterdraw.studio/wp-content/uploads/2021/12/Luxe-Modern-Personal-Portfolio-Website-Hero-Image.png"
                  alt="Portfolio Example"
                  width={600}
                  height={400}
                  className="relative rounded-lg shadow-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">100+</h3>
                <p className="text-sm font-medium text-muted-foreground">Beautiful Templates</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">10K+</h3>
                <p className="text-sm font-medium text-muted-foreground">Happy Users</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">5K+</h3>
                <p className="text-sm font-medium text-muted-foreground">Published Portfolios</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">99%</h3>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose PortfolioHub?</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Everything you need to build a professional portfolio website, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-violet-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-violet-600">
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
                    className="h-8 w-8"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Beautiful Templates</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Choose from over 100+ professionally designed templates to get started quickly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-indigo-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-indigo-600">
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
                    className="h-8 w-8"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    <path d="M19 17.7C16.9 19 14.5 19.7 12 19.7c-2.4 0-4.9-.7-7-2" />
                    <path d="M12 12v.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Easy Customization</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Personalize colors, fonts, and layouts with our intuitive drag-and-drop editor.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-violet-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-violet-600">
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
                    className="h-8 w-8"
                  >
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Custom Domain</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Connect your own domain or use our free subdomain (username.portfoliohub.com).
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-indigo-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-indigo-600">
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
                    className="h-8 w-8"
                  >
                    <path d="m8 2 1.88 1.88" />
                    <path d="M14.12 3.88 16 2" />
                    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                    <path d="M12 20h0v0" />
                    <path d="M3 15a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Mobile Responsive</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  All templates are fully responsive and look great on any device.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-violet-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-violet-600">
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
                    className="h-8 w-8"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 12v5h16a2 2 0 0 1 0 4H3v-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">SEO Optimized</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Get found online with built-in SEO tools and optimizations.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group relative overflow-hidden rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -bottom-2 -right-2 aspect-square w-24 rounded-full bg-indigo-500/20 transition-all duration-300 group-hover:scale-150" />
                <div className="mb-4 text-indigo-600">
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
                    className="h-8 w-8"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Fast & Secure</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Lightning-fast load times and SSL security included on all portfolios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Preview Section */}
        <section className="py-20 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Stunning Templates</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Choose from a variety of professional templates for any creative field.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Template 1 */}
              <div className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src="https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4"
                    alt="Developer Portfolio Template"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <h3 className="text-lg font-semibold text-white">Developer Portfolio</h3>
                    <p className="text-sm text-white/80">Perfect for showcasing coding projects</p>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium">10 layouts</span>
                  <Link href="/templates/developer">
                    <Button variant="ghost" size="sm">Preview</Button>
                  </Link>
                </div>
              </div>

              {/* Template 2 */}
              <div className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src="https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg"
                    alt="Designer Portfolio Template"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <h3 className="text-lg font-semibold text-white">Designer Portfolio</h3>
                    <p className="text-sm text-white/80">Showcase your creative work beautifully</p>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium">8 layouts</span>
                  <Link href="/templates/designer">
                    <Button variant="ghost" size="sm">Preview</Button>
                  </Link>
                </div>
              </div>

              {/* Template 3 */}
              <div className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src="https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg"
                    alt="Photographer Portfolio Template"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <h3 className="text-lg font-semibold text-white">Photographer Portfolio</h3>
                    <p className="text-sm text-white/80">Highlight your photography with style</p>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium">12 layouts</span>
                  <Link href="/templates/photographer">
                    <Button variant="ghost" size="sm">Preview</Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/templates">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  View All Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-10" />
          <div className="container px-4 md:px-6 text-center relative">
            <div className="max-w-[800px] mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Create Your Portfolio?</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of professionals who trust PortfolioHub to showcase their work online.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Get Started — It's Free
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button size="lg" variant="outline">
                    View Examples
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
