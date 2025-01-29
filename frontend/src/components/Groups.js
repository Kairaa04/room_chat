import React, { useEffect, useState } from "react";
import axios from "axios";
// import "./Groups.css"; // Ensure the CSS is properly imported

import { useNavigate } from "react-router-dom"; // Import useNavigate

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate(); // Use navigate for routing

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:5000/groups");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  const goToChatRoom = (groupId, groupName) => {
    navigate(`/chat/${groupId}`, {
      state: { groupName, userName: "YourUserName" },
    }); // Adjust userName to be dynamic based on logged-in user
  };

  return (
    <div className="groups-container">
      <h2>Available Groups</h2>
      <ul>
        {groups.map((group) => (
          <li
            key={group._id}
            onClick={() => goToChatRoom(group._id, group.roomName)}
          >
            {group.roomName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Groups;
