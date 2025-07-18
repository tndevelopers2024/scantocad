import React from 'react';

export const UploadExamples = () => {
  return (
    <section className="mt-24 bg-[#F9FCFF] py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl font-bold">
          Upload <span className="text-blue-500">Examples</span> & Supported{' '}
          <span className="text-blue-500">Formats</span>
        </h2>

        <div className="flex justify-center mt-10">
          <div className="bg-white border border-blue-500 rounded-xl shadow-xl p-4">
            <img
              src="/img/website/home/formate.png"
              alt="formats"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
