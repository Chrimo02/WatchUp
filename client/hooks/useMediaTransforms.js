import { useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext';

export function useMediaTransforms() {
  const { isInWatchlist } = useMovies();

  const transformMovieData = useCallback((movies) => {
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/placeholder-poster.jpg',
      score: movie.vote_average?.toFixed(1) || 'N/A',
      bookmarked: isInWatchlist(movie.id, 'movie'),
      type: 'movie'
    }));
  }, [isInWatchlist]);

  const transformTVShowData = useCallback((tvShows) => {
    return tvShows.map(show => ({
      id: show.id,
      title: show.name,
      poster: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : '/placeholder-poster.jpg',
      score: show.vote_average?.toFixed(1) || 'N/A',
      bookmarked: isInWatchlist(show.id, 'tv'),
      type: 'tv'
    }));
  }, [isInWatchlist]);

  return { transformMovieData, transformTVShowData };
}
