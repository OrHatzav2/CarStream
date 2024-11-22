import React from 'react';
import car from '../assets/images/car.png';

const Hero = ({
  title = 'יבוא רכבים לישראל: כל המידע שצריך',
}) => {
  return (
    <section
      className="bg-gradient-to-br from-indigo-900 via-indigo-600 to-indigo-900 py-20 mb-4 relative overflow-hidden"
    >
      {/* Background overlay effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-72 h-72 bg-indigo-500 opacity-10 rounded-full absolute -top-12 -left-10 blur-4xl"/>
        <div className="w-48 h-48 bg-indigo-500 opacity-10 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 blur-4xl"/>
        <div className="w-56 h-56 bg-indigo-500 opacity-10 rounded-full absolute top-3 right-0 blur-4xl"/>
      </div>

      {/* Partial background image */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-50"
        style={{
          backgroundImage: `url(${car})`,
          backgroundPosition: 'center 60%',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Title text with shadow */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center">
          <h1 className="text-4xl text-white sm:text-5xl md:text-6xl font-open-sans mb-4"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1)' }}>
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Hero;
