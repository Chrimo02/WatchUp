import React from "react";
import { cn } from "@/lib/utils";
import AddToList from "../assets/AddToList.svg";

const MovieCardMenu = ({
  className,
  onRate,
  onAddToList,
  onFavorite,
  mediaType, 
  isFavorite = false,
  currentRating = 0,      
}) => (
  <div
    className={cn(
      "inline-flex w-fit h-fit px-3 py-4 justify-center rounded-2xl backdrop-blur-[2px] bg-black/85",
      className
    )}
  >
    <div className="flex flex-col gap-2">
      {/* ── Rate ───────────────────────────────────── */}
      <button
        onClick={onRate}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
     <div className="w-5 flex justify-center">
      {isFavorite ? (
        /* filled heart */
        <svg width="18" height="15" viewBox="0 0 18 15" fill="#e11d48">
          <path d="M10 15L8.84 13.92C4.72 10.1 2 7.58 2 4.5 …"/>
        </svg>
      ) : (
        /* outline */
        <svg width="18" height="15" viewBox="0 0 18 15" fill="none" stroke="#ccc">
          <path d="M10 15L8.84 13.92C4.72 10.1 2 7.58 2 4.5 …"/>
        </svg>
      )}
    </div>
    <span className="text-[#CCC] text-[14px] font-poppins">
      {isFavorite ? "Unfavorite" : "Favorite"}
    </span>
      </button>
      +
  {currentRating > 0 && (
    <div className="self-end mt-1 text-xs text-[#f5c518]">
      You rated {currentRating}/10
    </div>
  )}

      {/* ── Add to List (nur bei Filmen) ───────────── */}
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

      {/* ── Favorite ───────────────────────────────── */}
      <button
        onClick={onFavorite}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-5 flex justify-center">
          <svg
            width="18"
            height="15"
            viewBox="0 0 18 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 15L8.84 13.921C4.72 10.1035 2 7.57766 2 4.49591C2 1.97003 3.936 0 6.4 0C7.792 0 9.128 0.662125 10 1.70027C10.872 0.662125 12.208 0 13.6 0C16.064 0 18 1.97003 18 4.49591C18 7.57766 15.28 10.1035 11.16 13.921L10 15Z"
              fill="#CCCCCC"
            />
          </svg>
        </div>
        <span className="text-[#CCC] text-[14px] font-poppins">Favorite</span>
      </button>
    </div>
  </div>
);

export default MovieCardMenu;
