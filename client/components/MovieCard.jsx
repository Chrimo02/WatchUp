// src/components/MovieCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMovies } from '../contexts/MovieContext';
import { getPosterUrl } from '../utils/api';
import { Star, MoreHorizontal } from 'lucide-react';
import AddToBookmark from '../assets/AddToBookmark.svg?url';
import Bookmarked    from '../assets/Bookmarked.svg?url';
import MovieCardMenu from './MovieCardMenu';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export default function MovieCard({
  mediaType,
  mediaId,
  bookmarked = false,
  isLoading  = false,
  onBookmarkToggle,
  onRate,
  onAddToList,
  onFavorite,
}) {
  const { fetchMovieDetails, fetchTVShowDetails } = useMovies();
  const [details, setDetails] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapperRef = useRef(null);

  // close menu on outside click
  useOnClickOutside(menuWrapperRef, () => setMenuOpen(false));

  useEffect(() => {
    (async () => {
      try {
        const res = mediaType === 'movie'
          ? await fetchMovieDetails(mediaId)
          : await fetchTVShowDetails(mediaId);
        setDetails(res);
      } catch (err) {
        console.error('Error loading details', err);
      }
    })();
  }, [mediaType, mediaId]);

  if (!details) return null;

  const title      = details.title || details.name;
  const date       = details.release_date || details.first_air_date;
  const year       = date ? new Date(date).getFullYear() : '';
  const ageRating  = details.adult ? '18+' : '13+';
  const runtimeMin = mediaType === 'movie'
    ? details.runtime
    : (details.episode_run_time?.[0] || 0);
  const runtimeStr = `${Math.floor(runtimeMin/60)}h ${runtimeMin%60}m`;

  const handleBookmarkClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && onBookmarkToggle) {
      onBookmarkToggle(mediaId, mediaType);
    }
  };

  return (
    <div className="w-[200px] bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden relative">
      {/* Poster + overlays */}
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
            {details.vote_average.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Text Panel */}
      <div className="bg-[#141414] px-4 py-3 flex items-center justify-between rounded-b-2xl">
        <div>
          <h3 className="text-white text-base font-poppins font-semibold">
            {title}
          </h3>
          <div className="flex items-center text-gray-400 text-sm font-sans space-x-1 mt-1">
            <span>{year}</span><span>•</span>
            <span>{ageRating}</span><span>•</span>
            <span>{runtimeStr}</span>
          </div>
        </div>

        {/* More button + menu wrapper */}
        <div ref={menuWrapperRef} className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(open => !open);
            }}
            className="
              p-1 rounded-full
              bg-white text-gray-900
              hover:bg-gray-700/80 hover:text-white
              transition-colors
            "
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-[30px] right-0 z-20">
              <MovieCardMenu
                onRate={() => onRate(mediaId, mediaType)}
                onAddToList={() => onAddToList(mediaId, mediaType)}
                onFavorite={() => onFavorite(mediaId, mediaType)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

MovieCard.propTypes = {
  mediaType:        PropTypes.oneOf(['movie','tv']).isRequired,
  mediaId:          PropTypes.number.isRequired,
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onRate:           PropTypes.func,
  onAddToList:      PropTypes.func,
  onFavorite:       PropTypes.func,
};