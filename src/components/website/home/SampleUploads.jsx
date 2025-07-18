import React from 'react';

const samples = [
  '/img/website/home/sample1.png',
  '/img/website/home/sample2.png',
  '/img/website/home/sample3.png',
  '/img/website/home/sample4.png',
];

export const SampleUploads = () => {
  return (
    <section className="mt-24 container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold">
        Sample <span className="text-blue-500">Uploads</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 border border-blue-500 rounded-xl p-4">
        {samples.map((img, index) => (
          <div key={index} className="overflow-hidden rounded-xl">
            <img src={img} alt={`Sample ${index + 1}`} className="w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
};
