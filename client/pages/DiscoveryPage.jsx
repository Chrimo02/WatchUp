// src/pages/DiscoveryPage.jsx
import React, {
  useState, useEffect, useCallback, useRef, Fragment,
} from 'react'
import { Popover } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { useMovies }       from '../contexts/MovieContext'
import { useAuth }         from '../contexts/AuthContext'
import { useBookmarkToggle } from '../hooks/useBookmarkToggle'
import { useLanguage }     from '../contexts/LanguageContext'

import {
  getMovies,
  getMovieWatchProviders,
  markAsFavorite,
  addToWatchlist,
  rateMovie,
  getMovieDetailsWithLanguage,
  getMovieReleaseDates,
  getAgeRatingForRegion,
} from '../utils/api'

import MovieCard      from '../components/MovieCard'
import MovieCardMenu  from '../components/MovieCardMenu'
import ListComponent  from '../components/ListComponent'
import FilterIcon     from '../components/icons/FilterIcon'
import ListIcon       from '../components/icons/ListIcon'
import GridIcon       from '../components/icons/GridIcon'
import AdvancedSearch from '../components/AdvancedSearch'
import chairsBg       from '../assets/chairs.jpg'
import { SortSelect } from '@/components/ui/SortSelect'

export default function DiscoveryPage () {
  const location  = useLocation()
  const preset    = location.state?.preset ?? null

  const {
    discoverMoviesByFilter,
    getBatchAccountStates,
    isInWatchlist,
  } = useMovies()
  const { isAuthenticated, user, sessionId } = useAuth()
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle()
  const { language, region } = useLanguage()

  const fetchedPages = useRef(new Set())    


  const certLTE = (
    { US:'PG-13', DE:'FSK 12', GB:'12', FR:'12',
      ES:'13',   CA:'PG-13',  AU:'PG', JP:'G',  KR:'12' }
  )[region] ?? 'PG-13'

  const [filters, setFilters] = useState({})
  const [sortOption, setSortOption] = useState(() => {
    if (preset === 'trending') return 'trending'
    if (preset === 'popular')  return 'popularity_desc'
    if (preset === 'topRated') return 'rating_desc'
    return 'date_desc'
  })

  const sortBy = {
    date_desc:'primary_release_date.desc', date_asc:'primary_release_date.asc',
    name_asc:'original_title.asc',         name_desc:'original_title.desc',
    rating_desc:'vote_average.desc',       rating_asc:'vote_average.asc',
    popularity_desc:'popularity.desc',     popularity_asc:'popularity.asc',
  }[sortOption]

  /* ---------- data state ---------------- */
  const [page, setPage]              = useState(1)
  const [totalResults, setTotal]     = useState(0)
  const [movies, setMovies]          = useState([])
  const [hasMore, setHasMore]        = useState(true)
  const [loadingPage, setLoading]    = useState(false)
  const [providersMap, setProviders] = useState({})
  const [viewMode, setViewMode]      = useState('grid')
  const [menuOpenFor, setMenuOpenFor]   = useState(null)

  /* ---------- refs for grid + observer -- */
  const gridRef      = useRef(null)
  const sentinelRef  = useRef(null)
  const [rowH, setRowH] = useState(null)


/* -------------------------------------------------------------------- */
/* ONE‑PAGE LOADER – call with the page number you want to append       */
/* -------------------------------------------------------------------- */
const fetchPage = useCallback(async (p) => {
  /* guard‑rails ------------------------------------------------------- */
  if (loadingPage)            return           // still processing the last one
  if (fetchedPages.current.has(p)) return      // we already fetched this page
  if (!hasMore)               return           // nothing left to load

  fetchedPages.current.add(p) // mark *before* we await to block duplicates
  setLoading(true)

  try {
    /* 1) raw list ----------------------------------------------------- */
    let raw = [], total = 0

    if (sortOption === 'trending') {
      if (p > 1) { setHasMore(false); return }        // trending only has 1 page
      const { data } = await getMovies.trending()        
      raw   = data.results
      total = data.results.length
    } else {
      const { results, total_results, total_pages } =
        await discoverMoviesByFilter({
          page: p,
          sort_by: sortBy,
          include_adult: false,
          certification_country: region,
          certification_lte: certLTE,
          'vote_count.gte': 50,
          ...filters,
        })
      raw   = results
      total = total_results
      if (p >= total_pages) setHasMore(false)
    }

    /* 2) enrich with runtime + cert ---------------------------------- */
    const enriched = await Promise.all(raw.map(async (m) => {
      try {
        const det       = await getMovieDetailsWithLanguage(m.id, language)
        const { data }  = await getMovieReleaseDates(m.id)
        const cert      = getAgeRatingForRegion(data, region) ??
                          (det.data.adult ? '18+' : 'NR')

        const min       = det.data.runtime || 0
        const runtime   = min ? `${Math.floor(min / 60)}h ${min % 60}m` : null

        return { ...m, certification: cert, runtime }
      } catch {
        return { ...m, certification: m.adult ? '18+' : 'NR', runtime: null }
      }
    }))

    /* 3) provider logos ---------------------------------------------- */
    const provPairs = await Promise.all(enriched.map(async (m) => {
      try {
        const { data } = await getMovieWatchProviders(m.id)
        return [m.id, data.results[region] ?? {}]
      } catch {
        return [m.id, { stream: [], rent: [], buy: [] }]
      }
    }))

    /* 4) account states batch ---------------------------------------- */
    if (isAuthenticated && sessionId && enriched.length) {
      await getBatchAccountStates(
        enriched.map(i => ({ id: i.id, type: 'movie' })), sessionId
      )
    }

    /* 5) commit – deduplicate by id ---------------------------------- */
    setMovies(prev => {
      const map = new Map(prev.map(movie => [movie.id, movie])) // existing ones
      enriched.forEach(movie => map.set(movie.id, movie))       // merge / add
      return Array.from(map.values())
    })
    setTotal(total)
    setProviders(prev => ({ ...prev, ...Object.fromEntries(provPairs) }))
  } catch (err) {
    console.error('DiscoveryPage load error:', err)
    setHasMore(false)
  } finally {
    setLoading(false)
  }
}, [
  loadingPage, hasMore,
  sortOption, sortBy, filters,
  region, certLTE, language,
  discoverMoviesByFilter, getMovies,
  isAuthenticated, sessionId, getBatchAccountStates,
])


  /* reset list on filter/sort change */
  useEffect(()=>{
    setMovies([]); setProviders({}); setPage(1); setHasMore(true); fetchedPages.current.clear()    
  },[sortOption,filters,preset,region,language])

  /* trigger load for current page */
  useEffect(()=>{ fetchPage(page) },[page,fetchPage])

  /* intersection observer for infinite scroll */
  useEffect(()=>{
    if(!hasMore) return
    const io=new IntersectionObserver(e=>{
      if(e[0].isIntersecting && !loadingPage) setPage(pr=>pr+1)
    },{rootMargin:'400px'})
    const el=sentinelRef.current
    if(el) io.observe(el)
    return ()=>{ if(el) io.unobserve(el) }
  },[hasMore,loadingPage])

  /* equalise grid rows */
  useEffect(()=>{
    if(viewMode!=='grid')return
    const measure=()=>{
      if(!gridRef.current)return
      let max=0
      gridRef.current.querySelectorAll('.movie-card-wrapper')
        .forEach(el=>{max=Math.max(max,el.getBoundingClientRect().height)})
      setRowH(max)
    }
    measure(); window.addEventListener('resize',measure)
    return ()=>window.removeEventListener('resize',measure)
  },[movies,bookmarkLoadingStates,viewMode])

  /* ------------ render helpers ---------- */
  const headerText = sortOption==='trending' ? 'Trending Titles' : 'Discover Titles'

  const movieItems = movies.map(m=>({
    id:m.id,
    title:m.title,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year:m.release_date?.slice(0,4),
    voteAverage:m.vote_average,
    runtime:m.runtime,
    certification:m.certification,
    bookmarked:isInWatchlist(m.id,'movie'),
    isLoading:bookmarkLoadingStates.has(m.id),
  }))

  /* ------------- JSX -------------------- */
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* ─── HERO HEADER ─────────────────────────────────────────── */}
      <header
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage:`url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />

        <h1 className="relative text-4xl font-extrabold">{headerText}</h1>

        <div className="absolute bottom-4 left-8 text-sm text-gray-300">
          {movies.length.toLocaleString()} / {totalResults.toLocaleString()} titles
        </div>

        {/* right‑hand controls */}
        <div className="absolute bottom-4 right-8 flex items-center space-x-3">
          {/* FILTER */}
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600">
              <FilterIcon className="w-5 h-5 text-white"/>
              <span>Filter</span>
              <ChevronDown className="w-4 h-4 text-white"/>
            </Popover.Button>
            <Popover.Panel className="absolute left-[-240px] w-[600px] bg-[#141414] rounded-[50px] shadow-lg z-20">
              <AdvancedSearch onSearch={(f) => { setFilters(f); setPage(1) }}/>
            </Popover.Panel>
          </Popover>

          {/* SORT */}
          <SortSelect
            value={sortOption}
            onChange={val => { setSortOption(val); setPage(1) }}
          />

          {/* VIEW TOGGLE */}
          <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode==='list'?'bg-white text-black':'bg-gray-800'}`}>
            <ListIcon className="w-6 h-6"/>
          </button>
          <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode==='grid'?'bg-white text-black':'bg-gray-800'}`}>
            <GridIcon className="w-6 h-6"/>
          </button>
        </div>
      </header>

      {/* ─── CONTENT ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* GRID view ------------------------------------------------ */}
        {viewMode === 'grid' && (
          movies.length === 0 && !loadingPage
          ? <p className="text-center text-gray-400 py-10">No movies found.</p>
            : (
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-start items-stretch"
                style={rowH ? { gridAutoRows:`${rowH}px` } : {}}
              >
                {movieItems.map((m, idx) => (
                  <Fragment key={m.id}>
                    <div
                      className="movie-card-wrapper relative w-[200px]"
                      ref={idx === movieItems.length-1 ? sentinelRef : null}
                    >
                      <MovieCard
                        id={m.id}
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
                        onMenuClick={id => setMenuOpenFor(menuOpenFor===id?null:id)}
                        className="h-full"
                      />

                      {menuOpenFor === m.id && (
                        <div
                          className="absolute right-2 top-[calc(100%_-_48px)] z-20"
                          onClick={e => e.stopPropagation()}
                        >
                          <MovieCardMenu
                            onRate={rating  => rateMovie(m.id, sessionId, rating)}
                            onAddToList={() =>
                              addToWatchlist(user.id, sessionId, m.id, 'movie', !isInWatchlist(m.id,'movie'))}
                            onFavorite={() =>
                              markAsFavorite(user.id, sessionId, m.id, 'movie', !isInWatchlist(m.id,'movie'))}
                          />
                        </div>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
            )
        )}

        {/* LIST view ------------------------------------------------ */}
        {viewMode === 'list' && (
          movieItems.length === 0
            ? <p className="text-center text-gray-400 py-10">No movies found.</p>
            : (
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
                        markAsFavorite(user.id, sessionId, m.id, 'movie', !isInWatchlist(m.id,'movie'))}
                      onAddToList={() =>
                        addToWatchlist(user.id, sessionId, m.id, 'movie', !isInWatchlist(m.id,'movie'))}
                      onRate={val => rateMovie(m.id, sessionId, val)}
                      streamingPlatforms={[
                        ...(providersMap[m.id]?.flatrate||[]),
                        ...(providersMap[m.id]?.rent||[]),
                        ...(providersMap[m.id]?.buy||[]),
                      ].map(p => ({
                        icon: p.logo_path
                          ? <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                                 alt={p.provider_name}
                                 className="w-6 h-6 object-contain"/>
                          : null,
                        name: p.provider_name,
                      }))}
                    />
                    {/* sentinel for list mode */}
                    {idx === movieItems.length-1 && <div ref={sentinelRef}/>}
                  </Fragment>
                ))}
              </div>
            )
        )}

        {/* small spinner at bottom while loading next page */}
        {loadingPage && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
          </div>
        )}
      </main>
    </div>
  )
}
