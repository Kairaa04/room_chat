import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import cryptoJS from "crypto-js";
import io from "socket.io-client";
// import "./ChatRoom.css"; // Ensure the CSS is properly imported

const socket = io("http://localhost:5000");

const ChatRoom = () => {
  const { roomId } = useParams(); // Get roomId from URL params
  const location = useLocation(); // Get state passed from navigation
  const { userName, roomName } = location.state; // Extract userName and roomName
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const SECRET_KEY = "supersecretkey123";

  useEffect(() => {
    socket.emit("joinRoom", { roomId, userName });

    // Fetch previous messages from the server
    axios.get(`http://localhost:5000/api/chats/${roomId}`).then((res) => {
      const decryptedMessages = res.data.map((chat) => ({
        ...chat,
        message: cryptoJS.AES.decrypt(chat.message, SECRET_KEY).toString(
          cryptoJS.enc.Utf8
        ),
      }));
      setMessages(decryptedMessages);
    });

    // Listen for new messages via Socket.IO
    socket.on("newMessage", (newMessage) => {
      const decryptedMessage = {
        ...newMessage,
        message: cryptoJS.AES.decrypt(newMessage.message, SECRET_KEY).toString(
          cryptoJS.enc.Utf8
        ),
      };
      setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
    });

    // Update message status when it's delivered or seen
    socket.on("updateMessageStatus", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    return () => socket.disconnect();
  }, [roomId, userName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const encryptedMessage = cryptoJS.AES.encrypt(
        message,
        SECRET_KEY
      ).toString();

      // Send message to the server
      axios
        .post("http://localhost:5000/api/chats", {
          roomId,
          username: userName,
          message: encryptedMessage,
        })
        .then((res) => {
          // Emit the message via Socket.IO for real-time updates
          socket.emit("sendMessage", {
            roomId,
            username: userName,
            message: encryptedMessage,
            timestamp: new Date(),
          });

          // Initially, mark the message as 'pending'
          const newMessage = {
            _id: res.data._id, // Assuming the response returns the message ID
            username: userName,
            message,
            timestamp: new Date(),
            status: "pending",
          };

          setMessages((prevMessages) => [...prevMessages, newMessage]);
          setMessage("");
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSeenMessage = () => {
    // Emit event when messages are seen by the user
    messages.forEach((msg) => {
      if (msg.username !== userName && msg.status !== "seen") {
        socket.emit("messageSeen", { messageId: msg._id, roomId });
      }
    });
  };

  useEffect(() => {
    handleSeenMessage();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.username === userName ? "sent" : "received"
            }`}
          >
            <strong>{msg.username === userName ? "You" : msg.username}</strong>:{" "}
            {msg.message}
            <small>
              {formatTime(msg.timestamp)}
              {/* Render ticks based on message status */}
              {msg.username === userName && (
                <>
                  {msg.status === "pending" && (
                    <span className="single-tick">✔</span>
                  )}
                  {msg.status === "delivered" && (
                    <span className="double-tick gray-tick">✔✔</span>
                  )}
                  {msg.status === "seen" && (
                    <span className="double-tick blue-tick">✔✔</span>
                  )}
                </>
              )}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
