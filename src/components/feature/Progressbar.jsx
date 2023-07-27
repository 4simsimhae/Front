import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";

function Progressbar({ endGameSignalHandler }) {
  // gameTime : 게임시간 (초 단위)
  const gameTime = 10;
  const gameStepTime = [1.5, 2, 3.5, 4, 5.5, 6, 7.5, 8, 10];
  const [runningTime, setRunningTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(gameTime);

  const progressbarPercent = (runningTime / gameTime) * 100;

  const gameEnd = useCallback(
    () =>
      setTimeout(() => {
        endGameSignalHandler();
      }, 1000),
    [endGameSignalHandler]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRunningTime((prevTime) => {
        setRemainingTime(gameTime - (prevTime + 1));
        return prevTime + 1;
      });
    }, 1000);
    console.log(gameTime, runningTime, remainingTime, progressbarPercent);
    if (runningTime === gameTime) {
      gameEnd();
    }
    return () => {
      clearInterval(timer);
    };
  }, [runningTime, gameEnd, progressbarPercent, remainingTime]);

  return (
    <>
      <div className="mx-auto w-full px-[2.97vw]">
        <div className="relative bg-[#2F3131] w-full h-[3px] translate-y-[50%] rounded-full">
          <div className="absolute left-[15%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[20%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[35%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[40%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[55%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[60%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[75%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[80%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div className="absolute left-[100%] translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-gray-300 z-[3]" />
          <div
            className="absolute top-[25%] bg-[#EFFE37] h-[50%] w-full rounded-full z-[4]"
            style={{
              width: `${progressbarPercent}%`,
              transition: "width 0.5s",
            }}
          >
            <div
              className="absolute right-0 transform translate-y-[-20%] w-[5px] h-[5px] rounded-full bg-[#EFFE37] z-[5]"
              style={{
                transition: "width 1s",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Progressbar;
