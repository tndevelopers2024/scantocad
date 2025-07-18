import React from "react";
import { Carousel } from "./website/home/Carousel";
import { WhoIsThisFor } from "./website/home/WhoIsThisFor";
import { WhyChooseUs } from "./website/home/WhyChooseUs";
import { UploadExamples } from "./website/home/UploadExamples";
import { SampleUploads } from "./website/home/SampleUploads";
import { NeedHelp } from "./website/home/NeedHelp";
import { FooterSection } from "./website/home/FooterSection";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden ">
      {/* Header */}
      <header className=" bg-[linear-gradient(18.16deg,_#424242_30.16%,_#A8A8A8_284.6%)] flex justify-between items-center px-10 py-5 bg-gradient-to-r from-neutral-700 to-neutral-400 rounded-b-[50px] w-[98%] mx-auto max-sm:justify-center flex-wrap">
        <img
          src="/img/website/home/logo.png"
          alt="Logo"
          className="w-[160px]"
        />
        <div className="flex items-center gap-6">
            <Link to='/app/login' className="px-6 py-2 text-blue-500 font-semibold border border-blue-400 rounded-lg hover:bg-blue-50 transition duration-300">Log in</Link>
            
            <Link to='/app/register' className="bg-[#2da7ff] text-white text-base font-semibold px-6 py-2 rounded-md hover:opacity-90 transition">Sign up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[url('/img/website/home/banner-bg.png')] bg-cover border border-blue-500 rounded-xl mt-8 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-blue-500">Turn Your 3D Scans into</span>
            <br />
            Manufacturing Ready CAD in Minutes
          </h1>
          <h5 className="text-xl md:text-2xl text-gray-500 font-medium mt-4">
            Upload <span className="text-yellow-500">|</span> Estimate{" "}
            <span className="text-yellow-500">|</span> Approve{" "}
            <span className="text-yellow-500">|</span> Download.
          </h5>
          <p className="text-lg text-gray-500 mt-6">
            The World’s Easiest Way to Convert 3D Scan Files into Production
            Ready CAD <br />
            Models Fast, Affordable and Professional.
          </p>
          <div className="mt-8 text-center">
            <Link to='/app/register' className="block w-full max-w-xs md:max-w-fit mx-auto text-center bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-sm md:text-lg px-6 md:px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300 whitespace-normal"
            >
              Create Free Account & Get 4 Hours of Free Credits</Link>
            {/* <a
              href="#"
              className="block w-full max-w-xs md:max-w-fit mx-auto text-center bg-gradient-to-b from-[#389DFB] to-[#2DA7FF] text-white font-semibold text-sm md:text-lg px-6 md:px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-all duration-300 whitespace-normal"
            >
              Create Free Account & Get 4 Hours of Free Credits
            </a> */}
          </div>

          <div className="mt-14">
            <img
              src="/img/website/home/bannert-img.png"
              alt="Banner"
              className="mx-auto"
            />
          </div>
        </div>
      </section>

      <Carousel />
      <WhoIsThisFor />
      <WhyChooseUs />
      <UploadExamples />
      <SampleUploads />
      <NeedHelp />
      <FooterSection />
    </div>
  );
}
