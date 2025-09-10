import React from 'react';

const reasons = [
  { text: '4 Hours Free Trial Credits – No strings attached', img: '/img/website/home/list1.png' },
  { text: 'Fast Turnaround – CAD delivered in hours, not days', img: '/img/website/home/list2.png' },
  { text: 'Use Anywhere – Cloud-based global access', img: '/img/website/home/list3.png' },
  { text: 'Secure Upload & Storage – Your data is encrypted & confidential', img: '/img/website/home/list4.png' },
  { text: 'Real-Time Estimation – Know the cost upfront', img: '/img/website/home/list5.png' },
];

export const WhyChooseUs = () => {
  return (
    <section className="mt-24 container mx-auto px-4">
      <h2 className="text-center text-4xl font-bold">
        Why <span className="text-blue-500">Choose</span>{' '}
        <img src="/img/website/home/new-logo2.png" alt="logo" className="inline w-62 h-auto" />?
      </h2>

      <div className="mt-10 space-y-5">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-center gap-5 bg-[#F9FCFF] border border-blue-500 rounded-xl p-4"
          >
            <img src={reason.img} alt="reason" className="w-12 h-12" />
            <p className="text-gray-800 text-lg">{reason.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
