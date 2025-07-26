// src/components/ListComponent.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMovies } from '../contexts/MovieContext';
import { Star as StarOutline, Plus, Heart } from 'lucide-react';
import { getPosterUrl } from '../utils/api';
import AddToBookmark from '../assets/AddToBookmark.svg';
import Bookmarked from '../assets/Bookmarked.svg';

export default function ListComponent({
  mediaType,
  mediaId,
  streamingPlatforms = [],
  onRate,
  onAddToList,
  onFavorite,
  bookmarked = false,
  isLoading = false,
  onBookmarkToggle,
}) {
  const { fetchMovieDetails, fetchTVShowDetails } = useMovies();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = mediaType === 'movie'
          ? await fetchMovieDetails(mediaId)
          : await fetchTVShowDetails(mediaId);
        setDetails(res);
      } catch (err) {
        console.error('Failed to load media details', err);
      }
    }
    loadDetails();
  }, [mediaType, mediaId]);

  if (!details) {
    return <div className="text-white p-4">Loading...</div>;
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const ageRating = details.adult ? '18+' : '13+';

  let totalMinutes = 0;
  if (mediaType === 'movie' && details.runtime) totalMinutes = details.runtime;
  else if (mediaType === 'tv' && details.episode_run_time?.length) totalMinutes = details.episode_run_time[0];
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const handleBookmarkClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    onBookmarkToggle(mediaId, mediaType);
  };

  return (
    <div className="relative bg-[#141414] border border-gray-700 rounded-2xl p-4">
      {/* Flex container with poster and content */}
      <div className="flex">
        {/* Poster with full-height rounding */}
        <div className="flex-shrink-0 mr-6 self-stretch rounded-2xl overflow-hidden">
          <img
            src={getPosterUrl(details.poster_path, 'w500')}
            alt={title}
            className="w-[150px] h-full object-cover"
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col space-y-2 flex-1 text-white">
          {/* Title */}
          <h2 className="font-poppins text-2xl lg:text-3xl font-bold leading-tight">
            {title}
          </h2>

          {/* Info: Year • Age • Runtime */}
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            {year && <span>{year}</span>}
            <span>•</span>
            <span>{ageRating}</span>
            <span>•</span>
            <span>{hours}h {minutes}m</span>
          </div>

          {/* Actions: Rating + buttons */}
          <div className="flex items-center space-x-4">
            {/* Rating Display */}
            <div className="flex items-center space-x-1">
              <StarOutline className="w-5 h-5 text-yellow-400" fill="currentColor" stroke="none" />
              <span className="text-yellow-400 font-semibold text-xl">
                {details.vote_average.toFixed(1)}
              </span>
            </div>

            {/* Rate Button */}
            {onRate && (
              <button type="button" onClick={() => onRate(mediaId)} className="flex items-center gap-[2px] text-red-500 hover:text-red-300 transition">
                <StarOutline className="w-5 h-5" />
                <span>Rate</span>
              </button>
            )}

            {/* Add to List Button */}
            {onAddToList && (
              <button type="button" onClick={() => onAddToList(mediaId)} className="flex items-center gap-[2px] text-red-500 hover:text-red-300 transition">
                <Plus className="w-5 h-5" />
                <span>Add to list</span>
              </button>
            )}

            {/* Favourite Button */}
            {onFavorite && (
              <button type="button" onClick={() => onFavorite(mediaId)} className="flex items-center gap-[2px] text-red-500 hover:text-red-300 transition">
                <Heart className="w-5 h-5" />
                <span>Favourite</span>
              </button>
            )}
          </div>

          {/* Streaming Platforms */}
          {streamingPlatforms.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Stream on:</span>
              {streamingPlatforms.map((p, i) => (
                <span key={i}>{p.icon}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-[15px] text-gray-300 leading-relaxed line-clamp-3 font-sans">
            {details.overview}
          </p>
        </div>
      </div>

      {/* Bookmark Button */}
      <button
        type="button"
        onClick={handleBookmarkClick}
        className={`absolute left-6 top-[15px] w-[34px] h-[45px] z-10 transform hover:scale-110 transition-transform duration-200 ease-out ${
          isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <img
            src={bookmarked ? Bookmarked : AddToBookmark}
            alt={bookmarked ? 'Bookmarked' : 'Add to Bookmark'}
            className="w-full h-full object-contain"
          />
        )}
      </button>
    </div>
  );
}

ListComponent.propTypes = {
  mediaType:      PropTypes.string.isRequired,
  mediaId:        PropTypes.number.isRequired,
  streamingPlatforms: PropTypes.array,
  onRate:         PropTypes.func,
  onAddToList:    PropTypes.func,
  onFavorite:     PropTypes.func,
  bookmarked:     PropTypes.bool,
  isLoading:      PropTypes.bool,
  onBookmarkToggle: PropTypes.func.isRequired,
};