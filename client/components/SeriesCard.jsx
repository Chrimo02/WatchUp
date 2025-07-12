// src/components/SeriesCard.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMovies } from '../contexts/MovieContext';
import { getPosterUrl } from '../utils/api';
import { Star, MoreHorizontal } from 'lucide-react';
import AddToBookmark from '../assets/AddToBookmark.svg?url';
import Bookmarked      from '../assets/Bookmarked.svg?url';

export default function SeriesCard({
  mediaId,
  bookmarked = false,
  isLoading  = false,
  onBookmarkToggle,
  onMenuClick,
}) {
  const { fetchTVShowDetails } = useMovies();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTVShowDetails(mediaId);
        setDetails(res);
      } catch (err) {
        console.error('Error loading series details', err);
      }
    })();
  }, [mediaId]);

  if (!details) return null; // you could swap in a spinner

  const title     = details.name;
  const date      = details.first_air_date;
  const year      = date ? new Date(date).getFullYear() : '';
  const genre     = details.genres?.[0]?.name || '';    // first genre
  const rating    = details.vote_average.toFixed(1);

  const handleBookmarkClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && onBookmarkToggle) {
      onBookmarkToggle(mediaId, 'tv');
    }
  };

  return (
    <div className="w-[200px] bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden group">
      {/* Poster + Overlays */}
      <div className="relative">
        <img
          src={getPosterUrl(details.poster_path, 'w500')}
          alt={title}
          className="w-full h-auto object-cover"
        />

        {/* Bookmark */}
        <div
          onClick={handleBookmarkClick}
          className={`
            absolute left-2 top-[3px] transform -translate-y-1
            w-[34px] h-[45px] z-10
            ${isLoading ? 'opacity-50' : 'cursor-pointer hover:scale-110'}
            transition-transform ease-out
          `}
        >
          <img
            src={bookmarked ? Bookmarked : AddToBookmark}
            alt={bookmarked ? 'Bookmarked' : 'Add to Bookmark'}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Rating Badge */}
        <div className="
          absolute top-2 right-2
          bg-black/80 rounded-xl px-2 py-1
          flex items-center gap-1
        ">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-white font-medium text-[16px] font-sans">
            {rating}
          </span>
        </div>
      </div>

      {/* Text Panel */}
      <div className="bg-[#141414] px-4 py-3 flex items-center justify-between rounded-b-2xl">
        <div>
          <h3 className="text-white text-lg font-poppins font-semibold leading-tight">
            {title}
          </h3>
          <div className="flex items-center text-gray-400 text-sm font-sans space-x-1 mt-1">
            {year && <><span>{year}</span><span>•</span></>}
            <span>{genre}</span>
          </div>
        </div>

        {/* More button */}
        {onMenuClick && (
          <button
            onClick={() => onMenuClick(mediaId)}
            className="
              p-1 rounded-full
              bg-white text-gray-900
              hover:bg-gray-700/80 hover:text-white
              transition-colors
            "
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

SeriesCard.propTypes = {
  mediaId:          PropTypes.number.isRequired,
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
};
