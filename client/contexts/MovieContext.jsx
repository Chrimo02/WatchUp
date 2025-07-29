// src/contexts/MovieContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getMovies,
  getTVShows,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getTVShowDetails,
  getTVShowCredits,
  getTVShowVideos,
  searchMovies,
  searchTVShows,
  searchMulti,
  searchPeople,
  discoverMovies,
  discoverTVShows,
  getGenres,
  addToWatchlist,
  getUpcomingMoviesWithVideos,
  getMovieAccountStates,
  getTVShowAccountStates,
  getBatchAccountStates,
  markAsFavorite, 
} from '../utils/api';

const MovieContext = createContext({});
export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [trendingMovies, setTrendingMovies]                       = useState([]);
  const [popularMovies, setPopularMovies]                         = useState([]);
  const [topRatedMovies, setTopRatedMovies]                       = useState([]);
  const [popularTVShows, setPopularTVShows]                       = useState([]);
  const [topRatedTVShows, setTopRatedTVShows]                     = useState([]);
  const [airingTodayTVShows, setAiringTodayTVShows]               = useState([]);
  const [genres, setGenres]                                       = useState([]);
  const [upcomingMoviesWithTrailers, setUpcomingMoviesWithTrailers] = useState([]);
  const [accountStates, setAccountStates]                         = useState({});

  const getCacheKey = (mediaId, mediaType) => `${mediaType}_${mediaId}`;

  // Fetch trending movies
  const fetchTrendingMovies = async (timeWindow = 'day') => {
    setLoading(true); setError(null);
    try {
      const { data } = await getMovies.trending(timeWindow);
      setTrendingMovies(data.results);
    } catch (err) {
      setError('Failed to fetch trending movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular movies
  const fetchPopularMovies = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getMovies.popular(page);
      setPopularMovies(data.results);
    } catch (err) {
      setError('Failed to fetch popular movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top-rated movies
  const fetchTopRatedMovies = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getMovies.topRated(page);
      setTopRatedMovies(data.results);
    } catch (err) {
      setError('Failed to fetch top rated movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular TV shows
  const fetchPopularTVShows = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getTVShows.popular(page);
      setPopularTVShows(data.results);
    } catch (err) {
      setError('Failed to fetch popular TV shows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top-rated TV shows
  const fetchTopRatedTVShows = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getTVShows.topRated(page);
      setTopRatedTVShows(data.results);
    } catch (err) {
      setError('Failed to fetch top rated TV shows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch airing today TV shows
  const fetchAiringTodayTVShows = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await getTVShows.airing_today(page);
      setAiringTodayTVShows(data.results);
    } catch (err) {
      setError('Failed to fetch airing today TV shows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get account states for a single item (with caching)
  const getAccountStates = async (mediaId, mediaType, sessionId) => {
    const key = getCacheKey(mediaId, mediaType);
    if (accountStates[key]) {
      return accountStates[key];
    }
    try {
      const resp = mediaType === 'movie'
        ? await getMovieAccountStates(mediaId, sessionId)
        : await getTVShowAccountStates(mediaId, sessionId);
      const states = resp.data;
      setAccountStates(prev => ({ ...prev, [key]: states }));
      return states;
    } catch (err) {
      console.error(`Failed to get account states for ${mediaType} ${mediaId}:`, err);
      const defaultStates = { watchlist: false, favorite: false, rated: false };
      setAccountStates(prev => ({ ...prev, [key]: defaultStates }));
      return defaultStates;
    }
  };

  // Batch get account states for multiple items
  const getBatchAccountStatesForItems = async (items, sessionId) => {
    const uncached = items.filter(i => !accountStates[getCacheKey(i.id, i.type)]);
    if (uncached.length === 0) return accountStates;
    try {
      const newStates = await getBatchAccountStates(uncached, sessionId);
      setAccountStates(prev => ({ ...prev, ...newStates }));
      return { ...accountStates, ...newStates };
    } catch (err) {
      console.error('Failed to get batch account states:', err);
      return accountStates;
    }
  };

  // Toggle watchlist
  const toggleWatchlist = async (accountId, sessionId, mediaId, mediaType, isCurrentlyInWatchlist) => {
    try {
      const shouldAdd = !isCurrentlyInWatchlist;
      await addToWatchlist(accountId, sessionId, mediaId, mediaType, shouldAdd);
      const key = getCacheKey(mediaId, mediaType);
      setAccountStates(prev => ({
        ...prev,
        [key]: { ...prev[key], watchlist: shouldAdd }
      }));
      return true;
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
      throw err;
    }
  };

  const toggleFavorite = async (
    accountId,
    sessionId,
    mediaId,
    mediaType,          // "movie" | "tv"
    isCurrentlyFavorite // boolean
  ) => {
    try {
      const shouldAdd = !isCurrentlyFavorite;
      await markAsFavorite(accountId, sessionId, mediaId, mediaType, shouldAdd);

      const key = getCacheKey(mediaId, mediaType);
      setAccountStates(prev => ({
        ...prev,
        [key]: { ...(prev[key] ?? {}), favorite: shouldAdd },
      }));
      return true;
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      throw err;
    }
  };

  // Check if in watchlist
  const isInWatchlist = useCallback((mediaId, mediaType) => {
    return accountStates[getCacheKey(mediaId, mediaType)]?.watchlist || false;
  }, [accountStates]);

  // Fetch movie details
  const fetchMovieDetails = async movieId => {
    setLoading(true); setError(null);
    try {
      const { data } = await getMovieDetails(movieId);
      return data;
    } catch (err) {
      setError('Failed to fetch movie details');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch TV show details
  const fetchTVShowDetails = async tvId => {
    setLoading(true); setError(null);
    try {
      const { data } = await getTVShowDetails(tvId);
      return data;
    } catch (err) {
      setError('Failed to fetch TV show details');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch movie credits
  const fetchMovieCredits = async movieId => {
    try {
      const { data } = await getMovieCredits(movieId);
      return data;
    } catch (err) {
      console.error('Failed to fetch movie credits:', err);
      throw err;
    }
  };

  // Fetch TV show credits
  const fetchTVShowCredits = async tvId => {
    try {
      const { data } = await getTVShowCredits(tvId);
      return data;
    } catch (err) {
      console.error('Failed to fetch TV show credits:', err);
      throw err;
    }
  };

  // Fetch movie videos
  const fetchMovieVideos = async movieId => {
    try {
      const { data } = await getMovieVideos(movieId);
      return data;
    } catch (err) {
      console.error('Failed to fetch movie videos:', err);
      throw err;
    }
  };

  // Fetch TV show videos
  const fetchTVShowVideos = async tvId => {
    try {
      const { data } = await getTVShowVideos(tvId);
      return data;
    } catch (err) {
      console.error('Failed to fetch TV show videos:', err);
      throw err;
    }
  };

  // Search movies (sorted by popularity desc)
  const searchMoviesByQuery = useCallback(async (query, page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await searchMovies(query, page);
      data.results = (data.results || [])
        .slice()
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return data;
    } catch (err) {
      setError('Failed to search movies');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search TV shows (sorted by popularity desc)
  const searchTVShowsByQuery = useCallback(async (query, page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await searchTVShows(query, page);
      data.results = (data.results || [])
        .slice()
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return data;
    } catch (err) {
      setError('Failed to search TV shows');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search people (sorted by popularity desc)
  const searchPeopleByQuery = useCallback(async (query, page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await searchPeople(query, page);
      data.results = (data.results || [])
        .slice()
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return data;
    } catch (err) {
      setError('Failed to search people');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Multi search (sorted by popularity desc)
  const searchMultiByQuery = useCallback(async (query, page = 1) => {
    setLoading(true); setError(null);
    try {
      const { data } = await searchMulti(query, page);
      data.results = (data.results || [])
        .slice()
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return data;
    } catch (err) {
      setError('Failed to search multi');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Discover movies by filter
  const discoverMoviesByFilter = async params => {
    setLoading(true); setError(null);
    try {
      const { data } = await discoverMovies(params);
      return data;
    } catch (err) {
      setError('Failed to discover movies');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Discover TV shows by filter
  const discoverTVShowsByFilter = async params => {
    setLoading(true); setError(null);
    try {
      const { data } = await discoverTVShows(params);
      return data;
    } catch (err) {
      setError('Failed to discover TV shows');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const setRatingLocal = (mediaId, mediaType, value) => {
    const key = getCacheKey(mediaId, mediaType);
    setAccountStates(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), rated: { value } },
    }));
  };
  // Fetch genres
  const fetchGenres = async () => {
    try {
      const { data } = await getGenres();
      setGenres(data.genres);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  // Get random movie from popular
  const getRandomMovie = useCallback(() => {
    if (popularMovies.length === 0) return null;
    const idx = Math.floor(Math.random() * popularMovies.length);
    return popularMovies[idx];
  }, [popularMovies]);

  // Get random TV show from popular
  const getRandomTVShow = useCallback(() => {
    if (popularTVShows.length === 0) return null;
    const idx = Math.floor(Math.random() * popularTVShows.length);
    return popularTVShows[idx];
  }, [popularTVShows]);

  // Fetch upcoming movies with trailers
  const fetchUpcomingMoviesWithTrailers = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const data = await getUpcomingMoviesWithVideos(page);
      setUpcomingMoviesWithTrailers(data.results);
      return data.results;
    } catch (err) {
      setError('Failed to fetch upcoming movies with trailers');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovieContext.Provider
      value={{
        loading,
        error,
        trendingMovies,
        popularMovies,
        topRatedMovies,
        popularTVShows,
        topRatedTVShows,
        airingTodayTVShows,
        genres,
        upcomingMoviesWithTrailers,
        accountStates,
        setRatingLocal, 
        fetchTrendingMovies,
        fetchPopularMovies,
        fetchTopRatedMovies,
        fetchPopularTVShows,
        fetchTopRatedTVShows,
        fetchAiringTodayTVShows,
        fetchMovieDetails,
        fetchTVShowDetails,
        fetchMovieCredits,
        fetchTVShowCredits,
        fetchMovieVideos,
        fetchTVShowVideos,
        searchMoviesByQuery,
        searchTVShowsByQuery,
        searchPeopleByQuery,
        searchMultiByQuery,
        discoverMoviesByFilter,
        discoverTVShowsByFilter,
        fetchGenres,
        toggleWatchlist,
        getAccountStates,
        getBatchAccountStates: getBatchAccountStatesForItems,
        isInWatchlist,
        getRandomMovie,
        getRandomTVShow,
        fetchUpcomingMoviesWithTrailers,
        toggleFavorite, 
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
