import React from 'react';
import HeroBanner from '../components/HeroBanner';
import FeaturesZigZag from '../components/FeaturesZigZag';
import ExamCards from '../components/ExamCards';

const Home = () => {
  return (
    <div>
      <HeroBanner />
      <ExamCards />
      <FeaturesZigZag />
    </div>
  );
};

export default Home;
