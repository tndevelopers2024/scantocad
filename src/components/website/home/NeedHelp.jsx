import React from 'react';

export const NeedHelp = () => {
  return (
    <section className="mt-32 container mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold flex justify-center items-center gap-4">
        <img src="/img/website/home/question.png" alt="?" className="h-10" />
        Need Help?
      </h2>
      <p className="text-gray-600 mt-2">Chat live with our expert team or book a demo!</p>
      <div className="flex justify-center gap-6 mt-6 max-md:flex-wrap">
        <a href="https://us02web.zoom.us/j/5903189768?pwd=T3VucDArMUY1NGxNRU1NMnJMYnVuQT09" className="bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-lg px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300">Meet Us Live Online</a>
        <a href="https://www.precise3dm.com/Book-demo-get-quote-for-3D-scanner.php" className="bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-lg px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300">Book a Demo</a>
      </div>
    </section>
  );
};
