export const TOGGLE_ON_COLORS = [
  { name: 'green', from: '#00a884', to: '#008a69' },
  { name: 'ocean', from: '#13547a', to: '#80d0c7' },
  { name: 'grape', from: '#4e54c8', to: '#8f94fb' },
  { name: 'fire', from: '#f12711', to: '#f5af19' },
];

export const TOGGLE_OFF_COLORS = [
  { name: 'gray', color: '#374151' }, // gray-700
  { name: 'dark', color: '#1f2937' }, // gray-800
  { name: 'blue-gray', color: '#4b5563' }, // gray-600
];

export const THEMES = {
  green: {
    name: 'green',
    gradient: { from: '#00a884', to: '#008a69' }, // WhatsApp Classic
    wallpaper: 'https://i.redd.it/qwd83nc4xxf41.jpg',
    bubbleColor: '#005c4b',
  },
  sunset: {
    name: 'sunset',
    gradient: { from: '#FF512F', to: '#DD2476' }, // Vibrant Red-Pink
    wallpaper: 'https://picsum.photos/seed/sunset-wallpaper/1080/1920',
    bubbleColor: '#A31D45',
  },
  ocean: {
    name: 'ocean',
    gradient: { from: '#2193b0', to: '#6dd5ed' }, // Bright Blue
    wallpaper: 'https://picsum.photos/seed/ocean-wallpaper/1080/1920',
    bubbleColor: '#1A6B80',
  },
  grape: {
    name: 'grape',
    gradient: { from: '#8E2DE2', to: '#4A00E0' }, // Deep Purple
    wallpaper: 'https://picsum.photos/seed/grape-wallpaper/1080/1920',
    bubbleColor: '#5E1B9E',
  },
  lush: {
    name: 'lush',
    gradient: { from: '#11998e', to: '#38ef7d' }, // Fresh Green
    wallpaper: 'https://picsum.photos/seed/lush-wallpaper/1080/1920',
    bubbleColor: '#0C6B63',
  },
  fire: {
    name: 'fire',
    gradient: { from: '#ff9966', to: '#ff5e62' }, // Soft Red-Orange
    wallpaper: 'https://picsum.photos/seed/fire-wallpaper/1080/1920',
    bubbleColor: '#B34245',
  },
  midnight: {
    name: 'midnight',
    gradient: { from: '#232526', to: '#414345' }, // Dark Grey
    wallpaper: 'https://picsum.photos/seed/midnight/1080/1920',
    bubbleColor: '#2b2d2e',
  },
  royal: {
    name: 'royal',
    gradient: { from: '#141E30', to: '#243B55' }, // Deep Blue
    wallpaper: 'https://picsum.photos/seed/royal/1080/1920',
    bubbleColor: '#1a2639',
  },
  rose: {
    name: 'rose',
    gradient: { from: '#EC008C', to: '#FC6767' }, // Pink-Red
    wallpaper: 'https://picsum.photos/seed/rose/1080/1920',
    bubbleColor: '#A60062',
  },
  lavender: {
    name: 'lavender',
    gradient: { from: '#C33764', to: '#1D2671' }, // Pink-Purple-Blue
    wallpaper: 'https://picsum.photos/seed/lavender/1080/1920',
    bubbleColor: '#6B1E37',
  },
  default: { // This is a fallback and copy of green, not shown in UI
    name: 'green',
    gradient: { from: '#00a884', to: '#008a69' },
    wallpaper: 'https://i.redd.it/qwd83nc4xxf41.jpg',
    bubbleColor: '#005c4b',
  }
};

// Export a list of unique themes for UI pickers
const themeNames = [...new Set(Object.values(THEMES).map(t => t.name).filter(name => name !== 'default'))];
export const gradients = themeNames.map(name => Object.values(THEMES).find(theme => theme.name === name)!);