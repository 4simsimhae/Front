import React from "react";
import { useEffect, useState, useRef } from "react";

function TestProgressbar({ endGameSignalHandler }) {
  const [progress, setProgress] = useState("first");
  const totalGameTime = 240;
  const [progressbarPercent, setProgressbarPercent] = useState(0);
  const [progressName, setProgressName] = useState("찬성 주장");
  const progressStyle = useRef("text-white bg-[#14B5FF]");

  useEffect(() => {
    let counter = 0;
    const test = setInterval(() => {
      counter += 1;
      // console.log(counter);
      setProgressbarPercent((counter / totalGameTime) * 100);
      switch (counter) {
        case 90:
          setProgress("second");
          setProgressName("반대 주장");
          progressStyle.current = "text-white bg-[#FA3C3C]";
          break;
        case 180:
          setProgress("third");
          setProgressName("최종 주장");
          progressStyle.current = "text-black bg-[#EFFE37]";
          break;
        case 240:
          clearInterval(test);
          setProgress("");
          endGameSignalHandler();
          break;
        default:
          break;
      }
    }, 1000);
    return () => {
      clearInterval(test);
    };
  }, []);

  return (
    <>
      <div className="mx-auto w-full px-[2.97vw]">
        <div className="relative flex w-full h-[3px] whitespace-nowrap">
          <div
            className="absolute top-[-20px] h-[50%] w-full rounded-full z-[4]"
            style={{
              width: `${progressbarPercent}%`,
              transition: "width 0.5s",
            }}
          >
            <div
              className={
                progressStyle.current +
                " absolute right-0 transform translate-y-[-50%] translate-x-[50%] w-fit h-fit px-[0.625vw] py-[0.42vh] rounded-[0.67vh] font-bold text-[1.17vh] z-[5]"
              }
              style={{
                transition: "width 1s",
              }}
            >
              {progressName}
            </div>
          </div>
          {progress === "first" ? (
            <>
              <div className="absolute left-[0%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#14B5FF]" />
              <div className="w-[37.5%] border-[1.5px] border-[#14B5FF] border-dashed animate-blink" />
            </>
          ) : (
            <>
              <div className="absolute left-[0%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#505050]" />
              <div className="w-[37.5%] border-[1.5px] border-[#505050]" />
            </>
          )}
          {progress === "second" ? (
            <>
              <div className="absolute left-[37.5%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#FA3C3C]" />
              <div className="w-[37.5%] border-[1.5px] border-[#FA3C3C] border-dashed animate-blink" />
            </>
          ) : (
            <>
              <div className="absolute left-[37.5%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#505050]" />
              <div className="w-[37.5%] border-[1.5px] border-[#505050]" />
            </>
          )}
          {progress === "third" ? (
            <>
              <div className="absolute left-[75%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#EFFE37]" />
              <div className="w-[25%] border-[1.5px] border-[#EFFE37] border-dashed animate-blink" />
              <div className="absolute left-[100%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#EFFE37]" />
            </>
          ) : (
            <>
              <div className="absolute left-[75%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#505050]" />
              <div className="w-[25%] border-[1.5px] border-[#505050]" />
              <div className="absolute left-[100%] translate-x-[-50%] translate-y-[-35%] w-[10px] h-[10px] rounded-full bg-[#505050]" />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TestProgressbar;
