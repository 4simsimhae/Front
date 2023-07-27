/// webrtc
import { useState, useEffect } from "react";
import SimplePeer from "simple-peer";
import io from "socket.io-client";
// export function useWebRTC({ isTeller, roomNumber, socket }) {
export function useWebRTC() {
  // console.log(roomNumber);
  // console.log(isTeller);
  const [peer, setPeer] = useState(null);
  const [socket, setSocket] = useState(null); //코드수정후삭제예정
  const [roomNumber, setRoomNumber] = useState(""); // 방 번호 상태, 삭제예정
  // const [isTeller] = state;
  useEffect(() => {
    // 웹RTC 초기화 및 관련 이벤트 처리 등을 수행하는 코드
    const initializeWebRTC = () => {
      // Socket.IO 연결 설정
      const socket = io(`${process.env.REACT_APP_BACKEND_SERVER_URL}`);
      setSocket(socket);
      // 웹RTC 초기화
      const peer = new SimplePeer({
        initiator: true,
        // initiator: isTeller, // 여기서 발언자구분
      });
      // Offer를 상대방에게 전송하는 로직
      peer.on("signal", (offer) => {
        // 여기에서 실시간 채팅을 통해 상대방에게 Offer를 전달하는 코드를 작성해야합니다.
        // Socket.IO를 이용하는 경우에는 소켓을 통해 Offer를 전달할 수 있습니다.
        // 예를 들어, socket.emit("offer", offer);와 같이 Offer를 전달합니다.
        socket.emit("offer", offer, roomNumber);
        // socket.emit("offer", offer);
      });
      // 원격 비디오 스트림 연결-연결id 값에 연결
      peer.on("stream", (stream) => {
        const yourVideo = document.getElementById("yourVideo");
        yourVideo.srcObject = stream;
      });
      setPeer(peer);
      // 백엔드와 연결 확인
      socket.on("connect", () => {
        console.log("백엔드connect");
      });
      socket.on("disconnect", () => {
        console.log("백엔드disconnect");
      });
      // 기타 웹RTC 초기화 후 추가 작업
    };
    initializeWebRTC();
    return () => {
      // 웹RTC 정리 작업 등
      if (peer) {
        peer.destroy(); // 웹RTC 연결 종료
      }
      if (socket) {
        socket.disconnect(); // Socket.IO 연결 종료
      }
    };
  }, [peer, roomNumber, socket]);
  useEffect(() => {
    // Offer를 수신하고 처리하는 로직-on 메서드를 사용
    if (socket) {
      socket.on("offer", (offer) => {
        // 웹RTC 연결 응답 처리
        if (peer) {
          peer.signal(offer);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("offer");
      }
    };
  }, [socket, peer]);
  // 방 번호를 서버에서 받아오는 로직
  useEffect(() => {
    if (socket) {
      socket.on("roomNumber", (receivedRoomNumber) => {
        setRoomNumber(receivedRoomNumber);
      });
    }
    return () => {
      if (socket) {
        socket.off("roomNumber");
      }
    };
  }, [socket]);
  // //중복해결답변..
  // useEffect(() => {
  //   if (socket) {
  //     const handleEvent = (event, callback) => {
  //       socket.on(event, callback);
  //       return () => {
  //         socket.off(event, callback);
  //       };
  //     };
  //     const handleOffer = (offer) => {
  //       if (peer) {
  //         peer.signal(offer);
  //       }
  //     };
  //     const handleRoomNumber = (receivedRoomNumber) => {
  //       setRoomNumber(receivedRoomNumber);
  //     };
  //     const unsubscribeOffer = handleEvent("offer", handleOffer);
  //     const unsubscribeRoomNumber = handleEvent("roomNumber", handleRoomNumber);
  //     return () => {
  //       unsubscribeOffer();
  //       unsubscribeRoomNumber();
  //     };
  //   }
  // }, [socket, peer]);
  // 추가적인 웹RTC 관련 유틸리티 함수나 훅들
  return {
    peer,
    // 추가적인 반환값
  };
}
