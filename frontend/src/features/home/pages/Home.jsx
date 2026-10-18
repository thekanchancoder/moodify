import React, { useState } from 'react';
import FaceExpression from '../../expression/components/FaceExpression';
import Player from '../components/Player';
import { useSong } from '../hooks/useSong';
import { searchSongsApi } from '../service/song.api';
import useAuth from '../../auth/hooks/useAuth';
import '../styles/Home.scss';

// Exact songs matching the screenshot
const DEFAULT_PLAYLIST = [
  {
    videoId: 'Oa_RSwwpPaA',
    title: 'Golden Hour',
    channelTitle: 'JVKE',
    duration: '3:29',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'u57d4_b_YgI',
    title: 'Better Together',
    channelTitle: 'Jack Johnson',
    duration: '3:28',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'ApXoWvfEYVU',
    title: 'Sunflower',
    channelTitle: 'Post Malone & Swae Lee',
    duration: '2:38',
    thumbnail: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: '2JpB4iK00xQ',
    title: 'Good Days',
    channelTitle: 'SZA',
    duration: '4:39',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'QeW_V34H6S0',
    title: 'Midnight',
    channelTitle: 'Chase Atlantic',
    duration: '3:31',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'b1kbLwvqugk',
    title: 'Anti-Hero',
    channelTitle: 'Taylor Swift',
    duration: '3:20',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'm7Bc3pLyij0',
    title: 'Happier',
    channelTitle: 'Marshmello',
    duration: '3:34',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'
  },
  {
    videoId: 'V1Pl8CzNzCw',
    title: 'Lovely',
    channelTitle: 'Billie Eilish & Khalid',
    duration: '3:18',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=150&q=80'
  }
];

const Home = () => {
  const { playlist, currentSong, setCurrentSong, mood, loading, handleGetSong } = useSong();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Active songs list: dynamic YouTube playlist if available, otherwise default screenshot songs
  const activePlaylist = (playlist && playlist.length > 0) ? playlist : DEFAULT_PLAYLIST;

  // Real YouTube Search on enter or debounce
  const handleSearchSubmit = async (queryText) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchSongsApi(q.trim());
      if (res?.success && res?.songs?.length > 0) {
        setSearchResults(res.songs);
        setCurrentSong(res.songs[0]); // Auto-play the first matched song
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Live auto-search with debounce
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      handleSearchSubmit(searchQuery);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Playlist displayed: search results if searching, otherwise active playlist
  const displayedPlaylist = searchResults !== null ? searchResults : activePlaylist;
  const activeCurrentSong = currentSong || displayedPlaylist[0];

  // Mood configuration
  const currentMood = (mood || 'happy').toLowerCase();
  const moodConfig = {
    happy: {
      title: 'Happy',
      sentiment: 'Positive',
      desc: 'You look great! Keep that energy going.',
      confidence: '87%'
    },
    sad: {
      title: 'Sad',
      sentiment: 'Reflective',
      desc: 'Taking a moment to breathe and unwind.',
      confidence: '92%'
    },
    surprised: {
      title: 'Surprised',
      sentiment: 'Excited',
      desc: "Exciting vibes detected! Let's ride this wave.",
      confidence: '89%'
    }
  };

  const activeMoodInfo = moodConfig[currentMood] || moodConfig.happy;

  return (
    <div className="moodify-dashboard">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVBAR                                                 */}
      {/* ------------------------------------------------------------- */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h2.5l2.5-6 3 12 3-14 3 10 2.5-4H22" />
            </svg>
          </div>
          <h1 className="brand-title">Moodify</h1>
        </div>

        <div className="navbar-actions">
          <div className="user-profile-badge">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
              alt="Kanchan" 
              className="user-avatar-img" 
            />
            <span className="user-name-text">{user?.username || 'Kanchan'}</span>
            <svg className="chevron-down-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button className="btn-logout" onClick={logout} title="Log out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. 3-COLUMN MAIN DASHBOARD GRID                               */}
      {/* ------------------------------------------------------------- */}
      <main className="dashboard-grid">
        {/* =========================================================== */}
        {/* COLUMN 1: Expression Capture                                */}
        {/* =========================================================== */}
        <section className="expression-column">
          <div className="expression-card">
            <div className="card-top-header">
              <div className="icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="card-title-text">Expression Capture</h3>
              </div>
            </div>
            <p className="card-subtitle">Look at the camera and let us detect your mood.</p>

            {/* MediaPipe Camera Viewfinder & Detection Trigger */}
            <FaceExpression 
              onMoodDetect={(detectedMood) => {
                handleGetSong({ mood: detectedMood });
              }}
            />
          </div>
        </section>

        {/* =========================================================== */}
        {/* COLUMN 2: Mood Analytics & Player                           */}
        {/* =========================================================== */}
        <section className="center-column">
          {/* Card 1: Current Mood Analysis */}
          <div className="mood-analysis-card">
            <div className="card-top-header">
              <div className="icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3 className="card-title-text">Current Mood Analysis</h3>
            </div>

            <div className="analysis-content">
              {/* Circular Mood Avatar */}
              <div className="mood-avatar-glow">
                <svg viewBox="0 0 64 64" fill="none">
                  {/* Subtle eyes */}
                  <path d="M22 26c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M34 26c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  {/* Cute curved smile */}
                  <path d="M23 37c3 4 8 6 9 6s6-2 9-6" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Mood details */}
              <div className="mood-info-box">
                <div className="mood-title-row">
                  <h2 className="mood-name">{activeMoodInfo.title}</h2>
                  <span className="sentiment-pill">{activeMoodInfo.sentiment}</span>
                </div>
                <p className="mood-desc">{activeMoodInfo.desc}</p>

                <div className="confidence-row">
                  <div className="confidence-labels">
                    <span>Confidence</span>
                    <span className="percent">{activeMoodInfo.confidence}</span>
                  </div>
                  <div className="confidence-bar-track">
                    <div className="confidence-bar-fill" style={{ width: activeMoodInfo.confidence }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Today's Mood History */}
          <div className="history-card">
            <div className="history-header-row">
              <div className="card-top-header" style={{ marginBottom: 0 }}>
                <div className="icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="card-title-text">Today's Mood History</h3>
              </div>

              {/* Legend */}
              <div className="history-legend">
                <div className="legend-item">
                  <span className="dot yellow" /> Happy
                </div>
                <div className="legend-item">
                  <span className="dot purple" /> Surprised
                </div>
                <div className="legend-item">
                  <span className="dot cyan" /> Sad
                </div>
              </div>
            </div>

            {/* Interactive SVG Spline Line Graph */}
            <div className="chart-container">
              <svg viewBox="0 0 460 75" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="historyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Horizontal Grid lines */}
                <line x1="10" y1="15" x2="450" y2="15" className="chart-grid-line" />
                <line x1="10" y1="35" x2="450" y2="35" className="chart-grid-line" />
                <line x1="10" y1="55" x2="450" y2="55" className="chart-grid-line" />

                {/* Gradient area underneath curve */}
                <path
                  d="M 15 50 C 40 28, 55 16, 75 16 C 95 16, 115 32, 135 32 C 155 32, 175 46, 195 46 C 215 46, 235 26, 255 26 C 275 26, 295 36, 315 36 C 335 36, 355 20, 375 20 C 395 20, 420 14, 442 14 L 442 70 L 15 70 Z"
                  fill="url(#historyGradient)"
                />

                {/* Smooth purple spline line */}
                <path
                  d="M 15 50 C 40 28, 55 16, 75 16 C 95 16, 115 32, 135 32 C 155 32, 175 46, 195 46 C 215 46, 235 26, 255 26 C 275 26, 295 36, 315 36 C 335 36, 355 20, 375 20 C 395 20, 420 14, 442 14"
                  className="chart-curve"
                />

                {/* Node Circles */}
                <circle cx="15" cy="50" r="4" fill="#06B6D4" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="75" cy="16" r="4" fill="#FACC15" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="135" cy="32" r="4" fill="#A855F7" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="195" cy="46" r="4" fill="#06B6D4" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="255" cy="26" r="4" fill="#A855F7" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="315" cy="36" r="4" fill="#A855F7" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="375" cy="20" r="4" fill="#FACC15" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
                <circle cx="442" cy="14" r="4" fill="#A855F7" stroke="#ffffff" strokeWidth="1.5" className="chart-node" />
              </svg>

              {/* Timestamp Labels along X axis */}
              <div className="chart-timestamps">
                <span>8 AM</span>
                <span>10 AM</span>
                <span>12 PM</span>
                <span>2 PM</span>
                <span>4 PM</span>
                <span>6 PM</span>
                <span>8 PM</span>
                <span>10 PM</span>
              </div>
            </div>
          </div>

          {/* Card 3: Now Playing YouTube Player */}
          <Player 
            playlist={displayedPlaylist} 
            currentSong={activeCurrentSong} 
            setCurrentSong={setCurrentSong} 
          />
        </section>

        {/* =========================================================== */}
        {/* COLUMN 3: Song Playlist Sidebar                             */}
        {/* =========================================================== */}
        <section className="playlist-column">
          <div className="playlist-card">
            <div className="playlist-top-header">
              <div className="card-top-header" style={{ marginBottom: 0 }}>
                <div className="icon-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <h3 className="card-title-text">
                  {searchResults !== null ? `Search Results (${displayedPlaylist.length})` : 'Song Playlist'}
                </h3>
              </div>

              <button 
                className="search-icon-btn" 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    setSearchQuery('');
                    setSearchResults(null);
                  }
                }}
                title={showSearch ? "Close Search" : "Search YouTube"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>

            {/* Expandable Search Input / Form */}
            {showSearch && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(searchQuery);
                }}
                style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search YouTube songs & press Enter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: '0.55rem',
                      padding: '0.5rem 2rem 0.5rem 0.75rem',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        padding: 0
                      }}
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                    border: 'none',
                    borderRadius: '0.55rem',
                    padding: '0 0.75rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSearching ? 0.7 : 1
                  }}
                  title="Search"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            )}

            {/* Searching indicator */}
            {isSearching && (
              <div style={{ fontSize: '0.75rem', color: '#a855f7', padding: '0.4rem 0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
                Searching YouTube for "{searchQuery}"...
              </div>
            )}

            {/* No results message */}
            {!isSearching && searchResults !== null && searchResults.length === 0 && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.85rem 0.2rem', textAlign: 'center' }}>
                No songs found for "{searchQuery}". Try another keyword!
              </div>
            )}

            {/* Scrollable Song List */}
            <div className="song-list-scroll">
              {displayedPlaylist.map((song) => {
                const isActive = (activeCurrentSong && activeCurrentSong.videoId === song.videoId);

                return (
                  <div
                    key={song.videoId || song.title}
                    className={`playlist-item ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentSong(song)}
                  >
                    <img 
                      src={song.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'} 
                      alt={song.title} 
                      className="item-art" 
                    />

                    <div className="item-info">
                      <h4 className="item-title">{song.title}</h4>
                      <div className="item-artist-row">
                        <span>{song.channelTitle || song.artist || 'Artist'}</span>
                        {song.duration && (
                          <>
                            <span className="bullet">•</span>
                            <span>{song.duration}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="item-action">
                      {isActive ? (
                        <div className="equalizer-anim">
                          <span />
                          <span />
                          <span />
                        </div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;