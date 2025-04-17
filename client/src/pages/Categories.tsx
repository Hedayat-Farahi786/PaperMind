import React from 'react';
import Sidebar from '@/components/app/Sidebar';
import TopBar from '@/components/app/TopBar';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Categories = () => {
  // Mock user data until authentication is properly set up
  const user = { id: 1, name: 'John Doe' };

  // Mock categories for demonstration
  const categories = [
    {
      id: 1,
      name: 'Financial Documents',
      description: 'Bank statements, tax forms, and other financial records',
      documentCount: 12,
      color: 'blue',
    },
    {
      id: 2,
      name: 'Medical Records',
      description: 'Medical reports, insurance claims, and healthcare documents',
      documentCount: 7,
      color: 'green',
    },
    {
      id: 3,
      name: 'Legal Documents',
      description: 'Contracts, agreements, and legal correspondence',
      documentCount: 5,
      color: 'purple',
    },
    {
      id: 4, 
      name: 'Work Related',
      description: 'Employment contracts, work projects, and professional materials',
      documentCount: 9,
      color: 'orange',
    },
    {
      id: 5,
      name: 'Receipts',
      description: 'Purchase receipts and warranties',
      documentCount: 15,
      color: 'red',
    }
  ];

  // Get color class based on category color
  const getCategoryColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    
    return colorMap[color] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400';
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Document Categories
              </h1>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className={`pb-3 ${getCategoryColorClass(category.color)}`}>
                    <CardTitle className="flex items-center">
                      <Tag className="mr-2 h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {category.documentCount} {category.documentCount === 1 ? 'document' : 'documents'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Categories;