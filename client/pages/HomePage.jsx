import React, { useEffect, useState } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import MovieSlider from '../components/MovieSlider';

const HomePage = () => {
  const { 
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
    fetchGenres,
    fetchWatchlistMovies,
    fetchWatchlistTVShows,
    toggleWatchlist,
    isInWatchlist
  } = useMovies();

  const { isAuthenticated, user, sessionId, login } = useAuth();
  
  // Local state to track bookmark operations and force re-renders
  const [bookmarkLoadingStates, setBookmarkLoadingStates] = useState(new Set());
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Fetch data when component mounts
    fetchGenres();
    fetchTrendingMovies();
    fetchPopularMovies();
    fetchTopRatedMovies();
    fetchPopularTVShows();
    fetchTopRatedTVShows();
    fetchAiringTodayTVShows();
  }, []);

  useEffect(() => {
    // Fetch watchlist when user is authenticated
    if (isAuthenticated && user && sessionId) {
      fetchWatchlistMovies(user.id, sessionId);
      fetchWatchlistTVShows(user.id, sessionId);
    }
  }, [isAuthenticated, user, sessionId]);

  // Helper function to check if item is in watchlist
  const checkIsInWatchlist = (itemId, itemType) => {
    if (!isAuthenticated) return false;
    
    if (itemType === 'movie') {
      return watchlistMovies.some(movie => movie.id === itemId);
    } else if (itemType === 'series' || itemType === 'tv') {
      return watchlistTVShows.some(show => show.id === itemId);
    }
    return false;
  };

  // Transform movie data to match the expected format for MovieSlider
  const transformMovieData = (movies) => {
    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg',
      score: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
      bookmarked: checkIsInWatchlist(movie.id, 'movie'),
      type: 'movie'
    }));
  };

  // Transform TV show data to match the expected format for MovieSlider
  const transformTVShowData = (tvShows) => {
    return tvShows.map(show => ({
      id: show.id,
      title: show.name, // TV shows use 'name' instead of 'title'
      poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : '/placeholder-poster.jpg',
      score: show.vote_average ? show.vote_average.toFixed(1) : 'N/A',
      bookmarked: checkIsInWatchlist(show.id, 'tv'),
      type: 'series'
    }));
  };

  const handleBookmarkToggle = async (itemId, itemType) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      login();
      return;
    }

    if (!user || !sessionId) {
      console.error('User or session ID not available');
      return;
    }

    // Add to loading states
    setBookmarkLoadingStates(prev => new Set(prev).add(itemId));

    try {
      // Check current state
      const currentlyBookmarked = checkIsInWatchlist(itemId, itemType);
      
      // Convert series type to tv for API
      const apiMediaType = itemType === 'series' ? 'tv' : itemType;
      
      // Toggle bookmark using context function
      await toggleWatchlist(user.id, sessionId, itemId, apiMediaType, currentlyBookmarked);
      
      // Force a re-render to update the UI
      setForceUpdate(prev => prev + 1);
      
      console.log(`${currentlyBookmarked ? 'Removed' : 'Added'} ${itemType} ${itemId} ${currentlyBookmarked ? 'from' : 'to'} watchlist`);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // You might want to show a toast notification here
      alert('Failed to update watchlist. Please try again.');
    } finally {
      // Remove from loading states
      setBookmarkLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleViewAll = (section, type) => {
    console.log(`View all ${type} for ${section}`);
    // Here you would navigate to a dedicated page showing all items
  };

  if (loading && trendingMovies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#141414" }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#141414" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-white">{error}</p>
          <button 
            onClick={() => {
              fetchTrendingMovies();
              fetchPopularMovies();
              fetchTopRatedMovies();
              fetchPopularTVShows();
              fetchTopRatedTVShows();
              fetchAiringTodayTVShows();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-poppins" style={{ backgroundColor: "#141414" }}>
      <div className="max-w-[1176px] mx-auto px-4 py-8">
        {/* Trending Movies/Series */}
        <MovieSlider 
          title="Trending" 
          movieItems={transformMovieData(trendingMovies)}
          seriesItems={transformTVShowData(airingTodayTVShows)} // Use airing today for trending series
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={true}
          onViewAll={(type) => handleViewAll('trending', type)}
          showTabSwitcher={true}
          defaultTab="movies"
          key={`trending-${forceUpdate}`} // Force re-render when bookmarks change
        />
        
        {/* Popular Movies/Series */}
        <MovieSlider 
          title="Popular" 
          movieItems={transformMovieData(popularMovies)}
          seriesItems={transformTVShowData(popularTVShows)}
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={true}
          onViewAll={(type) => handleViewAll('popular', type)}
          showTabSwitcher={true}
          defaultTab="movies"
          key={`popular-${forceUpdate}`} // Force re-render when bookmarks change
        />
        
        {/* Top Rated Movies/Series */}
        <MovieSlider 
          title="Top Rated" 
          movieItems={transformMovieData(topRatedMovies)}
          seriesItems={transformTVShowData(topRatedTVShows)}
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={true}
          onViewAll={(type) => handleViewAll('top-rated', type)}
          showTabSwitcher={true}
          defaultTab="movies"
          key={`top-rated-${forceUpdate}`} // Force re-render when bookmarks change
        />
      </div>
    </div>
  );
};

export default HomePage;