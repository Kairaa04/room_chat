const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  roomId: String,
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // Default status is 'pending'
});

module.exports = mongoose.model("Chat", chatSchema);
