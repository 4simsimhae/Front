import React from "react";
import Lottie from "lottie-react";

import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";

import { useRoulette } from "../util/useRoulette";
import { useSocketEnterRoom } from "../util/useSocketEnterRoom";

import { socket } from "../socket";
import { chatgpt } from "../api/api";

import Timer from "../components/feature/Timer";
import Prompt from "../components/feature/Prompt";
import ProgressBar from "../components/feature/Progressbar";
import lottie from "../lottie";
import icon from "../icons";

function GameRoom() {
  const Ment = [
    {
      timer: 10,
      message:
        "안녕하세요, 토론에 참가해 주신 여러분께 감사드립니다. 오늘은 [주제]에 대해 토론을 진행하도록 하겠습니다.",
    },
    {
      timer: 10,
      message:
        "방청객 분들께서는 찬성측과 반대측 발언에 대해서 공감가시는 입장에 토론 종료되기 전까지 투표부탁드립니다",
    },
    { timer: 10, message: "모두 준비되셨으면, 시작하겠습니다." },
    { timer: 10, message: "토론을 시작하겠습니다" },
    { timer: 10, message: "먼저, 찬성 측 첫번째 발언해주시겠습니까?" },
    { timer: 150, message: "찬성 측 의견을 말씀해 주세요" },
    { timer: 150, message: "네, 이번에는 반대 측 의견을 말씀해 주세요" },
    { timer: 100, message: "찬성 측 반론 있으시면 발언해주세요" },
    {
      timer: 100,
      message: "반대 측 찬성측 발언에 대해 반론이 있으시면 발언해주세요",
    },
    { timer: 100, message: "추가로 의견을 제시하실 분은 말씀해주세요" },
    {
      timer: 100,
      message: "시간이 얼마 남지 않았습니다. 마지막 결론 말씀해주세요",
    },
    { timer: 100, message: "반대측 부터 발언해주세요" },
    { timer: 100, message: "마지막으로 찬성 측 발언해주세요" },
    { timer: 10, message: "토론이 종료되었습니다" },
    { timer: 10, message: "투표가 종료되었습니다." },
    { timer: 10, message: "토론배틀에 승자는 {토론자A}입니다. 축하드립니다. " },
    { timer: 10, message: "다시 한번 참가해 주신 여러분께 감사드립니다. " },
    {
      timer: 10,
      message:
        "토론에 참가하실 의향이 있으신 분은 도전하기 버튼을 눌러 많은 참여부탁드립니다.",
    },
  ];

  const navigate = useNavigate();
  // 방 리스트 페이지에서 페이지 이동 시 넘겨는 State : 방 넘버
  const { state } = useLocation();
  // console.log(state);
  const [roomNumber, defaultTitle, categoryName, categoryCode, isTeller] =
    state;

  // 타이틀 설정 시 사용되는 상태
  const [title, setTitle] = useState(defaultTitle);
  // 룰렛 표시 여부에 사용되는 상태
  const [isRoulette, setIsRoulette] = useState(false);
  const [isRouletteResult, setIsRouletteResult] = useState(false);
  // 채팅 표시를 위해 사용되는 상태
  const [totalChat, setTotalChat] = useState([]);
  // 음소거 아이콘 변경에 사용되는 상태
  const [isMuted, setIsMuted] = useState(false);
  // 비디오 끄기, 켜기에 사용되는 상태
  const [isVideoOff, setIsVideoOff] = useState(true);
  // 유저 닉네임 보여주는 상태
  const [userNickname, setUserNickname] = useState([]);

  const countReadyBox = () => {
    const count = 10 - userNickname.length;
    return Array(count).fill(<Lottie animationData={lottie.loading} />);
  };

  // const URL = process.env.REACT_APP_BACKEND_SERVER_URL;

  const readyBox = useMemo(countReadyBox, [userNickname]);

  // 룰렛 React DOM을 point하기 위한 Ref
  const roulette = useRef(null);
  // 비디오 부분 React DOM을 point하기 위한 Ref
  const myVideoBox = useRef(null);
  const yourVideoBox = useRef(null);
  // 채팅 전송을 위한 Ref
  const chatInputValue = useRef("");

  // chatgpt에 카테고리별 주제 받아오는 Ref
  const titleList = useRef([]);

  //// gpt에서 주제 받아오는 api
  // const { mutateAsync: getTitleList, isLoading: isTitleLoading } = useMutation(
  //   () => chatgpt.kategorie(categoryName),
  //   {
  //     onSuccess: (res) => {
  //       console.log("title is", res);
  //     },
  //     onError: (error) => {
  //       console.log(error);
  //     },
  //     retry: 0,
  //   }
  // );

  // --------- 소켓 부분 -----------
  useSocketEnterRoom({ socket, roomNumber, isTeller });

  // 1. 룸 입장 시 랜덤 닉네임 받아옴
  socket.on("roomJoined", (nickName) => {
    setUserNickname([...nickName]);
  });

  // 2. 상대 방이 보낸 채팅 가져옴
  socket.on("new_chat", (chat) => {
    setTotalChat([...totalChat, chat]);
  });

  // 2 -1. 내 채팅 내용 화면에 띄어줌
  const chatSubmitHandler = (event) => {
    event.preventDefault();
    const myChat = chatInputValue.current.value;
    socket.emit("new_message", myChat, roomNumber, () => {
      console.log("채팅이 보내졌습니다!");
    });
    setTotalChat([...totalChat, `You: ${myChat}`]);
    chatInputValue.current.value = "";
  };

  // 3. 룰렛 보여줌
  socket.on("show_roulette", (rouletteData, result) => {
    titleList.current = [...rouletteData];
    setIsRoulette(result);
  });

  // 3-1. 게임 시작 버튼 클릭 시 실행되는 함수
  const gameStartBtnClickhandler = () => {
    socket.emit("show_roulette", true, roomNumber, () => {
      console.log("룰렛이 생성되었습니다.");
    });
  };

  // 4. 룰렛 닫기
  socket.on("close_roulette", (result) => {
    setIsRoulette(result);
  });

  socket.on("close_result", (result) => {
    setIsRouletteResult(result);
  });

  // 5. 유저 나갔을 시 발생하는 알람
  socket.on("roomLeft", (nickname) => {
    setTotalChat([...totalChat, `Alarm : ${nickname}님이 나가셨습니다.`]);
  });
  // ---------- 소켓 부분 -----------

  // ---------- 룰렛 관련 -----------
  // 룰렛 그리기
  useRoulette({ isRoulette, titleList, roulette, title });

  // 룰렛 돌려 주제정하는 함수
  // 룰렛 시작 버튼 클릭 -> 소켓으로 시작 알려줌 ->
  const setTitleBtnClickHandler = (event) => {
    // event.stopPropagation();
    socket.emit("start_roulette", roomNumber, () => {
      console.log("주제 정하기 룰렛이 다 돌아갔습니다!");
    });
  };

  socket.on("start_roulette", (ran) => {
    console.log(roulette.current);
    setTitleFunc(ran);
  });

  // const ran = Math.floor(Math.random() * titleList.current.length);
  let currentTitle;
  const setTitleFunc = (ran) => {
    currentTitle = titleList.current[ran];
    const canvas = roulette.current;
    if (canvas === null) {
      return;
    } // 가드 처리, TypeScript 사용 시에는 build 불가
    canvas.style.transform = `initial`;
    canvas.style.transition = `initial`;

    setTimeout(() => {
      const arc = 360 / titleList.current.length;
      const rotate = ran * arc + 3600 + arc * 3 - arc / 2;

      canvas.style.transform = `rotate(-${rotate}deg)`;
      canvas.style.transition = `2s`;

      setTimeout(() => {
        setTitle(currentTitle);
        setIsRouletteResult(true);
      }, 2000);
      // handleButtonClick();
    }, 1);
  };

  const closeResultModal = () => {
    socket.emit("close_result", false, roomNumber, () => {
      console.log("주제가 확정되었습니다. 게임이 시작됩니다!");
    });
    socket.emit("close_roulette", false, roomNumber, () => {
      console.log("주제가 확정되었습니다. 게임이 시작됩니다!");
    });
  };
  const closeRouletteModal = () => {
    socket.emit("close_result", false, roomNumber, () => {
      console.log("주제가 확정되었습니다. 게임이 시작됩니다!");
    });
  };
  // ---------- 룰렛 관련 -----------

  // ---------- Web RTC -----------
  // 내 오디오 음소거 함수
  const muteClickHandler = async () => {
    (await myStream)
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    // console.log((await myStream).getAudioTracks());
    if (!isMuted) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // 내 비디오 끄기 함수
  const cameraOffClickHandler = async () => {
    (await myStream)
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    // console.log((await myStream).getVideoTracks());
    if (!isVideoOff) {
      setIsVideoOff(true);
    } else {
      setIsVideoOff(false);
    }
  };

  // 내 비디오, 오디오 정보 가져오는 함수
  const getMedia = async () => {
    try {
      // 내 오디오, 비디오 장비들의 stram 정보를 가져옴
      const Stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      Stream.getVideoTracks().forEach(
        (track) => (track.enabled = !track.enabled)
      );
      // console.log(Stream);
      return Stream;
    } catch (e) {
      console.log(e);
    }
  };

  // 컴포넌트 첫 마운트 시에 myStream 정보를 캐싱 후 바꾸지 않음
  // 향후 반장이 바뀔 때 의존성으로 사용할 수 있을 것 같음
  const myStream = useMemo(getMedia, []);

  // isMuted 와 isVideoOff 상태를 의존성을 가지며 2개의 상태값이 변할 때마다 캐싱된 myStream 값을 가져와서 video의 srcObject로 입력해줌
  useEffect(() => {
    setTimeout(async () => {
      // console.log(await myStream);
      myVideoBox.current.srcObject = await myStream;
      yourVideoBox.current.srcObject = await myStream;
    }, 0);
  }, [isMuted, isVideoOff, myStream]);
  // ---------- Web RTC -----------

  // ---------- 좋아요, 싫어요, 응 버튼 ---------
  /// 작업중
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleButtonClick = () => {
    setButtonClicked(true);
  };

  const [showLikeButton, setShowLikeButton] = useState(false);
  const [showLikeYouButton, setShowLikeYouButton] = useState(false);

  const handleMouseEnter = () => {
    setShowLikeButton(true);
    // console.log("Hi", showLikeButton);
  };

  const handleMouseLeave = () => {
    setShowLikeButton(false);
    // console.log("Bye", showLikeButton);
  };

  const handleMouseYouEnter = () => {
    setShowLikeYouButton(true);
  };

  const handleMouseYouLeave = () => {
    setShowLikeYouButton(false);
  };
  // ---------- 좋아요, 싫어요, 응 버튼 ---------

  // 나가기 버튼 클릭 시 실행되는 함수
  const goHomeBtnClick = () => {
    navigate("/roomlist", { state: [categoryName, categoryCode] });
  };

  return (
    <div className="relative flex w-[100vw] h-[100vh] gap-3 bg-black">
      {/* ========================================= 룰렛 모달 ================================================ */}
      {isRoulette ? (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]">
          <div className="relative flex justify-center items-center w-[75vmin] h-[75vmin] z-[3]">
            <canvas
              ref={roulette}
              className="w-[90%] h-[90%] rounded-[100%] border-[2vh] border-gray-400 outline outline-[3vh]"
              width="450px"
              height="450px"
            />
            <div className="absolute flex flex-col justify-center items-center gap-[1vmin] w-[20%] h-[20%] rounded-full bg-black z-[4]">
              <button
                onClick={setTitleBtnClickHandler}
                disabled={!isTeller}
                className=" text-green-300 text-[2.5vmin] font-semibold"
              >
                룰렛돌리기
              </button>
            </div>
            <div className="absolute w-[1vh] h-[1vh] top-[1.5vmin] left-[47%] text-[5vh] z-[4]">
              ▼
            </div>
            {isRouletteResult ? (
              <div className="absolute flex flex-col justify-center items-center w-[80%] h-[10vh] top-[43%] bg-white text-[3vh] z-[5]">
                결과는 {title}입니다.
                <div className="flex w-full h-[50%] justify-evenly">
                  {isTeller && (
                    <>
                      <button
                        className="bg-slate-300 px-[5%]"
                        onClick={closeResultModal}
                      >
                        Start
                      </button>
                      <button
                        className="bg-slate-300 px-[5%]"
                        onClick={closeRouletteModal}
                      >
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* // ) : isTitleLoading ? (
      //   <div className="absolute w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[2]">
      //     <div className="relative flex justify-center items-center w-[75vh] h-[75vh] top-[12.5%] left-[25vw] z-[2]">
      //       <Lottie animationData={lottie.loading} />
      //     </div>
      //   </div>
      // )  */}
      {/* ========================================= 룰렛 모달 ================================================ */}

      {/* ========================================== 게임 창 ================================================ */}
      <div className="flex flex-col w-[75%] h-full py-[1%] pl-[1%] gap-[1%]">
        {/*----------- 주제 + 비디오 ---------- */}
        <div className="relative flex flex-col gap-[2%] p-[1%] h-[50%] bg-[#1E1E1E] rounded-2xl">
          {/* 1. 주제 */}
          <div className="w-full h-[15%]">
            <div className="flex h-full justify-between gap-[1%]">
              <div className="flex w-[10%] items-center justify-center bg-[#2F3131] text-white rounded-lg font-medium text-[1.8vh]">
                주제
              </div>
              <div className="flex w-[90%] items-center justify-start pl-[2vmin] bg-[#2F3131] text-white rounded-lg font-medium text-[2vh]">
                {title}
              </div>
            </div>
          </div>

          {/* 2. Versus Icon */}
          <div className="absolute w-[3vh] h-[2vh right-[48%] top-[55%] z-[2]">
            <icon.Versus width="100%" height="100%" />
          </div>

          {/* 3. 비디오 */}
          <div className="flex justify-between items-center w-full h-[85%]">
            {/* 비디오 html : srcObject는 내 오디오, 비디오 장비,연결 시 자동으로 Play되는 autoPlay 속성 적용 */}
            {/* playsinline : 모바일 기기가 비디오를 재생할 때 전체화면이 되지 않도록 설정 */}
            <div
              className="relative w-[48%] h-full"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <video
                className="w-full h-full rounded-2xl"
                ref={myVideoBox}
                autoPlay
                playsInline
                muted
              ></video>

              {/* 4. 비디오 내 버튼들 */}
              {showLikeButton && (
                <div className="absolute bottom-0  w-full h-[20%]   opacity-95 flex items-center justify-center">
                  <icon.challenge className="cursor-pointer left-10" />
                  <icon.likeButton className="cursor-pointer" />
                  <icon.hateButton className="cursor-pointer" />
                  <icon.whyButton className="cursor-pointer" />
                  <icon.reportButton className="cursor-pointer right-0" />
                </div>
              )}
            </div>
            <div
              className="relative w-[48%] h-full"
              onMouseEnter={handleMouseYouEnter}
              onMouseLeave={handleMouseYouLeave}
            >
              <video
                className="  w-full h-full rounded-2xl"
                ref={yourVideoBox}
                autoPlay
                playsInline
                muted
              />
              {showLikeYouButton && (
                <div className="absolute bottom-0  w-full h-[20%] opacity-75 flex items-center justify-center">
                  <icon.challenge className="cursor-pointer" />
                  <icon.likeButton className="cursor-pointer" />
                  <icon.hateButton className="cursor-pointer" />
                  <icon.whyButton className="cursor-pointer" />
                  <icon.reportButton className="cursor-pointer" />
                </div>
              )}
            </div>
          </div>
        </div>
        {/*----------- 주제 + 비디오 ---------- */}

        {/*-----------Progress bar --------- */}
        <div className="relative flex justify-center items-center w-full h-[7%] bg-[#1E1E1E] rounded-2xl text-white">
          {/* <ProgressBar timers={Ment} /> */}
          {buttonClicked ? (
            <ProgressBar timers={Ment} />
          ) : (
            <div className="absolute left-[10%]  bg-gray-500 w-[70%] h-5 rounded-full"></div>
          )}
          {buttonClicked ? (
            <Timer timers={Ment} />
          ) : (
            <button className="absolute text-[#C6C6C6] font-bold rounded-2xl text-[2vh] w-[20%] right-10 mx-auto ">
              잔여시간
            </button>
          )}
        </div>
        {/*-----------Progress bar --------- */}

        {/*-------------- 유저 창 --------------*/}
        <div className="grid grid-cols-5 grid-rows-2 w-full h-[20%]  gap-2">
          {userNickname.map((nickname) => (
            <UserBox key={nickname} nickname={nickname} />
          ))}
          {readyBox.map((item, index) => {
            return <UserBox key={index} nickname={item} />;
          })}
        </div>
        {/*-------------- 유저 창 --------------*/}

        {/*-------------- 프롬프트 --------------*/}
        <div className="flex justify-center items-center w-full h-[14%] bg-[#2F3131] text-[#C6C6C6] font-bold rounded-2xl text-[2vh]">
          {buttonClicked ? (
            <Prompt timers={Ment} />
          ) : (
            <div>아래 Start버튼을 눌러 시작해주세요!</div>
          )}
        </div>
        {/*-------------- 프롬프트 --------------*/}

        {/*------------- 기능 버튼들 ------------*/}
        <div className="flex justify-between w-full h-[7%] px-[1%]">
          <div className="flex w-[40%] gap-[8%]">
            {/* 1. 비디오 켜기/끄기 */}
            <button className="text-white my-2">
              {isVideoOff ? (
                <icon.VideoOn
                  onClick={cameraOffClickHandler}
                  width="8vh"
                  height="100%"
                />
              ) : (
                <icon.VideoOff
                  onClick={cameraOffClickHandler}
                  width="8vh"
                  height="100%"
                />
              )}
            </button>

            {/* 2. 오디오 켜기/끄기 */}
            <button className="text-white my-2">
              {isMuted ? (
                <icon.MuteOff
                  onClick={muteClickHandler}
                  width="8vh"
                  height="100%"
                />
              ) : (
                <icon.Mute
                  onClick={muteClickHandler}
                  width="8vh"
                  height="100%"
                />
              )}
            </button>
          </div>

          {/* 3. 게임시작 */}
          <div className="flex w-[10vh]">
            {isTeller && (
              <button
                className="text-white my-2 ml-auto w-full border text-[3vh]"
                onClick={gameStartBtnClickhandler}
              >
                start
              </button>
            )}
          </div>

          {/* 4. 방 나가기 */}
          <div className="flex">
            <button
              className="text-white my-2 ml-auto"
              onClick={goHomeBtnClick}
            >
              <icon.Exit width="8vh" height="100%" />
            </button>
          </div>
        </div>
        {/*------------- 기능 버튼들 ------------*/}
      </div>
      {/* ========================================== 게임 창 ================================================ */}

      {/* ========================================= 채팅 박스 ================================================ */}
      <form
        className="flex flex-col ml-auto  w-[25%] h-full"
        onSubmit={chatSubmitHandler}
      >
        <div className="h-full border border-black p-2 break-words overflow-x-hidden overflow-y-auto bg-[#1B1B1B]">
          <ul>
            {totalChat?.map((chat, index) => {
              if (chat.split(":")[0] === "You") {
                return (
                  <li
                    key={index}
                    className="w-fit max-w-[80%] ml-auto bg-[#2F3131] px-[0.5vh] mt-[0.5vh] text-[#C6C6C6] text-[1.7vh] rounded-[1vh]"
                  >
                    {chat.split(":")[1]}
                  </li>
                );
              }
              return (
                <li
                  key={index}
                  className="w-fit max-w-[80%] bg-[#2F3131] text-[#C6C6C6] text-[1.7vh] mt-[0.5vh] px-[0.5vh] rounded-[1vh]"
                >
                  {chat}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex w-full h-[5%] border border-black gap-[10px] bg-slate-300 p-2 mt-2 rounded-2xl">
          <input
            className="border w-full"
            ref={chatInputValue}
            type="text"
            required
            placeholder="Write chat"
          />
          <button className="bg-slate-100 px-1 rounded-2xl">Send</button>
        </div>
      </form>
      {/* ========================================= 채팅 박스 =================================================*/}
    </div>
  );
}

export default GameRoom;

function UserBox({ nickname }) {
  return (
    <div className="bg-[#1B1B1B] rounded-lg text-white flex justify-center items-center text-[2vmin]">
      {nickname}
    </div>
  );
}
