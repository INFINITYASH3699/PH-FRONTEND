import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Sample example portfolios
const examplePortfolios = [
  {
    id: 'dev-portfolio-1',
    title: 'Alex Johnson',
    subtitle: 'Full Stack Developer',
    image: 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg',
    thumbnail: 'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/peterdraw.studio/wp-content/uploads/2021/12/Luxe-Modern-Personal-Portfolio-Website-Hero-Image.png',
    url: 'https://alexjohnson.dev',
    category: 'developer',
    template: 'Modern Developer',
  },
  {
    id: 'designer-portfolio-1',
    title: 'Emily Parker',
    subtitle: 'UI/UX Designer',
    image: 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg',
    thumbnail: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
    url: 'https://emilyparker.design',
    category: 'designer',
    template: 'Creative Studio',
  },
  {
    id: 'photo-portfolio-1',
    title: 'Marcus Chen',
    subtitle: 'Landscape Photographer',
    image: 'https://xsgames.co/randomusers/assets/avatars/male/5.jpg',
    thumbnail: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    url: 'https://marcuschen.photos',
    category: 'photographer',
    template: 'Photo Gallery',
  },
  {
    id: 'writer-portfolio-1',
    title: 'Sophia Williams',
    subtitle: 'Content Writer & Blogger',
    image: 'https://xsgames.co/randomusers/assets/avatars/female/5.jpg',
    thumbnail: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
    url: 'https://sophiawrites.com',
    category: 'writer',
    template: 'Content Creator',
  },
  {
    id: 'architect-portfolio-1',
    title: 'David Kim',
    subtitle: 'Architect & Interior Designer',
    image: 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg',
    thumbnail: 'https://marketplace.canva.com/EAGGr0aHXDg/2/0/1600w/canva-pink-bold-modern-creative-portfolio-presentation-te1AiwXONs0.jpg',
    category: 'architect',
    template: 'Architecture Studio',
  },
  {
    id: 'artist-portfolio-1',
    title: 'Isabella Rodriguez',
    subtitle: 'Visual Artist & Illustrator',
    image: 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg',
    thumbnail: 'https://www.unsell.design/wp-content/uploads/2021/07/bd5b5164-cover-flat-lay.jpg',
    url: 'https://isabella.art',
    category: 'artist',
    template: 'Artist Gallery',
  },
];

export default function ExamplesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold">Portfolio Examples</h1>
              <p className="text-lg text-muted-foreground">
                Get inspired by portfolios created by our users across different industries. See what's possible with our templates.
              </p>
            </div>
          </div>
        </section>

        {/* Examples Gallery */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {examplePortfolios.map((portfolio) => (
                <div key={portfolio.id} className="group rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={portfolio.thumbnail}
                      alt={portfolio.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      <h3 className="text-lg font-semibold text-white">{portfolio.title}</h3>
                      <p className="text-sm text-white/80">{portfolio.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={portfolio.image}
                          alt={portfolio.title}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{portfolio.title}</p>
                        <p className="text-xs text-muted-foreground">{portfolio.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
                        {portfolio.template}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={portfolio.url} target="_blank" rel="noopener noreferrer">
                          View Portfolio
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Create Your Own Portfolio</h2>
              <p className="text-lg text-muted-foreground">
                Ready to showcase your work? Choose from our beautiful templates and create a professional portfolio in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/templates">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Create Account
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
