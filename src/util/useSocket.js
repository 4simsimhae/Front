import { io } from "socket.io-client";

const URL = process.env.REACT_APP_BACKEND_SERVER_URL;

export const useSocket = () => {
  const socket = io(URL, {
    withCredentials: true,
    query: {
      token: sessionStorage.getItem("Authorization"),
    },
  });
  return socket;
};

export const useRoomListSocket = () => {
  const socket = io(`${URL}/roomList`, {
    withCredentials: true,
    query: {
      token: sessionStorage.getItem("Authorization"),
    },
  });
  return socket;
};
