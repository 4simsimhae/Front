import React from "react";
import icon from "../icons";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="w-full h-[18.2vh] bg-[#2F3131] px-[18.7vw]">
      <div className="w-full h-full flex flex-col justify-center">
        <div className="w-[10.37vh] h-[2.17vh]">
          <icon.teamlogo className="w-[100%] h-[100%]" />
        </div>
        <p className="flex w-full h-[1.84vh] items-center text-[#C6C6C6] font-regular whitespace-nowrap text-[1.5vh] mt-[1.33vh]">
          심심함, 그 속에서 가치있는 원석을 찾아내 사람들의 공감을 얻을 수 있게
          다듬고 빛냅니다.
        </p>
        <div className="flex h-[2.67vh] gap-[2.5vw] items-center text-[#C6C6C6] text-[1.25vh] font-bold mt-[1.17vh]">
          <a
            href="https://github.com/4simsimhae"
            target="_blank"
            rel="noreferrer"
          >
            <icon.githublogo className="w-[2.67vh] h-[2.67vh]" />
          </a>
          <Link to="/tos">
            <p>이용약관</p>
          </Link>
          <p>Contact Us</p>
        </div>
        <div>
          <p className="flex items-center text-[#777777] h-[1.42vh] text-[1.17vh] font-light mt-[1.17vh]">
            ©2023. TEAM SIMSIMHAE. All Rights reserved,
          </p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
