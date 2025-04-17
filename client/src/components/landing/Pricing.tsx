import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for occasional use",
      features: [
        { included: true, text: "5 documents/month" },
        { included: true, text: "Basic summaries" },
        { included: true, text: "PDF & image support" },
        { included: false, text: "Calendar integrations" },
        { included: false, text: "Reminders" },
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      highlight: false,
    },
    {
      name: "Pro",
      price: isAnnual ? 7.99 : 9.99,
      description: "Perfect for regular personal use",
      features: [
        { included: true, text: "50 documents/month" },
        { included: true, text: "Advanced summaries" },
        { included: true, text: "All document formats" },
        { included: true, text: "Calendar integrations" },
        { included: true, text: "Email reminders" },
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      highlight: true,
    },
    {
      name: "Premium",
      price: isAnnual ? 15.99 : 19.99,
      description: "Perfect for businesses",
      features: [
        { included: true, text: "Unlimited documents" },
        { included: true, text: "Advanced AI analysis" },
        { included: true, text: "Team collaboration" },
        { included: true, text: "All integrations" },
        { included: true, text: "Priority support" },
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Choose the plan that works best for your document management needs.
          </p>
          
          {/* Pricing toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
              Monthly
            </span>
            <div className="mx-3">
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary-600"
              />
            </div>
            <span className={`text-sm font-medium ${isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
              Annual <span className="text-primary-600 dark:text-primary-400">Save 20%</span>
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-xl overflow-hidden transition-all duration-200 ${
                plan.highlight 
                  ? 'bg-white dark:bg-neutral-900 transform scale-105 shadow-lg border-2 border-primary-500 z-10' 
                  : 'bg-neutral-50 dark:bg-neutral-800 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="bg-primary-500 text-white text-center text-sm font-medium py-1">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="ml-1 text-neutral-500 dark:text-neutral-400">/month</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{plan.description}</p>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-neutral-400 mr-2 flex-shrink-0" />
                      )}
                      <span className={`${
                        feature.included ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={`p-6 ${
                plan.highlight 
                  ? 'bg-neutral-50 dark:bg-neutral-800' 
                  : 'bg-neutral-100 dark:bg-neutral-700'
              }`}>
                <Link href="/dashboard">
                  {plan.highlight ? (
                    <Button 
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500"
                    >
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Button 
                      variant={plan.buttonVariant} 
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
