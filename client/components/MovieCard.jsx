import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Star, MoreHorizontal, Trash2} from "lucide-react";
import AddToBookmark from "../assets/AddToBookmark.svg";
import Bookmarked from "../assets/Bookmarked.svg";
import NoImageFound from "../assets/no-image-found.png";

export default function MovieCard({
  id,
  mediaType,           // "movie" | "tv"
  title,
  poster,
  voteAverage,         // number (0‑10)
  year,                // string | number
  runtime,             // string like "1h 58m"  (optional)
  certification,       // "PG‑13", "12", "NR" … (optional)
  bookmarked = false,
  isLoading  = false,
  onBookmarkToggle,
  onMenuClick,
  onDelete,
  className = '',
  showBookmark = true, // New prop to control bookmark visibility
  showDeleteButton = false,
  deleteLoading = false,

}) {
  const handleBookmarkClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && onBookmarkToggle) {
      onBookmarkToggle(id, mediaType);
    }
  };

  const handleMenuClick = e => {
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick(id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (!deleteLoading && onDelete) {
      onDelete(mediaId, mediaType)
    }
  }
  const ratingFixed = certification ? certification.replace('-', '‑') : '';

  return (
    <div className={`
      relative flex flex-col bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden
      ${className}
    `}>
      {/* Poster */}
      <div className="relative w-full flex-shrink-0 aspect-[2/3]">
        <Link to={`/${mediaType}/${id}`} className="absolute inset-0 z-0">
          <img
            src={poster || NoImageFound}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </Link>


        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`
            absolute top-[-1px] left-3 w-[34px] h-[45px] z-10
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            transition-transform ease-out
          `}
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
        )

        {/* Score */}
        <div className="absolute top-2 right-2 bg-black/80 rounded-xl px-2 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-white font-medium text-[16px]">
            {voteAverage.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 bg-[#141414] px-3 py-2 flex items-center justify-between rounded-b-2xl">
        <div>
          <h3 className="text-white text-sm lg:text-base font-poppins font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
          {/* meta row */}
          <div className="flex items-center text-gray-400 text-xs lg:text-sm space-x-1 mt-1 whitespace-nowrap">
            {year && <span>{year}</span>}
            {ratingFixed && (
              <><span>•</span><span>{ratingFixed}</span></>
            )}
            {runtime && (
              <><span>•</span><span>{runtime}</span></>
            )}
          </div>
        </div>

        {/* Show delete button or menu button based on props */}
        {showDeleteButton ? (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleteLoading}
            className={`
              p-1 rounded-full transition-colors
              ${
                deleteLoading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
            `}
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
  id:            PropTypes.number.isRequired,
  mediaType:     PropTypes.oneOf(["movie","tv"]).isRequired,
  title:         PropTypes.string.isRequired,
  poster:        PropTypes.string,
  voteAverage:   PropTypes.number.isRequired,
  year:          PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
  runtime:       PropTypes.string,
  certification: PropTypes.string,
  bookmarked:    PropTypes.bool,
  isLoading:     PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
  onDelete:         PropTypes.func,
  className:        PropTypes.string,
  showBookmark:     PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  deleteLoading:    PropTypes.bool,
};

