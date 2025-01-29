import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState(""); // State for mobile number
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); // State for OTP
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP has been sent
  const [isSouthIndia, setIsSouthIndia] = useState(false); // Track if user is in South India
  const [loading, setLoading] = useState(true); // Track loading state
  const [timer, setTimer] = useState(60); // 2-minute timer (120 seconds)
  const [resendDisabled, setResendDisabled] = useState(true); // Initially disabled
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // Success alert state
  const [verifiedOtp, setVerifiedOtp] = useState(false);

  useEffect(() => {
    const applyThemeBasedOnLocation = async () => {
      try {
        // Fetch the location data using the IP API
        const response = await axios.get("https://ipapi.co/json/");
        const region = response.data.region; // Get the region/state from the response

        // List of South Indian states
        const southIndianStates = [
          "Tamil Nadu",
          "Kerala",
          "Karnataka",
          "Madhya Pradesh",
          "Telangana",
        ];

        // Check if the region is in South Indian states
        if (southIndianStates.includes(region)) {
          document.body.setAttribute("data-bs-theme", "light"); // Apply white theme for South India
          setIsSouthIndia(true); // Set South India flag
        } else {
          document.body.setAttribute("data-bs-theme", "dark"); // Apply dark theme for other regions
          setIsSouthIndia(false); // Clear South India flag
        }
      } catch (error) {
        console.error("Error fetching location", error);
        // Fallback to dark mode in case of an error
        document.body.setAttribute("data-bs-theme", "dark");
        setIsSouthIndia(false); // Clear South India flag
      } finally {
        setLoading(false); // Update loading state
      }
    };

    applyThemeBasedOnLocation();

    return () => {
      document.body.removeAttribute("data-bs-theme"); // Clean up on component unmount
    };
  }, []);

  // const handleSendOtp = async (req, res) => {
  //   const { name } = req.body;
  //   const response = await axios.get("login-otp", {
  //     name,
  //   });
  // };

  useEffect(() => {
    let countdownInterval;

    if (isOtpSent && timer > 0 && !verifiedOtp) {
      // Start the countdown only if OTP is sent and not yet verified
      countdownInterval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !verifiedOtp) {
      // Show alert only if the timer reaches 0 and OTP is not verified
      setResendDisabled(false); // Enable "Resend OTP" after the timer expires
      alert("1 minute is up! You can now resend the OTP.");
    }

    // Cleanup the interval on unmount or when OTP is verified
    return () => clearInterval(countdownInterval);
  }, [isOtpSent, timer, verifiedOtp]);

  const handleSendOtp = async () => {
    try {
      setIsOtpSent(true); // Set OTP sent state to true
      setResendDisabled(true); // Disable the "Resend OTP" button
      setTimer(60); // Reset timer to 1 minutes
      setShowSuccessAlert(true); // Show the success alert
      setTimeout(() => {
        setShowSuccessAlert(false); // Hide alert after 5 seconds
      }, 5000);
      // Call your API to send the OTP
      const payload = isSouthIndia ? { email } : { mobile };
      await axios.post("http://localhost:5000/api/user/login-otp", payload);
      setIsOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP", error);
      setError("Failed to send OTP. Please try again.");
    }
  };
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

        // Stop the timer and disable the resend button after OTP is verified
        setResendDisabled(true); // Disable the "Resend OTP" button
        setTimer(0); // Reset the timer to 0 to stop countdown
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/login",
        {
          email,
          mobile,
          password,
        }
      );
      if (verifiedOtp && response.status === 200) {
        alert("login successfull");
        navigate("/GroupForm");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert(error.response.data.message); // Display the backend message
      } else {
        console.error("Error verifying OTP", error);
        setError("Failed to verify OTP. Please try again.");
      }
    }
  };
  // Early return if loading
  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row justify-content-center">
        <div className="col-md-19">
          <div className="card p-4 shadow-lg">
            <h2 className="mb-4">Login</h2>
            {showSuccessAlert && (
              <div className="alert alert-success" role="alert">
                OTP sent successfully—check it out!
              </div>
            )}
            <form onSubmit={handleLogin}>
              {/* Conditional Rendering for Email or Mobile */}
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
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </button>
                  ) : (
                    // Show "Resend OTP" button after OTP is sent
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSendOtp}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
            <div className="mt-3">
              <span>Create a new account? </span>
              <button
                className="btn btn-link p-0"
                onClick={() => navigate("/")}
              >
                Signup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
