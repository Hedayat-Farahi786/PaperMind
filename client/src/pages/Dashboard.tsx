// pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext'; // Keep using useAuth
import { useDocuments } from '@/hooks/use-document'; // This hook uses the auth token internally
import Sidebar from '@/components/app/Sidebar';
import TopBar from '@/components/app/TopBar';
import FileUpload from '@/components/app/FileUpload'; // This component needs a disabled prop
import DocumentCard from '@/components/app/DocumentCard';
import DocumentActions from '@/components/app/DocumentActions'; // This component might need updates
import ReminderItem from '@/components/app/ReminderItem'; // This component might need updates
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Get user and isAuthenticated status

  // Get userId from the authenticated user object
  const userId = user?.id;

  // Pass the userId to the hook, but the hook will use the token for auth
  const { data: documents, isLoading: docsLoading, error: docsError } = useDocuments(userId);
  const [lastUploadedDoc, setLastUploadedDoc] = useState<any>(null);

  // For demo purposes, we'll simulate some reminders
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: 'Pay Insurance Premium',
      description: 'Final notice for home insurance renewal payment of $542.00',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      priority: 'high' as const,
      completed: false
    },
    {
      id: 2,
      title: 'Submit Tax Form 1040',
      description: 'Extended deadline for submitting your annual tax form',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
      priority: 'medium' as const,
      completed: false
    },
    {
      id: 3,
      title: 'Medical Follow-up Appointment',
      description: 'Schedule a follow-up appointment with Dr. Smith based on your report',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
      priority: 'low' as const,
      completed: false
    }
  ]);

  const handleReminderStatusChange = (id: number, completed: boolean) => {
    // In a real app, this would trigger an API call to update the reminder status
    // This call should also use getAuthHeaders()
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, completed } : reminder
      )
    );
  };

  const handleUploadSuccess = (document: any) => {
    // In a real app, this would trigger a refetch of the documents query (already handled in useUploadDocument onSuccess)
    console.log('Document uploaded:', document);
    setLastUploadedDoc(document);
  };

  // Use effect to clear the last uploaded doc after 2 minutes (improve UX)
  useEffect(() => {
    if (lastUploadedDoc) {
      const timer = setTimeout(() => {
        setLastUploadedDoc(null);
      }, 120000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [lastUploadedDoc]);

  // Determine if the upload functionality should be disabled
  const isUploadDisabled = authLoading || !isAuthenticated; // Disable if auth is loading or not authenticated

  // You might want to redirect if not authenticated
//   import { useLocation } from 'wouter';
  const [, setLocation] = useLocation();
  useEffect(() => {
     if (!authLoading && !isAuthenticated) {
         setLocation('/login');
     }
  }, [authLoading, isAuthenticated, setLocation]);


    // Show loading state while authentication is being checked
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Render the dashboard only if authenticated (after loading finishes)
    if (!isAuthenticated) {
        // If not authenticated, you could render a message or handle redirect (see commented code above)
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                Please sign in to view the dashboard.
            </div>
        );
    }

  // Render the full dashboard content when authenticated
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user || undefined} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {reminders.filter(r => !r.completed).length > 0
                  ? `You have ${reminders.filter(r => !r.completed).length} documents that need your attention.`
                  : 'All caught up! No pending documents need your attention.'}
              </p>
            </div>

            {/* Quick actions - File Upload */}
            {/* Pass the disabled state to FileUpload */}
            <FileUpload
              userId={userId} // Pass userId
              onUploadSuccess={handleUploadSuccess}
              disabled={isUploadDisabled} // <--- ADD THIS PROP
            />

            {/* Show action guidance after document upload */}
            {lastUploadedDoc && (
              <div className="my-6 animate-fadeIn">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                        Document uploaded successfully
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                        <p>Your document "{lastUploadedDoc.title}" has been processed and is ready for review.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DocumentActions component might need to use getAuthHeaders() */}
                {/* Ensure DocumentActions also uses getAuthHeaders for any API calls it makes */}
                <DocumentActions
                  documentId={lastUploadedDoc.id}
                  title={lastUploadedDoc.title}
                  hasActionItems={Array.isArray(lastUploadedDoc.actionItems) && lastUploadedDoc.actionItems.length > 0}
                />
              </div>
            )}

            {/* Recent documents section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Documents</h2>
                <Link href="/documents">
                  <div className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                    View all
                  </div>
                </Link>
              </div>

              {docsLoading ? ( // Use docsLoading for documents
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : docsError ? ( // Use docsError for documents
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
                  Error loading documents: {docsError.message}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Slice documents from the fetched data */}
                  {documents.slice(0, 3).map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      fileType={doc.fileType}
                      tags={doc.tags || []}
                      uploadedAt={doc.uploadedAt}
                      actionItems={doc.actionItems as any[]}
                      thumbnailUrl={doc.fileType.startsWith('image/') ? doc.filePath : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                  <FileText className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No documents yet</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Upload your first document to get started
                  </p>
                  <Link href="/upload"> {/* Ensure this route exists */}
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming reminders section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Upcoming Reminders</h2>
                <Link href="/calendar"> {/* Ensure this route exists */}
                  <div className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">View calendar</div>
                </Link>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
                {reminders.length > 0 ? ( // Reminders are currently client-side demo data
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
                        onStatusChange={handleReminderStatusChange} // This handler should ideally make an API call
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">No upcoming reminders.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;