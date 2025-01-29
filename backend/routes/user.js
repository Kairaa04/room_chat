const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
// const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
// var TMClient = require("textmagic-rest-client");
const soni = "0426";
//Mobile Verification

//Mobile Verification
// Route to verify OTP
let OtpIs;
function generateOTP(length = 6) {
  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
}
const OTP_EXPIRATION_TIME = 1 * 60 * 1000; // 1 minutes in milliseconds
let otpData = {}; // Store OTP data for simplicity (in a real app, use a database)
router.post("/send-otp", async (req, res) => {
  let { email } = req.body;
  OtpIs = generateOTP(); // Generate new OTP for every request
  let expiresAt = Date.now() + OTP_EXPIRATION_TIME; // Set expiration time

  // Store the OTP and its expiration time (e.g., in a database or in-memory)
  console.log(OtpIs);

  otpData[email] = { otp: OtpIs, expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "chouhankaira23@gmail.com",
      pass: "vqyt qxxw iyhv btnw",
    },
  });

  async function main() {
    const info = await transporter.sendMail({
      from: "chouhankaira23@gmail.com",
      to: email,
      subject: "Your OTP Code is Here! 🎉",
      text: `Hey there! Your OTP is: ${OtpIs}. It’s valid for 5 minutes!`,
      html: `<p>Your OTP is: <strong>${OtpIs}</strong>.</p>
             <p>This OTP is valid for 1 minutes. Please use it promptly!</p>`,
    });
    console.log("Message sent: %s", info.messageId);
    res.send("OTP sent to your email.");
  }

  main().catch(console.error);
});

router.post("/verify-otp", async (req, res) => {
  let { otp } = req.body;
  console.log("userside otp", otp);
  console.log(OtpIs);
  if (otp == OtpIs) {
    res.status(201).send("User verified");
  } else if (otp !== OtpIs) {
    res.status(400).json({ message: "Wrong otp or otp is expired" });
  }
});
// Signup route
router.post("/signup", async (req, res) => {
  try {
    let { name, password, email, mobile } = req.body; // Accept both email and mobile

    // Check if username is already taken
    let existingUsername = await User.findOne({ name });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username is already taken" });
    }

    // Check if email or mobile already exists
    let existingEmail = email ? await User.findOne({ email }) : null;
    let existingMobile = mobile ? await User.findOne({ mobile }) : null;

    if (existingEmail) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    if (existingMobile) {
      return res
        .status(400)
        .json({ msg: "Mobile number is already registered" });
    }

    // Proceed to create the user if no existing email/mobile found
    const hashedPassword = await bcrypt.hash(password, 10);
    let data = { name, password: hashedPassword };

    if (email) {
      data.email = email;
    } else if (mobile) {
      data.mobile = mobile;
    }

    await User.create(data);
    res.status(201).send("User added successfully");
  } catch (error) {
    res.status(500).send("Error adding user: " + error.message);
  }
});

// Login route

router.post("/login-otp", async (req, res) => {
  let { email } = req.body;
  let user;
  // Check for user based on email or mobile
  if (email) {
    user = await User.findOne({ email });
  } else if (mobile) {
    user = await User.findOne({ mobile });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  OtpIs = generateOTP(); // Generate new OTP for every request
  let expiresAt = Date.now() + OTP_EXPIRATION_TIME; // Set expiration time

  // Store the OTP and its expiration time (e.g., in a database or in-memory)
  otpData[email] = { otp: OtpIs, expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "internapp01@gmail.com",
      pass: "ugfk gbbn rmzu rbvr",
    },
  });

  async function main() {
    const info = await transporter.sendMail({
      from: "internapp01@gmail.com",
      to: email,
      subject: "Your OTP Code is Here! 🎉",
      text: `Hey there! Your OTP is: ${OtpIs}. It’s valid for 5 minutes!`,
      html: `<p>Your OTP is: <strong>${OtpIs}</strong>.</p>
             <p>This OTP is valid for 1 minutes. Please use it promptly!</p>`,
    });
    console.log("Message sent: %s", info.messageId);
    res.send("OTP sent to your email.");
  }

  main().catch(console.error);
});

router.post("/login", async (req, res) => {
  try {
    const { email, mobile, password } = req.body; // Accept both email and mobile
    let user;
    // Check for user based on email or mobile
    if (email) {
      user = await User.findOne({ email });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      console.log("loggedin");
      const token = jwt.sign({ email: user.email || user.mobile }, "abcdef");
      res.cookie("token", token, { httpOnly: true });
      return res.status(200).json({ message: "Login successful", user });
    } else {
      return res.status(401).json({ message: "Password does not match" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error during login", error: err.message });
  }
});

// Search route
router.get("/search", async (req, res) => {
  const data = await User.find();
  res.send(data);
});

module.exports = router; // Make sure you're exporting the router
