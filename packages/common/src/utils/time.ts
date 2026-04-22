/**
 * Formats a countdown in seconds to MM:SS format.
 * @param seconds The number of seconds
 * @returns The formatted countdown string
 */
export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Gets the current date in YYYY-MM-DD format.
 * @returns The current date as a string
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Gets yesterday's date in YYYY-MM-DD format.
 * @returns Yesterday's date as a string
 */
export const getYesterdayDateString = (): string => {
  const yesterday = new Date(Date.now() - 86400000);
  return yesterday.toISOString().split('T')[0];
};
