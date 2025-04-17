import { Brain } from 'lucide-react';

interface DocumentSummaryProps {
  summary: string | string[];
}

const DocumentSummary = ({ summary }: DocumentSummaryProps) => {
  // Process summary data which can be either string or array
  const formatSummary = (summaryData: string | string[]) => {
    // If no summary available
    if (!summaryData) return [];
    
    // If summary is already an array
    if (Array.isArray(summaryData)) {
      return summaryData.filter(item => item && item.trim().length > 0);
    }
    
    // If summary is a string
    const summaryText = String(summaryData); // Ensure it's a string
    
    // If the summary is already in bullet point format
    if (summaryText.includes('•') || summaryText.includes('-') || summaryText.includes('*')) {
      return summaryText
        .split(/\n/)
        .filter(line => line.trim().length > 0)
        .map(line => line.trim().replace(/^[•\-*]\s*/, ''));
    }
    
    // Otherwise split by sentences or periods
    return summaryText
      .split(/\.\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim().replace(/\.$/, ''));
  };

  const summaryPoints = formatSummary(summary);

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
          <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Summary</h2>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
        {summaryPoints.length > 0 ? (
          <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
            {summaryPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-xs text-primary-500 mt-1.5 mr-2">●</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400 italic">
            No summary available for this document.
          </p>
        )}
      </div>
    </div>
  );
};

export default DocumentSummary;
