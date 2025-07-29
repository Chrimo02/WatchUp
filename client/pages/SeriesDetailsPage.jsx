// SeriesDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import SeasonsList from '../components/SeasonsList';
import PLACEHOLDER from '../assets/placeholder-profile.png';
import { useOmdb } from '../contexts/OmdbContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  posterSizes,
  backdropSizes,
  markAsFavorite,
  addToWatchlist,
  rateTVShow,
  deleteTVShowRating,
  getTVShowDetailsWithLanguage,
  getTVShowContentRatings,
  getTVContentRatingForRegion,
  getAgeRatingInfo,
  getTVShowWatchProviders,
  getTVShowCredits,
  getSimilarTVShows,
  getRecommendedTVShows,
  getShowKeywords,
  getTVShowExternalIds 
} from '../utils/api';
import MovieInfo from '../components/MovieSeriesPage/MovieInfo';
import WatchProviders from '../components/MovieSeriesPage/WatchProviders';
import CastSlider from '../components/MovieSeriesPage/CastSlider';
import MovieSlider from '../components/MovieSlider';
import { Sidebar } from '../components/MovieSeriesPage/Sidebar';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useMediaTransforms } from '../hooks/useMediaTransforms';

const SeriesDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { language, region } = useLanguage();
  const { transformTVShowData } = useMediaTransforms();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();
  const { loading, error, fetchTVShowVideos, getAccountStates } = useMovies();
  const { getSeriesDetails, selectedSeries } = useOmdb();

  const [showData, setShowData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [officialTrailer, setOfficialTrailer] = useState(null);
  const [certification, setCertification] = useState(null);
  const [accountStates, setAccountStates] = useState({
    watchlist: false,
    favorite: false,
    rated: false
  });
  const [watchProviders, setWatchProviders] = useState({
    stream: [], rent: [], buy: []
  });
  const [externalIds, setExternalIds] = useState({});
  const [credits, setCredits] = useState(null);
  const [formattedCast, setFormattedCast] = useState([]);
  const [similarShows, setSimilarShows] = useState([]);
  const [recommendedShows, setRecommendedShows] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const toast = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
  };

  // Pick best trailer
  const pickTrailer = arr => {
    if (!arr?.length) return null;
    const yt = arr.filter(v => v.site === 'YouTube');
    const priority = ['official trailer','final trailer','main trailer','trailer','official teaser','teaser','clip'];
    for (const p of priority) {
      const t = yt.find(v => v.type === 'Trailer' && v.name.toLowerCase().includes(p));
      if (t) return t;
    }
    return yt.find(v => v.type === 'Trailer') || yt[0];
  };

  // Certification
  const fetchCertification = async tvId => {
    try {
      const { data } = await getTVShowContentRatings(tvId);
      setCertification(getTVContentRatingForRegion(data, region));
    } catch {
      setCertification(null);
    }
  };

  // Fetch all data
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        // Details w/ language
        const { data } = await getTVShowDetailsWithLanguage(+id, language);
        setShowData(data);

        await fetchCertification(data.id);

        // OMDB fallback
        if (data.imdb_id) {
          await getSeriesDetails(data.imdb_id);
        }

        // Videos & trailer
        const vids = await fetchTVShowVideos(data.id);
        setVideos(vids.results);
        setOfficialTrailer(pickTrailer(vids.results));

        // Providers
        const { data: prov } = await getTVShowWatchProviders(data.id);
        const country = prov.results[region] || {};
        setWatchProviders({
          stream: country.flatrate || [],
          rent: country.rent || [],
          buy: country.buy || []
        });

        // Credits & Cast
        const creditsResponse = await getTVShowCredits(data.id);
        const cred = creditsResponse.data;
        setCredits(cred);
        setFormattedCast(
          (cred.cast || []).map(m => ({
            id: m.id,
            name: m.name,
            role: m.character,
            img: m.profile_path
              ? `${posterSizes.medium}${m.profile_path}`
              : PLACEHOLDER
          }))
        );

        // Account states
        if (isAuthenticated && sessionId) {
          const states = await getAccountStates(data.id, 'tv', sessionId);
          setAccountStates(states);
        }

        // Similar & Recommended
        const sim = await getSimilarTVShows(data.id);
        setSimilarShows(sim.data.results || []);
        const rec = await getRecommendedTVShows(data.id);
        setRecommendedShows(rec.data.results || []);

        // Keywords
        const kw = await getShowKeywords(data.id);
        setKeywords(kw.data.results || []);

         const ext = await getTVShowExternalIds(data.id);
        setExternalIds(ext.data || {});

      } catch (e) {
        console.error(e);
        setShowData({});
      }
    };

    load();
    window.scrollTo(0, 0);
  }, [id, language, region, isAuthenticated, sessionId]);

  // Toast handlers for favorite/watchlist/rate
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !user || !sessionId) {
      return login()
    }
    try {
      await markAsFavorite(user.id, sessionId, showData.id, 'tv', !accountStates.favorite);
      setAccountStates(s => ({ ...s, favorite: !s.favorite }));
      toast(accountStates.favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast('Failed to update favorites', 'error');
    }
  };
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated || !user || !sessionId) {
      return login()
    }
    try {
      await addToWatchlist(user.id, sessionId, showData.id, 'tv', !accountStates.watchlist);
      setAccountStates(s => ({ ...s, watchlist: !s.watchlist }));
      toast(accountStates.watchlist ? 'Removed from watchlist' : 'Added to watchlist');
    } catch {
      toast('Failed to update watchlist', 'error');
    }
  };
  const handleRate = async v => {
    if (!isAuthenticated || !sessionId) {
      return login()
    }
    try {
      await rateTVShow(showData.id, sessionId, v);
      setAccountStates(s => ({ ...s, rated: { value: v } }));
      toast(`Rated ${v}/10`);
    } catch {
      toast('Failed to rate', 'error');
    }
  };
  const handleClearRating = async () => {
    if (!isAuthenticated || !sessionId) {
      toast('Sign in to clear rating', 'error'); return;
    }
    try {
      await deleteTVShowRating(showData.id, sessionId);
      setAccountStates(s => ({ ...s, rated: false }));
      toast('Rating cleared');
    } catch {
      toast('Failed to clear rating', 'error');
    }
  };

  // Build info for MovieInfo
  const movieInfoData = (() => {
    if (!showData) return null;
    const backdropUrl = showData.backdrop_path
      ? `${backdropSizes.original}${showData.backdrop_path}` : null;
    const posterUrl = showData.poster_path
      ? `${posterSizes.large}${showData.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    return {
      mediaType: 'series',
      title: showData.name,
      year: showData.first_air_date ? new Date(showData.first_air_date).getFullYear() : 'N/A',
      rating: certification || 'NR',
      ageRatingInfo: getAgeRatingInfo(certification, region),
      releaseDate: showData.first_air_date
        ? new Date(showData.first_air_date).toLocaleDateString() : 'N/A',
      genre: showData.genres?.map(g => g.name).join(', ') || 'N/A',
      duration: null,
      userScore: showData.vote_average?.toFixed(1) || '0.0',
      userRatings: showData.vote_count
        ? `${showData.vote_count.toLocaleString()} ratings` : 'No ratings',
      yourRating: accountStates.rated?.value?.toFixed(1) || '0.0',
      imdbScore: selectedSeries?.imdbRating || 'N/A',
      rottenTomatoesScore: selectedSeries?.rottenTomatoesRating || 'N/A',
      metacriticScore: selectedSeries?.metacriticRating || 'N/A',
      tagline: showData.tagline || '',
      overview: showData.overview || '',
      backgroundUrl: backdropUrl,
      posterUrl,
      crew: (showData.created_by || []).map(creator => ({
        name: creator.name,
        role: 'Creator'
      })),
      trailer: officialTrailer
        ? {
            youtubeId: officialTrailer.key,
            name: officialTrailer.name,
            type: officialTrailer.type
          }
        : null,
      isFavorite: accountStates.favorite,
      isInWatchlist: accountStates.watchlist,
      onFavoriteToggle: handleFavoriteToggle,
      onWatchlistToggle: handleWatchlistToggle,
      onRateMovie: handleRate,
      onClearRating: handleClearRating,
      isAuthenticated,
    };
  })();

  if (loading && !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary" />
      </div>
    );
  }
  if (showData === null || (!Object.keys(showData).length && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary" />
      </div>
    );
  }
  if (error || !Object.keys(showData).length) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Series Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {movieInfoData && <MovieInfo movieData={movieInfoData} />}

      <div className="max-w-[1176px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-5">
          <div className="lg:col-span-3 space-y-8">
            <WatchProviders providers={watchProviders} region={region} />
            <CastSlider cast={formattedCast} />
          </div>
          <Sidebar
            externalIds={externalIds}
            homepage={showData.homepage}
            status={showData.status}
            originalLanguage={showData.original_language}
            network={showData.networks}
            type={showData.type}
            keywords={keywords.map(k => k.name)}
          />
          </div>
<SeasonsList tvId={showData.id} seasons={showData.seasons} />

      <section className="mt-5">
        
        <MovieSlider
          title="Similar Series"
          movieItems={transformTVShowData(similarShows)}
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={false}
          showTabSwitcher={false}
          bookmarkLoadingStates={bookmarkLoadingStates}
          defaultTab="movies"
        />
        <MovieSlider
          title="Recommended"
          movieItems={transformTVShowData(recommendedShows)}
          onBookmarkToggle={handleBookmarkToggle}
          showViewAll={false}
          showTabSwitcher={false}
          bookmarkLoadingStates={bookmarkLoadingStates}
          defaultTab="movies"
        />
      </section>
      </div>
    </div>
  );
};

export default SeriesDetailsPage;
