import { useState } from 'react';
import { Link } from 'wouter';
import { 
  CalendarClock, 
  MessageCircle, 
  Share, 
  FileText, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Mail,
  Edit,
  Tag,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface DocumentActionsProps {
  documentId: number;
  title: string;
  hasActionItems?: boolean;
}

const DocumentActions = ({ documentId, title, hasActionItems = false }: DocumentActionsProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: `Export started`,
      description: `Exporting ${title} as ${format}...`,
    });
    // Implement actual export
  };

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/documents/${documentId}`);
    toast({
      title: "Link copied",
      description: "Document link copied to clipboard",
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Document Actions
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowMoreActions(!showMoreActions)}
          className="flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {showMoreActions ? (
            <>
              Less options <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              More options <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Primary actions */}
        <Link href={`/documents/${documentId}`}>
          <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
            <FileText className="h-5 w-5 mr-2" />
            <span>View</span>
          </Button>
        </Link>
        
        <Button 
          className="w-full flex justify-center items-center h-auto py-3 px-2" 
          variant="outline"
          onClick={handleShare}
        >
          <Share className="h-5 w-5 mr-2" />
          <span>Share</span>
        </Button>
        
        {hasActionItems ? (
          <Link href="/calendar">
            <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
              <CalendarClock className="h-5 w-5 mr-2" />
              <span>Reminders</span>
            </Button>
          </Link>
        ) : (
          <Link href={`/documents/${documentId}`}>
            <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
              <MessageCircle className="h-5 w-5 mr-2" />
              <span>Ask AI</span>
            </Button>
          </Link>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
              <Download className="h-5 w-5 mr-2" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleExport('PDF')}>
              <FileText className="h-4 w-4 mr-2" />
              <span>PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('Word')}>
              <FileText className="h-4 w-4 mr-2" />
              <span>Word Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('Text')}>
              <FileText className="h-4 w-4 mr-2" />
              <span>Text File</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Additional actions */}
      {showMoreActions && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
            <Printer className="h-5 w-5 mr-2" />
            <span>Print</span>
          </Button>
          
          <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
            <Mail className="h-5 w-5 mr-2" />
            <span>Email</span>
          </Button>
          
          <Button className="w-full flex justify-center items-center h-auto py-3 px-2" variant="outline">
            <Edit className="h-5 w-5 mr-2" />
            <span>Edit</span>
          </Button>
          
          <Button className="w-full flex justify-center items-center h-auto py-3 px-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" variant="outline">
            <Trash2 className="h-5 w-5 mr-2" />
            <span>Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentActions;