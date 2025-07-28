// src/utils/api.js
import axios from 'axios';

// Replace with your TMDB API key
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// Image sizes
export const posterSizes = {
  small: `${IMAGE_BASE_URL}/w185`,
  medium: `${IMAGE_BASE_URL}/w342`,
  large: `${IMAGE_BASE_URL}/w500`,
  original: `${IMAGE_BASE_URL}/original`,
};

export const backdropSizes = {
  small: `${IMAGE_BASE_URL}/w300`,
  medium: `${IMAGE_BASE_URL}/w780`,
  large: `${IMAGE_BASE_URL}/w1280`,
  original: `${IMAGE_BASE_URL}/original`,
};

// API endpoints for movies
export const getMovies = {
  trending: (timeWindow = 'day') => api.get(`/trending/movie/${timeWindow}`),
  popular: (page = 1) => api.get('/movie/popular', { params: { page } }),
  topRated: (page = 1) => api.get('/movie/top_rated', { params: { page } }),
  upcoming: (page = 1) => api.get('/movie/upcoming', { params: { page } }),
  nowPlaying: (page = 1) => api.get('/movie/now_playing', { params: { page } }),
};

// API endpoints for TV shows
export const getTVShows = {
  trending: (timeWindow = 'day') => api.get(`/trending/tv/${timeWindow}`),
  popular: (page = 1) => api.get('/tv/popular', { params: { page } }),
  topRated: (page = 1) => api.get('/tv/top_rated', { params: { page } }),
  airing_today: (page = 1) => api.get('/tv/airing_today', { params: { page } }),
  on_the_air: (page = 1) => api.get('/tv/on_the_air', { params: { page } }),
};

// Details
export const getMovieDetails = (movieId) => api.get(`/movie/${movieId}`);
export const getTVShowDetails = (tvId) =>
  api.get(`/tv/${tvId}`, { params: { append_to_response: 'external_ids' } });
export const getSeasonDetails = (tvId, seasonNumber) =>
  api.get(`/tv/${tvId}/season/${seasonNumber}`);

// Credits
export const getMovieCredits = (movieId) => api.get(`/movie/${movieId}/credits`);
export const getTVShowCredits = (tvId) => api.get(`/tv/${tvId}/credits`);

// Videos
export const getMovieVideos = (movieId) => api.get(`/movie/${movieId}/videos`);
export const getTVShowVideos = (tvId) => api.get(`/tv/${tvId}/videos`);

export const getMovieKeywords = (movieId) =>
  api.get(`/movie/${movieId}/keywords`);

export const getShowKeywords = (tvId) =>
  api.get(`/tv/${tvId}/keywords`);

// Similar content
export const getSimilarMovies = (movieId, page = 1) =>
  api.get(`/movie/${movieId}/similar`, { params: { page } });

export const getRecommendedMovies = (movieId, page = 1) =>
  api.get(`/movie/${movieId}/recommendations`, { params: { page } });

export const getRecommendedTVShows = (tvId, page = 1) =>
  api.get(`/tv/${tvId}/recommendations`, { params: { page } });

export const getSimilarTVShows = (tvId, page = 1) =>
  api.get(`/tv/${tvId}/similar`, { params: { page } });

export const getTVShowExternalIds = (tvId) =>
  api.get(`/tv/${tvId}/external_ids`);

// Search
export const searchMovies = (query, page = 1) =>
  api.get('/search/movie', { params: { query, page } });

export const searchTVShows = (query, page = 1) =>
  api.get('/search/tv', { params: { query, page } });

// Multi-search (movies, TV, people)
export const searchMulti = (query, page = 1) =>
  api.get('/search/multi', { params: { query, page } });

// Neue Funktion: dedizierte Personensuche
export const searchPeople = (query, page = 1) =>
  api.get('/search/person', { params: { query, page } });

// Discover
export const discoverMovies = (params = {}) =>
  api.get('/discover/movie', {
    params: {
      include_adult: false,
      certification_country: params.certification_country || 'US',
      'certification.lte':   params['certification.lte']     || 'PG-13',
      ...params
    }
  });

export const discoverTVShows = (params = {}) =>
  api.get('/discover/tv', {
    params: {
      include_adult: false,
      ...params
    }
  });

// Genres
export const getGenres = () => api.get('/genre/movie/list');
export const getTVGenres = () => api.get('/genre/tv/list');

// Authentication
export const auth = {
  createRequestToken: () => api.get('/authentication/token/new'),
  createSession: (requestToken) =>
    api.post('/authentication/session/new', { request_token: requestToken }),
  deleteSession: (sessionId) =>
    api.delete('/authentication/session', { data: { session_id: sessionId } }),
  getAccount: (sessionId) =>
    api.get('/account', { params: { session_id: sessionId } }),
};

// User specific endpoints
export const getUserLists = (accountId, sessionId) =>
  api.get(`/account/${accountId}/lists`, { params: { session_id: sessionId } });

export const getFavoriteMovies = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/favorite/movies`, {
    params: { session_id: sessionId, page },
  });

export const getFavoriteTVShows = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/favorite/tv`, {
    params: { session_id: sessionId, page },
  });

export const getWatchlistMovies = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/watchlist/movies`, {
    params: { session_id: sessionId, page },
  });

export const getWatchlistTVShows = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/watchlist/tv`, {
    params: { session_id: sessionId, page },
  });

export const getRatedMovies = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/rated/movies`, {
    params: { session_id: sessionId, page },
  });

export const getRatedTVShows = (accountId, sessionId, page = 1) =>
  api.get(`/account/${accountId}/rated/tv`, {
    params: { session_id: sessionId, page },
  });

// List management functions
export const createList = (sessionId, name, description = "") =>
  api.post(
    "/list",
    {
      name,
      description,
      language: "en",
    },
    { params: { session_id: sessionId } },
  );

export const getListDetails = (listId, sessionId) =>
  api.get(`/list/${listId}`, { params: { session_id: sessionId } });

export const addMovieToList = (listId, sessionId, movieId) =>
  api.post(
    `/list/${listId}/add_item`,
    {
      media_id: movieId,
    },
    { params: { session_id: sessionId } },
  );

export const removeMovieFromList = (listId, sessionId, movieId) =>
  api.post(
    `/list/${listId}/remove_item`,
    {
      media_id: movieId,
    },
    { params: { session_id: sessionId } },
  );

export const deleteList = (listId, sessionId) =>
  api.delete(`/list/${listId}`, { params: { session_id: sessionId } });

export const markAsFavorite = (accountId, sessionId, mediaId, mediaType, favorite) =>
  api.post(
    `/account/${accountId}/favorite`,
    {
      media_type: mediaType,
      media_id: mediaId,
      favorite,
    },
    { params: { session_id: sessionId } },
  );

export const addToWatchlist = (accountId, sessionId, mediaId, mediaType, watchlist) =>
  api.post(
    `/account/${accountId}/watchlist`,
    {
      media_type: mediaType,
      media_id: mediaId,
      watchlist,
    },
    { params: { session_id: sessionId } },
  );

export const rateMovie = (movieId, sessionId, value) =>
  api.post(
    `/movie/${movieId}/rating`,
    {
      value,
    },
    { params: { session_id: sessionId } },
  );

export const rateTVShow = (tvId, sessionId, value) =>
  api.post(
    `/tv/${tvId}/rating`,
    {
      value,
    },
    { params: { session_id: sessionId } },
  );

// Additional helper functions
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-poster.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const deleteMovieRating = (movieId, sessionId) =>
  api.delete(`/movie/${movieId}/rating`, {
    params: { session_id: sessionId },
  });

export const deleteTVShowRating = (tvId, sessionId) =>
  api.delete(`/tv/${tvId}/rating`, {
    params: { session_id: sessionId },
  });

// Get movie release dates and certifications
export const getMovieReleaseDates = (movieId) =>
  api.get(`/movie/${movieId}/release_dates`);

// Get TV show content ratings
export const getTVShowContentRatings = (tvId) =>
  api.get(`/tv/${tvId}/content_ratings`);

// Modified api instance to include language parameter
const apiWithLanguage = (language = 'en-US') =>
  axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: API_KEY,
      language: language,
    },
  });

// Updated movie details with language support
export const getMovieDetailsWithLanguage = (movieId, language = 'en-US') =>
  apiWithLanguage(language).get(`/movie/${movieId}`);

// Updated TV show details with language support
export const getTVShowDetailsWithLanguage = (tvId, language = 'en-US') =>
  apiWithLanguage(language).get(`/tv/${tvId}`, {
    params: { append_to_response: 'external_ids' },
  });

export const getTVShowWatchProviders = (tvId) =>
  api.get(`/tv/${tvId}/watch/providers`);

export const getMovieWatchProviders = (movieId) =>
  api.get(`/movie/${movieId}/watch/providers`);

// Helper function to get age rating for specific region
export const getAgeRatingForRegion = (releaseDates, region = 'US') => {
  if (!releaseDates || !releaseDates.results) return null;

  const regionData = releaseDates.results.find(r => r.iso_3166_1 === region);
  if (!regionData || !regionData.release_dates) return null;

  const releaseWithCertification = regionData.release_dates.find(
    rd => rd.certification && rd.certification.trim() !== ''
  );

  return releaseWithCertification ? releaseWithCertification.certification : null;
};

// Helper function to get TV content rating for specific region
export const getTVContentRatingForRegion = (contentRatings, region = 'US') => {
  if (!contentRatings || !contentRatings.results) return null;

  const regionData = contentRatings.results.find(r => r.iso_3166_1 === region);
  return regionData ? regionData.rating : null;
};

// Age rating mapping for different regions
export const getAgeRatingInfo = (certification, region = 'US') => {
  const ratings = {
    US: {
      'G': { age: 0, color: 'bg-green-600', description: 'General Audiences' },
      'PG': { age: 0, color: 'bg-yellow-600', description: 'Parental Guidance' },
      'PG-13': { age: 13, color: 'bg-orange-600', description: 'Parents Strongly Cautioned' },
      'R': { age: 17, color: 'bg-red-600', description: 'Restricted' },
      'NC-17': { age: 18, color: 'bg-red-800', description: 'Adults Only' },
    },
    DE: {
      'FSK 0': { age: 0, color: 'bg-green-600', description: 'Freigegeben ohne Altersbeschränkung' },
      'FSK 6': { age: 6, color: 'bg-yellow-600', description: 'Freigegeben ab 6 Jahren' },
      'FSK 12': { age: 12, color: 'bg-orange-600', description: 'Freigegeben ab 12 Jahren' },
      'FSK 16': { age: 16, color: 'bg-red-600', description: 'Freigegeben ab 16 Jahren' },
      'FSK 18': { age: 18, color: 'bg-red-800', description: 'Keine Jugendfreigabe' },
    },
    GB: {
      'U': { age: 0, color: 'bg-green-600', description: 'Universal' },
      'PG': { age: 0, color: 'bg-yellow-600', description: 'Parental Guidance' },
      '12': { age: 12, color: 'bg-orange-600', description: 'Suitable for 12+' },
      '12A': { age: 12, color: 'bg-orange-600', description: 'Suitable for 12+ (Cinema)' },
      '15': { age: 15, color: 'bg-red-600', description: 'Suitable for 15+' },
      '18': { age: 18, color: 'bg-red-800', description: 'Suitable for adults only' },
    },
  };

  const regionRatings = ratings[region] || ratings.US;
  const ratingInfo = regionRatings[certification];

  if (!ratingInfo) {
    return {
      age: 0,
      color: 'bg-gray-600',
      description: certification || 'Not Rated',
      displayText: certification || 'NR'
    };
  }

  return {
    ...ratingInfo,
    displayText: certification
  };
};

// Account states for movies and TV shows
export const getMovieAccountStates = (movieId, sessionId) =>
  api.get(`/movie/${movieId}/account_states`, {
    params: { session_id: sessionId }
  });

export const getTVShowAccountStates = (tvId, sessionId) =>
  api.get(`/tv/${tvId}/account_states`, {
    params: { session_id: sessionId }
  });

// Batch function to get account states for multiple items
export const getBatchAccountStates = async (items, sessionId) => {
  const accountStates = {};

  try {
    const promises = items.map(async (item) => {
      try {
        const response = item.type === 'movie' || item.type === 'film'
          ? await getMovieAccountStates(item.id, sessionId)
          : await getTVShowAccountStates(item.id, sessionId);

        return {
          id: item.id,
          type: item.type,
          states: response.data
        };
      } catch (error) {
        console.error(`Failed to get account states for ${item.type} ${item.id}:`, error);
        return {
          id: item.id,
          type: item.type,
          states: { watchlist: false, favorite: false, rated: false }
        };
      }
    });

    const results = await Promise.all(promises);

    results.forEach(result => {
      accountStates[`${result.type}_${result.id}`] = result.states;
    });

    return accountStates;
  } catch (error) {
    console.error('Failed to get batch account states:', error);
    return {};
  }
};

export const getUpcomingMoviesWithVideos = async (page = 1) => {
  try {
    const { data } = await api.get('/movie/upcoming', { params: { page } });
    const moviesWithVideos = await Promise.all(
      data.results.map(async (movie) => {
        try {
          const videosResponse = await getMovieVideos(movie.id);
          const trailer = videosResponse.data.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube'
          );
          return {
            ...movie,
            youtubeId: trailer ? trailer.key : null,
            hasTrailer: !!trailer
          };
        } catch (error) {
          console.error(`Failed to fetch videos for movie ${movie.id}:`, error);
          return {
            ...movie,
            youtubeId: null,
            hasTrailer: false
          };
        }
      })
    );

    const moviesWithTrailers = moviesWithVideos.filter(movie => movie.hasTrailer);

    return {
      ...data,
      results: moviesWithTrailers
    };
  } catch (error) {
    console.error('Failed to fetch upcoming movies with videos:', error);
    throw error;
  }
};

// Error handling wrapper
export const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    return error.response.data.status_message || 'An error occurred';
  } else if (error.request) {
    console.error('Network Error:', error.request);
    return 'Network error. Please check your connection.';
  } else {
    console.error('Error:', error.message);
    return error.message;
  }
};

// Person endpoints
export const getPersonDetails = (personId, language = 'en-US') =>
  api.get(`/person/${personId}`, { params: { language } });

export const getPersonCombinedCredits = (personId, language = 'en-US') =>
  api.get(`/person/${personId}/combined_credits`, { params: { language } });

export const getPopularPeople = (page = 1) =>
  api.get(`/person/popular`, { params: { page } });

export default api;
