// src/pages/ComponentTestPage.jsx
import React, { useEffect } from 'react';
import { useMovies } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import MovieCardMenu from '../components/MovieCardMenu';
import SeasonListComponent from '../components/SeasonListComponent';
import ListComponent from '../components/ListComponent.jsx';
import { AppleTVIcon, NetflixIcon } from '../assets/icons';

function ComponentTestPage() {
  const {
    fetchTrendingMovies,
    trendingMovies,
    fetchPopularTVShows,
    popularTVShows,
    toggleWatchlist,
    isInWatchlist
  } = useMovies();

  useEffect(() => {
    fetchTrendingMovies();      // loads into trendingMovies[]
    fetchPopularTVShows();      // loads into popularTVShows[]
  }, []);

  if (trendingMovies.length === 0 || popularTVShows.length === 0) {
    return <div className="text-center p-8">Loading components…</div>;
  }

  // pick the first movie and show
  const movie = trendingMovies[0];
  const show  = popularTVShows[0];

  // build poster URLs
  const posterBase = 'https://image.tmdb.org/t/p/w500';
  const moviePoster = movie.poster_path ? posterBase + movie.poster_path : '';
  const showPoster  = show.poster_path  ? posterBase + show.poster_path  : '';

  return (
    <div className="space-y-8 p-6">
        {/* MovieCard */}
        <div className="flex flex-wrap gap-6">
        <MovieCard
            mediaType="movie"
            mediaId={578}            // e.g. “Jaws”
            bookmarked={false}
            isLoading={false}
            onBookmarkToggle={() => {}}
            onMenuClick={() => {}}
        />
        <MovieCard
            mediaType="tv"
            mediaId={66732}          // e.g. “Stranger Things”
            bookmarked={true}
            isLoading={false}
            onBookmarkToggle={() => {}}
            onMenuClick={() => {}}
        />
        {/* … */}
        </div>

      {/* SeriesCard */}
      <div className="flex flex-wrap gap-6">
        <SeriesCard
            mediaId={1398}             // e.g. “Game of Thrones”
            bookmarked={false}
            isLoading={false}
            onBookmarkToggle={(id) => {/*…*/}}
            onMenuClick={(id) => {/*…*/}}
        />
        <SeriesCard
            mediaId={1396}             // e.g. “Game of Thrones”
            bookmarked={false}
            isLoading={false}
            onBookmarkToggle={(id) => {/*…*/}}
            onMenuClick={(id) => {/*…*/}}
        />
        {/* … */}
        </div>

      {/* MovieCardMenu */}
      <div className="bg-white p-4">
        <MovieCardMenu
            onRate={() => alert('Rate clicked!')}
            onAddToList={() => alert('Add to list!')}
            onFavorite={() => alert('Favorite!')}
        />
      </div>

    <ListComponent
      mediaType="movie"
      mediaId={275}  // The Shawshank Redemption
      streamingPlatforms={[
        { icon: <AppleTVIcon />, name: 'Apple TV' },
        { icon: <NetflixIcon />, name: 'Netflix' },
      ]}
      onRate={() => {}}
      onAddToList={() => {}}
      onFavorite={() => {}}
      bookmarked={false}
      isLoading={false}
      onBookmarkToggle={() => {}}
    />
      

      {/* SeasonListComponent */}
        <SeasonListComponent
       id={/* episode id */ 1}
       name={/* episode title */ "Pilot Test"}
       air_date={/* air date */ "2025-07-01"}
       runtime={/* runtime in minutes */ 42}
       vote_average={/* rating 0–10 */ 8.7}
       overview={/* brief synopsis */ "This is a test overview of the episode."}
       still_path={/* e.g. from show.poster_path */ show.poster_path}
       onRate={id => console.log("Rated episode", id)}
     />

    </div>
  );
}

export default ComponentTestPage;
