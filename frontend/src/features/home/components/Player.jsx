import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_SONG = {
  title: 'Golden Hour',
  channelTitle: 'JVKE',
  thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80',
  duration: '3:29',
  videoId: 'Oa_RSwwpPaA'
};

const Player = ({ playlist = [], currentSong, setCurrentSong }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(209); // Default 3:29 in seconds
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const handleNextRef = useRef(null);

  const displaySong = currentSong || (playlist.length > 0 ? playlist[0] : DEFAULT_SONG);
  const activeVideoId = displaySong?.videoId || DEFAULT_SONG.videoId;

  // Next song handler
  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    if (isShuffle && playlist.length > 1) {
      const remaining = playlist.filter((s) => s.videoId !== activeVideoId);
      const randomIndex = Math.floor(Math.random() * remaining.length);
      setCurrentSong(remaining[randomIndex]);
      return;
    }
    const currentIndex = playlist.findIndex((s) => s.videoId === activeVideoId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % playlist.length : 0;
    setCurrentSong(playlist[nextIndex]);
  };

  // Previous song handler
  const handlePrev = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s) => s.videoId === activeVideoId);
    const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + playlist.length) % playlist.length : 0;
    setCurrentSong(playlist[prevIndex]);
  };

  handleNextRef.current = handleNext;

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load YouTube IFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    let playerInstance = null;

    const createPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      const container = document.getElementById('youtube-player-element');
      if (!container) return;

      playerInstance = new window.YT.Player('youtube-player-element', {
        height: '100%',
        width: '100%',
        videoId: activeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            event.target.setVolume(volume);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (handleNextRef.current) {
                handleNextRef.current();
              }
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerInstance && playerInstance.destroy) {
        try {
          playerInstance.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Whenever activeVideoId changes, load the new video in the existing player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function' && activeVideoId) {
      playerRef.current.loadVideoById(activeVideoId);
      setIsPlaying(true);
    }
  }, [activeVideoId]);

  // Track playback time interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(cur);
          if (dur > 0 && Math.abs(dur - duration) > 1) {
            setDuration(dur);
          }
        } catch (e) {
          // player not ready
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [duration]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Playback toggle error:", e);
    }
  };

  // Seek bar click handler
  const handleSeek = (e) => {
    if (!progressBarRef.current || !playerRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const seekSeconds = ratio * duration;
    try {
      playerRef.current.seekTo(seekSeconds, true);
      setCurrentTime(seekSeconds);
    } catch (e) {
      console.error("Seek error:", e);
    }
  };

  // Volume slider click / drag handler
  const handleVolumeChange = (e) => {
    if (!volumeBarRef.current || !playerRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newVol = Math.round(ratio * 100);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    try {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
    } catch (e) {
      console.error("Volume error:", e);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 80);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.error("Mute error:", e);
    }
  };

  // Progress percentage
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="now-playing-card">
      <div className="player-header-row">
        <div className="card-top-header" style={{ marginBottom: 0 }}>
          <div className="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h3 className="card-title-text">Now Playing</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            onClick={() => setShowVideo(!showVideo)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              color: showVideo ? '#a855f7' : '#94a3b8',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              transition: 'all 0.2s ease'
            }}
            title={showVideo ? "Hide Video" : "Watch Video"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            {showVideo ? "Hide" : "Video"}
          </button>

          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
            title="Add to favorites"
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="player-main-body">
        {/* Track Artwork */}
        <div className="track-artwork-box">
          <img 
            src={displaySong?.thumbnail || DEFAULT_SONG.thumbnail} 
            alt={displaySong?.title || "Track"} 
          />
        </div>

        {/* Track Details & Controls */}
        <div className="track-details-controls">
          <h4 className="track-title" title={displaySong?.title}>{displaySong?.title || "No track selected"}</h4>
          <p className="track-artist">{displaySong?.channelTitle || displaySong?.artist || "Artist"}</p>

          {/* Real-time Interactive Progress Bar */}
          <div className="progress-bar-container">
            <span className="time-text">{formatTime(currentTime)}</span>
            <div 
              className="progress-track" 
              ref={progressBarRef}
              onClick={handleSeek}
              title="Click to seek"
            >
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="time-text">{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div className="controls-row">
            {/* Shuffle */}
            <button 
              className="btn-ctrl" 
              onClick={() => setIsShuffle(!isShuffle)}
              style={{ color: isShuffle ? '#a855f7' : undefined }}
              title={isShuffle ? "Shuffle On" : "Shuffle Off"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            {/* Previous */}
            <button className="btn-ctrl" onClick={handlePrev} title="Previous Song">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play / Pause Toggle Button */}
            <button 
              className="btn-ctrl play-pause-btn" 
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button className="btn-ctrl" onClick={handleNext} title="Next Song">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            {/* Volume & Mute */}
            <div className="volume-group">
              <button 
                onClick={toggleMute}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>

              <div 
                className="volume-slider-track"
                ref={volumeBarRef}
                onClick={handleVolumeChange}
                title="Adjust Volume"
              >
                <div 
                  className="volume-slider-fill" 
                  style={{ width: isMuted ? '0%' : `${volume}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Player Container - zero height in normal flow when hidden, expands smoothly when video is watched */}
      <div 
        style={{ 
          position: showVideo ? 'relative' : 'absolute',
          width: showVideo ? '100%' : '1px',
          height: showVideo ? '200px' : '1px',
          opacity: showVideo ? 1 : 0.001,
          overflow: 'hidden',
          marginTop: showVideo ? '0.75rem' : '0',
          transition: 'height 0.3s ease, opacity 0.3s ease',
          pointerEvents: showVideo ? 'auto' : 'none',
          borderRadius: '0.75rem',
          background: '#000'
        }}
      >
        <div id="youtube-player-element" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default Player;