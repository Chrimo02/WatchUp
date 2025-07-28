import React, { useState, useEffect, useRef } from "react";
import { Popover } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useMovies } from "../contexts/MovieContext";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarkToggle } from "../hooks/useBookmarkToggle";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getMovies,
  getMovieWatchProviders,
  markAsFavorite,
  addToWatchlist,
  rateMovie,
} from "../utils/api";
import MovieCard from "../components/MovieCard";
import MovieCardMenu from "../components/MovieCardMenu";
import ListComponent from "../components/ListComponent";
import FilterIcon from "../components/icons/FilterIcon";
import ListIcon from "../components/icons/ListIcon";
import GridIcon from "../components/icons/GridIcon";
import AdvancedSearch from "../components/AdvancedSearch";
import chairsBg from "../assets/chairs.jpg";
import { SortSelect } from "@/components/ui/SortSelect";


export default function DiscoveryPage() {
  const {
    loading: globalLoading,
    error,
    discoverMoviesByFilter,
    getBatchAccountStates,
    isInWatchlist,
  } = useMovies();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { region } = useLanguage();

  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [providersMap, setProvidersMap] = useState({});
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState("date_desc");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const [rowHeight, setRowHeight] = useState(null);
  const gridRef = useRef(null);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const sortByMap = {
    date_desc: "primary_release_date.desc",
    date_asc: "primary_release_date.asc",
    name_asc: "original_title.asc",
    name_desc: "original_title.desc",
    rating_desc: "vote_average.desc",
    rating_asc: "vote_average.asc",
    popularity_desc: "popularity.desc",
    popularity_asc: "popularity.asc",
  };
  const sortBy = sortByMap[sortOption];

  // close open menus on outside click
  useEffect(() => {
    const onOutside = () => setMenuOpenFor(null);
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, []);

  // fetch data, states, providers
  useEffect(() => {
    const load = async () => {
      try {
        let results = [], total = 0;
        if (sortOption === "trending") {
          const { data } = await getMovies.trending();
          results = data.results;
          total = results.length;
        } else {
          const { results: res, total_results } = await discoverMoviesByFilter({
            page,
            sort_by: sortBy,
            "vote_count.gte": 50,
            ...filters,
          });
          results = res;
          total = total_results;
        }

        setMovies(results);
        setTotalResults(total);

        if (isAuthenticated && user?.id && sessionId && results.length) {
          await getBatchAccountStates(
            results.map((m) => ({ id: m.id, type: "movie" })),
            sessionId
          );
        }

        const provs = await Promise.all(
          results.map(async (m) => {
            const { data } = await getMovieWatchProviders(m.id);
            return [m.id, data.results[region] || {}];
          })
        );
        setProvidersMap(Object.fromEntries(provs));
      } catch (err) {
        console.error("DiscoveryPage load error:", err);
        setMovies([]);
        setTotalResults(0);
        setProvidersMap({});
      }
    };
    load();
  }, [
    sortOption,
    page,
    sortBy,
    discoverMoviesByFilter,
    filters,
    isAuthenticated,
    user,
    sessionId,
    getBatchAccountStates,
    region,
  ]);

  // sync pagination input
  useEffect(() => {
    setInputPage(page);
  }, [page]);
  const commitPage = () => {
    let v = parseInt(inputPage, 10) || 1;
    v = Math.min(Math.max(v, 1), totalPages);
    setPage(v);
  };
  const onKeyDown = (e) => e.key === "Enter" && commitPage();

  // uniform grid row heights
  useEffect(() => {
    if (viewMode !== "grid") return;
    const measure = () => {
      if (!gridRef.current) return;
      let max = 0;
      gridRef.current
        .querySelectorAll(".movie-card-wrapper")
        .forEach((el) => {
          max = Math.max(max, el.getBoundingClientRect().height);
        });
      setRowHeight(max);
    };
    const tid = setTimeout(measure, 0);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(tid);
      window.removeEventListener("resize", measure);
    };
  }, [movies, bookmarkLoadingStates, viewMode]);

  if (globalLoading)
    return <div className="py-20 text-center text-white">Loading…</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;

  const items = movies.map((m) => ({
    mediaId: m.id,
    mediaType: "movie",
    bookmarked: isInWatchlist(m.id, "movie"),
    isLoading: bookmarkLoadingStates.has(m.id),
  }));

  const headerText =
    sortOption === "trending" ? "Trending Titles" : "Discover Titles";

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
        <h1 className="relative text-4xl font-extrabold">{headerText}</h1>
        <div className="absolute bottom-4 left-8">
          <p className="text-sm">
            {(page - 1) * pageSize + 1} –{" "}
            {Math.min(page * pageSize, totalResults)} of {totalResults} Titles
          </p>
        </div>
        <div className="absolute bottom-4 right-8 flex items-center space-x-3">
          {/* FILTER */}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600">
              <FilterIcon className="w-5 h-5 text-white" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </Popover.Button>
            <Popover.Panel className="absolute left-[-240px] w-[600px] bg-[#141414] rounded-[50px] shadow-lg z-20">
              <AdvancedSearch onSearch={setFilters} />
            </Popover.Panel>
          </Popover>

          {/* SORT */}
          <div className="relative">
            <SortSelect
              value={sortOption}
              onChange={(val) => {
                setSortOption(val);
                setPage(1);
              }}
            />
          </div>

          {/* VIEW MODE */}
          <button
            className={`p-2 rounded ${viewMode === "list" ? "bg-white text-black" : "bg-gray-800"
              }`}
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="w-6 h-6" />
          </button>
          <button
            className={`p-2 rounded ${viewMode === "grid" ? "bg-white text-black" : "bg-gray-800"
              }`}
            onClick={() => setViewMode("grid")}
          >
            <GridIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {items.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No movies found.</div>
        ) : viewMode === "grid" ? (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-start items-stretch"
            style={rowHeight ? { gridAutoRows: `${rowHeight}px` } : {}}
          >
            {items.map(({ mediaId, mediaType, bookmarked, isLoading }) => (
              <div
                key={mediaId}
                className="movie-card-wrapper relative w-[200px]"
              >
                <MovieCard
                  mediaId={mediaId}
                  mediaType={mediaType}
                  bookmarked={bookmarked}
                  isLoading={isLoading}
                  onBookmarkToggle={handleBookmarkToggle}
                  onMenuClick={() =>
                    setMenuOpenFor(menuOpenFor === mediaId ? null : mediaId)
                  }
                  className="h-full"
                />
                {menuOpenFor === mediaId && (
                  <div
                    className="absolute right-2 top-[calc(100%_-_48px)] z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MovieCardMenu
                      onRate={(rating) =>
                        rateMovie(mediaId, sessionId, rating)
                      }
                      onAddToList={() =>
                        addToWatchlist(
                          user.id,
                          sessionId,
                          mediaId,
                          "movie",
                          !isInWatchlist(mediaId, "movie")
                        )
                      }
                      onFavorite={() =>
                        markAsFavorite(
                          user.id,
                          sessionId,
                          mediaId,
                          "movie",
                          !isInWatchlist(mediaId, "movie")
                        )
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(({ mediaId, mediaType, bookmarked, isLoading }) => (
              <ListComponent
                key={mediaId}
                mediaType={mediaType}
                mediaId={mediaId}
                bookmarked={bookmarked}
                isLoading={isLoading}
                onBookmarkToggle={handleBookmarkToggle}
                onFavorite={() =>
                  markAsFavorite(
                    user.id,
                    sessionId,
                    mediaId,
                    "movie",
                    !isInWatchlist(mediaId, "movie")
                  )
                }
                onAddToList={() =>
                  addToWatchlist(
                    user.id,
                    sessionId,
                    mediaId,
                    "movie",
                    !isInWatchlist(mediaId, "movie")
                  )
                }
                onRate={(value) => rateMovie(mediaId, sessionId, value)}
                streamingPlatforms={[
                  ...(providersMap[mediaId]?.flatrate || []),
                  ...(providersMap[mediaId]?.rent || []),
                  ...(providersMap[mediaId]?.buy || []),
                ].map((p) => ({
                  icon: p.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                      alt={p.provider_name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : null,
                  name: p.provider_name,
                }))}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {sortOption !== "trending" && (
          <div className="flex justify-center items-center gap-4">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              &laquo; Previous
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={commitPage}
                onKeyDown={onKeyDown}
                className="w-16 text-center bg-gray-800 border border-gray-600 rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <span className="text-sm">/ {totalPages}</span>
            </div>
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}