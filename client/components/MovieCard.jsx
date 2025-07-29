import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useMovies } from '../contexts/MovieContext';
import { getPosterUrl } from '../utils/api';
import { Star, MoreHorizontal, Trash2 } from 'lucide-react';
import AddToBookmark from '../assets/AddToBookmark.svg?url';
import Bookmarked from '../assets/Bookmarked.svg?url';
import NoImageFound from '../assets/no-image-found.png';

export default function MovieCard({
  mediaType,           // "movie" | "tv"
  mediaId,             // for fetching if no direct props

  // Optional direct props (if provided, skip fetch)
  title: propTitle,
  poster: propPoster,
  voteAverage: propVoteAverage,
  year: propYear,
  runtime: propRuntime,
  certification: propCertification,

  // Bookmark & delete
  bookmarked = false,
  isLoading = false,
  deleteLoading = false,
  showBookmark = true,
  showDeleteButton = false,
  onBookmarkToggle,
  onMenuClick,
  onDelete,
  className = '',
}) {
  const { fetchMovieDetails, fetchTVShowDetails } = useMovies();
  const [details, setDetails] = useState(null);

  const useFetch = !propTitle;

  useEffect(() => {
    if (!useFetch) return;
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
  }, [useFetch, mediaType, mediaId, fetchMovieDetails, fetchTVShowDetails]);

  if (useFetch && !details) return null;

  // Resolve data from props or fetched details
  const title = propTitle || details.title || details.name;
  const poster = propPoster || (details.poster_path && getPosterUrl(details.poster_path, 'w500')) || NoImageFound;
  const voteAverage = propVoteAverage != null
    ? propVoteAverage
    : (details.vote_average || 0);

  // Year
  const year = propYear || (() => {
    const date = useFetch
      ? details.release_date || details.first_air_date
      : null;
    return date ? new Date(date).getFullYear() : null;
  })();

  // Runtime
  const runtime = propRuntime || (() => {
    if (!useFetch) return null;
    const minutes = mediaType === 'movie'
      ? details.runtime
      : (details.episode_run_time?.[0] || 0);
    return `${Math.floor(minutes/60)}h ${minutes%60}m`;
  })();

  // Certification
  const certification = propCertification || (useFetch
    ? (details.adult ? '18+' : '13+')
    : null);
  const ratingFixed = certification ? certification.replace('-', '‑') : null;

  const handleBookmarkClick = e => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoading && onBookmarkToggle) onBookmarkToggle(mediaId, mediaType);
  };
  const handleMenuClick = e => {
    e.stopPropagation(); if (onMenuClick) onMenuClick(mediaId);
  };
  const handleDeleteClick = e => {
    e.stopPropagation(); if (!deleteLoading && onDelete) onDelete(mediaId, mediaType);
  };

  return (
    <div className={`relative flex flex-col bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden ${className}`}>
      {/* Poster & Overlays */}
      <div className="relative w-full flex-shrink-0 aspect-[2/3]">
        <Link to={`/${mediaType}/${mediaId}`} className="absolute inset-0 z-0">
          <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        </Link>

        {showBookmark && (
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`absolute top-[-1px] left-3 w-[34px] h-[45px] z-10 transition-transform ease-out ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img
                src={bookmarked ? Bookmarked : AddToBookmark}
                alt={bookmarked ? 'Bookmarked' : 'Add to Bookmark'}
                className="w-full h-full object-contain"
              />
            )}
          </button>
        )}

        {/* Score */}
        <div className="absolute top-2 right-2 bg-black/80 rounded-xl px-2 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-white font-medium text-[16px]">{voteAverage.toFixed(1)}</span>
        </div>
      </div>

      {/* Text & Actions */}
      <div className="flex-1 bg-[#141414] px-3 py-2 flex items-center justify-between rounded-b-2xl">
        <div>
          <h3 className="text-white text-sm lg:text-base font-poppins font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center text-gray-400 text-xs lg:text-sm space-x-1 mt-1 whitespace-nowrap">
            {year && <span>{year}</span>}
            {ratingFixed && <><span>•</span><span>{ratingFixed}</span></>}
            {runtime && <><span>•</span><span>{runtime}</span></>}
          </div>
        </div>

        {showDeleteButton ? (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleteLoading}
            className={`p-1 rounded-full transition-colors ${
              deleteLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title="Remove from list"
          >
            {deleteLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        ) : onMenuClick ? (
          <button
            type="button"
            onClick={handleMenuClick}
            className="p-1 rounded-full bg-white text-gray-900 hover:bg-gray-700/80 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

MovieCard.propTypes = {
  mediaType:        PropTypes.oneOf(['movie','tv']).isRequired,
  mediaId:          PropTypes.number.isRequired,
  // Direct props
  title:            PropTypes.string,
  poster:           PropTypes.string,
  voteAverage:      PropTypes.number,
  year:             PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
  runtime:          PropTypes.string,
  certification:    PropTypes.string,
  // Actions
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  showBookmark:     PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
  // Delete
  showDeleteButton: PropTypes.bool,
  deleteLoading:    PropTypes.bool,
  onDelete:         PropTypes.func,
  className:        PropTypes.string,
};