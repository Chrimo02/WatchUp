// MovieSlider.jsx
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
  bookmarkLoadingStates = new Set()
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [fadeLeft, setFadeLeft] = useState(0);
  const [fadeRight, setFadeRight] = useState(1);
  const scrollRef = useRef(null);

  const updateScroll = () => {
    const c = scrollRef.current;
    if (!c) return;
    const { scrollLeft, scrollWidth, clientWidth } = c;
    const maxScroll = scrollWidth - clientWidth;

    // binary flags
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScroll - 1);

    // continuous fade over half a card width
    const firstCard = c.children[0];
    const cardWidth = firstCard?.offsetWidth ?? clientWidth;
    const threshold = cardWidth / 2;

    const rightOpacity = Math.max(0, Math.min(1, (threshold - scrollLeft) / threshold));
    const leftOpacity  = Math.max(0, Math.min(1, (scrollLeft - threshold) / threshold));
    setFadeRight(rightOpacity);
    setFadeLeft(leftOpacity);
  };

  const scrollBy = (distance) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleBookmarkToggle = async (itemId, itemType) => {
    try {
      await onBookmarkToggle(itemId, itemType);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  useEffect(() => {
    updateScroll();
  }, [activeTab, movieItems, seriesItems]);

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    c.scrollLeft = 0;
    updateScroll();
  }, [activeTab]);

  if ((!movieItems.length) && (!seriesItems.length)) return null;
  const currentItems = activeTab === "movies" ? movieItems : seriesItems;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full h-11 relative">
        <h2 className="text-white text-2xl font-bold leading-6">{title}</h2>
        <div className="flex items-center gap-4">
          {showTabSwitcher && seriesItems.length > 0 && (
            <div className="relative inline-flex rounded-full border border-primary p-1">
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-in-out"
                style={{
                  left: activeTab === "movies" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
              />
              <div className="relative z-10 flex">
                <button
                  onClick={() => switchTab("movies")}
                  className="px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-300 rounded-full min-w-[70px]"
                  style={{ color: activeTab === "movies" ? "#B91E1E" : "#FFF" }}
                >
                  Movies
                </button>
                <button
                  onClick={() => switchTab("series")}
                  className="px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-300 rounded-full min-w-[70px]"
                  style={{ color: activeTab === "series" ? "#B91E1E" : "#FFF" }}
                >
                  Series
                </button>
              </div>
            </div>
          )}
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

      {/* Slider + Gradients */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-300)}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Left Fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-16 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, #000, transparent)',
            opacity: fadeLeft
          }}
        />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={updateScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {currentItems.map(item => (
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

        {/* Right Fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-20 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to left, #141413, transparent)',
            opacity: fadeRight
          }}
        />

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy(300)}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieSlider;
