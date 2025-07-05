const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper function to make API calls
const tmdbRequest = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('TMDB API Request failed:', error);
    throw error;
  }
};

// Helper function to format movie/TV show data
const formatMovieData = (item, type = 'movie') => {
  const title = type === 'movie' ? item.title : item.name;
  const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
  
  return {
    id: `${type}_${item.id}`,
    tmdbId: item.id,
    title,
    poster: item.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}`
      : '/placeholder-poster.jpg',
    backdrop: item.backdrop_path 
      ? `${TMDB_IMAGE_BASE_URL}/w1280${item.backdrop_path}`
      : null,
    score: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
    overview: item.overview,
    releaseDate,
    type,
    bookmarked: false, // Default value, should be managed by your app state
  };
};

// Get trending movies
export const getTrendingMovies = async (timeWindow = 'week') => {
  try {
    const data = await tmdbRequest('/trending/movie/week');
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

// Get trending TV shows
export const getTrendingTVShows = async (timeWindow = 'week') => {
  try {
    const data = await tmdbRequest('/trending/tv/week');
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return [];
  }
};

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const data = await tmdbRequest('/movie/popular', { page });
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Get popular TV shows
export const getPopularTVShows = async (page = 1) => {
  try {
    const data = await tmdbRequest('/tv/popular', { page });
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1) => {
  try {
    const data = await tmdbRequest('/movie/top_rated', { page });
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

// Get top rated TV shows
export const getTopRatedTVShows = async (page = 1) => {
  try {
    const data = await tmdbRequest('/tv/top_rated', { page });
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    return [];
  }
};

// Get now playing movies
export const getNowPlayingMovies = async (page = 1) => {
  try {
    const data = await tmdbRequest('/movie/now_playing', { page });
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

// Get upcoming movies
export const getUpcomingMovies = async (page = 1) => {
  try {
    const data = await tmdbRequest('/movie/upcoming', { page });
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

// Get currently airing TV shows
export const getAiringTodayTVShows = async (page = 1) => {
  try {
    const data = await tmdbRequest('/tv/airing_today', { page });
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error fetching airing today TV shows:', error);
    return [];
  }
};

// Get TV shows on the air
export const getOnTheAirTVShows = async (page = 1) => {
  try {
    const data = await tmdbRequest('/tv/on_the_air', { page });
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error fetching on the air TV shows:', error);
    return [];
  }
};

// Search movies and TV shows
export const searchMoviesAndTVShows = async (query, page = 1) => {
  try {
    const [moviesData, tvData] = await Promise.all([
      tmdbRequest('/search/movie', { query, page }),
      tmdbRequest('/search/tv', { query, page })
    ]);
    
    const movies = moviesData.results.map(movie => formatMovieData(movie, 'movie'));
    const tvShows = tvData.results.map(show => formatMovieData(show, 'tv'));
    
    return [...movies, ...tvShows].sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error searching movies and TV shows:', error);
    return [];
  }
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    const data = await tmdbRequest(`/movie/${movieId}`);
    return formatMovieData(data, 'movie');
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Get TV show details
export const getTVShowDetails = async (tvId) => {
  try {
    const data = await tmdbRequest(`/tv/${tvId}`);
    return formatMovieData(data, 'tv');
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return null;
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  try {
    const data = await tmdbRequest('/genre/movie/list');
    return data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
};

// Get TV genres
export const getTVGenres = async () => {
  try {
    const data = await tmdbRequest('/genre/tv/list');
    return data.genres;
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    return [];
  }
};

// Discover movies with filters
export const discoverMovies = async (filters = {}) => {
  try {
    const data = await tmdbRequest('/discover/movie', filters);
    return data.results.map(movie => formatMovieData(movie, 'movie'));
  } catch (error) {
    console.error('Error discovering movies:', error);
    return [];
  }
};

// Discover TV shows with filters
export const discoverTVShows = async (filters = {}) => {
  try {
    const data = await tmdbRequest('/discover/tv', filters);
    return data.results.map(show => formatMovieData(show, 'tv'));
  } catch (error) {
    console.error('Error discovering TV shows:', error);
    return [];
  }
};

// Helper function to get different image sizes
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-poster.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Configuration for TMDB image sizes
export const IMAGE_SIZES = {
  poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdrop: ['w300', 'w780', 'w1280', 'original'],
  profile: ['w45', 'w185', 'h632', 'original']
};