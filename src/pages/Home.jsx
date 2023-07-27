import React from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";

import icon from "../icons";

function Home() {
  const navigate = useNavigate();

  // Let's Go!
  const moveToCategoryPage = () => {
    navigate("/category");
  };
  return (
    <>
      <Header />
      <div className="w-full h-full overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div className="relative flex flex-col justify-center mt-[222px] items-center w-[3202px] h-[214px] whitespace-nowrap overflow-hidden">
          <div className="absoulte flex w-full h-full animate-flowTextToLeft">
            <div className="flex w-full h-full items-center">
              <icon.Top />
            </div>
            <div className="flex w-full h-full items-center">
              <icon.Top />
            </div>
          </div>
        </div>
        <div className="relative flex flex-col justify-center mt-[-46px] items-center w-[2747px] h-[214px] whitespace-nowrap overflow-hidden">
          <div className="absoulte flex w-full h-full animate-flowTextToRight">
            <div className="flex w-full h-full items-center">
              <icon.Low />
            </div>
            <div className="flex w-full h-full items-center">
              <icon.Low />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-[150px]">
          <button
            onClick={moveToCategoryPage}
            className="py-[2vmin] px-[8vw] bg-[#EFFE37] text-black font-bold text-[4vmin] rounded-[60px] hover:shadow-[#EFFF364D] hover:shadow-xl"
          >
            Let's Go!
          </button>
        </div>
        <div className="flex flex-col items-center mt-[60px]">
          <p className="text-[#777777] text-[2.01vh]">How to</p>
          <icon.MainMidDoubleArrow className="h-[2.01vh]" />
        </div>
        <div className="mt-[1.75vh]">
          <icon.MainMidSection width="100%" height="100%" />
        </div>
        <div className="relative">
          <icon.MainMidSection2 width="100%" height="100%" />
          <icon.MainMidArrow className="absolute left-[50%] bottom-0 translate-x-[-50%] translate-y-[50%] h-[7vmin]" />
        </div>
        <div>
          <icon.MainMidSection3 width="100%" height="100%" />
        </div>
        <div>
          <icon.MainBottom width="100%" height="100%" />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Home;
