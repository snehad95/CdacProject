import React from 'react';
import HeroBanner from '../components/HeroBanner';
import FeaturesZigZag from '../components/FeaturesZigZag';
import ExamCards from '../components/ExamCards';
import TestimonialsSection from '../components/TestimonialsSection';

const Home = () => {
  return (
    <div style={{ display: 'block' }}>
      <HeroBanner />
      <ExamCards />
      <div style={{ display: 'block', position: 'relative' }}>
        <FeaturesZigZag />
      </div>
      <TestimonialsSection />
    </div>
  );
};

export default Home;
