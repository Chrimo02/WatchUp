import { useState, useRef, useEffect } from "react";
import SimpleMovieCard from "./SimpleMovieCard";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieSlider = ({ 
  movieItems = [],
  seriesItems = [],
  onBookmarkToggle, 
  title = "Movies",
  showViewAll = true,
  onViewAll,
  showTabSwitcher = true,
  defaultTab = "movies",
  bookmarkLoadingStates = new Set() // Accept loading states from parent
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    // Reset scroll position when switching tabs
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleBookmarkToggle = async (itemId, itemType) => {
    console.log(`Bookmark toggle initiated for ${itemType} ${itemId}`);
    
    try {
      await onBookmarkToggle(itemId, itemType);
      console.log(`Bookmark toggle completed for ${itemType} ${itemId}`);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  useEffect(() => {
    onScroll();
  }, [activeTab, movieItems, seriesItems]);

  // Get current items based on active tab
  const currentItems = activeTab === "movies" ? movieItems : seriesItems;

  // Don't render if no items for either tab
  if ((!movieItems || movieItems.length === 0) && (!seriesItems || seriesItems.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full h-11 relative">
        <h2 className="text-white text-2xl font-bold leading-6">
          {title}
        </h2>

        <div className="flex items-center gap-4">
          {/* Tab Switcher */}
          {showTabSwitcher && seriesItems && seriesItems.length > 0 && (
            <div className="relative inline-flex rounded-full border border-primary p-1">
              {/* Sliding background */}
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-in-out"
                style={{
                  left: activeTab === "movies" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
              />
              
              {/* Button container */}
              <div className="relative z-10 flex">
                <button
                  onClick={() => switchTab("movies")}
                  className="px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-300 rounded-full min-w-[70px]"
                  style={{
                    color: activeTab === "movies" ? "#B91E1E" : "#FFF",
                  }}
                >
                  Movies
                </button>
                <button
                  onClick={() => switchTab("series")}
                  className="px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-300 rounded-full min-w-[70px]"
                  style={{
                    color: activeTab === "series" ? "#B91E1E" : "#FFF",
                  }}
                >
                  Series
                </button>
              </div>
            </div>
          )}

          {/* View All Button */}
          {showViewAll && onViewAll && (
            <button 
              onClick={() => onViewAll(activeTab)}
              className="flex items-center gap-1 px-2 py-1 text-white text-lg leading-6 font-normal hover:opacity-80 transition-opacity"
            >
              <span>View All</span>
              <svg
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 flex-shrink-0"
              >
                <path
                  d="M14.752 6.42993L20.822 12.4999L14.752 18.5699"
                  stroke="#B91E1E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.822 12.4999H4.822"
                  stroke="#B91E1E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative">
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

        {/* Movie Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {currentItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex-shrink-0">
              <SimpleMovieCard
                id={item.id}
                type={item.type}
                poster={item.poster}
                title={item.title}
                score={item.score}
                bookmarked={item.bookmarked}
                isLoading={bookmarkLoadingStates.has(item.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieSlider;