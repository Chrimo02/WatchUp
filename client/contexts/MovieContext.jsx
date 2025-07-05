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
  getWatchlistMovies,
  getWatchlistTVShows,
  addToWatchlist
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
  watchlistMovies: [],
  watchlistTVShows: [],
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
  fetchWatchlistMovies: async () => {},
  fetchWatchlistTVShows: async () => {},
  toggleWatchlist: async () => {},
  isInWatchlist: () => false,
  getRandomMovie: () => ({}),
  getRandomTVShow: () => ({}),
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
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [watchlistTVShows, setWatchlistTVShows] = useState([]);

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

  const fetchWatchlistMovies = async (accountId, sessionId) => {
    try {
      const { data } = await getWatchlistMovies(accountId, sessionId);
      setWatchlistMovies(data.results || []);
      console.log('Fetched watchlist movies:', data.results);
    } catch (err) {
      console.error('Failed to fetch watchlist movies:', err);
      setWatchlistMovies([]);
    }
  };

  const fetchWatchlistTVShows = async (accountId, sessionId) => {
    try {
      const { data } = await getWatchlistTVShows(accountId, sessionId);
      setWatchlistTVShows(data.results || []);
      console.log('Fetched watchlist TV shows:', data.results);
    } catch (err) {
      console.error('Failed to fetch watchlist TV shows:', err);
      setWatchlistTVShows([]);
    }
  };

  const toggleWatchlist = async (accountId, sessionId, mediaId, mediaType, isCurrentlyInWatchlist) => {
    try {
      const shouldAdd = !isCurrentlyInWatchlist;
      
      console.log(`Toggling watchlist: ${mediaType} ${mediaId}, adding: ${shouldAdd}`);
      
      // Make API call
      await addToWatchlist(accountId, sessionId, mediaId, mediaType, shouldAdd);
      
      // Update local state immediately for better UX
      if (mediaType === 'movie') {
        if (shouldAdd) {
          // Add movie to local watchlist state
          // We need to create a movie object - for now we'll just use the id
          // In a real app, you might want to fetch the movie details
          const movieToAdd = { id: mediaId };
          setWatchlistMovies(prev => {
            // Check if it's already in the list
            if (prev.some(movie => movie.id === mediaId)) {
              return prev;
            }
            return [...prev, movieToAdd];
          });
        } else {
          // Remove movie from local watchlist state
          setWatchlistMovies(prev => prev.filter(movie => movie.id !== mediaId));
        }
      } else if (mediaType === 'tv') {
        if (shouldAdd) {
          // Add TV show to local watchlist state
          const tvShowToAdd = { id: mediaId };
          setWatchlistTVShows(prev => {
            // Check if it's already in the list
            if (prev.some(show => show.id === mediaId)) {
              return prev;
            }
            return [...prev, tvShowToAdd];
          });
        } else {
          // Remove TV show from local watchlist state
          setWatchlistTVShows(prev => prev.filter(show => show.id !== mediaId));
        }
      }
      
      console.log(`Successfully toggled watchlist for ${mediaType} ${mediaId}`);
      return true;
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
      throw err;
    }
  };

  const isInWatchlist = useCallback((mediaId, mediaType) => {
    if (mediaType === 'movie') {
      return watchlistMovies.some(movie => movie.id === mediaId);
    } else if (mediaType === 'tv' || mediaType === 'series') {
      return watchlistTVShows.some(show => show.id === mediaId);
    }
    return false;
  }, [watchlistMovies, watchlistTVShows]);

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
        watchlistMovies,
        watchlistTVShows,
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
        fetchWatchlistMovies,
        fetchWatchlistTVShows,
        toggleWatchlist,
        isInWatchlist,
        getRandomMovie,
        getRandomTVShow,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};