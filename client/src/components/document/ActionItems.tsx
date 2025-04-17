import { useState } from 'react';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface ActionItem {
  task: string;
  dueDate?: string;
  priority?: string;
}

interface ActionItemsProps {
  actionItems: ActionItem[];
  documentId: number;
}

const ActionItems = ({ actionItems, documentId }: ActionItemsProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const { toast } = useToast();

  const handleAddReminder = (action: ActionItem) => {
    setSelectedAction(action);
    setIsReminderDialogOpen(true);
  };

  const createReminder = async () => {
    if (!selectedAction) return;
    
    try {
      const reminderData = {
        userId: 1, // Would come from auth context in a real app
        documentId,
        title: selectedAction.task,
        description: `Reminder for document: ${documentId}`,
        dueDate: selectedAction.dueDate || new Date().toISOString(),
        priority: selectedAction.priority || 'medium',
      };
      
      await apiRequest('POST', '/api/reminders', reminderData);
      
      toast({
        title: 'Reminder added',
        description: 'The reminder has been added to your calendar',
      });
      
      setIsReminderDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to add reminder',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Actions Required</h2>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
        {actionItems.length > 0 ? (
          <div className="space-y-3">
            {actionItems.map((action, index) => (
              <div key={index} className="flex items-center">
                <Checkbox
                  id={`action-${index}`}
                  checked={checkedItems[index] || false}
                  onCheckedChange={(checked) => {
                    setCheckedItems(prev => ({
                      ...prev,
                      [index]: checked === true
                    }));
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor={`action-${index}`} 
                  className="ml-3 text-neutral-700 dark:text-neutral-300 flex-1"
                >
                  {action.task}
                  {action.dueDate && (
                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                      (Due: {format(parseISO(action.dueDate), 'MMM d, yyyy')})
                    </span>
                  )}
                </label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600 dark:text-primary-400 text-sm hover:text-primary-700 dark:hover:text-primary-300"
                  onClick={() => handleAddReminder(action)}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Reminder
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400 italic">
            No action items identified for this document.
          </p>
        )}
      </div>
      
      {/* Add Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
              Add a reminder for: <strong>{selectedAction?.task}</strong>
            </p>
            {selectedAction?.dueDate && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Due date: {format(parseISO(selectedAction.dueDate), 'MMMM d, yyyy')}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsReminderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createReminder}
              >
                Add Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionItems;
