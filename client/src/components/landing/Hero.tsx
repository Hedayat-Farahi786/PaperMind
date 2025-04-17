import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-16 pb-24 bg-gradient-to-r from-primary-50/50 to-primary-100/10 dark:from-primary-900/30 dark:to-primary-900/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Understand Your Documents. Take Action Instantly.
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              Upload letters, bills, forms, or PDFs. PaperMind extracts the key info and tells you exactly what to do.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button 
                  className="bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3"
                >
                  Try for Free
                </Button>
              </Link>
              <a href="#demo">
                <Button 
                  variant="outline" 
                  className="border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 px-6 py-3"
                >
                  View Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
          <div className="lg:flex hidden justify-end">
            <img 
              src="https://images.unsplash.com/photo-1586282391129-76a6df230234?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Document analysis with AI" 
              className="rounded-lg shadow-lg h-[400px] object-cover" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
