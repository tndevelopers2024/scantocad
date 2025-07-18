import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight,FaChevronLeft  } from "react-icons/fa6";

const steps = [
  {
    number: 1,
    title: "Create Your Free Account",
    desc: "Sign up in seconds and receive 4 hours worth of CAD conversion credits, absolutely free.",
    img: "/img/website/home/slide1.png",
  },
  {
    number: 2,
    title: "Drag & Drop Your 3D Scan Files",
    desc: "Upload STL/OBJ/PLY formats easily through our app.",
    img: "/img/website/home/slide2.png",
  },
  {
    number: 3,
    title: "Instant Estimation",
    desc: "Our app instantly analyzes your part and gives you a transparent price/time estimate.",
    img: "/img/website/home/slide3.png",
  },
  {
    number: 4,
    title: "Approve & Relax",
    desc: 'If you like the estimate, simply hit "Approve" and our expert team gets to work instantly.',
    img: "/img/website/home/slide4.png",
  },
  {
    number: 5,
    title: "Get Your CAD Files Back",
    desc: "Receive your fully parametric, manufacture-ready CAD files inside the same app.",
    img: "/img/website/home/slide5.png",
  },
];

export const Carousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const paginate = (dir) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + steps.length) % steps.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
      transition: { duration: 0.4, ease: "easeIn" },
    }),
  };

  return (
    <section className="mt-24 container mx-auto px-4 relative">
      <h2 className="text-center text-4xl font-bold mb-12">
        How It <span className="text-blue-500">Works</span>
      </h2>

      <div className="relative overflow-hidden min-h-[460px] mt-26">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 bg-[#F9FCFF] border border-blue-500 rounded-xl"
          >
            <div>
              <img
                src={steps[index].img}
                alt={`Step ${steps[index].number}`}
                className="w-full"
              />
            </div>
            <div className="space-y-6 pl-4">
              <div className="w-14 h-14 rounded-full border-4 border-yellow-400 grid place-content-center text-2xl font-bold text-yellow-500">
                {steps[index].number}
              </div>
              <h3 className="text-2xl font-bold">{steps[index].title}</h3>
              <p className="text-gray-600 text-lg">{steps[index].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {/* Prev Button */}
        
      </div>
      <button
          onClick={() => paginate(-1)}
          className="absolute top-20 left-1/2 -translate-x-[90px] -translate-y-1/2 w-[40px] h-[40px] z-10 bg-[#FFF9F0] border border-blue-500 rounded-full grid place-content-center hover:bg-blue-500 transition"
        >
          <span className="text-blue-500 hover:text-white text-2xl">
            <FaChevronLeft />
          </span>
        </button>

        {/* Next Button */}
        <button
          onClick={() => paginate(1)}
          className="absolute top-20 left-1/2 translate-x-[60px] -translate-y-1/2 w-[40px] h-[40px] z-10 bg-[#FFF9F0] border border-blue-500 rounded-full grid place-content-center hover:bg-blue-500 transition"
        >
          <span className="text-blue-500 hover:text-white text-2xl">
            <FaChevronRight />
          </span>
        </button>
    </section>
  );
};
