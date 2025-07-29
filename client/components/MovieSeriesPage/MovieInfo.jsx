// MovieInfo.jsx
import { useState } from "react";
import MovieBackground from "./MovieBackground";
import MoviePoster from "./MoviePoster";
import MovieHeader from "./MovieHeader";
import MovieRatings from "./MovieRatings";
import MovieActions from "./MovieActions";
import MovieOverview from "./MovieOverview";
import MovieCrew from "./MovieCrew";
import TrailerModal from "./TrailerModal";

const MovieInfo = ({ movieData}) => {
    const [showTrailer, setShowTrailer] = useState(false);

const playTrailer = () => {
  if (movieData.trailer) {
    setShowTrailer(true);         
  } else if (movieData.trailerUrl) {
    window.open(movieData.trailerUrl, '_blank');  
  } else {
    setShowTrailer(true);         
  }
};


  const closeTrailer = () => setShowTrailer(false);

  return (
    <div className="w-full bg-[#0d1117] font-[Poppins] relative">
  <MovieBackground url={movieData.backgroundUrl} />

      {/* Main Content Container */}
  <div className="relative z-10 px-4 md:px-12 pt-[55px] pb-12">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Movie Poster */}
            <MoviePoster 
              posterUrl={movieData.posterUrl} 
              title={movieData.title} 
            />

            {/* Movie Details */}
            <div className="flex-1 space-y-6">
              <MovieHeader 
                title={movieData.title}
                year={movieData.year}
                rating={movieData.rating}
                releaseDate={movieData.releaseDate}
                genre={movieData.genre}
                duration={movieData.duration}
              />

              <MovieRatings 
                userScore={movieData.userScore}
                userRatings={movieData.userRatings}
                yourRating={movieData.yourRating}
                imdbScore={movieData.imdbScore}
                rottenTomatoesScore={movieData.rottenTomatoesScore}
                metacriticScore={movieData.metacriticScore}
                isAuthenticated={movieData.isAuthenticated}
                onRateMovie={movieData.onRateMovie}
                onClearRating={movieData.onClearRating}
                title={movieData.title}
              />

              <MovieActions 
                isAuthenticated={movieData.isAuthenticated}
                isFavorite={movieData.isFavorite}
                isInWatchlist={movieData.isInWatchlist}
                onFavoriteToggle={movieData.onFavoriteToggle}
                onWatchlistToggle={movieData.onWatchlistToggle}
                onPlayTrailer={playTrailer}
                onAddToList={movieData.onAddToList} 
              />

              <MovieOverview 
                tagline={movieData.tagline}
                overview={movieData.overview}
              />

              <MovieCrew crew={movieData.crew} />
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal 
        isOpen={showTrailer} 
        onClose={closeTrailer} 
        movieTitle={movieData.title}  
        trailer={movieData.trailer}  
      />
    </div>
  );
};

export default MovieInfo;

