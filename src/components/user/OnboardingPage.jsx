import React from 'react';
import logo from '../../../public/img/logo/logo1.png'; // Adjust the path as necessary
const OnboardingPage = () => {
  // You would ideally replace these with actual image paths or SVG components
  return (
    <section className="onboard">


    <div className="container flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br  p-6">
      {/* Left Section: Text and Buttons */}
      <div className="flex  flex-col items-center justify-center w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 pr-0 md:pr-10">
        <img src={logo} alt="Convertscanstocad Logo" className="mx-auto md:mx-0 mb-6 " />
        <h1 className="text-4xl text-center md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Transform your scans into precise CAD models.
        </h1>
        <p className="text-lg text-center text-gray-600 mb-10 max-w-md">
          Register now and get 4 hours of credit to start converting your scans.
        </p>
        <div className="flex  flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <a href="/login" className="inline-block px-14 py-4 text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out text-lg font-semibold">
            Login
          </a>
          <a href="/register" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out text-lg font-semibold">
            Register Now
          </a>
        </div>
      </div>


    </div>
    </section>
  );
};

export default OnboardingPage;