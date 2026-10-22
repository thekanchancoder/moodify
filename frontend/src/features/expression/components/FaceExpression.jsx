import { useEffect, useRef, useState } from "react";
import { detect, init, stop } from "../utils/utils";

export default function FaceExpression({ onMoodDetect, onClick }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Initialization with safety handling
    init({ landmarkerRef, videoRef, streamRef }).catch((err) => {
      if (isMounted) console.error("Init Error:", err);
    });

    return () => {
      isMounted = false;
      stop({ landmarkerRef, streamRef, videoRef });
    };
  }, []);

  async function handleClick() {
    setIsDetecting(true);
    try {
      // Run facial expression detection
      const detectedExpression = await detect({ landmarkerRef, videoRef, setExpression });
      console.log("Detected Mood:", detectedExpression);

      // Trigger parent callback function
      const callback = onMoodDetect || onClick;
      if (detectedExpression && callback) {
        callback(detectedExpression);
      }
    } catch (err) {
      console.error("Detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  }

  return (
    <div className="face-expression-wrapper">
      <div className="video-viewfinder-box">
        <div className="camera-badge">
          <span className="green-dot" />
          {expression ? `Mood: ${expression.toUpperCase()}` : "Camera On"}
        </div>
        <div className="corner-marker top-left" />
        <div className="corner-marker top-right" />
        <div className="corner-marker bottom-left" />
        <div className="corner-marker bottom-right" />
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
        />
      </div>

      <button 
        className="start-detect-btn" 
        onClick={handleClick}
        disabled={isDetecting}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
        {isDetecting ? "Detecting Expression..." : "Start Detection"}
      </button>
    </div>
  );
}