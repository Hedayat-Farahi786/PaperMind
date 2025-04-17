import { Clock } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

interface TimelineItem {
  title: string;
  date: string;
  label?: string;
  type: 'upload' | 'due' | 'other';
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline = ({ items }: TimelineProps) => {
  // Sort items by date
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Get border color for timeline item
  const getBorderColor = (item: TimelineItem) => {
    const today = new Date();
    const itemDate = parseISO(item.date);
    
    if (item.type === 'upload') {
      return 'border-blue-500 dark:border-blue-400';
    }
    
    if (item.type === 'due') {
      if (isToday(itemDate)) {
        return 'border-orange-500 dark:border-orange-400';
      }
      
      if (isBefore(itemDate, today)) {
        return 'border-red-500 dark:border-red-400';
      }
      
      return 'border-primary-500 dark:border-primary-400';
    }
    
    return 'border-neutral-500 dark:border-neutral-400';
  };
  
  // Get relative date label
  const getRelativeDate = (dateStr: string) => {
    const today = new Date();
    const date = parseISO(dateStr);
    
    if (isToday(date)) {
      return 'Today';
    }
    
    // Check if date is tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getDate() === tomorrow.getDate() && 
        date.getMonth() === tomorrow.getMonth() && 
        date.getFullYear() === tomorrow.getFullYear()) {
      return 'Tomorrow';
    }
    
    // Check if date is within the next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    if (isAfter(date, today) && isBefore(date, nextWeek)) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
    
    // For past dates or dates beyond next week
    return format(date, 'MMM d, yyyy');
  };
  
  // Add relative days from now for future items
  const getDaysLabel = (dateStr: string) => {
    const today = new Date();
    const date = parseISO(dateStr);
    
    if (isToday(date)) {
      return '';
    }
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    }
    
    if (diffDays === 1) {
      return '1 day from now';
    }
    
    if (diffDays > 0) {
      return `${diffDays} days from now`;
    }
    
    return '';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Timeline</h2>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute h-full w-0.5 bg-neutral-200 dark:bg-neutral-700 left-3 top-0"></div>
        
        {/* Timeline points */}
        <div className="space-y-6">
          {sortedItems.map((item, index) => (
            <div key={index} className="ml-8 relative">
              <div className={`absolute -left-10 mt-1.5 w-5 h-5 rounded-full border-2 ${getBorderColor(item)} bg-white dark:bg-neutral-800`}></div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                {item.title}
                {item.label && <span className="text-xs font-normal text-neutral-600 dark:text-neutral-400 ml-2">({item.label})</span>}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {getRelativeDate(item.date)}
                {getDaysLabel(item.date) && ` (${getDaysLabel(item.date)})`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
