import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import "./CreateRoom.css"; // Ensure the CSS is properly imported

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (roomName && userName) {
      try {
        const response = await axios.post("http://localhost:5000/createRoom", {
          roomName,
        });
        const { roomId } = response.data;
        navigate(`/groups`); // After room creation, navigate to groups page
      } catch (error) {
        console.error("Error creating room:", error);
      }
    }
  };

  return (
    <div className="create-room-container">
      {/* Added the create-room-card class */}
      <div className="create-room-card">
        <h2>Create a New Chat Room</h2>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
      </div>
    </div>
  );
};

export default CreateRoom;
