import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getTVShowDetails, getSeasonDetails } from '../utils/api';
import SeasonListComponent from '../components/SeasonListComponent';

export default function SeasonPage() {
  const { tvId, seasonNumber } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(null);

  useEffect(() => {
    // fetch show backdrop & name
    getTVShowDetails(tvId).then(res => setShow(res.data));
    // fetch this season’s info & episodes
    getSeasonDetails(tvId, seasonNumber).then(res => setSeason(res.data));
  }, [tvId, seasonNumber]);

  if (!show || !season) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading season…
      </div>
    );
  }

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
              onRate={(episodeId) => {
                /* your rate handler */
                console.log('Rate ep', episodeId);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
