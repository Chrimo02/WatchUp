import React from "react";
import { Link } from "react-router-dom";
import AddToBookmark from "../assets/AddToBookmark.svg";
import Bookmarked     from "../assets/Bookmarked.svg";
import Star           from "../assets/Star.svg";
import DEFAULT_POSTER from '../assets/no-image-found.png';

export default function SimpleMovieCard({
  poster,
  title,
  score,
  bookmarked,
  isLoading = false,
  onBookmarkToggle,
  id,
  type,
  className = ""      
}) {
  
  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) onBookmarkToggle(id, type);
  };

  const linkPath = type === "tv" ? `/tv/${id}` : `/movie/${id}`;

  return (
    <Link to={linkPath} className={`movie-card ${className}`}>
      <div className="relative w-[188px] h-[312px] group">
        {/* Poster */}
        <img
          src={poster}
          alt={title}
          className="w-full h-[281px] object-cover rounded-[10px]"
          onError={(e) => (e.target.src = DEFAULT_POSTER)}
        />

        {/* Bookmark button */}
        <div
          onClick={handleBookmarkClick}
          className={`absolute left-[9px] top-0 w-[34px] h-[45px] z-10 ${
            isLoading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:scale-110"
          } transition-all duration-200`}
        >
          {isLoading ? (
            <div className="w-[34px] h-[45px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <img
              src={bookmarked ? Bookmarked : AddToBookmark}
              alt={bookmarked ? "Bookmarked" : "Add to Bookmark"}
              className="w-[34px] h-[45px] block object-cover"
            />
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute right-[5px] top-[5px] flex items-center gap-0.5 px-1 py-0.5 rounded-[10px] bg-black/80">
          <img src={Star} alt="Star" className="w-[11px] h-[11px]" />
          <span className="text-white text-base leading-6 font-normal">{score}</span>
        </div>

        {/* Title */}
        <h3 className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[138px] h-[23px] text-white text-center text-[15px] font-semibold leading-6 truncate">
          {title}
        </h3>
      </div>
    </Link>
  );
}
