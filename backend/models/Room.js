// models/Room.js
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Room", RoomSchema);
