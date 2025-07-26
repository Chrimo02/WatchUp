// src/components/MovieInfo/MovieRatings.jsx
import { useState } from "react";
import RatingModal from "./RatingModal";
import Star from "../../assets/Star.svg";
import IMDb from "../../assets/IMDb.png";
import Metacritic from "../../assets/Metacritic.png";
import RottenTomatoes from "../../assets/RottenTomatoes.png";

const MovieRatings = ({ 
  userScore, 
  userRatings, 
  yourRating, 
  imdbScore, 
  rottenTomatoesScore, 
  metacriticScore,
  isAuthenticated,
  onRateMovie,
  onClearRating,
  title
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);

  const hasUserRating = yourRating && yourRating > 0;
  const currentRating = hasUserRating ? parseFloat(yourRating) : 0;

  const openRatingModal = () => setShowRatingModal(true);
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setTempRating(0);
  };

  const submitRating = (rating) => {
    if (rating > 0 && onRateMovie) {
      onRateMovie(rating);
      closeRatingModal();
    }
  };

  const handleClearRating = () => {
    if (onClearRating) {
      onClearRating();
    }
  };

  const handleRatingClick = () => {
    if (isAuthenticated) {
      openRatingModal();
    } else {
      alert('Please sign in to rate movies');
    }
  };

  const formatRating = (rating, source) => {
    if (!rating || rating === 'N/A') {
      return null;
    }
    if (source === 'imdb') {
      return rating.replace('/10', '');
    }
    return rating;
  };

  const imdb = formatRating(imdbScore, 'imdb');
  const rt = formatRating(rottenTomatoesScore, 'rt');
  const mc = formatRating(metacriticScore, 'mc');

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* User Scores */}
        <div className="flex gap-4 md:gap-6">
          {/* TMDB Score */}
          <div className="text-center space-y-2">
            <span className="text-[#c3c3c4] text-sm md:text-base block">
              User Score TMDB
            </span>
            <div className="flex items-center gap-1 justify-center">
              <img src={Star} className="w-6 h-6" alt="Rating star icon"/>
              <div>
                <span className="text-white text-xl md:text-3xl font-normal">
                  {userScore}
                </span>
                <span className="text-[#c3c3c4] text-lg md:text-2xl font-normal">
                  /10
                </span>
              </div>
            </div>
            <span className="text-[#c3c3c4] text-xs md:text-sm block">
              {userRatings}
            </span>
          </div>

          {/* Your Rating */}
          <div className="text-center space-y-2">
            <span
              className={`
                text-[#c3c3c4] text-sm md:text-base block
                ${hasUserRating ? '' : 'invisible'}
              `}
            >
              Your Rating
            </span>
            <button
              onClick={handleRatingClick}
              className="bg-[#222629] hover:bg-[#222629]/80 rounded-full px-4 py-2 flex items-center gap-2 justify-center text-white transition-colors"
            >
              <img src={Star} className="w-6 h-6" alt="Rating star icon"/>
              <div>
                {hasUserRating ? (
                  <>
                    <span className="text-white text-xl md:text-3xl font-normal">
                      {yourRating} 
                    </span>
                    <span className="text-[#c3c3c4] text-lg md:text-2xl font-normal">
                      /10
                    </span>
                  </>
                ) : (
                  <span className="text-white text-xl md:text-3xl font-normal">
                    Rate
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* External Ratings */}
        <div className="flex flex-col space-y-2">
          {/* IMDb */}
          {imdb && (
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0">
                <img
                  src={IMDb}
                  alt="IMDb logo"
                  className="h-6 w-8 object-contain"
                />
              </div>
              <span className="ml-2 text-white text-lg font-light">
                {imdb}
              </span>
            </div>
          )}

          {/* Rotten Tomatoes */}
          {rt && (
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0">
                <img
                  src={RottenTomatoes}
                  alt="Rotten Tomatoes logo"
                  className="h-6 w-8 object-contain"
                />
              </div>
              <span className="ml-2 text-white text-lg font-light">
                {rt}
              </span>
            </div>
          )}

          {/* Metacritic */}
          {mc && (
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0">
                <img
                  src={Metacritic}
                  alt="Metacritic logo"
                  className="h-6 w-8 object-contain"
                />
              </div>
              <span className="ml-2 text-white text-lg font-light">
                {mc}
              </span>
            </div>
          )}
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={closeRatingModal}
        onSubmit={submitRating}
        tempRating={tempRating}
        setTempRating={setTempRating}
        title={title}
        currentRating={currentRating}
        onClearRating={handleClearRating}
      />
    </>
  );
};

export default MovieRatings;
