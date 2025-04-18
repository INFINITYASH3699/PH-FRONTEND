import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

const features = [
  {
    id: 'templates',
    title: 'Professional Templates',
    description:
      'Choose from a wide range of professionally designed templates for every creative field. From minimalist to bold, we have styles that suit every profession.',
    image: 'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/peterdraw.studio/wp-content/uploads/2021/12/Luxe-Modern-Personal-Portfolio-Website-Hero-Image.png',
    alt: 'Portfolio templates showcase',
  },
  {
    id: 'customization',
    title: 'Easy Customization',
    description:
      'Personalize your portfolio with our intuitive editor. Change colors, fonts, and layouts without any coding knowledge. Make your portfolio truly yours.',
    image: 'https://colorlib.com/wp/wp-content/uploads/sites/2/20_best_portfolio_wordpress_themes.jpg',
    alt: 'Portfolio customization interface',
  },
  {
    id: 'responsive',
    title: 'Fully Responsive',
    description:
      'Your portfolio will look great on any device - desktop, tablet, or mobile. We ensure your work is presented beautifully no matter how visitors view it.',
    image: 'https://www.dreamhost.com/blog/wp-content/uploads/2019/10/Portfolio-Websites-Feature.jpg',
    alt: 'Responsive portfolio design',
  },
  {
    id: 'domains',
    title: 'Custom Domains',
    description:
      'Connect your own domain or use our free subdomain (username.portfoliohub.com). Establish your professional web presence with a memorable address.',
    image: 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2019/02/choose-domain-name-for-website.png',
    alt: 'Custom domain setup',
  },
  {
    id: 'analytics',
    title: 'Portfolio Analytics',
    description:
      'Track visitor engagement with built-in analytics. See which projects get the most attention and understand where your visitors are coming from.',
    image: 'https://cdn.dribbble.com/users/1615584/screenshots/16983366/analytics_dashboard_dribbble_4x.jpg',
    alt: 'Portfolio analytics dashboard',
  },
  {
    id: 'seo',
    title: 'SEO Optimization',
    description:
      'Get found online with our SEO tools. We help search engines discover your portfolio so potential clients and employers can find your work.',
    image: 'https://cdn.searchenginejournal.com/wp-content/uploads/2022/08/seo-meme-63040c9c3cc6e-sej-1520x800.jpg',
    alt: 'SEO optimization tools',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold">Powerful Features for Your Portfolio</h1>
              <p className="text-lg text-muted-foreground">
                Discover all the tools and capabilities that make PortfolioHub the best platform for showcasing your work.
              </p>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="space-y-24">
              {features.map((feature, index) => (
                <div key={feature.id} className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <h2 className="text-2xl md:text-3xl font-bold">{feature.title}</h2>
                    <p className="text-lg text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className={`relative rounded-lg overflow-hidden shadow-xl ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="aspect-[16/9]">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What Our Users Say</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Thousands of professionals trust PortfolioHub to showcase their work online.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src="https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
                      alt="Sarah Johnson"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">UI/UX Designer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "PortfolioHub helped me showcase my design work professionally without any coding. I got three job offers within a month of launching my portfolio!"
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src="https://xsgames.co/randomusers/assets/avatars/male/2.jpg"
                      alt="Michael Rodriguez"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Michael Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Full Stack Developer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The templates are modern and clean, and the customization options are exactly what I needed. My portfolio stands out from others in the tech industry."
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src="https://xsgames.co/randomusers/assets/avatars/female/4.jpg"
                      alt="Jennifer Lee"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Jennifer Lee</p>
                    <p className="text-xs text-muted-foreground">Photographer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "As a photographer, image quality is everything. PortfolioHub's gallery layouts showcase my work beautifully, and the responsive design means it looks great on every device."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How We Compare</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                See why PortfolioHub is the best choice for your professional portfolio.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-muted">Features</th>
                    <th className="text-center p-4 bg-muted">PortfolioHub</th>
                    <th className="text-center p-4 bg-muted">Other Portfolio Builders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Professional Templates</td>
                    <td className="text-center p-4 text-green-500">100+ specialized templates</td>
                    <td className="text-center p-4 text-muted-foreground">Limited options</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Customization</td>
                    <td className="text-center p-4 text-green-500">Full visual editor, no coding needed</td>
                    <td className="text-center p-4 text-muted-foreground">Basic customization or requires coding</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Industry-Specific Features</td>
                    <td className="text-center p-4 text-green-500">Tailored for different professions</td>
                    <td className="text-center p-4 text-muted-foreground">Generic features</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Portfolio Analytics</td>
                    <td className="text-center p-4 text-green-500">Built-in, detailed insights</td>
                    <td className="text-center p-4 text-muted-foreground">Limited or requires third-party tools</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">SEO Tools</td>
                    <td className="text-center p-4 text-green-500">Comprehensive SEO optimization</td>
                    <td className="text-center p-4 text-muted-foreground">Basic or manual setup</td>
                  </tr>
                </tbody>
              </table>
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
                Join thousands of professionals who trust PortfolioHub to showcase their work.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/templates">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Sign Up Free
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
