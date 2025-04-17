import { useState } from 'react';
import { 
  AlertTriangle, Timer, CheckCircle, CalendarClock,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface ReminderItemProps {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  onStatusChange?: (id: number, completed: boolean) => void;
}

const ReminderItem = ({
  id,
  title,
  description,
  dueDate,
  priority,
  completed,
  onStatusChange
}: ReminderItemProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const dueDateObj = new Date(dueDate);
  
  // Get priority icon and color
  const getPriorityInfo = () => {
    if (isCompleted) {
      return {
        icon: <CheckCircle className="text-green-600 dark:text-green-400" />,
        bgColor: 'bg-green-100 dark:bg-green-900/30'
      };
    }
    
    switch (priority) {
      case 'high':
        return {
          icon: <AlertTriangle className="text-red-600 dark:text-red-400" />,
          bgColor: 'bg-red-100 dark:bg-red-900/30'
        };
      case 'medium':
        return {
          icon: <Timer className="text-yellow-600 dark:text-yellow-400" />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
        };
      default:
        return {
          icon: <CalendarClock className="text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        };
    }
  };
  
  // Get due date label
  const getDueDateLabel = () => {
    if (isCompleted) {
      return 'Completed';
    }
    
    if (isPast(dueDateObj) && !isToday(dueDateObj)) {
      return 'Overdue';
    }
    
    if (isToday(dueDateObj)) {
      return 'Today';
    }
    
    if (isTomorrow(dueDateObj)) {
      return 'Tomorrow';
    }
    
    return format(dueDateObj, 'MMM d, yyyy');
  };
  
  // Get due date text color
  const getDueDateColor = () => {
    if (isCompleted) {
      return 'text-green-600 dark:text-green-400';
    }
    
    if (isPast(dueDateObj) && !isToday(dueDateObj)) {
      return 'text-red-600 dark:text-red-400';
    }
    
    if (isToday(dueDateObj)) {
      return 'text-orange-600 dark:text-orange-400';
    }
    
    if (isTomorrow(dueDateObj)) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    
    return 'text-blue-600 dark:text-blue-400';
  };
  
  const priorityInfo = getPriorityInfo();
  const dueDateLabel = getDueDateLabel();
  const dueDateColor = getDueDateColor();
  
  const handleMarkAsDone = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest('PATCH', `/api/reminders/${id}`, { 
        completed: !isCompleted 
      });
      
      setIsCompleted(!isCompleted);
      
      if (onStatusChange) {
        onStatusChange(id, !isCompleted);
      }
      
      toast({
        title: !isCompleted ? 'Reminder completed' : 'Reminder reopened',
        description: !isCompleted 
          ? 'The reminder has been marked as completed'
          : 'The reminder has been reopened',
      });
    } catch (error) {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <li className={cn(
      "p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-200",
      isCompleted && "opacity-70"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "min-w-10 h-10 rounded-full flex items-center justify-center",
          priorityInfo.bgColor
        )}>
          {priorityInfo.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className={cn(
              "font-medium text-neutral-900 dark:text-white",
              isCompleted && "line-through opacity-70"
            )}>
              {title}
            </h3>
            <span className={cn(
              "text-xs font-medium", 
              dueDateColor
            )}>
              {dueDateLabel}
            </span>
          </div>
          
          {description && (
            <p className={cn(
              "text-sm text-neutral-600 dark:text-neutral-400 mt-1",
              isCompleted && "opacity-70"
            )}>
              {description}
            </p>
          )}
          
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              onClick={handleMarkAsDone}
              disabled={isLoading}
              className={isCompleted ? "border-green-500 text-green-700 dark:border-green-700 dark:text-green-400" : ""}
            >
              {isLoading ? (
                <span className="animate-spin mr-2">◌</span>
              ) : (
                <CheckCircle className="mr-2 h-3 w-3" />
              )}
              {isCompleted ? 'Completed' : 'Mark as Done'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <BellOff className="mr-2 h-3 w-3" />
              Snooze
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ReminderItem;
