import React from 'react';
import { Link } from 'react-router-dom';
import NeoBrutalistCard from '../components/NeoBrutalistCard';
import CTAButton from '../components/CTAButton';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-pastel-yellow flex items-center justify-center p-4">
      <NeoBrutalistCard background="white" className="text-center max-w-2xl">
        <div className="text-8xl mb-6">🤖</div>
        <h1 className="font-display font-black text-4xl md:text-6xl text-black mb-4">
          404
        </h1>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-black mb-6">
          Page not found! 😅
        </h2>
        <p className="text-lg text-black/70 mb-8">
          Looks like this page went on vacation without telling us. 
          Let's get you back to analyzing some awesome repos!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <CTAButton size="lg" color="green">
              Go Home 🏠
            </CTAButton>
          </Link>
          <Link to="/analyze">
            <CTAButton size="lg" color="blue" tilt={false}>
              Analyze Repo 🔍
            </CTAButton>
          </Link>
        </div>
      </NeoBrutalistCard>
    </div>
  );
};

export default NotFound;
