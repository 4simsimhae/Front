//Kakao.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Kakao = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 URL에서 쿼리 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      sessionStorage.setItem("Authorization", `Bearer ${token}`);
      sessionStorage.setItem("kakaoId", "1");
      navigate("/");
    }
    // 추출한 토큰을 로컬 스토리지에 저장
  }, [navigate]);

  return (
    <div>
      <div>
        <h1>잠시만 기다려 주세요! 로그인 중입니다.</h1>
      </div>
    </div>
  );
};

export default Kakao;

// const OAuth = () => {
//   const code = new URL(window.location.href).searchParams.get("code"); // 인가코드 추출
// 코드 전달은 바디에 담아서 보내도 되지만 아래에서는 url 을 통해서 전달
//   useEffect(() => {
//     fetch(`http://172.20.10.3:3000/user/signin?code=${code}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded;",
//       },
//     });
//   }, []);

//   return <Oabox>카카오 인가코드 받아서 넘기고 토큰 받아오는 과정</Oabox>;
// };
