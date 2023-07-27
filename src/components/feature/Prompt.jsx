import React, { useEffect, useState, useMemo } from "react";
import icon from "../../icons";

const Prompt = ({ title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const iconStyle = "h-[3.93vh]";
  const iconStyle2 = "h-[2.67vh]";
  const AgreeMentStyle = "text-[#14B5FF]";
  const DisagreeMentStyle = "text-[#FA3C3C]";

  const Ment = useMemo(
    () => [
      {
        timer: 90,
        ment: `"찬성입장 : ${title}"`,
        message1: "찬성 측의 발언 시간이예요!",
        message2: "와 같은 의견을 말씀해주세요.",
        icon: <icon.PromptAgree className={iconStyle} />,
        mentStyle: AgreeMentStyle,
      },
      {
        timer: 90,
        ment: `"반대입장 : ${title}"`,
        message1: "반대 측의 발언 시간이에요!",
        message2: "와 같은 의견을 말씀해주세요.",
        icon: <icon.PromptDisagree className={iconStyle} />,
        mentStyle: DisagreeMentStyle,
      },
      {
        timer: 60,
        ment: `토론주제 "${title}"`,
        message1: "최종 발언 시간이에요.",
        message2: "에 대한 자신의 찬반 의견을 말씀해주세요.",
        icon: <icon.PromptTogether className={iconStyle2} />,
        mentStyle: "text-[#EFFE37]",
      },
    ],
    [title]
  );

  useEffect(() => {
    if (currentIndex < Ment.length - 1) {
      const timerId = setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, Ment[currentIndex].timer * 1000);

      return () => clearTimeout(timerId);
    }
  }, [currentIndex, Ment]);

  return (
    <>
      {Ment[currentIndex].icon}
      <p className="mt-[1.34vh]">{Ment[currentIndex].message1}</p>
      <p>
        <span className={Ment[currentIndex].mentStyle + " font-bold"}>
          {Ment[currentIndex].ment}
        </span>
        {Ment[currentIndex].message2}
      </p>
    </>
  );
};

export default Prompt;
