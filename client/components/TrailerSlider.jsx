import { useState, useRef, useEffect } from "react";
import { MovieTrailerCard } from "./MovieTrailerCard";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Curtain from '../assets/backgroundcurtain.png';

const TrailerSlider = ({ upcomingMovies = [] }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    onScroll();
  }, [upcomingMovies]);

  // Don't render if no upcoming movies
  if (!upcomingMovies || upcomingMovies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
     
      {/* Full-width Background Container */}
      <div className="relative w-screen -ml-[50vw] left-1/2">
      
        <div 
          className="relative w-full h-[330px] bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `url(${Curtain})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>

          {/* Constrained Content Container */}
          <div className="max-w-[1176px] mx-auto px-4 h-full relative">
              <h2 className="text-white text-2xl font-bold mb-4 mt-4">
                Recent Trailers
              </h2>
            {/* Scrollable Content */}
            <div className="relative flex">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Trailer Cards Container - Now constrained */}
              <div
                ref={scrollContainerRef}
                onScroll={onScroll}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth items-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {upcomingMovies.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0">
                    <MovieTrailerCard
                      title={movie.title}
                      releaseDate={movie.release_date}
                      posterUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'}
                      youtubeId={movie.youtubeId}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerSlider;