import { Upload, Brain, ListChecks } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Upload Your Document",
      description: "Upload any document including PDF, image, or scanned letter using our simple drag-and-drop interface.",
    },
    {
      icon: <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "AI Analysis",
      description: "Our AI instantly analyzes your document, identifying key information and required actions.",
    },
    {
      icon: <ListChecks className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: "Get Actionable Insights",
      description: "Receive a clean, actionable overview with reminders for due dates and important tasks.",
    },
  ];

  return (
    <section id="howitworks" className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">How It Works</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{step.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
