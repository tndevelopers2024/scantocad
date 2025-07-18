import React from 'react';

const audience = [
  { text: '3D Scanning Service Providers', img: '/img/website/home/who1.png' },
  { text: 'Manufacturing Companies & Job Shops', img: '/img/website/home/who2.png' },
  { text: 'Global Reverse Engineering Teams', img: '/img/website/home/who3.png' },
  { text: 'Engineering Freelancers', img: '/img/website/home/who4.png' },
];

const brands = [
  '/img/website/home/brand1.png',
  '/img/website/home/brand2.png',
  '/img/website/home/brand3.png',
  '/img/website/home/brand4.png',
];

export const WhoIsThisFor = () => {
  return (
    <section className="mt-24 container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold mb-8">
        Who Is <span className="text-blue-500">This For</span>?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {audience.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 border border-blue-500 bg-[#F9FCFF] rounded-xl"
          >
            <img src={item.img} alt={item.text} className="w-16 h-16 object-contain" />
            <p className="text-black text-lg">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#F9FCFF] border border-blue-500 rounded-xl mt-6 p-6 text-center">
        <h4 className="text-2xl font-bold">3D Scanner Owners</h4>
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {brands.map((brand, i) => (
            <img key={i} src={brand} alt={`brand-${i}`} className="h-12" />
          ))}
          <h4 className="text-xl font-bold">etc.,</h4>
        </div>
      </div>
    </section>
  );
};
