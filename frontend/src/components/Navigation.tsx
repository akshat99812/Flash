import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Home, Code2, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// A more realistic set of nav items for a modern app
const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Editor', href: '/editor', icon: Sparkles },
  // 'Editor' is now the primary CTA button, so we remove it from here
];



export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();

  // Add a shadow to the navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-[100] w-full bg-background/80 backdrop-blur-lg transition-all duration-300",
          hasScrolled ? "border-b border-border/40 shadow-sm" : "border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-4 ">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Flash</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {location.pathname === item.href && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 z-0 rounded-md bg-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button asChild>
                <Link to="/editor">
                  <Code2 className="mr-2 h-4 w-4" /> Start Building
                </Link>
              </Button>
            </div>

            {/* Mobile Navigation Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={isOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && <MobileNav />}
      </AnimatePresence>
    </>
  );
}

const MobileNav = () => {
  const location = useLocation();

  const mobileMenuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
    },
    exit: { 
      x: '-100%', 
      opacity: 0, 
      transition: { duration: 0.3 }
    },
  };

  const listVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 md:hidden"
        aria-hidden="true"
      />
      <motion.div
        variants={mobileMenuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-xs p-4 bg-background border-l border-border md:hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Flash</span>
          </Link>
        </div>
        
        <motion.ul
          variants={listVariants}
          className="space-y-2"
        >
          {navItems.map((item) => (
            <motion.li key={item.name} variants={itemVariants}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md text-base font-medium transition-colors w-full",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </motion.li>
          ))}
          <motion.li variants={itemVariants} className="pt-4">
            <Button asChild className="w-full text-base py-6">
              <Link to="/editor">
                <Code2 className="mr-2 h-5 w-5" /> Start Building
              </Link>
            </Button>
          </motion.li>
        </motion.ul>
      </motion.div>
    </>
  );
};