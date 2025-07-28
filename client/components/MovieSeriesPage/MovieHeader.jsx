// src/components/MovieInfo/MovieHeader.jsx
import React from "react";

const MovieHeader = ({ title, year, rating, releaseDate, genre, duration }) => (
  <div className="space-y-2">
    <h1 className="text-2xl md:text-[35px] leading-tight">
      <span className="text-white font-bold">{title} </span>
      <span className="text-[#c3c3c4] font-light">({year})</span>
    </h1>

    <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
      <div className="border border-[#c3c3c4] rounded-sm px-2 py-1">
        <span className="text-[#c3c3c4] font-light text-sm md:text-xl">
          {rating}
        </span>
      </div>
      <span className="text-white font-light">{releaseDate}</span>
      <span className="text-white font-normal">•</span>
      <span className="text-white font-light">{genre}</span>
      {duration && (
        <>
          <span className="text-white font-normal">•</span>
          <span className="text-white font-light">{duration}</span>
        </>
      )}
    </div>
  </div>
);

export default MovieHeader;
