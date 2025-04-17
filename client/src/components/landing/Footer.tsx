import { Link } from 'wouter';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">PaperMind</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Turn confusing documents into clear, actionable summaries.</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Features</a></li>
              <li><a href="#pricing" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Pricing</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Integrations</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Blog</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Help Center</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Community</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">GDPR</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">© {new Date().getFullYear()} PaperMind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
