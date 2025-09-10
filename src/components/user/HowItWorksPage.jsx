import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowSmRight } from 'react-icons/hi';
import logo from '../../../public/img/logo/new-logo.png';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex justify-center items-start py-16 relative overflow-hidden">
      {/* Background Circles */}
      <div className="absolute -bottom-64 -left-64 w-[700px] h-[700px] rounded-full bg-blue-100 opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-96 right-1/2 w-[900px] h-[900px] rounded-full bg-blue-200 opacity-20 pointer-events-none"></div>

      {/* Logo */}
      <div className="absolute top-8 left-8 flex items-center space-x-2">
        <img src={logo} alt="Logo" className="h-24" />
      </div>

      <main className="relative z-10 mt-[90px] bg-[#E6F2FC] rounded-2xl shadow-xl p-12 max-w-6xl w-full text-center">
        <h1 className="text-4xl font-bold text-[#1C88ED]">How does Convert SCAN to CAD work?</h1>

        <p className="mt-4 text-gray-600 text-lg">
          The world’s first online service platform for Converting 3D Scan to CAD models
        </p>

        <p className="mt-8 text-xl font-semibold text-gray-800">
          What can you do on Convert-Scantocad?
        </p>

        {/* Stepper Process */}
        <div className="mt-16 flex items-center justify-between relative">
          {/* Wavy SVG Connector */}
          <svg
            className="absolute top-[60px] left-0 right-0 z-0 w-full h-24 -translate-y-1/2"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
             d="M0,50 C250,0 400,100 1000,20"

              fill="transparent"
              stroke="#93C5FD"
              strokeWidth="4"
              strokeDasharray="10 6"
            />
          </svg>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center w-1/3 px-2">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-200 hover:scale-105 transition">
              {/* Upload Icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v8m0 0l-2-2m2 2l2-2" stroke="#3498DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20h16" stroke="#3498DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-gray-800">Upload Your 3D Scans</p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center w-1/3 px-2">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-200 hover:scale-105 transition">
              {/* Quote Icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M8 17h8M8 13h8M8 9h8" stroke="#3498DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#3498DB" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-gray-800">Get an Instant Quote</p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center w-1/3 px-2">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-200 hover:scale-105 transition">
              {/* CAD File Icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M17 20H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" stroke="#3498DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 12h8M12 8v8" stroke="#3498DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-gray-800">Get 3D CAD Files</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/request-quote')}
          className="mt-12 bg-[#1C88ED] hover:bg-[#2980B9] text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
        >
          Request New Quote
        </button>
      </main>
    </div>
  );
};

export default HowItWorksPage;
