import React from 'react';

export default function FilterTabs({ selected, onSelect }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onSelect('movies')}
        className={`px-4 py-2 rounded ${
          selected === 'movies' ? 'bg-white text-black' : 'bg-gray-800 text-white'
        }`}
      >
        Movies
      </button>
      <button
        onClick={() => onSelect('series')}
        className={`px-4 py-2 rounded ${
          selected === 'series' ? 'bg-white text-black' : 'bg-gray-800 text-white'
        }`}
      >
        Series
      </button>
    </div>
  );
}
