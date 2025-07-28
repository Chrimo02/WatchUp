// src/components/MovieCard.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { getPosterUrl } from '../utils/api';
import { Star, MoreHorizontal } from 'lucide-react';
import AddToBookmark from '../assets/AddToBookmark.svg?url';
import Bookmarked      from '../assets/Bookmarked.svg?url';

export default function MovieCard({
  mediaType,
  mediaId,
  bookmarked = false,
  isLoading  = false,
  onBookmarkToggle,
  onMenuClick,
  className = '',
}) {
  const { fetchMovieDetails, fetchTVShowDetails } = useMovies();
  const [details, setDetails] = useState(null);

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
  }, [mediaType, mediaId, fetchMovieDetails, fetchTVShowDetails]);

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
    if (!isLoading) onBookmarkToggle(mediaId, mediaType);
  };

  const handleMenuClick = e => {
    e.stopPropagation();
    onMenuClick(mediaId);
  };

  return (
    <div className={`relative flex flex-col bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden ${className}`}>
      {/* Poster + Overlays */}
      <div className="relative w-full flex-shrink-0 aspect-[2/3]">
        {/* LINKED AREA */}
        <Link to={`/${mediaType}/${mediaId}`} className="absolute inset-0 z-0">
          <img
            src={getPosterUrl(details.poster_path, 'w500')}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black/80 rounded-xl px-2 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current"/>
            <span className="text-white font-medium text-[16px]">
              {details.vote_average.toFixed(1)}
            </span>
          </div>
        </Link>

        {/* Bookmark Button (outside the Link) */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`
            absolute top-[-1px] left-3 z-10
            w-[34px] h-[45px]
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            transition-transform ease-out
          `}
        >
          {isLoading
            ? <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              </div>
            : <img
                src={bookmarked ? Bookmarked : AddToBookmark}
                alt={bookmarked ? 'Bookmarked' : 'Add to Bookmark'}
                className="w-full h-full object-contain"
              />
          }
        </button>
      </div>

      {/* Text & Menu */}
      <div className="flex-1 bg-[#141414] px-3 py-2 flex items-center justify-between rounded-b-2xl">
        {/* LINKED AREA */}
        <Link to={`/${mediaType}/${mediaId}`} className="flex-1">
          <h3 className="text-white text-sm lg:text-base font-poppins font-semibold leading-tight">
            {title}
          </h3>
          <div className="flex items-center text-gray-400 text-xs lg:text-sm space-x-1 mt-1">
            {year && <span>{year}</span>}<span>•</span>
            <span>{ageRating}</span><span>•</span>
            <span>{runtimeStr}</span>
          </div>
        </Link>

        {/* Menu Button (outside the Link) */}
        {onMenuClick && (
          <button
            type="button"
            onClick={handleMenuClick}
            className="p-1 rounded-full bg-white text-gray-900 hover:bg-gray-700/80 hover:text-white transition-colors z-20"
          >
            <MoreHorizontal className="w-5 h-5"/>
          </button>
        )}
      </div>
    </div>
  );
}

MovieCard.propTypes = {
  mediaType:        PropTypes.string.isRequired,
  mediaId:          PropTypes.number.isRequired,
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
  className:        PropTypes.string,
};