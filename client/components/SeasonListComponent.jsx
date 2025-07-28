import React from 'react'
import PropTypes from 'prop-types'
import {Star} from "lucide-react";
import RatingButton from './RatingButton';

export default function SeasonListComponent({
  id,
  name,
  air_date,
  runtime,
  vote_average,
  overview,
  still_path,
  onRate,
  yourRating = 0,
  isAuthenticated
}) {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
  const imgSrc = still_path
    ? `${IMAGE_BASE_URL}${still_path}`
    : 'https://via.placeholder.com/320x180?text=No+Image'

  return (
    <div
      key={id}
      className="flex bg-[#181818] border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <img
        src={imgSrc}
        alt={name}
        className="w-[320px] h-[180px] object-cover flex-shrink-0"
      />
      <div className="flex flex-col p-4 pl-6 text-white flex-1">
        <h3 className="text-2xl font-[550] font-poppins">{name}</h3>
        <div className="flex items-center text-sm text-white mt-1 ms-3 font-sans">
          <span>{new Date(air_date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          <span className="mx-2">•</span>
          <span>{runtime}m</span>
        </div>
        <div className="flex items-center space-x-2 ms-3 mb-2">
            {/* Star Icon */}
            <Star
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                stroke="none"
            />

            {/* Numeric Score */}
            <span className="text-[18px] font-semibold text-yellow-400 font-sans">
                {vote_average.toFixed(1)}
            </span>

            {/* Rate Button */}
            {onRate && (
              <button
                onClick={() => onRate(id)}
                className="
                  flex items-center gap-1 
                  text-[16px] font-medium text-red-500 
                  hover:text-red-300 transition-colors 
                  font-sans
                "
              >
                <Star className="w-5 h-5" />
                <span>
                  { yourRating > 0 
                      ? `${yourRating.toFixed(1)}/10`  // show saved rating
                      : 'Rate'                         // or “Rate”
                  }
                </span>
              </button>
            )}

        </div>

        <p className="text-[15px] text-white leading-relaxed line-clamp-3 font-sans">
          {overview}
        </p>
      </div>
    </div>
  )
}
