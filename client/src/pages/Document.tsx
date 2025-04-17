import { useParams } from 'wouter';
import { useDocument } from '@/hooks/use-document';
import DocumentViewer from '@/components/document/DocumentViewer';
import TopBar from '@/components/app/TopBar';
import Sidebar from '@/components/app/Sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const Document = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = id ? parseInt(id) : undefined;
  // Mock user data until authentication is properly set up
  const user = { id: 1, name: 'John Doe' };
  const { data: document, isLoading, error } = useDocument(documentId);

  if (!documentId) {
    return (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar user={user || undefined} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Document Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                The document you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DocumentViewer id={documentId} />
      </div>
    </div>
  );
};

export default Document;
