import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  getTVShowDetailsWithLanguage,
  getSeasonDetailsWithLanguage,
} from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import SeasonListComponent from '../components/SeasonListComponent';
import RatingModal from '../components/MovieSeriesPage/RatingModal';
import { useAuth } from '../contexts/AuthContext';  // adjust path if needed

export default function SeasonPage() {
  const { tvId, seasonNumber } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage(); 
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(null);

  const [ratingEpisodeId, setRatingEpisodeId] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  const [userRatings, setUserRatings] = useState(() => {
    return JSON.parse(localStorage.getItem('userRatings')|| '{}')
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getTVShowDetailsWithLanguage(tvId, language)
      .then(res => setShow(res.data));

    getSeasonDetailsWithLanguage(tvId, seasonNumber, language)
      .then(res => setSeason(res.data));
  }, [tvId, seasonNumber, language]);

  if (!show || !season) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading season…
      </div>
    );
  }

  const openRatingModal = (episodeId) => {
    setRatingEpisodeId(episodeId);
    setCurrentRating(userRatings[episodeId] || 0);
    setTempRating(userRatings[episodeId] || 0);
  };

  const closeRatingModal = () => {
    setRatingEpisodeId(null);
  };

  const submitRating = (newRating) => {
    setUserRatings(prev => {
      const next = { ...prev, [ratingEpisodeId]: newRating };
      localStorage.setItem('userRatings', JSON.stringify(next));
      return next;
    });
    closeRatingModal();
  };
  
  const clearRating = () => {
    setUserRatings(prev => {
      const next = { ...prev };
      delete next[ratingEpisodeId];
      localStorage.setItem('userRatings', JSON.stringify(next));
      return next;
    });
    closeRatingModal();
  };  

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : '/placeholder-backdrop.jpg';

  return (
    <div className="min-h-screen bg-black font-poppins">
      {/* Hero */}
      <div
        className="relative w-full h-[400px] lg:h-[500px] overflow-hidden"
        style={{ backgroundImage: `url(${backdropUrl})`, backgroundSize: 'cover' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-3 px-4 py-3 border border-gray-700 rounded-lg bg-black/50 text-white hover:bg-black/70 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Back to Series</span>
        </button>

        {/* Next Season Button */}
        {Number(seasonNumber) < show.number_of_seasons && (
          <button
            onClick={() => navigate(`/series/${tvId}/season/${Number(seasonNumber) + 1}`)}
            className="absolute top-4 right-4 px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-white/10 transition flex items-center gap-2"
          >
            <span className="text-lg font-medium">Next Season</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        )}

        {/* Previous Season Button */}
        {Number(seasonNumber) > 1 && (
          <button
            onClick={() => navigate(`/series/${tvId}/season/${Number(seasonNumber) - 1}`)}
            className="absolute top-4 right-52 px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-white/10 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium">Previous Season</span>
          </button>
        )}

        {/* Season poster & title */}
        <div className="absolute bottom-6 left-4 flex items-end gap-4">
          {season.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
              alt={season.name}
              className="w-24 lg:w-32 rounded shadow-2xl"
            />
          )}
          <div className="text-white">
            <h1 className="text-3xl lg:text-5xl font-semibold inline">
              {season.name}
            </h1>
            <span className="text-gray-400 text-xl lg:text-2xl ml-2">
              ({new Date(season.air_date).getFullYear()})
            </span>
          </div>
        </div>
      </div>

      {/* Episode list */}
      <div className="p-6 space-y-6">
        <h2 className="text-2xl text-white font-semibold">
          Episodes ({season.episodes.length})
        </h2>
        <div className="flex flex-col gap-4">
          {season.episodes.map(ep => (
            <SeasonListComponent
              key={ep.id}
              id={ep.id}
              name={`${ep.episode_number}. ${ep.name}`}
              air_date={ep.air_date}
              runtime={ep.runtime || ep.runtime || 0}
              vote_average={ep.vote_average}
              overview={ep.overview}
              still_path={ep.still_path}
              yourRating={userRatings[ep.id] || 0}
              isAuthenticated={isAuthenticated}      // pull from your AuthContext
              onRate={() => openRatingModal(ep.id)}
            />
          ))}
        </div>
      </div>
       {/*Render the modal*/}
       <RatingModal
        isOpen={ratingEpisodeId !== null}
        onClose={closeRatingModal}
        onSubmit={submitRating}
        tempRating={tempRating}
        setTempRating={setTempRating}
        title={
          season.episodes.find(e => e.id === ratingEpisodeId)?.name
          || ''
        }
        currentRating={currentRating}
        onClearRating={currentRating > 0 ? clearRating : undefined}
      />
    </div>
  );
}
