import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useNotGoBack(state) {
  const { roomNumber } = state;
  const navigate = useNavigate();
  useEffect(() => {
    // console.log("방에 입장하셨습니다.");
    const handlePopstate = () => {
      console.log("popstate");
      console.log(window.history);
      navigate(`/room/${roomNumber}`);
    };
    window.history.pushState(null, "", "");
    window.addEventListener("popstate", handlePopstate);

    /* 새로고침 감지  
   const handleBeforeUnload = (event) => {
      event.preventDefault();
      alert("새로고침되었습니다.");
      // event.returnValue = ''; // 이 부분은 브라우저에 메시지를 표시할 수도 있습니다.
    }; 

    window.addEventListener("beforeunload", handleBeforeUnload);
    */
    return async () => {
      window.removeEventListener("popstate", handlePopstate);
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      // console.log("나가졌습니다.");
    };
  }, [navigate, roomNumber]);
}
