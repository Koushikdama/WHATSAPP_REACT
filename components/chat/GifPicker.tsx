import React, { useState, useEffect } from 'react';
import { CloseIcon, SearchIcon } from '../icons';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

// Mock GIF data - in a real app, this would come from an API like Giphy
const mockGifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG13a3ZtbjV2ejdjdjZ0cDM4Z2oyc2g2bTR5aWd4dDNwNTNnaDBwOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3Q4enZrdHZkaGN0eXRmMmczcmU1OHRnM3oxNThud3hqOWpramNnbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZpbjU0MmVmaTN0OWZ0ZXR6ajBqMmg5NnQ2emZ2eGZmaXRrcDdyNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlE7uhX8KFgEmY/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajF6b2ZzMDFrYXB3NzZ2emV1ZHdqczh0YWQ3a2E0aW9naWpyemM4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tHIRLHtNwxpjIFcOjg/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDV4cDhseXN0Z2J1cDI0c25sZ3E2dXN3ZDAzbzRmMndzOHM5ZGZqNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26n6Gx9moCgs1pUuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnA2OTZudW9kYm5udWZ3ajN4NXM5dGd6eHFmMnd0d2prNnd6eXNqZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o85xwxr06YNoFdSbm/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJkb28yMGp1a3d0dWpjaTkyc3A4d284aDZkMTJxbnc0dXR4d2xmcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl1OWR0ZGNxYmdzdjA3aWZyZHF6NW10d29kaHh6N3lsaXU3cm92ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G3va31oEEnIkM/giphy.gif'
];

const GifPicker: React.FC<GifPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState(mockGifs);

  useEffect(() => {
    // In a real app, you would fetch GIFs based on the search term.
    // Here we just filter the mock data for demonstration.
    if (searchTerm) {
      // Simple non-filtering, just showing the same list
      setGifs(mockGifs.slice().reverse());
    } else {
      setGifs(mockGifs);
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2a3942] rounded-lg shadow-xl w-full max-w-lg mx-4 text-white flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Select GIF</h2>
          <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
        </header>
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for GIFs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#202c33] border-transparent rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 ring-primary"
            />
          </div>
        </div>
        <main className="flex-grow p-4 pt-0 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gifs.map((gifUrl) => (
              <div key={gifUrl} className="aspect-square cursor-pointer" onClick={() => onSelect(gifUrl)}>
                <img src={gifUrl} alt="GIF" className="w-full h-full object-cover rounded-md" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GifPicker;