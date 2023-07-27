//socialKaka0
import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import icon from "../../icons";

//restapi 방법
const SocialKakao = () => {
  const kakaoLogin = `${process.env.REACT_APP_BACKEND_SERVER_URL}/auth/kakao/callback`;

  const { search } = useLocation();
  const token = queryString.parse(search);

  // query에 token이 있다면 localStorage에 저장
  if (Object.keys(token).length > 0) {
    sessionStorage.setItem("RefreshToken", token.token);
  }

  return (
    <div className="flex justify-center items-center w-[80vmin] h-[90vmin] m-auto">
      <div className="w-[100%]">
        <div className="w-[60%] mx-auto">
          <icon.illust_login width="100%" height="60%" />
        </div>
        <div className="w-[50%] mx-auto mt-[5vmin]">
          <icon.logo_debatory_middle width="100%" height="20%" />
        </div>
        <p className="text-[2.1vmin] text-[#ABABAB] whitespace-nowrap mx-auto mt-[8vmin] mb-[2.5vmin] flex flex-col items-center">
          카카오톡 소셜 로그인을 통해 내 계정 정보로 접속할 수 있습니다.
        </p>
        <div className="w-[60%] mx-auto">
          <a href={kakaoLogin}>
            <icon.kakaologin alt="카카오로그인" width="100%" height="20%" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialKakao;
