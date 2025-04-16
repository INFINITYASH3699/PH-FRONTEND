import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Mock user portfolio data
const portfolios = [
  {
    username: 'johndoe',
    title: 'John Doe - Full Stack Developer',
    subtitle: 'Building modern web applications',
    template: 'developer-1',
    about: {
      title: 'About Me',
      bio: 'I am a passionate developer with 5+ years of experience in building web applications. I specialize in React, Node.js, and TypeScript. I love creating clean, efficient code and solving complex problems.',
      image: 'https://ui-avatars.com/api/?name=John+Doe&background=6d28d9&color=fff&size=256'
    },
    projects: [
      {
        title: 'E-commerce Platform',
        description: 'A full-featured e-commerce platform built with Next.js, Tailwind CSS, and Supabase.',
        image: 'https://placehold.co/600x400/6d28d9/fff?text=E-commerce+Project',
        url: '#',
        github: 'https://github.com'
      },
      {
        title: 'Task Management App',
        description: 'A productivity app with real-time collaboration features using React and Firebase.',
        image: 'https://placehold.co/600x400/4f46e5/fff?text=Task+App',
        url: '#',
        github: 'https://github.com'
      },
      {
        title: 'Personal Finance Dashboard',
        description: 'A dashboard for tracking personal finances with charts and analytics.',
        image: 'https://placehold.co/600x400/8b5cf6/fff?text=Finance+App',
        url: '#',
        github: 'https://github.com'
      }
    ],
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'Next.js', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'GraphQL', level: 75 },
      { name: 'PostgreSQL', level: 70 },
      { name: 'AWS', level: 65 }
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Innovation Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2021',
        endDate: 'Present',
        description: 'Leading the frontend development team, implementing new features, and improving performance.'
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Solutions LLC',
        location: 'New York, NY',
        startDate: 'Mar 2018',
        endDate: 'Dec 2020',
        description: 'Developed and maintained web applications for clients in various industries.'
      },
      {
        title: 'Junior Developer',
        company: 'WebStart Agency',
        location: 'Boston, MA',
        startDate: 'Jun 2016',
        endDate: 'Feb 2018',
        description: 'Assisted in the development of websites and web applications for small businesses.'
      }
    ],
    education: [
      {
        degree: 'Master of Computer Science',
        institution: 'Massachusetts Institute of Technology',
        location: 'Cambridge, MA',
        startDate: '2014',
        endDate: '2016',
        description: 'Specialized in web technologies and distributed systems.'
      },
      {
        degree: 'Bachelor of Science in Computer Engineering',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2010',
        endDate: '2014',
        description: 'Graduated with honors. Member of the ACM student chapter.'
      }
    ],
    contact: {
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      social: {
        github: 'johndoe',
        linkedin: 'johndoe',
        twitter: 'johndoe'
      }
    }
  }
];

export default function PublishedPortfolioPage({ params }: { params: { username: string } }) {
  // Find the portfolio by username
  const portfolio = portfolios.find(p => p.username === params.username);

  // If portfolio not found, return 404
  if (!portfolio) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/portfolio/${portfolio.username}`} className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
            {portfolio.username}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium transition-colors hover:text-primary">About</a>
            <a href="#projects" className="text-sm font-medium transition-colors hover:text-primary">Projects</a>
            <a href="#skills" className="text-sm font-medium transition-colors hover:text-primary">Skills</a>
            <a href="#experience" className="text-sm font-medium transition-colors hover:text-primary">Experience</a>
            <a href="#education" className="text-sm font-medium transition-colors hover:text-primary">Education</a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">Contact</a>
          </nav>

          <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
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
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="about" className="py-24 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  {portfolio.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  {portfolio.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#contact">
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Contact Me
                    </Button>
                  </a>
                  <a href={`https://github.com/${portfolio.contact.social.github}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline">
                      View GitHub
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mx-auto lg:mx-0">
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  <Image
                    src={portfolio.about.image}
                    alt={portfolio.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 border-b">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">My Projects</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                Here are some of my recent projects. Check them out to see my work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.projects.map((project) => (
                <div key={project.title} className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex gap-3">
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Demo</Button>
                      </a>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Code</Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 border-b bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Skills & Expertise</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                Here are the technologies and tools I specialize in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {portfolio.skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience & Education Section */}
        <section id="experience" className="py-24 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Experience */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Experience</h2>
                <div className="space-y-8">
                  {portfolio.experience.map((exp) => (
                    <div key={exp.title + exp.company} className="relative pl-8 border-l pb-8">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-violet-600 bg-white dark:bg-gray-950" />
                      <h3 className="text-xl font-bold">{exp.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <span className="text-primary">{exp.company}</span>
                        <span className="hidden sm:inline text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{exp.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{exp.startDate} - {exp.endDate}</p>
                      <p className="mt-3">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div id="education">
                <h2 className="text-3xl font-bold mb-8">Education</h2>
                <div className="space-y-8">
                  {portfolio.education.map((edu) => (
                    <div key={edu.degree + edu.institution} className="relative pl-8 border-l pb-8">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-950" />
                      <h3 className="text-xl font-bold">{edu.degree}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <span className="text-primary">{edu.institution}</span>
                        <span className="hidden sm:inline text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{edu.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{edu.startDate} - {edu.endDate}</p>
                      <p className="mt-3">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                Interested in working together? Feel free to reach out to me using the contact information below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-600 mb-4">
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
                    className="h-6 w-6"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Email</h3>
                <a href={`mailto:${portfolio.contact.email}`} className="text-muted-foreground hover:text-primary">
                  {portfolio.contact.email}
                </a>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 mb-4">
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
                    className="h-6 w-6"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Phone</h3>
                <a href={`tel:${portfolio.contact.phone}`} className="text-muted-foreground hover:text-primary">
                  {portfolio.contact.phone}
                </a>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-background">
                <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-600 mb-4">
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
                    className="h-6 w-6"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Location</h3>
                <span className="text-muted-foreground">
                  {portfolio.contact.location}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-12">
              <a
                href={`https://github.com/${portfolio.contact.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-background border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.48C19.138 20.162 22 16.417 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>

              <a
                href={`https://linkedin.com/in/${portfolio.contact.social.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-background border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-[#0077B5]"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </a>

              <a
                href={`https://twitter.com/${portfolio.contact.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-background border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-[#1DA1F2]"
                >
                  <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 4.9 4.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by <Link href="/" className="text-primary hover:underline">PortfolioHub</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
