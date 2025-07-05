import { useState, useRef, useEffect } from "react";
import SimpleMovieCard from "../components/SimpleMovieCard";

export default function Index() {
  const [activeTab, setActiveTab] = useState("movies");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
React.useEffect(() => {
        fetch("https://api.themoviedb.org/3/trending/movie/{time_window}")
            .then(res => res.json())
            .then(res => setMemeImgs(res.data.memes))
    }, [])
  // Sample data - in a real app this would come from an API
  const [movies, setMovies] = useState([
    {
      id: "1",
      title: "The Dark Knight",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      score: 9.0,
      bookmarked: false,
    },
    {
      id: "2",
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      score: 8.8,
      bookmarked: true,
    },
    {
      id: "3",
      title: "Interstellar",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      score: 8.6,
      bookmarked: false,
    },
    {
      id: "4",
      title: "The Matrix",
      poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5h.jpg",
      score: 8.7,
      bookmarked: true,
    },
    {
      id: "5",
      title: "Pulp Fiction",
      poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      score: 8.9,
      bookmarked: false,
    },
    {
      id: "6",
      title: "Fight Club",
      poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      score: 8.8,
      bookmarked: false,
    },
  ]);

  const [series, setSeries] = useState([
    {
      id: "s1",
      title: "Breaking Bad",
      poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      score: 9.5,
      bookmarked: true,
    },
    {
      id: "s2",
      title: "Game of Thrones",
      poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      score: 9.2,
      bookmarked: false,
    },
    {
      id: "s3",
      title: "Stranger Things",
      poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      score: 8.7,
      bookmarked: true,
    },
    {
      id: "s4",
      title: "The Office",
      poster: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
      score: 8.9,
      bookmarked: false,
    },
    {
      id: "s5",
      title: "Friends",
      poster: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
      score: 8.9,
      bookmarked: true,
    },
  ]);

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

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

  const toggleBookmark = (id, type) => {
    if (type === "movies") {
      setMovies((prev) =>
        prev.map((movie) =>
          movie.id === id ? { ...movie, bookmarked: !movie.bookmarked } : movie
        )
      );
    } else {
      setSeries((prev) =>
        prev.map((show) =>
          show.id === id ? { ...show, bookmarked: !show.bookmarked } : show
        )
      );
    }
  };

  useEffect(() => {
    onScroll();
  }, [activeTab]);

  const currentItems = activeTab === "movies" ? movies : series;

  return (
    <div
      className="w-full min-h-screen font-poppins"
      style={{ backgroundColor: "#141414" }}
    >
      <div className="max-w-[1176px] mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full h-11 relative">
            <h2 className="text-white text-2xl font-bold leading-6">
              Trending
            </h2>

            <div className="flex items-center gap-4">


{/* Tab Switcher */}
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

              {/* View All Button */}
              <button className="flex items-center gap-1 px-2 py-1 text-white text-lg leading-6 font-normal">
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
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.82227 12.5H20.6523"
                    stroke="#B91E1E"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                style={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                style={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Movie Cards Container */}
            <div
            ref={scrollContainerRef}
            onScroll={onScroll}
            className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {currentItems.map((item) => (
              <div key={item.id} className="flex-shrink-0">
                <SimpleMovieCard
                  poster={item.poster}
                  title={item.title}
                  score={item.score}
                  bookmarked={item.bookmarked}
                  onBookmarkToggle={() => toggleBookmark(item.id, activeTab)}
                />
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}