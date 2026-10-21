// LocalStorage-based 7-Day Mood History Tracker (Pure JS, No Backend API needed)

const STORAGE_KEY = 'moodify_mood_history_7d';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate realistic seed history for past 7 days up to today
 * Ensures the chart looks gorgeous on first load.
 */
function generateSeedHistory() {
  const now = new Date();
  const seed = [];

  // Previous 6 days (1-2 records each day)
  const pastMoods = [
    { daysAgo: 6, hour: 11, mood: 'sad' },
    { daysAgo: 5, hour: 15, mood: 'surprised' },
    { daysAgo: 4, hour: 10, mood: 'happy' },
    { daysAgo: 3, hour: 16, mood: 'happy' },
    { daysAgo: 2, hour: 12, mood: 'sad' },
    { daysAgo: 1, hour: 17, mood: 'surprised' },
  ];

  pastMoods.forEach((item, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - item.daysAgo);
    d.setHours(item.hour, 0, 0, 0);
    seed.push({
      id: `seed_past_${idx}`,
      mood: item.mood,
      timestamp: d.getTime(),
    });
  });

  // Today's timeline (matching the aesthetic 8 AM to 8 PM)
  const todayMoods = [
    { hour: 8, mood: 'sad' },
    { hour: 10, mood: 'happy' },
    { hour: 12, mood: 'surprised' },
    { hour: 14, mood: 'sad' },
    { hour: 16, mood: 'surprised' },
    { hour: 18, mood: 'surprised' },
    { hour: 20, mood: 'happy' },
  ];

  todayMoods.forEach((item, idx) => {
    const d = new Date(now);
    d.setHours(item.hour, 0, 0, 0);
    // Only include if time is past or present today, or seed for visualization
    seed.push({
      id: `seed_today_${idx}`,
      mood: item.mood,
      timestamp: d.getTime(),
    });
  });

  return seed.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Clean records older than 7 days
 */
export function purgeOldRecords(records) {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  return (records || []).filter(item => item && item.timestamp && item.timestamp >= cutoff);
}

/**
 * Get all stored mood history (filtered to max 7 days)
 */
export function getStoredMoodHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = purgeOldRecords(parsed);
        if (cleaned.length > 0) {
          // Update storage if any old records were purged
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          }
          return cleaned.sort((a, b) => a.timestamp - b.timestamp);
        }
      }
    }

    // Initialize with seed data on first run
    const seed = generateSeedHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch (err) {
    console.error('Error reading mood history from localStorage:', err);
    return generateSeedHistory();
  }
}

/**
 * Save a new mood detection (auto-purges anything older than 7 days)
 */
export function recordMoodDetection(mood) {
  if (!mood) return [];

  const normalizedMood = mood.toLowerCase().trim();
  const validMood = ['happy', 'sad', 'surprised'].includes(normalizedMood)
    ? normalizedMood
    : (normalizedMood === 'neutral' ? 'surprised' : 'happy');

  const newEntry = {
    id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    mood: validMood,
    timestamp: Date.now(),
  };

  try {
    const current = getStoredMoodHistory();
    // Add new entry and keep only <= 7 days records
    const updated = purgeOldRecords([...current, newEntry]).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving mood to localStorage:', err);
    return [];
  }
}
