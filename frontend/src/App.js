import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import CreateRoom from "./components/CreateRoom"; // Create room page
import Groups from "./components/Groups"; // See groups page
import ChatRoom from "./components/ChatRoom"; // See groups page
import SignUp from "./components/SignUp"; // See groups page
import Login from "./components/Login"; // See groups page
import Video from "./components/Video"; // See groups page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/Sign-up" element={<SignUp />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Video" element={<Video />} />
      </Routes>
    </Router>
  );
};

export default App;
