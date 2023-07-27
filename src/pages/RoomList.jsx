import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Room from "../components/Room";
import Pagination from "../components/Pagination";
import { useRoomListSocket } from "../util/useSocket";
import { decrypt } from "../util/cryptoJs";
import SubHeader from "../components/SubHeader";
import icon from "../icons";

function RoomList() {
  const roomListSocket = useMemo(useRoomListSocket, []);

  const navigate = useNavigate();
  // 카테고리 페이지로부터 선택된 카테고리 전달 받음
  const state = decrypt(sessionStorage.getItem("selectedCategory"));
  // 카테고리 이름, 코드
  const { categoryName, categoryCode } = state;

  const roomListPageContainerRef = useRef(null);

  const goBackBtnClickHandler = () => {
    roomListPageContainerRef.current.scrollTop = 0;
  };

  useEffect(() => {
    roomListSocket.emit("update", categoryCode);
    return () => {
      roomListSocket.disconnect();
      // console.log("네임스페이스 소켓의 연결이 끊어졌습니다.");
    };
  }, [categoryCode, roomListSocket]);

  // 뒤로가기 막기
  useEffect(() => {
    // console.log("방에 입장하셨습니다.");
    const handlePopstate = () => {
      console.log("popstate");
      console.log(window.history);
      navigate("/roomlist");
    };
    window.history.pushState(null, "", "");
    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [navigate]);

  useEffect(() => {
    roomListSocket.on("update_roomList", (roomList) => {
      // console.log(roomList);
      setRoomList(roomList);
    });
  }, [roomListSocket]);

  // 페이지네이션 관련 변수들
  const limit = 10;
  const [page, setPage] = useState(1);
  const offset = (page - 1) * limit;

  // 방 리스트 만들기 위해 더미데이터 이용 => api로 받아와야 되는 부분들
  const [roomList, setRoomList] = useState([]);

  const showRoomListDevidedByNumber = (
    totalRoomList,
    startNumber,
    devideNumber
  ) => {
    return totalRoomList
      ?.slice(startNumber, startNumber + devideNumber)
      .map((item, index) => (
        <Room
          key={item.roomId}
          number={index + limit * (page - 1)}
          categoryName={item.KategorieName}
          roomName={item.roomName}
          debater={item.debater}
          panel={item.panel}
          roomId={item.roomId}
          categoryCode={categoryCode}
          gameStart={item.gameStart}
        />
      ));
  };

  const [isHot, setIsHot] = useState(false);

  const have2TellerBtnStyle = isHot ? "text-[#C6C6C6]" : "bg-[#EFFE37]";
  const hotBtnStyle = isHot ? "bg-[#EFFE37]" : "text-[#C6C6C6]";

  const have2TellerBtnClickHandler = () => {
    setIsHot(false);
  };
  const hotBtnClickHandler = () => {
    setIsHot(true);
  };
  return (
    <>
      <Header />
      <SubHeader categoryName={categoryName} categoryCode={categoryCode} />
      <div
        ref={roomListPageContainerRef}
        className="relative w-full h-full overflow-x-hidden overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col items-center w-full h-full px-[18.7vw]">
          {/* 핫한 방 리스트 */}
          <div className="flex flex-col w-full mt-[220px]">
            <div className="flex text-[1.5vh] gap-[1.04vw]">
              <button
                onClick={have2TellerBtnClickHandler}
                className={
                  have2TellerBtnStyle +
                  " px-[1.67vw] py-[0.75vh] border border-[#EFFE37] rounded-[30px]"
                }
              >
                토론자가 둘 다 있어요
              </button>
              <button
                onClick={hotBtnClickHandler}
                className={
                  hotBtnStyle +
                  " px-[1.67vw] py-[0.75vh] border border-[#EFFE37] rounded-[30px]"
                }
              >
                HOT한 토론
              </button>
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="flex gap-[1.04vw] w-fit h-[278px] mt-[3.34vh]">
                <div className="w-[456px] h-full bg-[#2F3131] rounded-[24px] overflow-hidden">
                  <icon.UpperNoRoom className="w-[456px] h-full" />
                </div>
              </div>
            </div>
          </div>
          {/* 핫한 방 리스트 */}

          <div className="flex flex-col my-auto w-full mx-[6.4vw] mt-[9.78vh] ">
            <p className="text-white text-[24px] font-bold">방 리스트</p>
            {/* 빙 리스트 본문 */}
            <div className="grid grid-cols-2 grid-rows-[314px_314px_314px_314px_314px] w-full gap-[2.51vh] mt-[3.01vh] ">
              {roomList.length !== 0 ? (
                showRoomListDevidedByNumber(roomList, offset, limit)
              ) : (
                <div className="w-[30.3vw] h-full bg-[#2F3131] rounded-[24px] overflow-hidden">
                  <icon.LowerNoRoom className="w-[30.3vw] h-full" />
                </div>
              )}
            </div>
            {/* 빙 리스트 본문 */}

            {/* 페이지네이션 부분 */}
            <div className="flex justify-center h-[7.02vh] items-center gap-[0.5vh] mt-[3vh]">
              {roomList.length !== 0 && (
                <Pagination
                  total={roomList.length}
                  limit={limit}
                  page={page}
                  setPage={setPage}
                />
              )}
            </div>
            {/* 페이지네이션 부분 */}

            <div className="flex justify-center mb-[7.02vh]">
              <icon.BackToTop
                onClick={goBackBtnClickHandler}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoomList;
