/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Format a date to a short format (MM/DD/YYYY)
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatShortDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Format a date to show time only
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

/**
 * Calculate the time difference between now and a given date
 * @param {string} dateString - The date string to compare
 * @returns {string} Time difference in a human-readable format
 */
export const getTimeDifference = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return formatShortDate(dateString);
}; 