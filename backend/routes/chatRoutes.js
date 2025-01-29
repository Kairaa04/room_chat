const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();
const cryptoJS = require("crypto-js");

const SECRET_KEY = "supersecretkey123";

// Route to fetch chat messages for a specific room
router.get("/:roomId", async (req, res) => {
  try {
    const chats = await Chat.find({ roomId: req.params.roomId });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to handle sending messages
router.post("/", async (req, res) => {
  const { roomId, username, message } = req.body;

  try {
    const newChat = new Chat({
      roomId,
      username,
      message, // Save encrypted message
    });

    await newChat.save();

    // Broadcast the new message to other clients in the room via Socket.IO
    const io = req.app.get("socketio");
    io.to(roomId).emit("newMessage", {
      username,
      message, // Send encrypted message to clients
      timestamp: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
