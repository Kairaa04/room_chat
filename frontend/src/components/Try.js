import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import video from "./1014.mp4";

const Try = () => {
  const [downloadsToday, setDownloadsToday] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isSouthIndia, setIsSouthIndia] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null); // To reference the video element
  const dailyDownloadLimit = 1;

  // Retrieve data from localStorage when the component mounts
  useEffect(() => {
    const savedDownloads = localStorage.getItem("downloadsToday");
    const savedPremiumStatus = localStorage.getItem("isPremium");

    if (savedDownloads) {
      setDownloadsToday(Number(savedDownloads));
    }

    if (savedPremiumStatus === "true") {
      setIsPremium(true);
    }

    const applyThemeBasedOnLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const region = response.data.region;
        const southIndianStates = [
          "Tamil Nadu",
          "Kerala",
          "Karnataka",
          "Madhya Pradesh",
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

  // Save to localStorage when downloadsToday or isPremium changes
  useEffect(() => {
    localStorage.setItem("downloadsToday", downloadsToday);
    localStorage.setItem("isPremium", isPremium);
  }, [downloadsToday, isPremium]);

  // Handle video download
  const handleDownload = () => {
    if (downloadsToday >= dailyDownloadLimit && !isPremium) {
      alert(
        "You have reached your download limit for today. Upgrade to Premium for unlimited downloads."
      );
      return;
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = video; // Assuming the video is locally hosted
    link.download = "video.mp4"; // Name of the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update the download count
    setDownloadsToday((prev) => prev + 1);
    alert("Video downloaded successfully!");
  };

  // Handle upgrading to Premium
  const handleUpgradeToPremium = () => {
    setIsPremium(true);
    alert("You have upgraded to Premium! Enjoy unlimited downloads.");
  };

  // Play video
  const handlePlay = () => {
    videoRef.current.play();
  };

  // Pause video
  const handlePause = () => {
    videoRef.current.pause();
  };

  if (loading) {
    return <p>Loading theme...</p>;
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        color: isSouthIndia ? "black" : "white",
        backgroundColor: isSouthIndia ? "#f8f9fa" : "#343a40",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: isSouthIndia ? "#000" : "#fff" }}>Watch Video</h1>

      {/* Custom Video Player */}
      <div>
        <video
          width="600"
          ref={videoRef}
          controls={false} // Disable default controls to remove the download option
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handlePlay}
            className={`btn ${isSouthIndia ? "btn-light" : "btn-dark"}`}
            style={{ marginRight: "10px" }}
          >
            Play
          </button>
          <button
            onClick={handlePause}
            className={`btn ${isSouthIndia ? "btn-light" : "btn-dark"}`}
          >
            Pause
          </button>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleDownload}
          className={`btn ${isSouthIndia ? "btn-light" : "btn-dark"}`}
          style={{
            margin: "10px",
            backgroundColor: isSouthIndia ? "#007bff" : "#ffc107",
            color: isSouthIndia ? "white" : "black",
          }}
        >
          Download Video
        </button>
        <p style={{ color: isSouthIndia ? "#000" : "#fff" }}>
          {`Downloads Today: ${downloadsToday}`}
        </p>

        {/* Premium option if user reaches limit */}
        {downloadsToday >= dailyDownloadLimit && !isPremium && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ color: isSouthIndia ? "#000" : "#fff" }}>
              You've reached your daily download limit. Upgrade to Premium for
              unlimited downloads.
            </p>
            <button
              onClick={handleUpgradeToPremium}
              className={`btn ${isSouthIndia ? "btn-success" : "btn-warning"}`}
              style={{
                margin: "10px",
                backgroundColor: isSouthIndia ? "#28a745" : "#ffc107",
                color: isSouthIndia ? "white" : "black",
              }}
            >
              Upgrade to Premium
            </button>
          </div>
        )}

        {/* Show message if user is premium */}
        {isPremium && (
          <p style={{ color: isSouthIndia ? "#000" : "#fff" }}>
            You are a Premium user! Enjoy unlimited downloads.
          </p>
        )}
      </div>
    </div>
  );
};

export default Try;
