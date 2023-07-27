import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Category from "../pages/Category";
import Home from "../pages/Home";
import GameRoom from "../pages/GameRoom";
import RoomList from "../pages/RoomList";
import Kakao from "../pages/kakaoLogin/Kakao";
import SocialKakao from "../pages/kakaoLogin/SocialKakao";
import Prompt from "../components/feature/Prompt";
import TermsOfUse from "../pages/TermsOfUse";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/room/:id" element={<GameRoom />} />
        <Route path="/roomlist" element={<RoomList />} />
        {/* <Route path="/room/:id" element={<OneRoom />} /> */}

        <Route path="/auth/kakao/callback" element={<Kakao />} />
        <Route path="/socialkakao" element={<SocialKakao />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/tos" element={<TermsOfUse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
