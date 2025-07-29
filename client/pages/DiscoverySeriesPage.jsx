// src/pages/DiscoverySeriesPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useMovies }         from '../contexts/MovieContext';
import { useAuth }           from '../contexts/AuthContext';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useLanguage }       from '../contexts/LanguageContext';
import RatingModal from '../components/MovieSeriesPage/RatingModal';
import {
  getTVShows,
  getTVShowWatchProviders,
  markAsFavorite,
  addToWatchlist,
  rateTVShow,
  getTVShowDetailsWithLanguage,
  getTVShowContentRatings,
  deleteTVShowRating,
  getTVContentRatingForRegion,
} from '../utils/api';

import MovieCard      from '../components/MovieCard';
import MovieCardMenu  from '../components/MovieCardMenu';
import ListComponent  from '../components/ListComponent';
import FilterIcon     from '../components/icons/FilterIcon';
import ListIcon       from '../components/icons/ListIcon';
import GridIcon       from '../components/icons/GridIcon';
import AdvancedSearch from '../components/AdvancedSearch';
import chairsBg       from '../assets/chairs.jpg';
import { SortSelect } from '../components/ui/SortSelect';

export default function DiscoverySeriesPage() {
  const location = useLocation();
  const preset   = location.state?.preset ?? null;

  const {
    discoverTVShowsByFilter,
    getBatchAccountStates,
    isInWatchlist,
    setRatingLocal,
    accountStates 
  } = useMovies();
 const { isAuthenticated, user, sessionId, login } = useAuth();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { language, region } = useLanguage();

  // Adult-Content / Altersfreigabe ≤ PG-13 / FSK 12 etc.
  const certLTE = (
    { US:'PG-13', DE:'FSK 12', GB:'12', FR:'12',
      ES:'13',   CA:'PG-13',  AU:'PG', JP:'G',  KR:'12' }
  )[region] ?? 'PG-13';

  const fetchedPages = useRef(new Set());
  const gridRef     = useRef(null);
  const sentinelRef = useRef(null);
  const [rowH, setRowH] = useState(null);
  const cardRefs = useRef({});
  const setMenuRef = id => el => {
    if (el) cardRefs.current[id] = el;
    else delete cardRefs.current[id];
  };
  const clearRating = async () => {
  if (!ratingTarget) return;
  try {
    if (ratingTarget.type === 'movie')
      await deleteMovieRating(ratingTarget.id, sessionId);
    else
      await deleteTVShowRating(ratingTarget.id, sessionId);
  } finally {
    closeRateModal();
  }
};
  const [filters, setFilters]       = useState({});
  const [sortOption, setSortOption] = useState(() => {
    if (preset === 'trending') return 'trending';
    if (preset === 'popular')  return 'popularity_desc';
    if (preset === 'topRated') return 'rating_desc';
    return 'date_desc';
  });
  const sortBy = {
    date_desc:   'first_air_date.desc',
    date_asc:    'first_air_date.asc',
    name_asc:    'name.asc',
    name_desc:   'name.desc',
    rating_desc: 'vote_average.desc',
    rating_asc:  'vote_average.asc',
    popularity_desc: 'popularity.desc',
    popularity_asc:  'popularity.asc',
  }[sortOption];

  const [page, setPage]           = useState(1);
  const [totalResults, setTotal]  = useState(0);
  const [shows, setShows]         = useState([]);
  const [hasMore, setHasMore]     = useState(true);
  const [loadingPage, setLoading] = useState(false);
  const [providersMap, setProvidersMap] = useState({});
  const [viewMode, setViewMode]   = useState('grid');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [ratingTarget,   setRatingTarget]   = useState(null);   // { id,title,type,current }
const [tempRating,     setTempRating]     = useState(0);

const [listTargetId,   setListTargetId]   = useState(null);   // nur die ID des Films

const openRateModal = (id, title, type, current = 0) =>
  setRatingTarget({ id, title, type, current });

const closeRateModal = () => {
  setTempRating(0);
  setRatingTarget(null);
};
const clearRatingForShow = async tvId => {
  try {
    await deleteTVShowRating(tvId, sessionId);   
    setRatingLocal(tvId, "tv", 0);              
  } catch (err) {
    console.error("Failed to clear rating:", err);
  }
};

const submitRating = async value => {
  if (!ratingTarget) return;
  try {
   if (ratingTarget.type === 'movie')
     await rateMovie(ratingTarget.id, sessionId, value);
   else
     await rateTVShow(ratingTarget.id, sessionId, value);

   // local cache sofort aktualisieren
   setRatingLocal(ratingTarget.id, ratingTarget.type, value);
  } finally {
    closeRateModal();
  }
};

const handleFavoriteToggle = async tvId => {
  if (!isAuthenticated || !sessionId) return login();  

  setShows(prev =>
    prev.map(s => s.id === tvId ? { ...s, favorite: !s.favorite } : s)
  );

  try {
    const show = shows.find(s => s.id === tvId);
    await markAsFavorite(
      user.id,
      sessionId,
      tvId,
      "tv",
      !show.favorite            
    );
  } catch (err) {
    console.error("Failed to toggle favourite:", err);
    setShows(prev =>
      prev.map(s => s.id === tvId ? { ...s, favorite: !s.favorite } : s)
    );
  }
};

  const fetchPage = useCallback(async (p) => {
    if (loadingPage || fetchedPages.current.has(p) || !hasMore) return;
    fetchedPages.current.add(p);
    setLoading(true);

    try {
      let batchStates = {};       
      let raw = [], total = 0;

      if (sortOption === 'trending') {
        if (p > 1) { setHasMore(false); return; }
        const { data } = await getTVShows.trending();
        raw   = data.results;
        total = data.results.length;
      } else {
        const { results, total_results, total_pages } =
          await discoverTVShowsByFilter({
            page: p,
            sort_by: sortBy,
            include_adult: false,
            certification_country: region,
            certification_lte: certLTE,
            'vote_count.gte': 50,
            ...filters,
          });
        raw   = results;
        total = total_results;
        if (p >= total_pages) setHasMore(false);
      }

      const enriched = await Promise.all(raw.map(async show => {
        try {
          const detResp  = await getTVShowDetailsWithLanguage(show.id, language);
          const credResp = await getTVShowContentRatings(show.id);
          const cert     = getTVContentRatingForRegion(credResp.data, region) ?? 'NR';
          const mins     = detResp.data.episode_run_time?.[0] || 0;
          const runtime  = mins ? `${Math.floor(mins/60)}h ${mins%60}m` : null;
          return { ...show, certification: cert, runtime };
        } catch {
          return { ...show, certification: null, runtime: null };
        }
      }));

      const provPairs = await Promise.all(enriched.map(async show => {
        try {
          const { data } = await getTVShowWatchProviders(show.id);
          return [show.id, data.results[region] ?? {}];
        } catch {
          return [show.id, { flatrate: [], rent: [], buy: [] }];
        }
      }));

      if (isAuthenticated && sessionId && enriched.length) {
        batchStates = await getBatchAccountStates(
          enriched.map(i => ({ id: i.id, type: 'tv' })), sessionId
        );
      }

      setShows(prev => {
        const map = new Map(prev.map(s => [s.id, s]));
        enriched.forEach(s => {
          const fav = batchStates?.[`tv_${s.id}`]?.favorite ?? false;
          map.set(s.id, { ...s, favorite: fav });
        });
        return Array.from(map.values());
      });
      setTotal(total);
      setProvidersMap(prev => ({ ...prev, ...Object.fromEntries(provPairs) }));
    } catch (err) {
      console.error('DiscoverySeriesPage load error:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    loadingPage, hasMore,
    sortOption, sortBy, filters,
    region, certLTE,
    discoverTVShowsByFilter,
    isAuthenticated, sessionId, getBatchAccountStates,
    language, region
  ]);

  useEffect(() => {
    setShows([]); setProvidersMap({}); setPage(1); setHasMore(true);
    fetchedPages.current.clear();
  }, [sortOption, filters, preset, language, region]);

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
  }, [shows, bookmarkLoadingStates, viewMode]);

  useEffect(() => {
    if (menuOpenFor == null) return;
    const handler = e => {
      const cardEl = cardRefs.current[menuOpenFor];
      if (cardEl && !cardEl.contains(e.target)) setMenuOpenFor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenFor]);

  const headerText = sortOption === 'trending' ? 'Trending Series' : 'Discover Series';
  const showItems = shows.map(s => ({
    id: s.id,
    title: s.name,
    isFavorite: s.favorite,
    myRating:  accountStates[`tv_${s.id}`]?.rated?.value ?? 0,
    poster: s.poster_path 
    
      ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
      : null,
    year: s.first_air_date?.slice(0,4),
    voteAverage: s.vote_average,
    runtime: s.runtime,
    certification: s.certification,
    bookmarked: isInWatchlist(s.id, 'tv'),
    isLoading: bookmarkLoadingStates.has(s.id),
  }));

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* HERO */}
      <header
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"/>
        <h1 className="relative text-4xl font-extrabold">{headerText}</h1>
        <div className="absolute bottom-4 left-8 text-sm text-gray-300">
          {shows.length.toLocaleString()} / {totalResults.toLocaleString()} titles
        </div>
        <div className="absolute bottom-4 right-8 flex items-center space-x-3">
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600">
              <FilterIcon className="w-5 h-5 text-white"/>
              <span>Filter</span>
              <ChevronDown className="w-4 h-4 text-white"/>
            </Popover.Button>
            <Popover.Panel className="absolute left-[-240px] w-[600px] bg-[#141414] rounded-[50px] shadow-lg z-20">
              <AdvancedSearch onSearch={f => { setFilters(f); setPage(1); }}/>
            </Popover.Panel>
          </Popover>
          <SortSelect value={sortOption} onChange={val => { setSortOption(val); setPage(1); }}/>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode==='list'?'bg-white text-black':'bg-gray-800'}`}
          >
            <ListIcon className="w-6 h-6"/>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode==='grid'?'bg-white text-black':'bg-gray-800'}`}
          >
            <GridIcon className="w-6 h-6"/>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {viewMode==='grid' ? (
          showItems.length===0 && !loadingPage ? (
            <p className="text-center text-gray-400 py-10">No series found.</p>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
              style={rowH?{gridAutoRows:`${rowH}px`}:{}}>
              {showItems.map((s,idx)=>
                <Fragment key={s.id}>
                  <div
                    className="movie-card-wrapper relative w-[200px]"
                    ref={s.id===menuOpenFor?setMenuRef(s.id):null}
                  >
                    <MovieCard
                      mediaType="tv"
                      mediaId={s.id}
                      title={s.title}
                      poster={s.poster}
                      voteAverage={s.voteAverage}
                      year={s.year}
                      runtime={s.runtime}
                      certification={s.certification}
                      bookmarked={s.bookmarked}
                      isLoading={s.isLoading}
                      onBookmarkToggle={handleBookmarkToggle}
                      onMenuClick={id=>setMenuOpenFor(menuOpenFor===id?null:id)}
                      className="h-full"
                    />
                    {menuOpenFor===s.id && (
                      <div className="absolute right-2 top-[calc(100%_-_48px)] z-20">
                        <MovieCardMenu
                          mediaType="tv"
                                            
                          currentRating={s.myRating}
                          onRate={() => openRateModal(s.id, s.title, "tv", s.myRating)}
                          onClearRating={() => clearRatingForShow(s.id)}
                                            
                          isFavorite={s.isFavorite}
                          onFavorite={() => handleFavoriteToggle(s.id)}
                          
                        />
                      </div>
                    )}
                    {idx===showItems.length-1 && <div ref={sentinelRef}/>}
                  </div>
                </Fragment>
              )}
            </div>
          )
        ) : (
          showItems.length===0 ? (
            <p className="text-center text-gray-400 py-10">No series found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {showItems.map((s,idx)=>
                <Fragment key={s.id}>
                  <ListComponent
                    mediaType="tv"
                    mediaId={s.id}
                    bookmarked={s.bookmarked}
                    onClearRating={() => clearRatingForMovie(m.id)}  
                    isLoading={s.isLoading}
                    onBookmarkToggle={handleBookmarkToggle}
                    onFavorite={() => handleFavoriteToggle(s.id)}
                    onAddToList={()=>addToWatchlist(user.id,sessionId,s.id,'tv',!isInWatchlist(s.id,'tv'))}
                    onRate={val=>rateTVShow(s.id,sessionId,val)}
                    streamingPlatforms={[
                      ...(providersMap[s.id]?.flatrate||[]),
                      ...(providersMap[s.id]?.rent||[]),
                      ...(providersMap[s.id]?.buy||[]),
                    ].map(p=>({
                      icon:p.logo_path
                        ?<img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 object-contain"/>
                        :null,
                      name:p.provider_name,
                    }))}
                  />
                  {idx===showItems.length-1&&<div ref={sentinelRef}/>}
                </Fragment>
              )}
            </div>
          )
        )}
        {loadingPage && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
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
    </div>
  );
}