import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/img/logo/logo1.png'; 
const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex justify-center items-start py-16 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -bottom-64 -left-64 w-[700px] h-[700px] rounded-full bg-blue-100 opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-96 right-1/2 w-[900px] h-[900px] rounded-full bg-blue-200 opacity-20 pointer-events-none"></div>

      {/* Logo in top‐left */}
      <div className="absolute top-8 left-8 flex items-center space-x-2">
        <img src={logo} alt="ConvertScanToCad logo" className=" h-8" />
      </div>

      <main className="relative z-10 bg-[#E6F2FC] rounded-2xl shadow-xl p-12 max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold text-[#1C88ED]">
          How does Convert SCAN to CAD work ?
        </h1>

        <p className="mt-4 text-gray-600 text-lg">
          The world’s first online service platform for Converting 3D Scan to CAD models
          (Design for manufacturing & Analysis)
        </p>

        <p className="mt-8 text-xl font-semibold text-gray-800">
          What can you do on Convert-Scantocad?
        </p>

        <div className="mt-12 flex justify-between space-x-8">
          {/* 1 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center">
              {/* upload icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" 
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4v8m0 0l-2-2m2 2l2-2" stroke="#3498DB" 
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 20h16" stroke="#3498DB" strokeWidth="1.5" 
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="mt-3 text-gray-800 font-medium">Upload Your 3D scans</span>
          </div>

          {/* 2 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center">
              {/* quote icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" 
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M8 17h8M8 13h8M8 9h8" stroke="#3498DB" 
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="4" width="16" height="16" rx="2" 
                      stroke="#3498DB" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="mt-3 text-gray-800 font-medium">Get an instant quote</span>
          </div>

          {/* 3 */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center">
              {/* CAD file icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" 
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20H7a2 2 0 01-2-2V6a2 2 0 
                         012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" 
                      stroke="#3498DB" strokeWidth="1.5" 
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12h8M12 8v8" stroke="#3498DB" 
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="mt-3 text-gray-800 font-medium">Get 3D CAD files</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/new-quote')}
          className="mt-12 bg-[#1C88ED] hover:bg-[#2980B9] text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
        >
          Request New Quote
        </button>
      </main>
    </div>
  );
};

export default HowItWorksPage;
