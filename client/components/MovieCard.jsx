// src/components/MovieCard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import PropTypes from 'prop-types'
import { useMovies } from '../contexts/MovieContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getPosterUrl,
  getMovieReleaseDates,
  getAgeRatingForRegion,
} from '../utils/api'
import { Star, MoreHorizontal } from 'lucide-react'
import AddToBookmark from '../assets/AddToBookmark.svg?url'
import Bookmarked    from '../assets/Bookmarked.svg?url'

export default function MovieCard({
  mediaType,
  mediaId,
  bookmarked = false,
  isLoading  = false,
  onBookmarkToggle,
  onMenuClick,
  className  = '',
}) {
  const { fetchMovieDetails, fetchTVShowDetails } = useMovies()
  const { region } = useLanguage()

  const [details, setDetails]     = useState(null)
  const [ageRating, setAgeRating] = useState(null)

  /* ─── load basic item details ─── */
  useEffect(() => {
    (async () => {
      try {
        const res = mediaType === 'movie'
          ? await fetchMovieDetails(mediaId)
          : await fetchTVShowDetails(mediaId)
        setDetails(res)
      } catch (err) {
        console.error('Error loading details', err)
      }
    })()
  }, [mediaType, mediaId, fetchMovieDetails, fetchTVShowDetails])

  /* ─── load region certificate once details are ready ─── */
  useEffect(() => {
    if (!details || mediaType !== 'movie') {
      setAgeRating(details?.adult ? '18+' : '13+')
      return
    }
    ;(async () => {
      try {
        const { data } = await getMovieReleaseDates(mediaId)
        const cert =
          getAgeRatingForRegion(data, region) || (details.adult ? '18+' : 'NR')
        setAgeRating(cert)
      } catch (err) {
        console.error('Error loading certificate', err)
        setAgeRating(details.adult ? '18+' : 'NR')
      }
    })()
  }, [details, mediaType, mediaId, region])

  if (!details) return null

  const title      = details.title || details.name
  const date       = details.release_date || details.first_air_date
  const year       = date ? new Date(date).getFullYear() : ''
  const runtimeMin = mediaType === 'movie'
    ? details.runtime
    : (details.episode_run_time?.[0] || 0)
  const runtimeStr  = `${Math.floor(runtimeMin / 60)}h ${runtimeMin % 60}m`
  const ratingFixed = (ageRating || '').replace('-', '‑') // non‑breaking hyphen

  const handleBookmarkClick = e => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoading) onBookmarkToggle(mediaId, mediaType)
  }

  const handleMenuClick = e => {
    e.stopPropagation()
    onMenuClick(mediaId)
  }

  return (
    <div className={`
      relative flex flex-col bg-[#141414] border border-gray-700 rounded-2xl overflow-hidden
      ${className}
    `}>
      {/* Poster */}
      <div className="relative w-full flex-shrink-0 aspect-[2/3]">
              <Link to={`/${mediaType}/${mediaId}`} className="absolute inset-0 z-0">

        <img
          src={getPosterUrl(details.poster_path, 'w500')}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
  </Link>
        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`
            absolute top-[-1px] left-3 w-[34px] h-[45px] z-10
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            transition-transform ease-out
          `}
        >
          {isLoading
            ? <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              </div>
            : <img
                src={bookmarked ? Bookmarked : AddToBookmark}
                alt={bookmarked ? 'Bookmarked' : 'Add to Bookmark'}
                className="w-full h-full object-contain"
              />}
        </button>

        {/* Score */}
        <div className="absolute top-2 right-2 bg-black/80 rounded-xl px-2 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current"/>
          <span className="text-white font-medium text-[16px]">
            {details.vote_average.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 bg-[#141414] px-3 py-2 flex items-center justify-between rounded-b-2xl">
        <div>
          <h3 className="text-white text-sm lg:text-base font-poppins font-semibold leading-tight">
            {title}
          </h3>
          {/*  ── meta row: now kept on one line ── */}
          <div className="flex items-center text-gray-400 text-xs lg:text-sm space-x-1 mt-1 whitespace-nowrap">
            {year && <span>{year}</span>}<span>•</span>
            <span>{ratingFixed}</span><span>•</span>
            <span>{runtimeStr}</span>
          </div>
        </div>

        {onMenuClick && (
          <button
            type="button"
            onClick={handleMenuClick}
            className="p-1 rounded-full bg-white text-gray-900 hover:bg-gray-700/80 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5"/>
          </button>
        )}
      </div>
    </div>
  )
}

MovieCard.propTypes = {
  mediaType:        PropTypes.string.isRequired,
  mediaId:          PropTypes.number.isRequired,
  bookmarked:       PropTypes.bool,
  isLoading:        PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  onMenuClick:      PropTypes.func,
  className:        PropTypes.string,
}