import React from "react";
import Lottie from "lottie-react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "boring-avatars";
import jwt_decode from "jwt-decode";

import { useRoulette } from "../util/useRoulette";
import { useNotGoBack } from "../util/useNotGoBack";
import { useSocket } from "../util/useSocket";
import { decrypt } from "../util/cryptoJs";

import Prompt from "../components/feature/Prompt";

import lottie from "../lottie";
import icon from "../icons";
import TestProgressbar from "../components/feature/TestProgressbar";

function GameRoom() {
  const navigate = useNavigate();

  const state = useMemo(() => decrypt(sessionStorage.getItem("userData")), []);

  let { roomNumber, defaultTitle, categoryName, categoryCode } = state;

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  // 타이틀 설정 시 사용되는 상태
  const [title, setTitle] = useState(defaultTitle);
  // 호스트 변경 시 사용
  const [isHost, setIsHost] = useState(false);
  // 배심원이 토론자로 변경될 시 사용할 예정
  const isTeller = useMemo(() => state.isTeller, [state.isTeller]);
  // const [isTeller, setIsTeller] = useState(state.isTeller);

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
  // 1. 방장 정보
  const [hostInfo, setHostInfo] = useState({});
  // 2. 토론자 정보
  const [debaterInfo, setDebaterInfo] = useState({});
  // 3. 배심원들 정보
  const [jurorInfo, setJurorInfo] = useState([]);

  // 게임 결과 보여주는 상태
  const [isVoteEnd, setIsVoteEnd] = useState(false);
  const [winnerNick, setWinnerNick] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [isDraw, setIsDraw] = useState(false);

  // 찬성, 반대에 따라 유저 div 색상 지정
  const [hostDivDesign, setHostDivDesign] = useState("bg-black");
  const [debaterDivDesign, setDebaterDivDesign] = useState("bg-black");

  // 투표 시 남은 시간 설정
  const [remainTime, setRemainTime] = useState("30");

  // OPENVIDU  **********************************************************
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);

  const OV = useRef(new OpenVidu());

  const { id } = useParams();
  const mySessionId = id.toString();

  useEffect(() => {
    // OpenVidu 연결
    OV.current.enableProdMode();
    const mySession = OV.current.initSession();

    console.log("1.세션 초기화 = ", mySession);
    setSession(mySession);
    // 구독자가 새로 들어오면 구독 처리
    mySession.on("streamCreated", (event) => {
      const subscriber = mySession.subscribe(event.stream);
      console.log("새 스트림 생성 = ", subscriber);
      setSubscribers((subs) => [...subs, subscriber]);
    });

    // 구독자가 나가면 구독 해제 처리
    mySession.on("streamDestroyed", (event) => {
      console.log("떠난사람 존재!", event);
      console.log("떠난 스트림", event.stream.streamId);
      const streamId = event.stream.streamId;
      setSubscribers((subs) =>
        subs.filter((subscriber) => subscriber.stream.streamId !== streamId)
      );
    });

    if (isTeller) {
      console.log("1. 발언자 로직 시작");
      getToken().then((token) => {
        mySession.connect(token).then(async () => {
          const __publisher = OV.current.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: "320x240", // The resolution of your video
            frameRate: 10, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });
          // setPublisher(__publisher);

          mySession.publish(__publisher);
          console.log("1. 발언자 publisher = ", __publisher);
          setPublisher(__publisher);
        });
      });
    } else {
      getToken().then((token) => {
        console.log("2. 배심원 로직 시작");
        mySession.connect(token).then(async () => {
          const __publisher = OV.current.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: false, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: false, // Whether you want to start publishing with your video enabled or not
            resolution: "320x240", // The resolution of your video
            frameRate: 10, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });
          // setPublisher(__publisher);

          // mySession.publish(__publisher);
          console.log("2. 배심원 publisher = ", __publisher);
          setPublisher(__publisher);
        });
      });
    }
    //클린업 함수
    return () => {
      console.log("연결끊김");
      if (mySession) {
        mySession.disconnect();
      }
    };
  }, []);

  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    const response = await axios.post(
      process.env.REACT_APP_BACKEND_SERVER_URL + "/api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The sessionId
  };

  const createToken = async (sessionId) => {
    const response = await axios.post(
      process.env.REACT_APP_BACKEND_SERVER_URL +
        "/api/sessions/" +
        sessionId +
        "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The token
  };

  // 상대편 비디오 보여주는 부분
  useEffect(() => {
    const newSubscribers = subscribers.filter(
      (subs) => subs.stream.audioActive === true
    );
    if (newSubscribers.length !== 0 && !!myVideoBox && !!yourVideoBox) {
      if (isHost && isTeller) {
        console.log("방장 구독 = ", newSubscribers);
        newSubscribers[0].addVideoElement(yourVideoBox.current);
      } else if (!isHost && isTeller) {
        console.log("발언자 구독 = ", newSubscribers);
        newSubscribers[0].addVideoElement(myVideoBox.current);
      } else {
        console.log("배심원들 구독 = ", newSubscribers);
        myVideoBox.current.srcObject = null;
        yourVideoBox.current.srcObject = null;
        if (newSubscribers.length === 2) {
          newSubscribers[0].addVideoElement(yourVideoBox.current);
          newSubscribers[1].addVideoElement(myVideoBox.current);
        } else {
          newSubscribers[0].addVideoElement(myVideoBox.current);
        }
      }
    }
  }, [subscribers, isHost, isTeller]);

  // 내 비디오 보여주는 부분
  useEffect(() => {
    myVideoBox.current.srcObject = null;
    yourVideoBox.current.srcObject = null;
    if (publisher && isHost && isTeller) {
      console.log("방장 로컬 스트림 = ", publisher);
      publisher.addVideoElement(myVideoBox.current);
    } else if (publisher && !isHost && isTeller) {
      console.log("발언자 로컬 스트림 = ", publisher);
      publisher.addVideoElement(yourVideoBox.current);
    } else {
      return;
    }
  }, [publisher, isHost, isTeller]);
  // **************************************************************************

  // 룰렛 React DOM을 point하기 위한 Ref
  const roulette = useRef(null);
  // 비디오 부분 React DOM을 point하기 위한 Ref
  const myVideoBox = useRef(null);
  const yourVideoBox = useRef(null);
  // 채팅 전송을 위한 Ref
  const chatInputValue = useRef("");

  // BackEnd에 카테고리별 주제 받아오는 Ref
  const titleList = useRef([]);

  // ************************************************ 채팅 창 스크롤 최신 채팅으로 맞추기
  const chatContainerRef = useRef(null);

  const scrollToRecent = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToRecent();
  }, [totalChat]);
  // ***************************************************************************

  // ************************************************* 진행상황 바 표시 및 프롬프트 관련
  // 프로그레스 바 진행 관련 상태
  const [isStartGame, setIsStartGame] = useState(false);
  // 투표 창 보여주는 상태
  const [isGameEnd, setIsGameEnd] = useState(false);

  // 게임 시작
  const startGameSignalHandler = () => {
    setIsStartGame(true);
  };

  // 게임 종료
  const endGameSignalHandler = () => {
    setInterval(() => {
      setIsGameEnd(false);
    }, 30000);
    setIsStartGame(false);
    setIsGameEnd(true);
    socket.emit("voteStart", roomNumber, categoryCode, () => {
      setIsGameEnd(false);
    });
  };
  // **************************************************************************

  // ****************************************************************** 소켓 부분
  // [Start] 소켓 연결 : useSocket
  //서버와 연결된 소켓 캐싱
  const socket = useMemo(useSocket, []);

  // 뒤로가기 막기 & 새로고침 시 게임진행 중이면 잘못된 접속으로 홈페이지로 이동
  useNotGoBack(state);

  /* 0. 소켓 연결 성공 시 : 방에 입장
  - 토론자일 시 : joinDebate 이벤트 밣생
  - 배심원일 시 : joinJuror 이벤트 발생 */
  // socket.on("connect", () => {
  useEffect(() => {
    if (!isTeller) {
      socket.emit("joinJuror", roomNumber, categoryCode, () => {
        setIsFirstLoading(false);
      });
    } else {
      socket.emit("joinDebate", roomNumber, categoryCode, (msg) => {
        // LoginError : 카카오로그인 안한 유저가 토론자로 참여시 에러 발생
        if (msg) {
          alert(`Error : ${msg}`);
          navigate("/roomlist", { state: [categoryName, categoryCode] });
        }
        setIsFirstLoading(false);
      });
    }
  }, [categoryCode, categoryName, isTeller, navigate, roomNumber, socket]);
  // });

  // 2. 채팅
  // 2 - 1. 내 채팅 내용 화면에 띄어줌, 채팅 상대방에게 전송
  const chatSubmitHandler = (event) => {
    event.preventDefault();
    const myChat = chatInputValue.current.value;
    socket.emit("new_message", myChat, roomNumber, () => {
      console.log("채팅이 보내졌습니다!");
    });
    setTotalChat([...totalChat, `You: ${myChat}`]);
    chatInputValue.current.value = "";
  };

  // 3. 룰렛

  // 룰렛 그려주는 함수 - useEffect()
  useRoulette({ isRoulette, titleList, roulette, title });

  // 3 - 1 - 1. 게임 시작 버튼 클릭 시 룰렛 보여줌
  const gameStartBtnClickHandler = () => {
    // console.log("버튼이 클릭되었습니다.");
    socket.emit("show_roulette", true, categoryCode);
  };

  // 3 - 2 - 1.룰렛 애니메이션 시작 - 룰렛의 Start 버튼
  const setTitleBtnClickHandler = () => {
    socket.emit("start_roulette", roomNumber, categoryCode);
  };

  // 3 - 3 - 1. 결과창 닫기  - 다시돌리기 Button
  const closeResultModal = () => {
    socket.emit("close_result", false, roomNumber, categoryCode);
    socket.emit("close_roulette", false, roomNumber, categoryCode);
  };

  // 3 - 4 - 1. 룰렛 닫기  - 토론 시작하기 Button
  const closeRouletteModal = () => {
    socket.emit("close_result", false, roomNumber, categoryCode);
  };

  // 5 - 1. Host 투표
  const voteFirstPersonHandler = () => {
    socket.emit("vote", roomNumber, 1, categoryCode);
    setIsGameEnd(false);
  };

  // 5 - 2. Debator 투표
  const voteSecondPersonHandler = () => {
    socket.emit("vote", roomNumber, 0, categoryCode);
    setIsGameEnd(false);
  };

  // 페이지 나가기 버튼 클릭 함수
  const gameOutBtnClick = async () => {
    if (window.confirm("이 게임방에서 나가실건가요?") === true) {
      socket.emit("leave_room", () => {
        socket.disconnect();
        navigate("/roomlist", {
          state: { categoryName, categoryCode },
        });
      });
    }
  };

  // 백 웹 소켓 서버에서 이벤트 받는 함수 (매번 생성할 필요 없이 페이지 마운트 시 한 번만 생성할 함수)
  useEffect(() => {
    // 2 - 2. 상대 방이 보낸 채팅 가져와서 화면에 표기
    socket.on("new_chat", (chat) => {
      setTotalChat((prevChat) => [...prevChat, chat]);
    });
    // 4. 유저 나갔을 시 발생하는 알람
    socket.on("roomLeft", (nickname) => {
      setTotalChat((prevChat) => [
        ...prevChat,
        `Alarm : ${nickname}님이 나가셨습니다.`,
      ]);
    });
    // 1. 방에 입장한 유저 닉네임 리스트 받아오기 [ 전체 수신 ]
    socket.on("roomJoined", (data) => {
      // console.log("데이터 = ", data);
      const { userId: myUserId } = jwt_decode(
        sessionStorage.getItem("Authorization")
      );
      // console.log("내 아이디 = ", myUserId);
      const jurorList = [];
      let debaterList = {};
      let hostList = {};
      // let hostStream = null;
      // let debaterStream = null;
      data.forEach((userInfo) => {
        // console.log("받아온 개별 유저정보", userInfo);
        const { host, debater } = userInfo;
        if (!debater) {
          jurorList.push({
            userId: userInfo.userId,
            nickName: userInfo.nickName,
            avatar: JSON.parse(userInfo.avatar),
          });
        }
        if (host && debater) {
          // console.log("host 유저ID", userInfo.userId);
          hostList = {
            userId: userInfo.userId,
            nickName: userInfo.nickName,
            avatar: JSON.parse(userInfo.avatar),
          };
          // if(userInfo.hostStream){
          //    myVideoBox.current.srcObject = "hostStream"
          // }

          if (userInfo.userId === myUserId) {
            setIsHost(true);
          } else {
            if (isHost) {
              setIsHost(false);
            }
          }
        } else if (!host && debater) {
          debaterList = {
            userId: userInfo.userId,
            nickName: userInfo.nickName,
            avatar: JSON.parse(userInfo.avatar),
          };
          // if(userInfo.debaterStream){
          //   yourVideoBox.current,srcObject = "debaterStream"
          // }
        }
      });
      setJurorInfo(jurorList);
      setHostInfo(hostList);
      setDebaterInfo(debaterList);
    });

    // 3 - 1 - 1. 룰렛 보여줌 [ 전체 수신 ]
    socket.on("show_roulette", (titleListFromBack, result) => {
      titleList.current = [...titleListFromBack];
      setIsRoulette(result);
    });

    /* 룰렛 애니메이션 작동
  - 시작점 : start_roulette 이벤트 수신 시
  */
    let currentTitle;
    const setTitleFunc = async (ran) => {
      currentTitle = titleList.current[ran];
      const canvas = roulette.current;
      // console.log(canvas);
      canvas.style.transform = `initial`;
      canvas.style.transition = `initial`;
      // console.log(canvas.style.transform);
      // console.log(canvas.style.transition);

      // 룰렛 애니메이션 작동안하는 이유 : 초기화 후 순차적으로 진행 필요? setTimeout 적용하니 해결됨
      setTimeout(() => {
        const arc = 360 / titleList.current.length;
        const rotate = ran * arc + 3600 + arc * 3 - arc / 2;
        // console.log(rotate);

        canvas.style.transform = `rotate(-${rotate}deg)`;
        canvas.style.transition = `2s`;

        setTimeout(() => {
          setTitle(currentTitle);
          setIsRouletteResult(true);
        }, 2000);
      }, 1);
    };

    // 3 - 2 - 2. 룰렛 애니메이션 시작 [ 전체 수신 ]
    socket.on("start_roulette", (randomSubjectIndex) => {
      // console.log(roulette.current);
      // 룰렛 애니메이션 함수
      setTitleFunc(randomSubjectIndex);
    });

    // 3 - 3 - 2. 결과 창 닫기 [ 전체 수신 ]
    socket.on("close_result", (result) => {
      setIsRouletteResult(result);
    });

    // 찬성 반대에 따른 색상 지정 함수 ( 찬성 : 파란색, 반대 : 빨간색 )
    const setDebaterPosition = (debatersInfo) => {
      if (!debatersInfo) {
        console.log("찬성/반대에 대한 정보가 전달되지 않았습니다.");
      }
      const hostPosition = debatersInfo[0];
      if (hostPosition.debatePosition === 1) {
        setHostDivDesign("bg-[#14B5FF]");
        setDebaterDivDesign("bg-[#FA3C3C]");
        // console.log("호스트 찬성");
      } else {
        setHostDivDesign("bg-[#FA3C3C]");
        setDebaterDivDesign("bg-[#14B5FF]");
        // console.log("호스트 반대");
      }
    };

    // 3 - 4 - 2. 이벤트 수신 후 룰렛 닫기 [ 전체 수신 ]
    socket.on("close_roulette", (result, debatersInfo) => {
      // console.log(debatersInfo);
      setIsRoulette(result);
      setTimeout(startGameSignalHandler, 100);
      setDebaterPosition(debatersInfo);
    });

    // 6. 투표 결과 받기 [ 전체 수신 ]
    socket.on("voteResult", (result) => {
      setRemainTime("30");
      setIsVoteEnd(true);
      setWinnerNick(result.winnerNickName);
      /*
      case 1 : 무승부
      object = {
        debater1: debaterUser1.userId,
        debater1Count: voteRecord.debater1Count,
        debater2: debaterUser2.userId,
        debater2Count: voteRecord.debater2Count,
      }
      */
      if (!result.winner) {
        setIsDraw(true);
        // done();
      } else {
        /*
      case 2 : 승자 / 패자 있는 경우
      object = {
        winner: winner.userId,
        winnerCount: winnerCount,
        loser: loser.userId,
        loserCount: loserCount,
      }
      */
        // 승자 있을 경우 jwt에서 userId가져와서 어느 유저가 승리자인지 확인
        const { userId: myUserId } = jwt_decode(
          sessionStorage.getItem("Authorization")
        );
        // console.log(myUserId);
        if (result.winner === myUserId) {
          setIsWinner(true);
        }
      }
      // 게임이 끝났음으로 호스트 및 토론자 div 색상 기본 값으로 재설정
      setDebaterDivDesign("bg-black");
      setHostDivDesign("bg-black");
    });

    // 7. 토론에서 진 유저 추방하기 [ 전체 수신 ]
    socket.on("loserExit", (exitUserId) => {
      const { userId } = jwt_decode(sessionStorage.getItem("Authorization"));
      if (userId === exitUserId) {
        socket.disconnect();
        setIsLoser(true);
      }
    });

    socket.on("sendRemainTime", (remainTime) => {
      setRemainTime(remainTime);
    });

    // 방 폭파 시 배심원들 나가게 하기 위한 로직
    socket.on("userDisconnected", (jurorUserId) => {
      const { userId } = jwt_decode(sessionStorage.getItem("Authorization"));
      if (userId === jurorUserId) {
        socket.disconnect();
        navigate("/");
      }
    });

    // 게임 중 토론자 유저 나갈 경우
    socket.on("gameEnd", () => {
      setIsStartGame(false);
      setHostDivDesign("bg-black");
      setDebaterDivDesign("bg-black");
    });
  }, []);
  // ******************************************************************************

  // ********************************************************************** Web RTC

  /*   // 내 오디오 음소거 함수
  const muteClickHandler = async () => {
    (await myStream)
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
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
      // console.log(Stream.getVideoTracks());
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
    }, 0);
  }, [isMuted, isVideoOff, myStream]); */
  // *******************************************************************************

  // ********************************************************************************

  // 룰렛 표시 관련 css
  const showRoullete = isRoulette
    ? { visibility: "visible" }
    : { display: "none" };

  const hideStartBtn = !isStartGame
    ? { visibility: "visible" }
    : { display: "none" };

  const hoverStyleOnGameStartBtn =
    hostInfo.nickName && debaterInfo.nickName && jurorInfo.length !== 0
      ? "hover:shadow-[#EFFF364D] hover:shadow-xl"
      : "";

  const goHomeBtnClickHandler = () => {
    socket.disconnect();
    navigate("/");
  };

  const continueGameBtnClickHandler = () => {
    setIsVoteEnd(false);
    setIsDraw(false);
    setIsWinner(false);
    setIsLoser(false);
  };

  return (
    <div className="relative flex justify-center gap-[20px] w-full h-full bg-black">
      {/* ========================================= 로딩 모달 창 ================================================ */}
      {isFirstLoading && (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-black z-[3]">
          <div className="flex flex-col items-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10">
            <Lottie
              className="w-[80%] h-[80%]"
              animationData={lottie.gameLoading}
            />
            <p className="text-white text-[3vmin] mt-[3vmin]">
              말 많은 사람들을 모으고 있어요...
            </p>
          </div>
        </div>
      )}
      {/* =================================================================================================== */}

      {/* ========================================= 룰렛 모달 ================================================ */}
      <div
        style={showRoullete}
        className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]"
      >
        <div className="relative flex justify-center items-center w-[75vmin] h-[75vmin] z-[3]">
          <canvas
            ref={roulette}
            className="w-[90%] h-[90%] border-[2px] border-[#5523BE] outline outline-[2.2vh] outline-[#7A48DE] rounded-[100%]"
            width="680px"
            height="680px"
          />
          <div className="absolute flex flex-col justify-center items-center gap-[1vmin] w-[20%] h-[20%] bg-black rounded-full z-[4]">
            <button
              onClick={setTitleBtnClickHandler}
              disabled={!isHost}
              className=" text-white text-[3vmin] font-semibold"
            >
              START!
            </button>
          </div>
          <div className="absolute w-fit h-fit top-0 left-[50%] translate-x-[-50%] translate-y-[-10%] z-[4]">
            <icon.RoulettePin className="w-[10vmin] h-[10vmin]" />
          </div>
        </div>
      </div>
      {/* ============================================================================================== */}

      {/* ========================================== 룰렛 결과 모달 창 ======================================== */}
      {isRouletteResult ? (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]">
          <div className="absolute flex flex-col justify-center items-center w-fit h-[21.91%] p-[2.5%] top-[50%] translate-y-[-50%] z-[5] bg-[#2F3131] rounded-[16px]">
            <div className="flex flex-col items-center">
              <p className="text-[2.26vh] text-[white] font-bold">
                토론 주제가 선정되었어요.
              </p>
              <div className="flex items-center w-full text-[#EFFE37] text-[1.76vh] font-bold mt-[2.13%]">
                <icon.IconOnly className="h-[1.76vh]" />
                &nbsp;&nbsp;
                {title}
              </div>
              <p className="text-[1.76vh] text-[#C6C6C6] mt-[2.13%]">
                이 창은 3초후에 닫힙니다.
              </p>
            </div>
            <div className="flex justify-evenly w-full mt-[2.01vh] gap-[0.63vw]">
              {isHost && (
                <>
                  <button
                    className="w-[50%] bg-[#D73232] px-[5%] py-[1.34vh] text-[1.5vh] text-white font-bold rounded-[1.34vh]"
                    onClick={closeRouletteModal}
                  >
                    다시 돌리기
                  </button>
                  <button
                    className="w-[50%] bg-[#EFFE37] px-[5%] py-[1.34vh] text-[1.5vh] font-bold rounded-[1.34vh]"
                    onClick={closeResultModal}
                  >
                    토론 시작하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {/* ============================================================================================== */}

      {/* ========================================== 투표 모달 창 ================================================ */}
      {isGameEnd && !isTeller && (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]">
          <div className="absolute top-[50%] left-[50%] flex flex-col items-center w-fit h-[33.33%] p-[4.01vh] bg-[#2F3131] rounded-[16px] z-[4] translate-y-[-50%] translate-x-[-50%]">
            <p className="text-[2.26vh] text-white font-bold">투표해주세요.</p>
            <p className="text-[2.01vh] text-[#EFFE37] font-bold mt-[3.43vh]">
              {title}
            </p>
            <p className="text-[1.76vh] text-[#C6C6C6] mt-[3.43vh]">
              투표가 {remainTime}초 남았습니다.
            </p>

            <div className="flex w-full h-[10%] justify-between gap-[1vh] mt-[2.01vh]">
              <div
                onClick={voteFirstPersonHandler}
                className={
                  hostDivDesign +
                  " flex justify-center items-center gap-[0.67vh] w-[50%] h-[4.68vh] px-[1.77vw] py-[0.67vh] text-white font-bold rounded-[16px] cursor-pointer"
                }
              >
                {/* <Avatar
                  name={hostInfo.avatar.name}
                  variant="beam"
                  color={hostInfo.avatar.color[0].split(",")}
                  className="h-[2.68vh]"
                /> */}
                <div className="w-[70%] flex flex-col justify-center">
                  {hostDivDesign === "bg-[#14B5FF]" ? (
                    <p>찬성 발언자</p>
                  ) : hostDivDesign === "bg-[#FA3C3C]" ? (
                    <p>반대 발언자</p>
                  ) : null}
                  <div className="w-full text-[1.34vh] whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {hostInfo.nickName}
                  </div>
                </div>
              </div>
              <div
                onClick={voteSecondPersonHandler}
                className={
                  debaterDivDesign +
                  " flex justify-center items-center gap-[0.67vh] w-[50%] h-[4.68vh] px-[1.77vw] py-[0.67vh] text-white font-bold rounded-[16px] cursor-pointer"
                }
              >
                {/* <Avatar
                  name={debaterInfo.avatar.name}
                  variant="beam"
                  color={debaterInfo.avatar.color[0].split(",")}
                  className="h-[2.68vh]"
                /> */}
                <div className="w-[70%] flex flex-col justify-center">
                  {debaterDivDesign === "bg-[#14B5FF]" ? (
                    <p>찬성 발언자</p>
                  ) : debaterDivDesign === "bg-[#FA3C3C]" ? (
                    <p>반대 발언자</p>
                  ) : null}
                  <div className="text-[1.34vh] whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {debaterInfo.nickName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isGameEnd && isTeller && (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]">
          <div className="absolute top-[50%] left-[50%] flex flex-col justify-evenly items-center w-fit h-[33.33%] p-[4.01vh] bg-[#2F3131] rounded-[16px] z-[4] translate-y-[-50%] translate-x-[-50%]">
            <p className="text-[2.26vh] text-white font-bold">
              투표가 진행중입니다.
            </p>
            <p className="text-[2.01vh] text-[#EFFE37] font-bold">{title}</p>
            <p className="text-[1.76vh] text-[#C6C6C6]">
              투표가 {remainTime}초 남았습니다.
            </p>
          </div>
        </div>
      )}
      {/* ================================================================================================ */}

      {/* ========================================== 투표 결과 모달 창 ================================================ */}
      {isVoteEnd && (
        <div className="absolute flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-slate-200/40 z-[3]">
          <div className="absolute flex flex-col items-center justify-evenly w-[592px] h-[61.45vh] p-[4.01vh] bg-[#2F3131]">
            <div className="flex items-center h-[14%]">
              {isTeller ? (
                isDraw ? (
                  <p className="text-[5.52vh] text-[#B484F1] font-bold">DRAW</p>
                ) : isWinner ? (
                  <p className="text-[5.52vh] text-[#EFFE37] font-bold">WIN</p>
                ) : (
                  <p className="text-[5.52vh] text-[#966052] font-bold">LOSE</p>
                )
              ) : isDraw ? (
                <p className="text-[5.52vh] text-[#B484F1] font-bold">DRAW</p>
              ) : (
                <p className="text-[5.52vh] text-white font-bold">FIN</p>
              )}
            </div>
            {/* <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
              패배는 다음의 승리를 위한 발돋움일 뿐
            </p> */}
            {isTeller ? (
              isDraw ? (
                <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
                  막상막하, 둘 다 정말 만만치 않은 실력이네요
                </p>
              ) : isWinner ? (
                <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
                  열띤 토론의 우승자는 바로 당신!
                </p>
              ) : (
                <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
                  패배는 다음의 승리를 위한 발돋움일 뿐
                </p>
              )
            ) : isDraw ? (
              <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
                막상막하, 둘 다 정말 만만치 않은 실력이네요
              </p>
            ) : (
              <p className="w-full h-[2.51vh] text-[2.01vh] text-center text-white font-bold whitespace-between overflow-hidden overflow-ellipsis">
                토론이 끝났습니다!
              </p>
            )}
            <div className="relative w-full h-[39.17%] overflow-hidden">
              {isTeller ? (
                isDraw ? (
                  <icon.DrawIcon className="absolute w-[300%] h-[300%] top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]" />
                ) : isWinner ? (
                  <icon.WinIcon className="absolute w-[300%] h-[270%] top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]" />
                ) : (
                  <icon.LoseIcon className="absolute w-[300%] h-[270%] top-[50%] left-[50%] translate-y-[-51.2%] translate-x-[-50%]" />
                )
              ) : isDraw ? (
                <icon.DrawIcon className="absolute w-[300%] h-[300%] top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]" />
              ) : (
                <icon.WinIcon className="absolute w-[300%] h-[270%] top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]" />
              )}
            </div>
            <div className="w-full flex flex-col items-center gap-[2.03%]">
              <p className="w-full text-[#EFFE37] text-[1.76vh] font-medium whitespace-nowrap overflow-hidden overflow-ellipsis text-center">
                {title}
              </p>
              {!isDraw ? (
                <p className="text-[#C6C6C6] text-[1.56vh] font-medium">
                  토론의 승리자는 &nbsp;
                  <span className="text-white font-bold">
                    {winnerNick}
                  </span>{" "}
                  &nbsp;님 입니다.
                </p>
              ) : (
                <p className="text-[#C6C6C6] text-[1.56vh] font-medium">
                  토론은 &nbsp;
                  <span className="text-white font-bold">{"무승부"}</span>{" "}
                  &nbsp;로 끝났습니다.
                </p>
              )}
            </div>
            <div class="flex justify-center w-full gap-[2.42%]">
              <button
                onClick={goHomeBtnClickHandler}
                className="w-[50%] p-[2.36%] bg-[#777777] text-[#C6C6C6] font-bold rounded-[1.34vh]"
              >
                홈 화면으로
              </button>
              {!isLoser ? (
                <button
                  onClick={continueGameBtnClickHandler}
                  className="w-[50%] p-[2.36%] bg-[#EFFE37] font-bold rounded-[1.34vh]"
                >
                  계속할래요
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {/* ================================================================================================ */}

      {/* ========================================== 게임 창 ================================================ */}
      <div className="flex flex-col gap-[1%] w-[75%] max-w-[1040px] min-w-[787px] h-full py-[20px] pl-[20px]">
        <div className="flex flex-col gap-[2%] h-[68%] p-[1%] bg-[#1E1E1E] rounded-2xl">
          {/* 1. 주제 */}
          <div className="w-full h-[8%]">
            <div className="flex gap-[0.83vw] w-full h-full items-center justify-center pl-[2vmin] rounded-lg text-white text-[1.76vh] font-medium">
              <icon.GameRoomTitleLogo className="h-[1.76vh]" /> {title}
            </div>
          </div>

          {/* 2. 비디오 */}
          <div className="relative flex justify-between items-center gap-[0.63vw] w-full h-[60%]">
            {/* 비디오 html : srcObject는 내 오디오, 비디오 장비,연결 시 자동으로 Play되는 autoPlay 속성 적용 */}
            {/* playsinline : 모바일 기기가 비디오를 재생할 때 전체화면이 되지 않도록 설정 */}
            <div className="absolute w-[8vmin] h-[8vmin] left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[2]">
              <icon.icon_debate_versus width="100%" height="100%" />
            </div>
            <div className="relative w-[50%] h-full bg-black rounded-[4px]">
              {hostInfo.nickName && (
                <TellerIcon userInfo={hostInfo} divDesign={hostDivDesign} />
              )}
              <video
                className="w-full h-full rounded-2xl"
                ref={myVideoBox}
                autoPlay
                playsInline
                muted
              ></video>
            </div>
            <div className="relative w-[50%] h-full bg-black rounded-[4px]">
              {debaterInfo.nickName && (
                <TellerIcon
                  userInfo={debaterInfo}
                  divDesign={debaterDivDesign}
                />
              )}
              <video
                className="  w-full h-full rounded-2xl"
                ref={yourVideoBox}
                autoPlay
                playsInline
                muted
              />
            </div>
          </div>
          {/*----------- Progress bar --------- */}
          <div className="relative flex flex-col justify-evenly items-center w-full h-[32%] rounded-2xl text-white">
            <div className="flex w-full justify-evenly items-center">
              {isStartGame ? (
                <TestProgressbar endGameSignalHandler={endGameSignalHandler} />
              ) : (
                <>
                  <div className="w-full px-[2.97vw]">
                    <div className="bg-[#2F3131] w-full h-[3px] translate-y-[50%] rounded-full"></div>
                  </div>
                </>
              )}
              {/* <Progressbar endGameSignalHandler={endGameSignalHandler} /> */}
            </div>
            {/*---------------------------------- */}

            {/*-------------- 프롬프트 --------------*/}
            <div className="flex flex-col justify-center items-center w-full h-[50%] text-[#C6C6C6] rounded-2xl text-[1.59vh]">
              {isStartGame ? (
                <Prompt title={title} />
              ) : (
                <div className="flex flex-col text-center">
                  {hostInfo.nickName &&
                  debaterInfo.nickName &&
                  jurorInfo.length !== 0 ? (
                    <p className="text-[#EFFE37] font-semibold">
                      아래 시작 버튼을 눌러 시작해주세요!
                    </p>
                  ) : (
                    <>
                      <p>
                        안녕하세요. 다른 참가자들이 들어오기까지 좀 더
                        기다려주세요
                      </p>
                      <p className="text-[#EFFE37] font-semibold">
                        (토론자 2명과 배심원이 적어도 1명 들어와야 시작이
                        가능합니다.)
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/*------------------------------------*/}
          </div>
        </div>
        {/*----------- 주제 + 비디오 ---------- */}

        {/*-------------- 배심원 창 --------------*/}
        <div className="flex items-center w-full h-[3%] gap-[0.42vw] text-[1.5vh] text-white font-medium">
          <icon.UserIcon className="h-[1.5vh]" />
          <p>배심원</p>
          <p>({jurorInfo.length}/5)</p>
        </div>
        <div className="grid grid-cols-5 grid-rows-1 w-full h-[15%] gap-2">
          {jurorInfo &&
            jurorInfo.map((userInfo) => {
              const { nickName, avatar, userId } = userInfo;
              return (
                <UserBox
                  key={nickName}
                  nickname={nickName}
                  avatar={avatar}
                  userId={userId}
                />
              );
            })}
        </div>
        {/*-------------------------------------*/}
        <div className="flex w-full h-[5%]">
          {/* 3. 게임시작 */}
          {isHost && (
            <button
              onClick={gameStartBtnClickHandler}
              style={hideStartBtn}
              disabled={
                !(
                  hostInfo.nickName &&
                  debaterInfo.nickName &&
                  jurorInfo.length !== 0
                )
              }
              className={
                hoverStyleOnGameStartBtn +
                " flex justify-center items-center w-[20%] h-full bg-[#EFFE37] rounded-full ml-auto text-[2.01vh] font-semibold disabled:bg-[#919191] disabled:text-[#505050]"
              }
            >
              <p>시작</p>
              {hostInfo.nickName &&
              debaterInfo.nickName &&
              jurorInfo.length !== 0 ? (
                <icon.ArrowRight className="h-[3vh]" />
              ) : (
                <icon.ArrowRightDisabled className="h-[3vh]" />
              )}
            </button>
          )}
        </div>
        {/*------------- 기능 버튼들 ------------*/}
        <div className="flex justify-between w-full h-[7%] px-[1%]">
          <div className="flex w-[40%] gap-[8%]">
            {/* 1. 비디오 켜기/끄기 */}
            {isTeller && (
              <button className="text-white my-2">
                {isVideoOff ? (
                  <icon.VideoOn
                    // onClick={cameraOffClickHandler}
                    width="8vh"
                    height="100%"
                  />
                ) : (
                  <icon.VideoOff
                    // onClick={cameraOffClickHandler}
                    width="8vh"
                    height="100%"
                  />
                )}
              </button>
            )}

            {/* 2. 오디오 켜기/끄기 */}
            {isTeller && (
              <button className="text-white my-2">
                {isMuted ? (
                  <icon.MuteOff
                    // onClick={muteClickHandler}
                    width="8vh"
                    height="100%"
                  />
                ) : (
                  <icon.Mute
                    // onClick={muteClickHandler}
                    width="8vh"
                    height="100%"
                  />
                )}
              </button>
            )}
          </div>

          {/* 4. 방 나가기 */}
          <div className="flex">
            <button
              className="text-white my-2 ml-auto"
              onClick={gameOutBtnClick}
              disabled={isStartGame}
            >
              <icon.Exit width="8vh" height="100%" />
            </button>
          </div>
        </div>
        {/*--------------------------------------------*/}
      </div>
      {/* =============================================================================================== */}

      {/* ========================================= 채팅 박스 ================================================ */}
      <div className="flex w-[25%] max-w-[380px] min-w-[282px] flex-col my-[20px] mr-[20px]">
        <div className="w-full h-[5%] px-[1.34vh] pt-[1.34vh] bg-[#1B1B1B] text-white text-[2vmin] rounded-t-[12px]">
          <p className="w-fit">채팅</p>
        </div>
        <form
          className="flex flex-col ml-auto  w-full h-[95%] px-[1.34vh] pb-[1.34vh] bg-[#1B1B1B] rounded-b-[12px]"
          onSubmit={chatSubmitHandler}
        >
          <div
            ref={chatContainerRef}
            className="h-[95%] break-words overflow-x-hidden overflow-y-auto scrollbar-hide"
          >
            {/* ul tag의 이름으로 nickName state를 배열로 만들어 마지막 값이 들어오도록 */}
            <ul>
              {totalChat?.map((chat, index) => {
                if (chat.split(":")[0] === "You") {
                  return (
                    <>
                      <li
                        key={chat}
                        className="w-fit max-w-[80%] text-white text-[1.7vh] ml-auto mt-[2.01vh] px-[0.5vh] rounded-[1vh]"
                      >
                        {chat.split(":")[0]}
                      </li>
                      <li
                        key={index}
                        className="w-fit max-w-[80%] bg-[#2F3131] text-[#C6C6C6] text-[1.7vh] ml-auto mt-[0.67vh] px-[0.8vh] py-[0.5vh] rounded-[1vh]"
                      >
                        {chat.split(":")[1]}
                      </li>
                    </>
                  );
                }
                return (
                  <>
                    <li
                      key={chat}
                      className="w-fit max-w-[80%] text-white text-[1.7vh] mt-[2.01vh] px-[0.5vh] rounded-[1vh]"
                    >
                      {chat.split(":")[0]}
                    </li>
                    <li
                      key={index}
                      className="w-fit max-w-[80%] bg-[#2F3131] text-[#C6C6C6] text-[1.7vh] mt-[0.67vh] px-[0.8vh] py-[0.5vh] rounded-[1vh]"
                    >
                      {chat.split(":")[1]}
                    </li>
                  </>
                );
              })}
            </ul>
          </div>
          {/* <div className="flex w-full h-[5%] border border-[#C6C6C6] gap-[10px] p-2 mt-2 rounded-2xl active:outline-[2px] active:outline-[#D7E33B]"> */}
          <input
            className="w-full h-[5%] px-[1.17vh] mt-[2vh] border border-[#C6C6C6] rounded-2xl bg-[#1B1B1B] text-white text-[1.17vh] font-medium focus:outline focus:outline-[#D2DE37] focus:border focus:border-[#D2DE37] focus:ring-0"
            ref={chatInputValue}
            disabled={isStartGame && !isTeller}
            type="text"
            required
            placeholder="메세지를 입력해주세요"
          />
          {/* </div> */}
        </form>
      </div>

      {/* ==============================================================================================*/}
    </div>
  );
}

export default GameRoom;

// 배심원으로 들어온 유저 보여주는 컴포넌트
function UserBox({ nickname, avatar, userId }) {
  const { userId: myUserId } = jwt_decode(
    sessionStorage.getItem("Authorization")
  );
  const meModifier =
    myUserId === userId ? { visibility: "visible" } : { display: "none" };
  return (
    <div className="relative flex flex-col h-full rounded-lg text-white justify-center items-center text-[2vmin]">
      <p
        style={meModifier}
        className="absolute top-0 left-0 text-[1.8vh] text-[#EFFE37] font-bold"
      >
        나
      </p>
      <Avatar
        size="6vh"
        name={avatar.name}
        variant="beam"
        colors={avatar.color[0].split(",")}
      />
      <div className="w-full text-[1.8vmin] mt-[1vmin] text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
        {nickname}
      </div>
    </div>
  );
}

// 토론자 및 호스트 유저아이콘 컴포넌트
function TellerIcon({ userInfo, divDesign }) {
  const { userId: myUserId } = jwt_decode(
    sessionStorage.getItem("Authorization")
  );
  const meModifier =
    myUserId === userInfo.userId
      ? { visibility: "visible" }
      : { display: "none" };

  const modifierStyle =
    divDesign === "bg-black" ? { display: "none" } : { visibility: "visible" };
  let modifier = "";
  modifier = divDesign === "bg-[#14B5FF]" ? "찬성 발언자" : "반대 발언자";
  return (
    <div
      className={
        divDesign +
        " absolute w-full h-[17.58%] flex justify-between items-center bottom-0 z-[2] rounded-b-[4px]"
      }
    >
      <div className="flex items-center gap-[1.59%] ml-[1.59%]">
        <Avatar
          size="2.67vh"
          name={userInfo.avatar.name}
          variant="beam"
          colors={userInfo.avatar.color[0].split(",")}
        />
        <div className="flex flex-col justify-center ml-[0.42vw]">
          <p style={modifierStyle} className="text-[1.17vh] font-medium">
            {modifier}
          </p>
          <div className="w-full text-center whitespace-nowrap overflow-hidden overflow-ellipsis text-[1.4vh] text-white font-bold">
            <span
              style={meModifier}
              className="mr-[4px] text-[1.4vh] text-[#EFFE37] font-bold"
            >
              나
            </span>
            {userInfo.nickName}
          </div>
        </div>
      </div>

      <div className="flex gap-[0.83vw] text-[1.17vh] text-white font-medium mr-[1.59%]">
        <div className="flex flex-col gap-[0.41vh] items-center">
          <icon.likeButton className="h-[2.01vh] cursor-pointer" />0
        </div>
        <div className="flex flex-col gap-[0.41vh] items-center">
          <icon.hateButton className="h-[2.01vh] cursor-pointer" />0
        </div>
        <div className="flex flex-col gap-[0.41vh] items-center">
          <icon.whyButton className="h-[2.01vh] cursor-pointer" />0
        </div>
      </div>
    </div>
  );
}
