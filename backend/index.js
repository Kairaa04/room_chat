const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const chatRoutes = require("./routes/ChatRoutes");
const Chat = require("./models/Chat");
const Room = require("./models/Room"); // Import Room model
const http = require("http");
const userRoutes = require("./routes/user");
const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());
app.use("/api/user", userRoutes);
// Connect to MongoDB

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/chat-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store the Socket.IO instance in the app object to access it in routes
app.set("socketio", io);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected");

  // Join a specific room
  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
  });

  // Listen for when a message is delivered to a client
  socket.on("messageDelivered", (data) => {
    Chat.findByIdAndUpdate(data.messageId, { status: "delivered" }, (err) => {
      if (err) console.error(err);
      io.to(data.roomId).emit("updateMessageStatus", {
        messageId: data.messageId,
        status: "delivered",
      });
    });
  });

  // Listen for when a message is seen by the recipient
  socket.on("messageSeen", (data) => {
    Chat.findByIdAndUpdate(data.messageId, { status: "seen" }, (err) => {
      if (err) console.error(err);
      io.to(data.roomId).emit("updateMessageStatus", {
        messageId: data.messageId,
        status: "seen",
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Create Room Endpoint
app.post("/createRoom", async (req, res) => {
  const { roomName } = req.body;
  try {
    const room = new Room({ roomName }); // Create a new Room document
    await room.save(); // Save the room to MongoDB
    res.status(201).json({ roomId: room._id, roomName }); // Return the room's ID and name
  } catch (error) {
    res.status(500).json({ error: "Error creating room" });
  }
});

// Get all groups (rooms) endpoint
app.get("/groups", async (req, res) => {
  try {
    const groups = await Room.find(); // Fetch all rooms from MongoDB
    res.status(200).json(groups); // Send the groups list as JSON
  } catch (error) {
    res.status(500).json({ error: "Error fetching groups" });
  }
});

// Use chat routes
app.use("/api/chats", chatRoutes);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
