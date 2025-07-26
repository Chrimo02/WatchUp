import React, { useEffect, useState, useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import MovieSlider from '../components/MovieSlider';
import TrailerSlider from '../components/TrailerSlider';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useMediaTransforms } from '../hooks/useMediaTransforms';

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
    upcomingMoviesWithTrailers,
    accountStates,
    fetchTrendingMovies, 
    fetchPopularMovies, 
    fetchTopRatedMovies,
    fetchPopularTVShows,
    fetchTopRatedTVShows,
    fetchAiringTodayTVShows,
    fetchGenres,
    fetchUpcomingMoviesWithTrailers,
    toggleWatchlist,
    getBatchAccountStates,
    isInWatchlist
  } = useMovies();

  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { transformMovieData, transformTVShowData } = useMediaTransforms();

  const [accountStatesLoaded, setAccountStatesLoaded] = useState(false);
  const [isLoadingAccountStates, setIsLoadingAccountStates] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchGenres(),
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchTopRatedMovies(),
          fetchPopularTVShows(),
          fetchTopRatedTVShows(),
          fetchAiringTodayTVShows(),
          fetchUpcomingMoviesWithTrailers()
        ]);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user || !sessionId || accountStatesLoaded || isLoadingAccountStates) {
      return;
    }

    const loadAccountStates = async () => {
      try {
        setIsLoadingAccountStates(true);
        
        const allItems = [
          ...trendingMovies.map(movie => ({ id: movie.id, type: 'movie' })),
          ...popularMovies.map(movie => ({ id: movie.id, type: 'movie' })),
          ...topRatedMovies.map(movie => ({ id: movie.id, type: 'movie' })),
          ...popularTVShows.map(show => ({ id: show.id, type: 'tv' })),
          ...topRatedTVShows.map(show => ({ id: show.id, type: 'tv' })),
          ...airingTodayTVShows.map(show => ({ id: show.id, type: 'tv' })),
        ];

        const uniqueItems = allItems.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id && t.type === item.type)
        );

        if (uniqueItems.length > 0) {
          const batchSize = 20; 
          const batches = [];
          
          for (let i = 0; i < uniqueItems.length; i += batchSize) {
            batches.push(uniqueItems.slice(i, i + batchSize));
          }

          for (let i = 0; i < batches.length; i++) {
            await getBatchAccountStates(batches[i], sessionId);
            
            if (i < batches.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          setAccountStatesLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load account states:', error);
      } finally {
        setIsLoadingAccountStates(false);
      }
    };

    // Only load if we have data to check
    const hasData = trendingMovies.length > 0 || popularMovies.length > 0 || 
                   topRatedMovies.length > 0 || popularTVShows.length > 0 || 
                   topRatedTVShows.length > 0 || airingTodayTVShows.length > 0;

    if (hasData) {
      // Add a small delay to ensure all data is loaded
      const timeoutId = setTimeout(() => {
        loadAccountStates();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isAuthenticated, 
    user, 
    sessionId, 
    trendingMovies, 
    popularMovies, 
    topRatedMovies, 
    popularTVShows, 
    topRatedTVShows, 
    airingTodayTVShows, 
    accountStatesLoaded,
    isLoadingAccountStates
  ]);


  const checkIsInWatchlist = useCallback((itemId, itemType) => {
    if (!isAuthenticated) return false;
    return isInWatchlist(itemId, itemType);
  }, [isAuthenticated, isInWatchlist]);



  const handleViewAll = (section, type) => {
    console.log(`View all ${type} for ${section}`);
    // Here you would navigate to a dedicated page showing all items 
    //TODO
  };

  const handleRetry = () => {

    setAccountStatesLoaded(false);
    setIsLoadingAccountStates(false);
    
    fetchTrendingMovies();
    fetchPopularMovies();
    fetchTopRatedMovies();
    fetchPopularTVShows();
    fetchTopRatedTVShows();
    fetchAiringTodayTVShows();
    fetchUpcomingMoviesWithTrailers();
  };

  if (loading && trendingMovies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#141414" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Loading movies and TV shows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#141414" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-poppins overflow-x-hidden" style={{ backgroundColor: "#141414" }}>
      <div className="max-w-[1176px] mx-auto px-4 py-8">
        
        {/* Trending Movies/Series */}
        <MovieSlider 
          title="Trending" 
          movieItems={transformMovieData(trendingMovies)}
          seriesItems={transformTVShowData(airingTodayTVShows)}
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={true}
          onViewAll={(type) => handleViewAll('trending', type)}
          showTabSwitcher={true}
          defaultTab="movies"
          bookmarkLoadingStates={bookmarkLoadingStates}
        />
        
        {/* Trailer Slider */}
        <TrailerSlider upcomingMovies={upcomingMoviesWithTrailers} />
        
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
          bookmarkLoadingStates={bookmarkLoadingStates}
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
          bookmarkLoadingStates={bookmarkLoadingStates}
        />
      </div>
    </div>
  );
};

export default HomePage;