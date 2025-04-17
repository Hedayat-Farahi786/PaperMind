import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from '@/components/app/Sidebar';
import TopBar from '@/components/app/TopBar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Laptop } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  language: z.string({
    required_error: 'Please select a language.',
  }),
  region: z.string({
    required_error: 'Please select a region.',
  }),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  browserNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  reminderEmails: z.boolean().default(true),
});

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  aiTone: z.enum(['formal', 'neutral', 'friendly']),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const Settings = () => {
  // Mock user data until authentication is properly set up
  const user = { id: 1, name: 'John Doe' };
  // Mock theme data until ThemeProvider is properly set up
  const theme = 'light';
  const toggleTheme = () => {};
  const { toast } = useToast();
  
  // Default form values
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: 'john.doe@example.com',
      language: 'english',
      region: 'united-states',
    },
  });
  
  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      browserNotifications: true,
      pushNotifications: false,
      reminderEmails: true,
    },
  });
  
  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: systemTheme,
      aiTone: 'neutral',
    },
  });
  
  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  };
  
  const onNotificationsSubmit = (data: NotificationsFormValues) => {
    toast({
      title: 'Notification settings updated',
      description: 'Your notification preferences have been saved.',
    });
  };
  
  const onAppearanceSubmit = (data: AppearanceFormValues) => {
    // Update theme preference
    setSystemTheme(data.theme);
    
    // In a real app, this would update the system theme
    if (data.theme === 'light' && theme === 'dark') {
      toggleTheme();
    } else if (data.theme === 'dark' && theme === 'light') {
      toggleTheme();
    }
    
    toast({
      title: 'Appearance settings updated',
      description: 'Your appearance preferences have been saved.',
    });
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user || undefined} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              Settings
            </h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full h-10 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  {...field}
                                >
                                  <option value="english">English</option>
                                  <option value="spanish">Spanish</option>
                                  <option value="french">French</option>
                                  <option value="german">German</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full h-10 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  {...field}
                                >
                                  <option value="united-states">United States</option>
                                  <option value="canada">Canada</option>
                                  <option value="united-kingdom">United Kingdom</option>
                                  <option value="australia">Australia</option>
                                  <option value="europe">Europe</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and reminders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationsForm}>
                      <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                        <FormField
                          control={notificationsForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications about your documents via email.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="browserNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Browser Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications in your browser when using the app.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Push Notifications</FormLabel>
                                <FormDescription>
                                  Receive push notifications on your mobile device.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="reminderEmails"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Reminder Emails</FormLabel>
                                <FormDescription>
                                  Receive email reminders for upcoming deadlines.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Appearance Settings */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...appearanceForm}>
                      <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                        <FormField
                          control={appearanceForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Theme Preference</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-4"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="light"
                                        id="theme-light"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="theme-light"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'light' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <Sun className="mb-2 h-6 w-6" />
                                      <span className="text-sm font-medium">Light</span>
                                    </label>
                                  </FormItem>
                                  
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="dark"
                                        id="theme-dark"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="theme-dark"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'dark' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <Moon className="mb-2 h-6 w-6" />
                                      <span className="text-sm font-medium">Dark</span>
                                    </label>
                                  </FormItem>
                                  
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="system"
                                        id="theme-system"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="theme-system"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'system' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <Laptop className="mb-2 h-6 w-6" />
                                      <span className="text-sm font-medium">System</span>
                                    </label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appearanceForm.control}
                          name="aiTone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AI Assistant Tone</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-4"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="formal"
                                        id="tone-formal"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="tone-formal"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'formal' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <span className="text-sm font-medium">Formal</span>
                                      <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                                        Professional and concise
                                      </span>
                                    </label>
                                  </FormItem>
                                  
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="neutral"
                                        id="tone-neutral"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="tone-neutral"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'neutral' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <span className="text-sm font-medium">Neutral</span>
                                      <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                                        Balanced and clear
                                      </span>
                                    </label>
                                  </FormItem>
                                  
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem
                                        value="friendly"
                                        id="tone-friendly"
                                        className="sr-only"
                                      />
                                    </FormControl>
                                    <label
                                      htmlFor="tone-friendly"
                                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer hover:border-primary-500 ${
                                        field.value === 'friendly' ? 'border-primary-500' : ''
                                      }`}
                                    >
                                      <span className="text-sm font-medium">Friendly</span>
                                      <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                                        Conversational and helpful
                                      </span>
                                    </label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
