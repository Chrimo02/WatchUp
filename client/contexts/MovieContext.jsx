import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  getMovies, 
  getMovieDetails, 
  getMovieCredits, 
  getMovieVideos,
  searchMovies,
  discoverMovies,
  getGenres,
  getTVShows,
  getTVShowDetails,
  getTVShowCredits,
  getTVShowVideos,
  searchTVShows,
  discoverTVShows,
  addToWatchlist,
  getUpcomingMoviesWithVideos,
  getMovieAccountStates,
  getTVShowAccountStates,
  getBatchAccountStates
} from '../utils/api';

const MovieContext = createContext({
  loading: false,
  error: null,
  trendingMovies: [],
  popularMovies: [],
  topRatedMovies: [],
  popularTVShows: [],
  topRatedTVShows: [],
  airingTodayTVShows: [],
  genres: [],
  upcomingMoviesWithTrailers: [],
  accountStates: {}, // New: cache for account states
  fetchTrendingMovies: async () => {},
  fetchPopularMovies: async () => {},
  fetchTopRatedMovies: async () => {},
  fetchPopularTVShows: async () => {},
  fetchTopRatedTVShows: async () => {},
  fetchAiringTodayTVShows: async () => {},
  fetchMovieDetails: async () => ({}),
  fetchMovieCredits: async () => ({}),
  fetchMovieVideos: async () => ({}),
  fetchTVShowDetails: async () => ({}),
  fetchTVShowCredits: async () => ({}),
  fetchTVShowVideos: async () => ({}),
  searchMoviesByQuery: async () => ({}),
  searchTVShowsByQuery: async () => ({}),
  discoverMoviesByFilter: async () => ({}),
  discoverTVShowsByFilter: async () => ({}),
  fetchGenres: async () => {},
  toggleWatchlist: async () => {},
  getAccountStates: async () => ({}),
  getBatchAccountStates: async () => ({}),
  isInWatchlist: () => false,
  getRandomMovie: () => ({}),
  getRandomTVShow: () => ({}),
  fetchUpcomingMoviesWithTrailers: async () => {},
});

export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [upcomingMoviesWithTrailers, setUpcomingMoviesWithTrailers] = useState([]);
  const [accountStates, setAccountStates] = useState({}); // Cache for account states

  // Helper function to get cache key
  const getCacheKey = (mediaId, mediaType) => `${mediaType}_${mediaId}`;

  const fetchTrendingMovies = async (timeWindow = 'day') => {
    setLoading(true);
    setError(null);
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

  const fetchPopularMovies = async (page = 1) => {
    setLoading(true);
    setError(null);
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

  const fetchTopRatedMovies = async (page = 1) => {
    setLoading(true);
    setError(null);
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

  const fetchPopularTVShows = async (page = 1) => {
    setLoading(true);
    setError(null);
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

  const fetchTopRatedTVShows = async (page = 1) => {
    setLoading(true);
    setError(null);
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

  const fetchAiringTodayTVShows = async (page = 1) => {
    setLoading(true);
    setError(null);
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

  // New function to get account states for a single item
  const getAccountStates = async (mediaId, mediaType, sessionId) => {
    const cacheKey = getCacheKey(mediaId, mediaType);
    
    // Return cached result if available
    if (accountStates[cacheKey]) {
      return accountStates[cacheKey];
    }

    try {
      const response = mediaType === 'movie' || mediaType === 'film'
        ? await getMovieAccountStates(mediaId, sessionId)
        : await getTVShowAccountStates(mediaId, sessionId);
      
      const states = response.data;
      
      // Cache the result
      setAccountStates(prev => ({
        ...prev,
        [cacheKey]: states
      }));
      
      return states;
    } catch (error) {
      console.error(`Failed to get account states for ${mediaType} ${mediaId}:`, error);
      // Return default states on error
      const defaultStates = { watchlist: false, favorite: false, rated: false };
      
      // Cache the default states to avoid repeated failed requests
      setAccountStates(prev => ({
        ...prev,
        [cacheKey]: defaultStates
      }));
      
      return defaultStates;
    }
  };

  // New function to get account states for multiple items
  const getBatchAccountStatesForItems = async (items, sessionId) => {
    // Filter out items that are already cached
    const uncachedItems = items.filter(item => {
      const cacheKey = getCacheKey(item.id, item.type);
      return !accountStates[cacheKey];
    });

    if (uncachedItems.length === 0) {
      // All items are cached, return current cache
      return accountStates;
    }

    try {
      const newStates = await getBatchAccountStates(uncachedItems, sessionId);
      
      // Merge with existing cache
      setAccountStates(prev => ({
        ...prev,
        ...newStates
      }));
      
      return { ...accountStates, ...newStates };
    } catch (error) {
      console.error('Failed to get batch account states:', error);
      return accountStates;
    }
  };

  const toggleWatchlist = async (accountId, sessionId, mediaId, mediaType, isCurrentlyInWatchlist) => {
    try {
      const shouldAdd = !isCurrentlyInWatchlist;
      
      console.log(`Toggling watchlist: ${mediaType} ${mediaId}, adding: ${shouldAdd}`);
      
      // Make API call
      await addToWatchlist(accountId, sessionId, mediaId, mediaType, shouldAdd);
      
      // Update cached account states immediately
      const cacheKey = getCacheKey(mediaId, mediaType);
      setAccountStates(prev => ({
        ...prev,
        [cacheKey]: {
          ...prev[cacheKey],
          watchlist: shouldAdd
        }
      }));
      
      console.log(`Successfully toggled watchlist for ${mediaType} ${mediaId}`);
      return true;
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
      throw err;
    }
  };

  const isInWatchlist = useCallback((mediaId, mediaType) => {
    const cacheKey = getCacheKey(mediaId, mediaType);
    return accountStates[cacheKey]?.watchlist || false;
  }, [accountStates]);

  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    setError(null);
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

  const fetchTVShowDetails = async (tvId) => {
    setLoading(true);
    setError(null);
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

  const fetchMovieCredits = async (movieId) => {
    try {
      const { data } = await getMovieCredits(movieId);
      return data;
    } catch (err) {
      console.error('Failed to fetch movie credits:', err);
      throw err;
    }
  };

  const fetchTVShowCredits = async (tvId) => {
    try {
      const { data } = await getTVShowCredits(tvId);
      return data;
    } catch (err) {
      console.error('Failed to fetch TV show credits:', err);
      throw err;
    }
  };

  const fetchMovieVideos = async (movieId) => {
    try {
      const { data } = await getMovieVideos(movieId);
      return data;
    } catch (err) {
      console.error('Failed to fetch movie videos:', err);
      throw err;
    }
  };

  const fetchTVShowVideos = async (tvId) => {
    try {
      const { data } = await getTVShowVideos(tvId);
      return data;
    } catch (err) {
      console.error('Failed to fetch TV show videos:', err);
      throw err;
    }
  };

  const searchMoviesByQuery = async (query, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await searchMovies(query, page);
      return data;
    } catch (err) {
      setError('Failed to search movies');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchTVShowsByQuery = async (query, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await searchTVShows(query, page);
      return data;
    } catch (err) {
      setError('Failed to search TV shows');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const discoverMoviesByFilter = async (params) => {
    setLoading(true);
    setError(null);
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

  const discoverTVShowsByFilter = async (params) => {
    setLoading(true);
    setError(null);
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

  const fetchGenres = async () => {
    try {
      const { data } = await getGenres();
      setGenres(data.genres);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const getRandomMovie = useCallback(() => {
    if (popularMovies.length > 0) {
      const randomIndex = Math.floor(Math.random() * popularMovies.length);
      return popularMovies[randomIndex];
    }
    return null;
  }, [popularMovies]);

  const getRandomTVShow = useCallback(() => {
    if (popularTVShows.length > 0) {
      const randomIndex = Math.floor(Math.random() * popularTVShows.length);
      return popularTVShows[randomIndex];
    }
    return null;
  }, [popularTVShows]);

  const fetchUpcomingMoviesWithTrailers = async (page = 1) => {
    setLoading(true);
    setError(null);
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
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};