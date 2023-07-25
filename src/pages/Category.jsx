import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../icons";
import Header from "../components/Header";
import { game } from "../api/api";
import { encrypt } from "../util/cryptoJs";
import SubHeader from "../components/SubHeader";

function Category() {
  const navigate = useNavigate();

  // 선택된 카테고리 저장을 위한 State
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 카테고리
  const categoryList = [
    { name: "랜덤", code: 0 },
    { name: "연애", code: 4 },
    { name: "게임/프로게이머", code: 1 },
    { name: "연예/이슈", code: 2 },
    { name: "스포츠/운동", code: 3 },
    { name: "학교생활", code: 7 },
    { name: "밸런스게임", code: 8 },
    { name: "회사생활", code: 6 },
    { name: "결혼/육아", code: 5 },
  ];

  const iconList = [
    <icon.Random width="100%" height="100%" />,
    <icon.Love width="100%" height="100%" />,
    <icon.Game width="100%" height="100%" />,
    <icon.Entertainment width="100%" height="100%" />,
    <icon.Sports width="100%" height="100%" />,
    <icon.School width="100%" height="100%" />,
    <icon.BalanceGame width="100%" height="100%" />,
    <icon.Company width="100%" height="100%" />,
    <icon.Marriage width="100%" height="100%" />,
  ];

  const originStyleList = [
    "flex-col row-start-1 row-end-3 bg-[#B484F1] rounded-[24px]",
    "flex-col bg-[#464747] rounded-[24px]",
    "flex-col bg-[#F7FF7D] rounded-[24px]",
    "flex-col bg-[#F7FF7D] rounded-[24px]",
    "flex-col bg-[#464747] rounded-[24px]",
    "flex-col bg-[#F7FF7D] rounded-[24px]",
    "col-start-2 col-end-4 bg-[#B484F1] rounded-[24px]",
    "col-start-1 col-end-3 bg-[#464747] rounded-[24px]",
    "flex-col bg-[#F7FF7D] rounded-[24px]",
  ];

  // 가장 많이 선택된 카테고리
  const example = "게임/프로게이머";

  useEffect(() => {
    // console.log("방에 입장하셨습니다.");
    const handlePopstate = () => {
      console.log("popstate");
      console.log(window.history);
      navigate("/category");
    };
    window.history.pushState(null, ", ");
    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [navigate]);

  // 입장하기 버튼 클릭 시 실행되는 함수
  // 1. 방 리스트 페이지로 이동
  // 2. 카테고리 선택 안될 시 알람 발생
  // 3. 랜덤 선택 시 임의의 주제 넘겨줌
  const enterRoomList = async () => {
    // 키테고리 선택 안할 시 알람 띄우고 진행 불가
    if (selectedCategory === null) {
      return alert("카테고리를 선택해주세요.");
      // 카테고리 값이 랜덤일 경우
    }
    if (selectedCategory === "랜덤") {
      // 선택된 카데고리가 랜덤일 경우 랜덤을 제외한 8개 중 무작위로 선택
      const randomNumber = Math.round(Math.random() * 7);
      console.log("랜덤넘버", randomNumber);

      // 카테고리 리스트 중 랜덤만 삭제 후 7개 중 임의의 값 가져옴
      const randomCategoryName = categoryList.filter(
        (item) => item.name !== "랜덤"
      )[randomNumber].name;
      console.log("랜덤카테고리", randomCategoryName);

      // 카테고리 코드(카테고리 Id)도 가져옴
      const randomCategoryCode = categoryList.filter(
        (item) => item.name !== "랜덤"
      )[randomNumber].code;
      console.log("랜덤카테고리코드", randomCategoryCode);

      //* ----------------   중 복 코 드 ------------------*/
      // 룸리스트 페이지로 전달할 값 인코딩 및 세션스토리지 저장
      const selectedCategoryInfoByRandom = encrypt({
        categoryName: randomCategoryName,
        categoryCode: randomCategoryCode,
      });
      sessionStorage.setItem("selectedCategory", selectedCategoryInfoByRandom);

      // api로 token 받아오기 ( kakao로그인 윺저 : 기존 토큰 사용, 비로그인 유저 : 임시 토큰 할당 )
      const data = game.selectCategory();

      // token 값만 가져오기 위해 data parsing
      const res = (await data).data.data[0];

      // api요청으로 토큰이 존재할 경우만 sessionStorage에 저장
      if (res) {
        sessionStorage.setItem("Authorization", res.Authorization);
        sessionStorage.setItem("kakaoId", res.kakaoId);
      }

      // 룸리스트 페이지로 이동
      return navigate("/roomlist");

      // 그냥 카테고리 중 아무거나 선택 시 진행되는 로직
    }
    // 선택된 카테고리 코드 가져옴
    const selectedCategoryCode = categoryList.filter(
      (category) => category.name === selectedCategory
    )[0].code;

    //* ----------------   중 복 코 드 ------------------*/
    // 룸리스트 페이지로 전달할 값 인코딩 및 세션스토리지 저장
    const selectedCategoryInfo = encrypt({
      categoryName: selectedCategory,
      categoryCode: selectedCategoryCode,
    });
    sessionStorage.setItem("selectedCategory", selectedCategoryInfo);

    // api로 token 받아오기 ( kakao로그인 윺저 : 기존 토큰 사용, 비로그인 유저 : 임시 토큰 할당 )
    const data = game.selectCategory();

    // token 값만 가져오기 위해 data parsing
    const res = (await data).data.data[0];

    // api요청으로 토큰이 존재할 경우만 localStorage에 저장
    if (res) {
      sessionStorage.setItem("Authorization", res.Authorization);
      sessionStorage.setItem("kakaoId", res.kakaoId);
    }

    // 룸리스트 페이지로 이동
    navigate("/roomlist");
  };

  // 카테고리 클릭
  // 하위 컴포넌트에서 선택된 카테고리를 state에 저장
  const categoryBtnClickHandler = (categoryName) => {
    // console.log(categoryName);
    setSelectedCategory(categoryName);
  };

  return (
    <>
      <Header />
      <SubHeader />
      <div className="relative flex w-full h-full overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div className="relative flex justify-center w-full min-w-[787px] h-full px-[18.7vw]">
          {/* Center */}
          <div className="w-[44.01vw] h-full">
            <div className="w-full flex flex-col items-center">
              <div className="flex justify-between w-[787px] mt-[249px] py-[8px] px-[16px] bg-[#464747] font-semibold text-[20px] rounded-2xl text-[#C6C6C6]">
                <p>
                  내가 최근에 입장한 토론 주제는{" "}
                  <span className="bg-black py-[0.3vmin] px-[0.5vmin] rounded-xl">
                    {example}
                  </span>{" "}
                  ?
                </p>
                <div className="text-[#EFFE37] cursor-pointer">
                  바로 선택하기 &gt;
                </div>
              </div>

              {/* 카테고리 카드들 표시되는 부분 */}
              <div className="grid grid-cols-3 grid-rows-[248px_248px_248px_248px] w-[787px] h-[1058px] gap-[22px] mt-[30px] mb-[50px]">
                {categoryList.map((category, index) => (
                  <CategoryCard
                    key={category.name}
                    categoryName={category.name}
                    selectedCategory={selectedCategory}
                    icon={iconList[index]}
                    originStyle={originStyleList[index]}
                    onClickHandler={categoryBtnClickHandler}
                    enterRoomListHandler={enterRoomList}
                    categoryArrow={<icon.CategoryArrow className="h-[36px]" />}
                  />
                ))}
              </div>
              {/* 카테고리 카드들 표시되는 부분 */}
              {/* <div>
                <button
                  onClick={enterRoomList}
                  className="bg-[#EFFE37] w-[600px] py-[40px] mt-[83px] mb-[159px] rounded-[60px] text-[27px] font-bold hover:shadow-[#EFFF364D] hover:shadow-xl"
                >
                  입장하기
                </button>
              </div> */}
            </div>
          </div>
          {/* Center */}
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default Category;

// 카테고리 카드 Component
// 카테고리 페이지에서만 사용됨
const CategoryCard = ({
  selectedCategory,
  categoryName,
  icon = null,
  originStyle,
  onClickHandler,
  enterRoomListHandler,
  categoryArrow,
}) => {
  // 카테고리 선택 시 디자인 변경을 위한 변수들
  const [isSelected, setIsSelected] = useState(false);
  const bgStyle =
    selectedCategory === categoryName
      ? originStyle + " outline outline-[2px] outline-white"
      : originStyle;

  return (
    <div
      onMouseOver={() => {
        onClickHandler(categoryName);
        setIsSelected(true);
      }}
      onMouseLeave={() => {
        onClickHandler(null);
        setIsSelected(false);
      }}
      className={bgStyle + " relative rounded-[24px] overflow-hidden"}
    >
      {icon}
      {isSelected && (
        <div
          onClick={() => {
            enterRoomListHandler();
          }}
          className="absolute flex justify-center items-center bottom-0 w-full h-[70px] bg-black opacity-70 text-white text-[18px] font-bold cursor-pointer"
        >
          다음으로
          {categoryArrow}
        </div>
      )}
    </div>
  );
};
