import React from "react";
import { cn } from "@/lib/utils";
import AddToList from '../assets/AddToList.svg';

const MovieCardMenu = ({ className, onRate, onAddToList, onFavorite }) => {
  return (
    <div
      className={cn(
        "flex w-[123px] h-[114px] px-3 py-[15px] justify-center items-center rounded-[20px] backdrop-blur-[2px]",
        "bg-black/85",
        className,
      )}
    >
      <div className="flex w-[98px] h-[84px] flex-col items-start gap-[9px] flex-shrink-0">
        {/* Rate */}
        <button
          onClick={onRate}
          className="flex items-center gap-[5px] w-full hover:opacity-80 transition-opacity"
        >
          <div className="w-[21px] h-[21px] flex-shrink-0">
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 2L13.09 7.26L19 8.27L14.75 12.14L15.68 18.02L10.5 15.77L5.32 18.02L6.25 12.14L2 8.27L7.91 7.26L10.5 2Z"
                fill="#CCCCCC"
              />
            </svg>
          </div>
          <span
            className="text-[#CCC] font-poppins text-[16px] font-normal leading-normal"
            style={{
              fontFamily:
                "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            Rate
          </span>
        </button>

        {/* Add to List */}
        <button
          onClick={onAddToList}
          className="flex justify-center items-center gap-2 w-full hover:opacity-80 transition-opacity"
        >
          <div className="flex w-[18px] justify-center items-center">
          <img src={AddToList} alt="Add to list" />
          </div>
          <span
            className="text-[#CCC] font-poppins text-[14px] font-normal leading-normal flex-1"
            style={{
              fontFamily:
                "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            Add to List
          </span>
        </button>

        {/* Favorite */}
        <button
          onClick={onFavorite}
          className="flex items-center gap-[9px] w-full hover:opacity-80 transition-opacity"
        >
          <div className="flex w-4 justify-center items-center">
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
          <span
            className="text-[#CCC] font-poppins text-[14px] font-normal leading-normal flex-1"
            style={{
              fontFamily:
                "Poppins, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            Favorite
          </span>
        </button>
      </div>
    </div>
  );
};

export default MovieCardMenu;