import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useAuth  } from '../contexts/AuthContext';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useLanguage }      from '../contexts/LanguageContext';
import AddToListModal from '../components/AddToListModal';
import RatingModal from '../components/MovieSeriesPage/RatingModal';
import {
  getMovies,
  getMovieWatchProviders,
  markAsFavorite,
  rateMovie,
  getMovieDetailsWithLanguage,
  getMovieReleaseDates,
  deleteMovieRating,
  getAgeRatingForRegion,
} from '../utils/api';

import MovieCard from '../components/MovieCard';
import MovieCardMenu from '../components/MovieCardMenu';
import ListComponent from '../components/ListComponent';
import FilterIcon from '../components/icons/FilterIcon';
import ListIcon from '../components/icons/ListIcon';
import GridIcon from '../components/icons/GridIcon';
import AdvancedSearch from '../components/AdvancedSearch';
import chairsBg from '../assets/chairs.jpg';
import { SortSelect } from '../components/ui/SortSelect';

export default function DiscoveryMoviesPage() {
  const location = useLocation();
  const preset = location.state?.preset ?? null;

  const {
   discoverMoviesByFilter,
   getBatchAccountStates,
   isInWatchlist,
   accountStates,          
   setRatingLocal,        
   toggleFavorite,  
 } = useMovies();

  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { language, region } = useLanguage();

  const fetchedPages = useRef(new Set());
  const gridRef = useRef(null);
  const sentinelRef = useRef(null);
  const [rowH, setRowH] = useState(null);

  const cardRefs = useRef({});
  const setMenuRef = id => el => {
    if (el) cardRefs.current[id] = el;
    else delete cardRefs.current[id];
  };

  const certLTE = (
    { US:'PG-13', DE:'FSK 12', GB:'12', FR:'12',
      ES:'13', CA:'PG-13', AU:'PG', JP:'G', KR:'12' }
  )[region] ?? 'PG-13';

  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState(() => {
    if (preset === 'trending') return 'trending';
    if (preset === 'popular') return 'popularity_desc';
    if (preset === 'topRated') return 'rating_desc';
    return 'date_desc';
  });
  const sortBy = {
    date_desc:'primary_release_date.desc', date_asc:'primary_release_date.asc',
    name_asc:'original_title.asc', name_desc:'original_title.desc',
    rating_desc:'vote_average.desc', rating_asc:'vote_average.asc',
    popularity_desc:'popularity.desc', popularity_asc:'popularity.asc',
  }[sortOption];

  const [page, setPage] = useState(1);
  const [totalResults, setTotal] = useState(0);
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPage, setLoading] = useState(false);
  const [providersMap, setProviders] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [ratingTarget,   setRatingTarget]   = useState(null);   
  const [tempRating,     setTempRating]     = useState(0);

  const [listTargetId,   setListTargetId]   = useState(null);  
const openListModal = id => setListTargetId(id);
  const openRateModal = (id, title, type, current = 0) =>
    setRatingTarget({ id, title, type, current });

  const closeRateModal = () => {
    setTempRating(0);
    setRatingTarget(null);
  };

  const submitRating = async value => {
    if (!ratingTarget) return;
    try {
       await rateMovie(ratingTarget.id, sessionId, value);
       setRatingLocal(ratingTarget.id, 'movie', value);  
    } finally {
      closeRateModal();
    }
  };

  const clearRating = async () => {
    if (!ratingTarget) return;
    try {
      await deleteMovieRating(ratingTarget.id, sessionId);
      setRatingLocal(ratingTarget.id, 'movie', 0);
    } finally {
      closeRateModal();
    }
  };
  const clearRatingForMovie = async movieId => {
  try {
    await deleteMovieRating(movieId, sessionId);
    setRatingLocal(movieId, "movie", 0);      // wipe local cache
  } catch (err) {
    console.error("Failed to clear rating:", err);
  }
};

  const fetchPage = useCallback(async (p) => {
    if (loadingPage || fetchedPages.current.has(p) || !hasMore) return;
    fetchedPages.current.add(p);
    setLoading(true);

    try {
      let batchStates = {};    
      let raw = [], total = 0;

      const {
        watchlistFilter,
        ratingsFilter,
        ...apiParams
      } = filters;

      if (sortOption === 'trending') {
        if (p > 1) { setHasMore(false); return; }
        const { data } = await getMovies.trending();
        raw = data.results;
        total = data.results.length;
      } else {
        const { results, total_results, total_pages } =
          await discoverMoviesByFilter({
            page: p,
            sort_by: sortBy,
            include_adult: false,
            certification_country: region,
            'certification.lte': certLTE,
            'vote_count.gte': 50,
            ...apiParams,
          });
        raw = results;
        total = total_results;
        if (p >= total_pages) setHasMore(false);
      }

      const enriched = await Promise.all(raw.map(async m => {
        try {
          const det = await getMovieDetailsWithLanguage(m.id, language);
          const { data: rd } = await getMovieReleaseDates(m.id);
          const cert = getAgeRatingForRegion(rd, region) ?? (det.data.adult ? '18+' : 'NR');
          const mins = det.data.runtime || 0;
          const runtime = mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
          return { ...m, certification: cert, runtime };
        } catch {
          return { ...m, certification: m.adult ? '18+' : 'NR', runtime: null };
        }
      }));

      // Fetch streaming providers
      const provPairs = await Promise.all(enriched.map(async m => {
        try {
          const { data } = await getMovieWatchProviders(m.id);
          return [m.id, data.results[region] ?? {}];
        } catch {
          return [m.id, { flatrate: [], rent: [], buy: [] }];
        }
      }));

      // Batch account‐states for watchlist & ratings
      if (isAuthenticated && sessionId && enriched.length) {
        batchStates = await getBatchAccountStates(
          enriched.map(i => ({ id: i.id, type: 'movie' })), sessionId
        );
      }

      // Client‐side filtering
      let filtered = enriched;

      // watchlist filter
      if (watchlistFilter === 'in') {
        filtered = filtered.filter(m =>
          accountStates[`movie_${m.id}`]?.watchlist
        );
      } else if (watchlistFilter === 'not') {
        filtered = filtered.filter(m =>
          !accountStates[`movie_${m.id}`]?.watchlist
        );
      }

      // ratings filter
      if (ratingsFilter === 'rated') {
        filtered = filtered.filter(m => {
          const state = accountStates[`movie_${m.id}`]?.rated;
          return state && (typeof state === 'object' ? state.value != null : state === true);
        });
      } else if (ratingsFilter === 'notRated') {
        filtered = filtered.filter(m => {
          const state = accountStates[`movie_${m.id}`]?.rated;
          return !(state && (typeof state === 'object' ? state.value != null : state === true));
        });
      }

      if (apiParams['certification.lte']) {
        filtered = filtered.filter(m => m.certification !== 'NR');
      }

      setMovies(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        filtered.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });

      setTotal(total);
      setProviders(prev => ({ ...prev, ...Object.fromEntries(provPairs) }));
    } catch (err) {
      console.error('DiscoveryMoviesPage load error:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    loadingPage, hasMore,
    sortOption, sortBy,
    filters, accountStates,
    region, certLTE, language,
    discoverMoviesByFilter,
    isAuthenticated, sessionId, getBatchAccountStates,
  ]);


  useEffect(() => {
    setMovies([]); setProviders({}); setPage(1); setHasMore(true);
    fetchedPages.current.clear();
  }, [sortOption, filters, preset, region, language]);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  useEffect(() => {
    if (!hasMore) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingPage) setPage(p => p + 1);
    }, { rootMargin: '400px' });
    const el = sentinelRef.current;
    if (el) io.observe(el);
    return () => el && io.unobserve(el);
  }, [hasMore, loadingPage, viewMode]);

  useEffect(() => {
    if (viewMode !== 'grid') return;
    const measure = () => {
      if (!gridRef.current) return;
      let max = 0;
      gridRef.current.querySelectorAll('.movie-card-wrapper')
        .forEach(el => max = Math.max(max, el.getBoundingClientRect().height));
      setRowH(max);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [movies, bookmarkLoadingStates, viewMode]);

  useEffect(() => {
    if (menuOpenFor == null) return;
    const handler = e => {
      const cardEl = cardRefs.current[menuOpenFor];
      if (cardEl && !cardEl.contains(e.target)) setMenuOpenFor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenFor]);

  const headerText = sortOption === 'trending' ? 'Trending Movies' : 'Discover Movies';
  const movieItems = movies.map(m => ({
    id: m.id,
    isFavorite: accountStates[`movie_${m.id}`]?.favorite || false,
    myRating:   accountStates[`movie_${m.id}`]?.rated?.value ?? 0,
    title: m.title,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date?.slice(0,4),
    voteAverage: m.vote_average,
    runtime: m.runtime,
    certification: m.certification,
    bookmarked: isInWatchlist(m.id, 'movie'),
    isLoading: bookmarkLoadingStates.has(m.id),
  }));

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <header
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
        <h1 className="relative text-4xl font-extrabold">{headerText}</h1>
        <div className="absolute bottom-4 left-8 text-sm text-gray-300">
          {movies.length.toLocaleString()} / {totalResults.toLocaleString()} titles
        </div>
        <div className="absolute bottom-4 right-8 flex items-center space-x-3">
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600">
              <FilterIcon className="w-5 h-5 text-white" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </Popover.Button>
            <Popover.Panel className="absolute left-[-240px] w-[600px] bg-[#141414] rounded-[50px] shadow-lg z-20">
              <AdvancedSearch onSearch={f => {
                const { watchlistFilter, ratingsFilter, ...apiOnly } = f;
                setFilters({ ...apiOnly, watchlistFilter, ratingsFilter });
                setPage(1);
              }} />
            </Popover.Panel>
          </Popover>
          <SortSelect value={sortOption} onChange={val => { setSortOption(val); setPage(1); }} />
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-black' : 'bg-gray-800'}`}
          >
            <ListIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-gray-800'}`}
          >
            <GridIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {viewMode === 'grid' ? (
          movies.length === 0 && !loadingPage ? (
            <p className="text-center text-gray-400 py-10">No movies found.</p>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
              style={rowH ? { gridAutoRows: `${rowH}px` } : {}}
            >
              {movieItems.map((m, idx) => (
                <Fragment key={m.id}>
                  <div
                    className="movie-card-wrapper relative w-[200px]"
                    ref={m.id === menuOpenFor ? setMenuRef(m.id) : null}
                  >
                    <MovieCard
                      mediaId={m.id}
                      mediaType="movie"
                      title={m.title}
                      poster={m.poster}
                      voteAverage={m.voteAverage}
                      year={m.year}
                      runtime={m.runtime}
                      certification={m.certification}
                      bookmarked={m.bookmarked}
                      isLoading={m.isLoading}
                      onBookmarkToggle={handleBookmarkToggle}
                      onMenuClick={id => setMenuOpenFor(menuOpenFor === id ? null : id)}
                      className="h-full"
                    />
                    {menuOpenFor === m.id && (
                      <div className="absolute right-2 top-[calc(100%_-_48px)] z-20">
                        <MovieCardMenu
                          onRate={() =>
                            openRateModal(
                              m.id,
                              m.title,
                              'movie',      
                              m.myRating                             
                            )
                          }
                          onAddToList= {() => openListModal(m.id)}
                           isFavorite={m.isFavorite}
                          currentRating={m.myRating}
                          onFavorite={() =>
                             toggleFavorite(
                               user.id,
                               sessionId,
                               m.id,
                               "movie",
                               m.isFavorite
                             )
                           }
                          mediaType="movie"
                          onClearRating={() => clearRatingForMovie(m.id)} 
                        />
                      </div>
                    )}
                    {idx === movieItems.length - 1 && <div ref={sentinelRef} />}
                  </div>
                </Fragment>
              ))}
            </div>
          )
        ) : (
          movies.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No movies found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {movieItems.map((m, idx) => (
                <Fragment key={m.id}>
                  <ListComponent
                    mediaType="movie"
                    mediaId={m.id}
                    bookmarked={m.bookmarked}
                    isLoading={m.isLoading}
                    onBookmarkToggle={handleBookmarkToggle}
                    onFavorite={() =>
                       toggleFavorite(
                         user.id,
                         sessionId,
                         m.id,
                         "movie",
                         m.isFavorite
                       )
                     }
                    onAddToList={() => openListModal(m.id)}
                    isFavorite={m.isFavorite}
                    onRate={id => openRateModal(id, m.title, 'movie', m.myRating)}
                    currentRating={m.myRating}

                    streamingPlatforms={[
                      ...(providersMap[m.id]?.flatrate || []),
                      ...(providersMap[m.id]?.rent    || []),
                      ...(providersMap[m.id]?.buy     || []),
                    ].map(p => ({
                      icon: p.logo_path
                        ? <img
                            src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                            alt={p.provider_name}
                            className="w-6 h-6 object-contain"
                          />
                        : null,
                      name: p.provider_name,
                    }))}
                  />
                  {idx === movieItems.length - 1 && <div ref={sentinelRef} />}
                </Fragment>
              ))}
            </div>
          )
        )}

        {loadingPage && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>
<RatingModal
  isOpen={!!ratingTarget}
  title={ratingTarget?.title ?? ''}
  currentRating={ratingTarget?.current ?? 0}
  tempRating={tempRating}
  setTempRating={setTempRating}
  onClose={closeRateModal}
  onSubmit={submitRating}
  onClearRating={clearRating}
/>

<AddToListModal
  isOpen={listTargetId !== null}
  onClose={() => setListTargetId(null)}
  mediaId={listTargetId ?? 0}
  onAdded={() => setListTargetId(null)}
/>

    </div>
  );
}