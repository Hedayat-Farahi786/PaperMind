import { Link, useLocation } from 'wouter';
import { Home, FileText, FolderOpen, Calendar, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const Sidebar = () => {
  const [location] = useLocation();

  const mainNavItems: NavItem[] = [
    { icon: <Home size={20} />, label: 'Home', href: '/dashboard' },
    { icon: <FileText size={20} />, label: 'Documents', href: '/documents' },
    { icon: <FolderOpen size={20} />, label: 'Categories', href: '/categories' },
    { icon: <Calendar size={20} />, label: 'Calendar & Reminders', href: '/calendar' },
  ];

  const bottomNavItems: NavItem[] = [
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
    { icon: <HelpCircle size={20} />, label: 'Help', href: '/help' },
  ];

  const isActive = (href: string) => {
    return location === href || location.startsWith(`${href}/`);
  };

  const NavItem = ({ item }: { item: NavItem }) => (
    <Link href={item.href}>
      <div className={cn(
        "flex items-center text-neutral-600 dark:text-neutral-300 px-3 py-2 rounded-lg transition-colors cursor-pointer",
        isActive(item.href) 
          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20" 
          : "hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}>
        <span className="mr-3">{item.icon}</span>
        <span>{item.label}</span>
      </div>
    </Link>
  );

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 h-full flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/dashboard">
            <div className="flex items-center space-x-2 cursor-pointer">
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
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {mainNavItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </nav>
        
        {/* Bottom section */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          {bottomNavItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
