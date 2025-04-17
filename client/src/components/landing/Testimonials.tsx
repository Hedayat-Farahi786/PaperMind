import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
      content: "PaperMind has simplified my paperwork process tremendously. I used to spend hours sorting through invoices and contracts, but now I can quickly understand what needs my attention.",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Freelance Designer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "As someone who gets anxious about official documents, PaperMind has been a game-changer. It breaks down complex information into actionable steps I can understand.",
      rating: 4.5,
    },
    {
      name: "Maria Rodriguez",
      role: "Healthcare Professional",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      content: "I use PaperMind to manage my family's healthcare documents. The reminders feature ensures we never miss an important medical appointment or insurance deadline.",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-yellow-400" />
          <Star className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">What Our Users Say</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={`${testimonial.name} avatar`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex">
                {renderStars(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
