import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { getPosterUrl } from '../utils/api';
import { Star, MoreHorizontal, Trash2 } from 'lucide-react';
import AddToBookmark from '../assets/AddToBookmark.svg?url';
import Bookmarked from '../assets/Bookmarked.svg?url';
import NoImageFound from '../assets/no-image-found.png';

export default function MovieCard({
  mediaType, mediaId,
  title: propTitle, poster: propPoster,
  voteAverage: propVoteAverage, year: propYear,
  runtime: propRuntime, certification: propCertification,
  bookmarked = false, isLoading = false,
  showBookmark = true, showDeleteButton = false,
  deleteLoading = false,
  onBookmarkToggle, onMenuClick, onDelete,
  className = '',
}) {
  const navigate = useNavigate();
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

  // resolve data
  const title = propTitle || details.title || details.name;
  const poster = propPoster ||
    (details.poster_path && getPosterUrl(details.poster_path, 'w500')) ||
    NoImageFound;
  const voteAverage = propVoteAverage != null
    ? propVoteAverage
    : (details.vote_average || 0);
  const year = propYear != null
    ? propYear
    : (() => {
        const d = details.release_date || details.first_air_date;
        return d ? new Date(d).getFullYear() : null;
      })();
  const runtime = propRuntime != null
    ? propRuntime
    : (() => {
        const mins = mediaType === 'movie'
          ? details.runtime
          : (details.episode_run_time?.[0] || 0);
        return mins ? `${Math.floor(mins/60)}h ${mins%60}m` : null;
      })();
  const certification = propCertification || (details.adult ? '18+' : null);
  const certFixed = certification?.replace('-', '‑') ?? null;

  // handlers
  const handleCardClick = () => navigate(`/${mediaType}/${mediaId}`);
  const handleBookmarkClick = e => {
    e.stopPropagation();
    if (!isLoading && onBookmarkToggle) onBookmarkToggle(mediaId, mediaType);
  };
  const handleMenuClick = e => {
    e.stopPropagation();
    if (onMenuClick) onMenuClick(mediaId);
  };
  const handleDeleteClick = e => {
    e.stopPropagation();
    if (!deleteLoading && onDelete) onDelete(mediaId, mediaType);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative cursor-pointer flex flex-col bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Poster */}
      <div className="relative w-full flex-shrink-0 aspect-[2/3]">
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {showBookmark && (
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`absolute top-[-1px] left-3 w-[34px] h-[45px] z-10 transition-transform ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer hover:scale-110'
            }`}
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
        )}

        <div className="absolute top-2 right-2 bg-black/80 rounded-xl px-2 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current"/>
          <span className="text-white font-medium text-[14px]">
            {voteAverage.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Title + Actions */}
      <div className="flex-1 bg-[#141414] px-3 py-2 flex items-center justify-between">
        <div className="flex-1 pr-2">
          <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center text-gray-400 text-xs space-x-1 mt-1 whitespace-nowrap">
            {year && <span>{year}</span>}
            {certFixed && <><span>•</span><span>{certFixed}</span></>}
            {runtime && <><span>•</span><span>{runtime}</span></>}
          </div>
        </div>

        {showDeleteButton ? (
          <button
            onClick={handleDeleteClick}
            disabled={deleteLoading}
            className={`p-1 rounded-full transition-colors ${
              deleteLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {deleteLoading
              ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
              : <Trash2 className="w-5 h-5"/>
            }
          </button>
        ) : onMenuClick ? (
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5"/>
          </button>
        ) : null}
      </div>
    </div>
  );
}

MovieCard.propTypes = {
  mediaType:        PropTypes.oneOf(['movie','tv']).isRequired,
  mediaId:          PropTypes.number.isRequired,
  title:            PropTypes.string,
  poster:           PropTypes.string,
  voteAverage:      PropTypes.number,
  year:             PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
  runtime:          PropTypes.string,
  certification:    PropTypes.string,
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  showBookmark:     PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
  showDeleteButton: PropTypes.bool,
  deleteLoading:    PropTypes.bool,
  onDelete:         PropTypes.func,
  className:        PropTypes.string,
};
