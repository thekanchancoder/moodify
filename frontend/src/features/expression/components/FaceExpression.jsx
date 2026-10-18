import { useEffect, useRef, useState } from "react";
import { detect, init } from "../utils/utils";

export default function FaceExpression({ onMoodDetect, onClick }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("Detecting...");

  useEffect(() => {
    init({ landmarkerRef, videoRef, streamRef });

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const [isDetecting, setIsDetecting] = useState(false);

  async function handleClick() {
    setIsDetecting(true);
    try {
      // MediaPipe detect call
      const detectedExpression = await detect({ landmarkerRef, videoRef, setExpression });
      console.log("Detected Mood:", detectedExpression);

      // Parent component callback (supports both onMoodDetect and onClick)
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
          Camera On
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