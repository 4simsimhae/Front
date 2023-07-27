import React from "react";
import { useNavigate } from "react-router-dom";
import icon from "../icons";
import { encrypt } from "../util/cryptoJs";
import { useMutation } from "react-query";
import { game } from "../api/api";

function SubHeader({ categoryName, categoryCode }) {
  const navigate = useNavigate();
  const makeRoomBtnStyle = "w-[10.54vw] h-[52px]";
  const middleIconStyle = "h-[630px]";
  // 메인으로 클릭 시 실행되는 함수
  const goHomeHandler = () => {
    navigate(`/`);
  };
  const goCategoryHandler = () => {
    navigate("/category");
  };

  const { mutateAsync: createRoom } = useMutation(
    () => game.createRoom(categoryCode),
    {
      onSuccess: (res) => {
        const roomData = res.data.data[0];
        const userData = encrypt({
          roomNumber: roomData.roomId,
          defaultTitle: roomData.roomName,
          categoryName,
          categoryCode,
          isTeller: true,
          isHost: true,
        });
        sessionStorage.setItem("userData", userData);
        navigate(`/room/${roomData.roomId}`);
      },
    }
  );

  let categoryIcon;
  switch (categoryName) {
    case "게임/프로게이머":
      categoryIcon = <icon.SubHeaderGame className={middleIconStyle} />; // 향후 추가 필요
      break;
    case "연예/이슈":
      categoryIcon = (
        <icon.SubHeaderEntertainment className={middleIconStyle} />
      );
      break;
    case "스포츠/운동":
      categoryIcon = <icon.SubHeaderSports className={middleIconStyle} />;
      break;
    case "연애":
      categoryIcon = <icon.SubHeaderLove className={middleIconStyle} />;
      break;
    case "결혼/육아":
      categoryIcon = <icon.SubHeaderMarriage className={middleIconStyle} />;
      break;
    case "회사생활":
      categoryIcon = <icon.SubHeaderCompany className={middleIconStyle} />;
      break;
    case "학교생활":
      categoryIcon = <icon.SubHeaderSchool className={middleIconStyle} />;
      break;
    case "밸런스게임":
      categoryIcon = <icon.SubHeaderBalanceGame className={middleIconStyle} />;
      break;
    default:
      break;
  }
  return (
    <div className="absolute top-[72px] flex justify-between w-full h-[120px] items-center px-[18.7vw] z-[1] overflow-hidden backdrop-blur-[4px] bg-black-transparent transition-[background-color]">
      {categoryName ? (
        <div
          onClick={goCategoryHandler}
          className="flex items-center gap-[0.5vw] cursor-pointer"
        >
          <icon.ArrowBack className="w-[24px] h-[24px]" />
          <div className="text-[#C6C6C6] text-[15px] font-bold">
            카테고리 선택
          </div>
        </div>
      ) : (
        <div
          onClick={goHomeHandler}
          className="flex items-center gap-[0.5vw] cursor-pointer"
        >
          <icon.ArrowBack className="w-[24px] h-[24px]" />
          <div className="text-[#C6C6C6] text-[15px] font-bold">메인으로</div>
        </div>
      )}
      {categoryName ? (
        categoryIcon
      ) : (
        <icon.SubHeaderDefault className="h-[30px]" />
      )}
      {categoryName && sessionStorage.getItem("kakaoId") === "1" ? (
        <icon.SubHeaderMakeRoomButton
          onClick={() => {
            createRoom();
          }}
          className={makeRoomBtnStyle + " cursor-pointer"}
        />
      ) : (
        <div className={makeRoomBtnStyle}></div>
      )}
    </div>
  );
}

export default SubHeader;
