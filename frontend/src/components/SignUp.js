import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
// import { initializeApp, getApps, getApp, getAuth } from "firebase/app";
const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSouthIndia, setIsSouthIndia] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailOrMobileTaken, setEmailOrMobileTaken] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState(false);
  const [timer, setTimer] = useState(60); // 2-minute timer (120 seconds)
  const [resendDisabled, setResendDisabled] = useState(true); // Initially disabled
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // Success alert state
  // Import the functions you need from the SDKs you need

  // Function to fetch location and apply the theme
  useEffect(() => {
    const applyThemeBasedOnLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const region = response.data.region;
        const southIndianStates = [
          "Tamil Nadu",
          "Kerala",
          "Karnataka",
          "Uttar Pradesh",
          "Telangana",
        ];
        if (southIndianStates.includes(region)) {
          document.body.setAttribute("data-bs-theme", "light");
          setIsSouthIndia(true);
        } else {
          document.body.setAttribute("data-bs-theme", "dark");
          setIsSouthIndia(false);
        }
      } catch (error) {
        console.error("Error fetching location", error);
        document.body.setAttribute("data-bs-theme", "dark");
        setIsSouthIndia(false);
      } finally {
        setLoading(false);
      }
    };

    applyThemeBasedOnLocation();

    return () => {
      document.body.removeAttribute("data-bs-theme");
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let countdownInterval;
    if (isOtpSent && timer > 0) {
      countdownInterval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false); // Enable "Resend OTP" after 2 minutes
      alert("1 minute is up! You can now resend the OTP.");
    }

    return () => clearInterval(countdownInterval); // Cleanup interval on component unmount
  }, [isOtpSent, timer]);
  //Mobile

  //Mobile
  // Function to send OTP
  const sendOTP = async () => {
    try {
      // alert("OTP sent successfully");
      setIsOtpSent(true); // Set OTP sent state to true
      setResendDisabled(true); // Disable the "Resend OTP" button
      setTimer(60); // Reset timer to 1 minutes
      setShowSuccessAlert(true); // Show the success alert
      setTimeout(() => {
        setShowSuccessAlert(false); // Hide alert after 5 seconds
      }, 5000);
      const response = await axios.post(
        "http://localhost:5000/api/user/send-otp",
        {
          email: email, // Use email or mobile based on user input
        }
      );
    } catch (error) {
      console.error("Error sending OTP", error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  // Function to verify OTP
  const verifyOTP = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/verify-otp",
        {
          otp: otp, // Use email or mobile based on user input
        }
      );
      if (response.status === 201) {
        setVerifiedOtp(true);
        alert("User verified");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Display the backend message
      } else {
        console.error("Error verifying OTP", error);
        setError("Failed to verify OTP. Please try again.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (verifiedOtp) {
        alert("Signup successful!");
        const response = await axios.post(
          "http://localhost:5000/api/user/signup",
          {
            name,
            [isSouthIndia ? "email" : "mobile"]: isSouthIndia ? email : mobile,
            password,
          }
        );
        setName("");
        setEmail("");
        setMobile("");
        setPassword("");
        setOtp("");
        setUsernameTaken(false);
        setEmailOrMobileTaken(false);
        setVerifiedOtp(false);
      } else {
        alert("First do the OTP verification");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.msg;
        if (errorMessage === "Username is already taken") {
          setUsernameTaken(true);
          setEmailOrMobileTaken(false);
        } else if (errorMessage === "Mobile number is already registered") {
          setEmailOrMobileTaken(true);
          setUsernameTaken(false);
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row justify-content-center">
        <div className="col-md-19">
          <div className="card p-4 shadow-lg">
            <h2 className="mb-4">Signup</h2>

            {/* Success Alert */}
            {showSuccessAlert && (
              <div className="alert alert-success" role="alert">
                OTP sent successfully—check it out!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {isSouthIndia ? (
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="mobile"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              )}

              {usernameTaken && (
                <div className="mb-3 text-danger">Username already taken.</div>
              )}
              {emailOrMobileTaken && (
                <div className="mb-3 text-danger">Already had an account.</div>
              )}
              {error && <div className="mb-3 text-danger">{error}</div>}

              <div className="mb-3">
                <label htmlFor="otp" className="form-label">
                  OTP
                </label>
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control me-2"
                    id="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={!isOtpSent}
                  />
                  {!isOtpSent ? (
                    // Show "Send OTP" button initially
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={sendOTP}
                    >
                      Send OTP
                    </button>
                  ) : (
                    // Show "Resend OTP" button after OTP is sent
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={sendOTP}
                      disabled={resendDisabled} // Disable until the timer expires
                    >
                      {resendDisabled ? ` Resend  (${timer}s)` : "Resend OTP"}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary mb-3"
                onClick={verifyOTP}
                disabled={!isOtpSent}
              >
                Verify OTP
              </button>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Signup
              </button>
            </form>
            <div className="mt-3">
              <span>Already have an account? </span>
              <button
                className="btn btn-link p-0"
                onClick={() => navigate("/Login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
