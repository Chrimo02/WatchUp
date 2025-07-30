import React, { useEffect, useState } from 'react';
import PeopleListView from '../components/PeopleListView';
import PeopleGridView from '../components/PeopleGridView';
import ListIcon from '../components/icons/ListIcon';
import GridIcon from '../components/icons/GridIcon';
import chairsBg from '../assets/chairs.jpg';
import { usePerson } from '../contexts/PersonContext';

export default function PopularPeople() {
  const {
    popularPeople,
    totalResults,
    loading,
    error,
    fetchPopularPeople,
  } = usePerson();

  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchPopularPeople(page);
  }, [page, fetchPopularPeople]);

  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const totalPages = Math.ceil(totalResults / 20);

  const commitInputPage = () => {
    let v = parseInt(inputPage, 10) || 1;
    if (v < 1) v = 1;
    if (v > totalPages) v = totalPages;
    setPage(v);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      commitInputPage();
    }
  };

  if (loading) return <div className="py-20 text-center text-white">Loading…</div>;
  if (error)   return <div className="py-20 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header Banner */}
      <div
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${chairsBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
        <h1 className="relative text-4xl font-extrabold">Popular People</h1>
        <div className="absolute bottom-4 left-8">
          <p className="text-sm">
            {`${(page - 1) * 20 + 1} – ${Math.min(page * 20, totalResults)} of ${totalResults} People`}
          </p>
        </div>
        <div className="absolute bottom-4 right-8 flex space-x-4">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {viewMode === 'list' ? (
          <PeopleListView people={popularPeople} />
        ) : (
          <PeopleGridView people={popularPeople} />
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &laquo; Previous
          </button>

          {/* Manual page input */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-input" className="sr-only">Page</label>
            <input
              id="page-input"
              type="number"
              min={1}
              max={totalPages}
              value={inputPage}
              onChange={e => setInputPage(e.target.value)}
              onBlur={commitInputPage}
              onKeyDown={handleKeyDown}
              className="
                w-16 text-center bg-gray-800 border border-gray-600 rounded 
                py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-600
                appearance-none
              "
            />
            <span className="text-sm">/ {totalPages}</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  );
}