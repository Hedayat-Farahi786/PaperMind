import { Link } from 'wouter';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Demo from '@/components/landing/Demo';
import UseCases from '@/components/landing/UseCases';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Demo />
        <UseCases />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
