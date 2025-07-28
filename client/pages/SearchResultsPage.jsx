// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useAuth } from '../contexts/AuthContext';
import ListComponent from '../components/ListComponent';
import PersonListItem from '../components/PersonListItem';
import chairsBg from '../assets/chairs.jpg';
import {
  rateMovie,
  markAsFavorite,
  addToWatchlist,
  getMovieWatchProviders,
  getTVShowWatchProviders,
} from '../utils/api';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';

  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { 
    searchMultiByQuery,
    searchMoviesByQuery,
    searchTVShowsByQuery,
    isInWatchlist,
  } = useMovies();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { user, sessionId } = useAuth();

  const [movieTotal, setMovieTotal] = useState(0);
  const [tvTotal, setTvTotal] = useState(0);
  const [providersMap, setProvidersMap] = useState({});

  // reset page on new query
  useEffect(() => {
    setPage(1);
  }, [query]);

  // fetch mixed search results & sort by popularity desc
  useEffect(() => {
    let cancelled = false;
    if (!query) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await searchMultiByQuery(query, page);
        if (cancelled) return;
        const results = (data.results || [])
          .slice() // copy
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        setItems(results);
        setTotal(data.total_results || 0);
      } catch (err) {
        if (!cancelled) {
          console.error('Search failed', err);
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query, page, searchMultiByQuery]);

  // fetch separate totals for movies & tv
  useEffect(() => {
    let cancelled = false;
    if (!query) {
      setMovieTotal(0);
      setTvTotal(0);
      return;
    }
    (async () => {
      try {
        const [m, tv] = await Promise.all([
          searchMoviesByQuery(query, 1),
          searchTVShowsByQuery(query, 1),
        ]);
        if (!cancelled) {
          setMovieTotal(m.total_results || 0);
          setTvTotal(tv.total_results || 0);
        }
      } catch (err) {
        if (!cancelled) console.error('Count-fetch failed', err);
      }
    })();
    return () => { cancelled = true; };
  }, [query, searchMoviesByQuery, searchTVShowsByQuery]);

  // load streaming providers for movies & tv
  useEffect(() => {
    let cancelled = false;
    if (!items.length) {
      setProvidersMap({});
      return;
    }
    (async () => {
      try {
        const relevant = items.filter(i => i.media_type === 'movie' || i.media_type === 'tv');
        const entries = await Promise.all(relevant.map(async i => {
          if (i.media_type === 'movie') {
            const { data } = await getMovieWatchProviders(i.id);
            return [i.id, data.results];
          } else {
            const { data } = await getTVShowWatchProviders(i.id);
            return [i.id, data.results];
          }
        }));
        if (!cancelled) setProvidersMap(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) console.error('Providers load failed', err);
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  // filter + counts
  const filtered = items.filter(x => {
    if (filter === 'all') return ['movie','tv','person'].includes(x.media_type);
    return x.media_type === filter;
  });
  const counts = {
    all: total,
    movie: movieTotal,
    tv: tvTotal,
    person: Math.max(total - movieTotal - tvTotal, 0),
  };

  const pageSize = 20;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div
        className="relative h-64 bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
        <div className="absolute bottom-4 left-8 text-sm text-gray-300">
          {start.toLocaleString()} – {end.toLocaleString()} of {total.toLocaleString()} Results
        </div>
        <h1 className="relative text-4xl font-extrabold">
          Results for “<span className="italic">{query}</span>”
        </h1>
        <div className="absolute bottom-4 right-8 flex gap-2">
          {(['all','movie','tv','person']).map(type => {
            const label =
              type === 'all'   ? 'All'
            : type === 'movie' ? 'Movies'
            : type === 'tv'    ? 'Series'
            :                   'People';
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                  px-4 py-2 rounded-full font-medium
                  ${filter === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                `}
              >
                {label} ({counts[type].toLocaleString()})
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-10">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No results found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(item => {
              if (item.media_type === 'movie' || item.media_type === 'tv') {
                const provs = providersMap[item.id] || {};
                const streaming = [
                  ...(provs.flatrate||[]),
                  ...(provs.rent   ||[]),
                  ...(provs.buy    ||[]),
                ].map(p => ({
                  icon: p.logo_path
                    ? <img
                        key={p.provider_id}
                        src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                        alt={p.provider_name}
                        className="w-6 h-6 object-contain"
                      />
                    : null,
                  name: p.provider_name,
                }));
                return (
                  <ListComponent
                    key={item.id}
                    mediaType={item.media_type}
                    mediaId={item.id}
                    bookmarked={isInWatchlist(item.id, item.media_type)}
                    isLoading={bookmarkLoadingStates.has(item.id)}
                    streamingPlatforms={streaming}
                    onBookmarkToggle={handleBookmarkToggle}
                    onRate={value => rateMovie(item.id, sessionId, value)}
                    onFavorite={() =>
                      markAsFavorite(user.id, sessionId, item.id, item.media_type, true)
                    }
                    onAddToList={() =>
                      addToWatchlist(user.id, sessionId, item.id, item.media_type, true)
                    }
                  />
                );
              }
              return <PersonListItem key={item.id} person={item} />;
            })}
          </div>
        )}

        {/* pagination */}
        {total > 0 && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(p-1,1))}
              disabled={page===1}
            >
              « Prev
            </button>
            <span>Page {page}</span>
            <button
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => p+1)}
              disabled={page * pageSize >= total}
            >
              Next »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}