import React, { useState, useEffect } from 'react';
import { useSearchParams }    from 'react-router-dom';
import { useMovies }          from '../contexts/MovieContext';
import { useBookmarkToggle }  from '../hooks/useBookmarkToggle';
import { useAuth }            from '../contexts/AuthContext';
import { useLanguage }        from '../contexts/LanguageContext';
import ListComponent          from '../components/ListComponent';
import PersonListItem         from '../components/PersonListItem';
import RatingModal            from '../components/MovieSeriesPage/RatingModal';
import AddToListModal         from '../components/AddToListModal';
import chairsBg               from '../assets/chairs.jpg';
import {
  rateMovie,
  rateTVShow,
  addToWatchlist,
  getMovieWatchProviders,
  getTVShowWatchProviders,
} from '../utils/api';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query          = searchParams.get('q')?.trim() || '';

  const {
    searchMoviesByQuery,
    searchTVShowsByQuery,
    searchPeopleByQuery,
    searchMultiByQuery,
    isInWatchlist,
    getBatchAccountStates,
    accountStates,
    toggleFavorite,
    setRatingLocal,
  } = useMovies();

  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { user, sessionId } = useAuth();
  const { region } = useLanguage();

  // Modal state
  const [ratingTarget, setRatingTarget] = useState(null);
  const [tempRating,   setTempRating]   = useState(0);
  const [listTargetId, setListTargetId] = useState(null);

  const openRateModal = (id, title, type, current = 0) =>
    setRatingTarget({ id, title, type, current });

  const closeRateModal = () => {
    setTempRating(0);
    setRatingTarget(null);
  };

  const submitRating = async value => {
    if (!ratingTarget) return;
    try {
      if (ratingTarget.type === 'tv') {
        await rateTVShow(ratingTarget.id, sessionId, value);
      } else {
        await rateMovie(ratingTarget.id, sessionId, value);
      }
      setRatingLocal(ratingTarget.id, ratingTarget.type, value);
    } finally {
      closeRateModal();
    }
  };

  const clearRating = async () => {
    if (!ratingTarget) return;
    try {
      if (ratingTarget.type === 'tv') {
        await rateTVShow(ratingTarget.id, sessionId, 0);
      } else {
        await rateMovie(ratingTarget.id, sessionId, 0);
      }
      setRatingLocal(ratingTarget.id, ratingTarget.type, 0);
    } finally {
      closeRateModal();
    }
  };

  const openListModal = id => setListTargetId(id);

  // Search + counts state
  const [filter, setFilter]     = useState('all');
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [movieTotal, setMovieTotal]   = useState(0);
  const [tvTotal, setTvTotal]         = useState(0);
  const [personTotal, setPersonTotal] = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [watchProvidersMap, setWatchProvidersMap] = useState({});

  useEffect(() => { setPage(1); }, [query, filter]);

  useEffect(() => {
    let cancelled = false;
    if (!query) { setAllTotal(0); return () => { cancelled = true; }; }
    (async () => {
      try {
        const data = await searchMultiByQuery(query, 1);
        if (!cancelled) setAllTotal(data.total_results || 0);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [query, searchMultiByQuery]);

  useEffect(() => {
    let cancelled = false;
    if (!query) { setItems([]); setTotal(0); setLoading(false); return () => { cancelled = true; }; }
    (async () => {
      setLoading(true);
      try {
        let data;
        if (filter === 'movie') {
          data = await searchMoviesByQuery(query, page);
          data.results = data.results.map(i => ({ ...i, media_type: 'movie' }));
        } else if (filter === 'tv') {
          data = await searchTVShowsByQuery(query, page);
          data.results = data.results.map(i => ({ ...i, media_type: 'tv' }));
        } else if (filter === 'person') {
          data = await searchPeopleByQuery(query, page);
          data.results = data.results.map(i => ({ ...i, media_type: 'person' }));
        } else {
          data = await searchMultiByQuery(query, page);
        }
        if (!cancelled) {
          setItems(data.results || []);
          setTotal(data.total_results || 0);
        }
      } catch {
        if (!cancelled) { setItems([]); setTotal(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [
    query, filter, page,
    searchMoviesByQuery,
    searchTVShowsByQuery,
    searchPeopleByQuery,
    searchMultiByQuery,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!query) { setMovieTotal(0); setTvTotal(0); setPersonTotal(0); return () => { cancelled = true; }; }
    (async () => {
      try {
        const [m, tv, p] = await Promise.all([
          searchMoviesByQuery(query, 1),
          searchTVShowsByQuery(query, 1),
          searchPeopleByQuery(query, 1),
        ]);
        if (!cancelled) {
          setMovieTotal(m.total_results || 0);
          setTvTotal(tv.total_results || 0);
          setPersonTotal(p.total_results || 0);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [query, searchMoviesByQuery, searchTVShowsByQuery, searchPeopleByQuery]);

  useEffect(() => {
    let cancelled = false;
    const relevant = items.filter(i => i.media_type==='movie' || i.media_type==='tv');
    if (!relevant.length) { setWatchProvidersMap({}); return () => { cancelled = true; }; }
    (async () => {
      const map = {};
      for (const item of relevant) {
        try {
          const { data } = item.media_type==='movie'
            ? await getMovieWatchProviders(item.id)
            : await getTVShowWatchProviders(item.id);
          const c = data.results[region] || {};
          map[item.id] = { stream: c.flatrate||[], rent: c.rent||[], buy: c.buy||[] };
        } catch {
          map[item.id] = { stream: [], rent: [], buy: [] };
        }
      }
      if (!cancelled) setWatchProvidersMap(map);
    })();
    return () => { cancelled = true; };
  }, [items, region]);

  useEffect(() => {
    if (!sessionId || !items.length) return;
    const batch = items
      .filter(i => i.media_type==='movie' || i.media_type==='tv')
      .map(i => ({ id: i.id, type: i.media_type }));
    if (batch.length) getBatchAccountStates(batch, sessionId);
  }, [items, sessionId, getBatchAccountStates]);

  const counts = { all: allTotal, movie: movieTotal, tv: tvTotal, person: personTotal };
  const pageSize = 20;
  const start    = (page - 1) * pageSize + 1;
  const end      = Math.min(page * pageSize, total);

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div className="relative h-64 bg-cover bg-center flex flex-col items-center justify-center"
           style={{ backgroundImage: `url(${chairsBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"/>
        <div className="absolute bottom-4 left-8 text-sm text-gray-300">
          {start.toLocaleString()} – {end.toLocaleString()} of {total.toLocaleString()} Results
        </div>
        <h1 className="relative text-4xl font-extrabold">
          Results for “<span className="italic">{query}</span>”
        </h1>
        <div className="absolute bottom-4 right-8 flex gap-2">
          {['all','movie','tv','person'].map(type => {
            const label = type==='all'?'All':type==='movie'?'Movies':type==='tv'?'Series':'People';
            return (
              <button key={type} onClick={() => setFilter(type)}
                      className={`px-4 py-2 rounded-full font-medium ${
                        filter===type
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}>
                {label} ({counts[type].toLocaleString()})
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-8 space-y-6">
        {loading
          ? <div className="text-center py-10">Loading…</div>
          : items.length===0
            ? <div className="text-center py-10 text-gray-400">No results found.</div>
            : <div className="flex flex-col gap-4">
                {items.map(item => (
                  item.media_type==='person'
                  ? <PersonListItem key={item.id} person={item}/>
                  : <ListComponent
                      key={item.id}
                      mediaType={item.media_type}
                      mediaId={item.id}
                      bookmarked={isInWatchlist(item.id, item.media_type)}
                      isLoading={bookmarkLoadingStates.has(item.id)}
                      streamingPlatforms={[
                        ...(watchProvidersMap[item.id]?.stream||[]),
                        ...(watchProvidersMap[item.id]?.rent||[]),
                        ...(watchProvidersMap[item.id]?.buy||[])
                      ].map(p => ({
                        icon: p.logo_path
                          ? <img key={p.provider_id}
                                 src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                                 alt={p.provider_name}
                                 className="w-6 h-6 object-contain"/>
                          : null
                      }))}
                      onBookmarkToggle={handleBookmarkToggle}
                      onRate={() =>
                        openRateModal(
                          item.id,
                          item.title||item.name,
                          item.media_type,
                          accountStates[`${item.media_type}_${item.id}`]?.rated?.value||0
                        )
                      }
                      onAddToList={() => openListModal(item.id)}
                      onFavorite={() =>
                        toggleFavorite(
                          user.id,
                          sessionId,
                          item.id,
                          item.media_type,
                          accountStates[`${item.media_type}_${item.id}`]?.favorite ?? false
                        )
                      }
                      isFavorite={accountStates[`${item.media_type}_${item.id}`]?.favorite ?? false}
                      currentRating={accountStates[`${item.media_type}_${item.id}`]?.rated?.value ?? 0}
                    />
                ))}
              </div>
        }

        {total > pageSize && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              « Prev
            </button>
            <span>Page {page}</span>
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total}
            >
              Next »
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <RatingModal
        isOpen={!!ratingTarget}
        title={ratingTarget?.title || ''}
        currentRating={ratingTarget?.current || 0}
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