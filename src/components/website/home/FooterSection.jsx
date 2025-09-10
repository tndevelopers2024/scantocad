import React from 'react';
import { Link } from 'react-router-dom';

export const FooterSection = () => {
  return (
    <>
      <section className="mt-40 container mx-auto px-4 text-center">
        <img src="/img/website/home/new-logo.png" alt="Logo" className="mx-auto mb-6 w-[270px]" />
        <h2 className="text-4xl font-bold">Start Converting Your Scans to CAD Today</h2>
        <div className="mt-6">
            <Link to='/app/register' className="block w-full max-w-xs md:max-w-fit mx-auto text-center bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-sm md:text-lg px-6 md:px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300 whitespace-normal">Create Free Account & Get 4 Hours of Free Credits</Link>
          {/* <a href="#" className="block w-full max-w-xs md:max-w-fit mx-auto text-center bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-sm md:text-lg px-6 md:px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300 whitespace-normal">Create Free Account & Get 4 Hours of Free Credits</a> */}
        </div>
      </section>

      <footer className="mt-40 bg-gradient-to-r from-neutral-700 to-neutral-400 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img src="/img/website/home/new-logo.png" alt="Footer Logo" className="mb-6 w-[250px]" />
            <h2 className="text-white text-3xl font-bold">Get your 3D Scans Converted into CAD models.</h2>
            <div className="flex gap-6 mt-6 flex-wrap">
              <a href="https://us02web.zoom.us/j/5903189768?pwd=T3VucDArMUY1NGxNRU1NMnJMYnVuQT09" className="bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-lg px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300">Meet Us Live Online</a>
              <a href="https://www.precise3dm.com/Book-demo-get-quote-for-3D-scanner.php" className="bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-lg px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300">Book a Demo</a>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <img src="/img/website/home/footer-img.png" alt="Footer Illustration" />
          </div>
        </div>
      </footer>
    </>
  );
};
