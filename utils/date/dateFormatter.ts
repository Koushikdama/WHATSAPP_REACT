// utils/dateFormatter.ts
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';

  // Handle Firestore Timestamp objects
  let date: Date;
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    // Firestore Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    // Firestore Timestamp with toDate method
    date = timestamp.toDate();
  } else {
    // Regular string timestamp
    date = new Date(timestamp);
  }

  const now = new Date();

  if (isNaN(date.getTime())) {
    return ''; // Return empty for invalid dates
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  if (date > oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  return date.toLocaleDateString();
};

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const formatDateSeparator = (timestamp: any): string => {
  if (!timestamp) return 'Today';

  // Handle Firestore Timestamp objects
  let date: Date;
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    return 'Today'; // Fallback for invalid dates
  }

  const now = new Date();

  if (isSameDay(date, now)) return "Today";

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getISODate = (timestamp: string): string => {
  if (!timestamp) return new Date().toISOString().split('T')[0];

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    // Invalid timestamp, return current date as fallback
    return new Date().toISOString().split('T')[0];
  }

  return date.toISOString().split('T')[0];
};