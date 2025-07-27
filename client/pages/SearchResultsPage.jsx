import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import ListComponent from '../components/ListComponent';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // filter: 'all' | 'movie' | 'tv' | 'person'
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { searchMultiByQuery, isInWatchlist } = useMovies();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();

  useEffect(() => {
    if (!query) return setItems([]);
    const doSearch = async () => {
      setLoading(true);
      try {
        const data = await searchMultiByQuery(query, page);
        setItems(data.results);
        setTotal(data.total_results);
      } catch (err) {
        console.error(err);
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [query, page]);

  const filtered = items.filter(x => {
    if (filter === 'all') return ['movie','tv','person'].includes(x.media_type);
    return x.media_type === filter;
  });

  return (
    <div className="min-h-screen bg-[#141414] text-white px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Results for “<span className="italic">{query}</span>”
      </h1>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all','movie','tv','person'].map(type => (
          <button
            key={type}
            onClick={() => { setFilter(type); setPage(1); }}
            className={`
              px-4 py-2 rounded-full font-medium
              ${filter === type
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
            `}
          >
            {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : type === 'tv' ? 'Series' : 'People'}
          </button>
        ))}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="text-center py-10">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No results found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(item => {
            if (item.media_type === 'movie' || item.media_type === 'tv') {
              return (
                <ListComponent
                  key={item.id}
                  mediaType={item.media_type}
                  mediaId={item.id}
                  bookmarked={isInWatchlist(item.id, item.media_type)}
                  isLoading={bookmarkLoadingStates.has(item.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              );
            }
            // für Personen
            return (
              <div
                key={item.id}
                className="bg-[#141414] border border-gray-700 rounded-2xl p-4 text-white"
              >
                <h3 className="text-lg font-semibold">{item.name}</h3>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(p-1, 1))}
            disabled={page === 1}
          >
            « Prev
          </button>
          <span>Page {page}</span>
          <button
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setPage(p => p+1)}
            disabled={page * 20 >= total}
          >
            Next »
          </button>
        </div>
      )}
    </div>
);
}