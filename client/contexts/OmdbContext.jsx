// src/contexts/OmdbContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { fetchMovieById, fetchMoviesBySearch } from '../utils/omdbapi';

const OmdbContext = createContext({
  loading: false,
  error: null,
  items: [],
  selectedMovie: null,
  selectedSeries: null,
  search: async () => {},
  getMovieDetails: async () => {},
  getSeriesDetails: async () => {},
});

export function OmdbProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  async function search(title) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMoviesBySearch(title);
      if (data.Response === 'True') {
        setItems(data.Search);
      } else {
        setError(data.Error);
        setItems([]);
      }
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function getMovieDetails(imdbID) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMovieById(imdbID);
      if (data.Response === 'True' && data.Type === 'movie') {
        setSelectedMovie(data);
      } else if (data.Response === 'True') {
        setError('Not a movie');
        setSelectedMovie(null);
      } else {
        setError(data.Error);
        setSelectedMovie(null);
      }
    } catch (e) {
      setError(e.message);
      setSelectedMovie(null);
    } finally {
      setLoading(false);
    }
  }

  async function getSeriesDetails(imdbID) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMovieById(imdbID);
      if (data.Response === 'True' && data.Type === 'series') {
        setSelectedSeries(data);
      } else if (data.Response === 'True') {
        setError('Not a series');
        setSelectedSeries(null);
      } else {
        setError(data.Error);
        setSelectedSeries(null);
      }
    } catch (e) {
      setError(e.message);
      setSelectedSeries(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OmdbContext.Provider
      value={{
        loading,
        error,
        items,
        selectedMovie,
        selectedSeries,
        search,
        getMovieDetails,
        getSeriesDetails
      }}
    >
      {children}
    </OmdbContext.Provider>
  );
}

export function useOmdb() {
  const context = useContext(OmdbContext);
  if (!context) throw new Error('useOmdb must be used within OmdbProvider');
  return context;
}
