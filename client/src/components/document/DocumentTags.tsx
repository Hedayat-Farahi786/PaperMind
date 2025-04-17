import { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentTagsProps {
  tags: string[];
  onAddTag?: (tag: string) => void;
}

const DocumentTags = ({ tags, onAddTag }: DocumentTagsProps) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim() && onAddTag) {
      onAddTag(newTag.trim());
      setNewTag('');
      setIsAddingTag(false);
    }
  };
  
  // Tag colors - rotate through these for different tags
  const tagColors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  ];
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
          <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Tags</h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <span 
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${tagColors[index % tagColors.length]}`}
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-neutral-500 dark:text-neutral-400 italic">
            No tags added yet.
          </span>
        )}
        
        {onAddTag && (
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center px-3 py-1 rounded-full text-sm"
            onClick={() => setIsAddingTag(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Tag
          </Button>
        )}
      </div>
      
      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter tag name"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingTag(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTags;
