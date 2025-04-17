import { useState } from 'react';
import { Link } from 'wouter';
import { 
  FileText, Timer, AlertTriangle, Info, MoreVertical,
  Clock, Eye, Trash, Download
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow, isFuture, isPast, isToday, isTomorrow } from 'date-fns';

interface ActionItem {
  task: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DocumentCardProps {
  id: number;
  title: string;
  fileType: string;
  tags: string[];
  uploadedAt: string;
  actionItems?: ActionItem[];
  thumbnailUrl?: string;
}

const DocumentCard = ({ 
  id, 
  title, 
  fileType, 
  tags = [], 
  uploadedAt, 
  actionItems = [], 
  thumbnailUrl 
}: DocumentCardProps) => {
  // Find closest due date
  const getClosestDueDate = () => {
    if (!actionItems || actionItems.length === 0) return null;
    
    const dueDates = actionItems
      .filter(item => item.dueDate)
      .map(item => new Date(item.dueDate!));
    
    if (dueDates.length === 0) return null;
    
    return dueDates.reduce((closest, date) => {
      if (!closest) return date;
      return date < closest ? date : closest;
    }, null as Date | null);
  };

  const closestDueDate = getClosestDueDate();
  
  // Get status label and style based on due date
  const getStatusInfo = () => {
    if (!closestDueDate) {
      return {
        label: 'For Review',
        icon: <Info className="mr-1 h-3 w-3" />,
        classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      };
    }
    
    if (isPast(closestDueDate) && !isToday(closestDueDate)) {
      return {
        label: 'Overdue',
        icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      };
    }
    
    if (isToday(closestDueDate)) {
      return {
        label: 'Due Today',
        icon: <Clock className="mr-1 h-3 w-3" />,
        classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      };
    }
    
    if (isTomorrow(closestDueDate)) {
      return {
        label: 'Due Tomorrow',
        icon: <Timer className="mr-1 h-3 w-3" />,
        classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      };
    }
    
    return {
      label: 'Upcoming',
      icon: <Timer className="mr-1 h-3 w-3" />,
      classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  // Get file type icon
  const getFileTypeIcon = () => {
    return <FileText className="mr-1 h-3 w-3" />;
  };
  
  // Format uploaded date
  const formattedUploadDate = formatDistanceToNow(new Date(uploadedAt), { addSuffix: true });
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="aspect-w-3 aspect-h-2 bg-neutral-100 dark:bg-neutral-700 relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusInfo.classes}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-neutral-900 dark:text-white truncate">{title}</h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap ml-2">{formattedUploadDate}</span>
        </div>
        
        <div className="flex flex-wrap items-center text-xs text-neutral-500 dark:text-neutral-400 gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700">
            {getFileTypeIcon()}
            {fileType.split('/')[1].toUpperCase()}
          </span>
          
          {tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
            >
              {tag}
            </span>
          ))}
          
          {tags.length > 2 && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              +{tags.length - 2} more
            </span>
          )}
        </div>
        
        {actionItems && actionItems.length > 0 && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
            {actionItems[0].task.length > 70 
              ? actionItems[0].task.substring(0, 70) + '...' 
              : actionItems[0].task
            }
            {actionItems.length > 1 && ` (+ ${actionItems.length - 1} more actions)`}
          </p>
        )}
        
        <div className="flex justify-between">
          <Link href={`/documents/${id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
            View Details
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
