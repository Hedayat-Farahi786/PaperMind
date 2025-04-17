import { Play } from 'lucide-react';

const Demo = () => {
  return (
    <section id="demo" className="py-16 bg-neutral-50 dark:bg-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">See PaperMind in Action</h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Watch how easily you can transform complex documents into clear, actionable summaries.
          </p>
        </div>
        
        {/* Demo image/video placeholder */}
        <div className="max-w-4xl mx-auto p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
          <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1589330694453-ded6df9afb8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="PaperMind demo" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="w-16 h-16 bg-primary-500 hover:bg-primary-600 transition-colors duration-200 rounded-full flex items-center justify-center shadow-lg"
                aria-label="Play demo video"
              >
                <Play className="h-8 w-8 text-white fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
