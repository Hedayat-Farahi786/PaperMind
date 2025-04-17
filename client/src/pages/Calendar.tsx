import { useState } from 'react';
import Sidebar from '@/components/app/Sidebar';
import TopBar from '@/components/app/TopBar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReminderItem from '@/components/app/ReminderItem';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  documentId?: number;
}

const Calendar = () => {
  // Mock user data until authentication is properly set up
  const user = { id: 1, name: 'John Doe' };
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  // For demo purposes, we'll simulate some reminders
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      title: 'Pay Insurance Premium',
      description: 'Final notice for home insurance renewal payment of $542.00',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      priority: 'high',
      completed: false,
      documentId: 1
    },
    {
      id: 2,
      title: 'Submit Tax Form 1040',
      description: 'Extended deadline for submitting your annual tax form',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
      priority: 'medium',
      completed: false,
      documentId: 2
    },
    {
      id: 3,
      title: 'Medical Follow-up Appointment',
      description: 'Schedule a follow-up appointment with Dr. Smith based on your report',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
      priority: 'low',
      completed: false,
      documentId: 3
    },
    {
      id: 4,
      title: 'Update Home Inventory',
      description: 'Take photos and document new purchases for insurance purposes',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days from now
      priority: 'medium',
      completed: false
    }
  ]);
  
  const handleReminderStatusChange = (id: number, completed: boolean) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id ? { ...reminder, completed } : reminder
      )
    );
  };
  
  // Get reminders for selected date (if in calendar view)
  const filteredReminders = view === 'calendar' && date
    ? reminders.filter(reminder => 
        isSameDay(parseISO(reminder.dueDate), date)
      )
    : reminders;
  
  // Helper to render calendar days with reminder indicators
  const getDaysWithReminders = () => {
    const days: Date[] = [];
    
    reminders.forEach(reminder => {
      const reminderDate = parseISO(reminder.dueDate);
      if (!days.some(day => isSameDay(day, reminderDate))) {
        days.push(reminderDate);
      }
    });
    
    return days;
  };
  
  const reminderDays = getDaysWithReminders();

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user || undefined} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Calendar & Reminders
              </h1>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant={view === 'calendar' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('calendar')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button 
                  variant={view === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </div>
            </div>
            
            {view === 'calendar' ? (
              <div className="grid md:grid-cols-5 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      modifiers={{
                        hasReminder: reminderDays
                      }}
                      modifiersStyles={{
                        hasReminder: {
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '50%'
                        }
                      }}
                    />
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>
                      {date ? format(date, 'MMMM d, yyyy') : 'No Date Selected'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredReminders.length > 0 ? (
                      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                          {filteredReminders.map((reminder) => (
                            <ReminderItem
                              key={reminder.id}
                              id={reminder.id}
                              title={reminder.title}
                              description={reminder.description}
                              dueDate={reminder.dueDate}
                              priority={reminder.priority}
                              completed={reminder.completed}
                              onStatusChange={handleReminderStatusChange}
                            />
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No reminders for this date
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  {reminders.length > 0 ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
                      <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {reminders.map((reminder) => (
                          <ReminderItem
                            key={reminder.id}
                            id={reminder.id}
                            title={reminder.title}
                            description={reminder.description}
                            dueDate={reminder.dueDate}
                            priority={reminder.priority}
                            completed={reminder.completed}
                            onStatusChange={handleReminderStatusChange}
                          />
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 dark:text-neutral-400">
                        No reminders found
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
