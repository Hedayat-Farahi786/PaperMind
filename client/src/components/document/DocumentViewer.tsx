import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Share, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import DocumentSummary from './DocumentSummary';
import ActionItems from './ActionItems';
import DocumentTags from './DocumentTags';
import Timeline from './Timeline';
import AskAI from './AskAI';
import { useDocument } from '@/hooks/use-document';

// Set the worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  id?: number;
}

const DocumentViewer = ({ id }: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: document, isLoading, error } = useDocument(id);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const getImageSrc = (filePath: string) => {
    const fileName = filePath.split('\\').pop() || '';
    return "https://placehold.co/600x400?text=" + fileName;
  };
  

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-red-500 text-6xl mb-4">!</div>
        <h2 className="text-xl font-bold mb-2">Error Loading Document</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          {error ? error.message : "Document not found"}
        </p>
        <Link href="/documents">
          <Button>Back to Documents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {document.title}
            </h1>
          </div>
          
          {/* Right actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" title="Share">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Download">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="More options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Document content area (split view) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side: Document viewer */}
        <div className="w-1/2 border-r border-neutral-200 dark:border-neutral-800 overflow-auto p-4">
          {/* Document preview */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            {document.fileType === 'application/pdf' ? (
              <Document
                file={document.filePath}
                onLoadSuccess={onDocumentLoadSuccess}
                className="w-full"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page 
                    key={`page_${index + 1}`} 
                    pageNumber={index + 1}
                    width={500}
                    className="mb-4"
                  />
                ))}
              </Document>
            ) : document.fileType.startsWith('image/') ? (
              <img 
                src={getImageSrc(document.filePath)} 
                alt={document.title} 
                className="w-full h-auto rounded-lg" 
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side: AI analysis */}
        <div className="w-1/2 overflow-auto p-6">
          {/* AI Summary */}
          <DocumentSummary summary={document.summary || ""} />
          
          {/* Actions required */}
          <ActionItems 
            actionItems={Array.isArray(document.actionItems) ? document.actionItems : []} 
            documentId={document.id}
          />
          
          {/* Tags */}
          <DocumentTags tags={Array.isArray(document.tags) ? document.tags : []} />
          
          {/* Timeline */}
          <Timeline 
            items={[
              ...(Array.isArray(document.actionItems) 
                ? document.actionItems
                    .filter((item: any) => item.dueDate)
                    .map((item: any) => ({
                      title: 'Action Due',
                      date: item.dueDate!,
                      label: item.task,
                      type: 'due' as const,
                    }))
                : []),
              {
                title: 'Document Uploaded',
                date: document.uploadedAt,
                type: 'upload' as const,
              }
            ]}
          />
          
          {/* Ask AI */}
          <AskAI documentId={document.id} />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
