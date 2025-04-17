import { FileText, Receipt, Globe, Clock } from 'lucide-react';

const UseCases = () => {
  const useCases = [
    {
      icon: <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Understand official letters",
      description: "Transform complex legal jargon into simple, understandable language.",
    },
    {
      icon: <Receipt className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Know what bills to pay and when",
      description: "Never miss a payment deadline with automatic bill detection and reminders.",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Translate and summarize forms",
      description: "Simplify government and official forms with clear summaries and translations.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Never miss deadlines again",
      description: "Get timely reminders for important deadlines and required actions.",
    },
  ];

  return (
    <section id="features" className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Use Cases</h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            PaperMind helps you manage various types of documents and stay on top of important tasks.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                {useCase.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">{useCase.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
