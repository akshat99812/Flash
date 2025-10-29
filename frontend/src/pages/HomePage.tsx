import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChatBox from '@/components/ChatBox';
import {  Code2, Palette, Rocket, Globe, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'AI-Powered Coding',
    description: 'Generate complete websites with just a prompt. Our AI understands your vision and creates production-ready code.',
  },
  {
    icon: Palette,
    title: 'Modern Design',
    description: 'Beautiful, responsive designs with Tailwind CSS and shadcn/ui components. Every site looks professional.',
  },
  {
    icon: Rocket,
    title: 'Instant Preview',
    description: 'See your changes in real-time. Edit code and watch your website update instantly in the preview.',
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    description: 'Export your projects or deploy directly to popular hosting platforms with one click.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Describe Your Vision',
    description: 'Tell us what kind of website you want to build using natural language.',
  },
  {
    number: '02',
    title: 'AI Generates Code',
    description: 'Our AI creates a complete, production-ready website based on your description.',
  },
  {
    number: '03',
    title: 'Customize & Deploy',
    description: 'Fine-tune your site with our editor and deploy it to the web instantly.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateProject = (prompt: string) => {
    // Navigate to editor with the prompt
    navigate('/editor', { state: { prompt } });
  };

  return (
    <div className="flex flex-col ">
      {/* <div className='h-[110px] w-full border-2 border-purple-500'>
      hi
      </div> */}
      {/* Hero Section */}
      <div className="flex flex-col overflow-visible min-h-screen">
        <section className="relative min-h-screen pt-28 lg:pt-32 pb-20 overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)] z-0" />

          <div className="container mx-auto px-4 relative z-10 min-h-screen">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Website Builder
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Build Websites with 
                <span className="text-primary"> Lightning Speed</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Transform your ideas into beautiful, functional websites using AI. 
                Just describe what you want, and Flash creates it in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/editor">
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Examples
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Chat Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Building with AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell Flash AI what you want to build and watch it create your website in real-time
            </p>
          </div>
          <ChatBox onCreateProject={handleCreateProject} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to build amazing websites
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flash combines the power of AI with professional development tools
              to make website creation effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-muted">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Flash Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to deployed website in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-8 group">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to build something amazing?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of developers and creators who are already building 
            the future with Flash.
          </p>
        </div>
      </section>
    </div>
  );
}