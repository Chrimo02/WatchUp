// MovieCardMenu.jsx
import React from "react";
import { cn } from "@/lib/utils";
import AddToList from "../assets/AddToList.svg";

/*  PROPS
 *  mediaType       "movie" | "tv"
 *  onRate          () -> void             (opens rating modal)
 *  onAddToList     () -> void
 *  onFavorite      () -> void
 *  onClearRating   () -> void  (optional) “remove rating” handler
 *  isFavorite      boolean
 *  currentRating   number 0‑10   (0 === not rated)
 */
const MovieCardMenu = ({
  className,
  mediaType,
  onRate,
  onAddToList,
  onFavorite,
  onClearRating,
  isFavorite = false,
  currentRating = 0,
}) => (
  <div
    className={cn(
      "inline-flex w-fit h-fit px-3 py-4 rounded-2xl backdrop-blur-[2px] bg-black/85",
      className
    )}
  >
    <div className="flex flex-col gap-2">

      {/* ───── Rate / Rating info ───── */}
      {currentRating === 0 ? (
        /* Not rated yet → grey star + “Rate” */
        <button
          onClick={onRate}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 flex justify-center">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="#CCCCCC">
              <path d="M10.5 2L13.09 7.26L19 8.27L14.75 12.14L15.68 18.02
                       L10.5 15.77L5.32 18.02L6.25 12.14L2 8.27L7.91 7.26L10.5 2Z" />
            </svg>
          </div>
          <span className="text-[#CCC] text-[14px] font-poppins">Rate</span>
        </button>
      ) : (
        /* Already rated → yellow star + score, acts like a button */
        <div className="flex items-center gap-1">
          <button
            onClick={onRate}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-5 flex justify-center">
              <svg width="21" height="21" viewBox="0 0 21 21" fill="#f5c518">
                <path d="M10.5 2L13.09 7.26L19 8.27L14.75 12.14L15.68 18.02
                         L10.5 15.77L5.32 18.02L6.25 12.14L2 8.27L7.91 7.26L10.5 2Z" />
              </svg>
            </div>
            <span className="text-[#f5c518] text-[14px] font-poppins">
              You&nbsp;rated&nbsp;{currentRating}/10
            </span>
          </button>

          {/* optional tiny “clear” icon */}
          {onClearRating && (
            <button
              onClick={onClearRating}
              className="ml-1 p-1 rounded hover:bg-white/10 transition-colors"
              title="Clear rating"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#808080">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ───── Add‑to‑List (movies only) ───── */}
      {mediaType === "movie" && (
        <button
          onClick={onAddToList}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 flex justify-center">
            <img src={AddToList} alt="" />
          </div>
          <span className="text-[#CCC] text-[14px] font-poppins">
            Add&nbsp;to&nbsp;List
          </span>
        </button>
      )}

      {/* ───── Favorite toggle ───── */}
      <button
        onClick={onFavorite}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-5 flex justify-center">
          <svg width="18" height="15" viewBox="0 0 18 15"
               fill={isFavorite ? "#e11d48" : "#CCCCCC"}>
            <path d="M10 15L8.84 13.921C4.72 10.1035 2 7.57766 2 4.49591
                     C2 1.97003 3.936 0 6.4 0C7.792 0 9.128 0.662125 10 1.70027
                     C10.872 0.662125 12.208 0 13.6 0C16.064 0 18 1.97003 18 4.49591
                     C18 7.57766 15.28 10.1035 11.16 13.921L10 15Z" />
          </svg>
        </div>
        <span
          className={cn(
            "text-[14px] font-poppins",
            isFavorite ? "text-[#e11d48]" : "text-[#CCC]"
          )}
        >
          {isFavorite ? "Favorited" : "Favorite"}
        </span>
      </button>
    </div>
  </div>
);

export default MovieCardMenu;
