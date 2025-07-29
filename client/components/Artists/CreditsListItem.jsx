// src/components/Artists/CreditsListItem.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBookmarkToggle } from '../../hooks/useBookmarkToggle';
import { useMovies } from '../../contexts/MovieContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMovieDetailsWithLanguage,
  getTVShowDetailsWithLanguage,
  getMovieReleaseDates,
  getAgeRatingForRegion,
  getMovieWatchProviders,
  getTVShowWatchProviders,
} from '../../utils/api';
import { Star as StarOutline, Plus, Heart } from 'lucide-react';
import AddToBookmark from '../../assets/AddToBookmark.svg';
import Bookmarked from '../../assets/Bookmarked.svg';
import NoImageFound from '../../assets/no-image-found.png';

export default function CreditsListItem({
  id,
  type,
  yearsValue,
  characterValue,
  onBookmarkToggle,
}) {
  const { language, region } = useLanguage();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { isInWatchlist } = useMovies();
  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();

  const [details, setDetails] = useState(null);
  const [ageCert, setAgeCert] = useState(null);
  const [providers, setProviders] = useState({ stream: [], rent: [], buy: [] });

  // load media details
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = type === 'movie'
          ? await getMovieDetailsWithLanguage(id, language)
          : await getTVShowDetailsWithLanguage(id, language);
        if (!cancelled) setDetails(res.data);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [id, type, language]);

  // load age certification
  useEffect(() => {
    if (!details) return;
    const fallback = details.adult ? '18+' : 'NR';
    setAgeCert(fallback);
    if (type === 'movie') {
      (async () => {
        try {
          const { data } = await getMovieReleaseDates(id);
          const cert = getAgeRatingForRegion(data, region) || fallback;
          setAgeCert(cert);
        } catch {}
      })();
    }
  }, [details, id, type, region]);

  // load watch providers
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = type === 'movie'
          ? await getMovieWatchProviders(id)
          : await getTVShowWatchProviders(id);
        const c = data.results[region] || {};
        if (!cancelled) {
          setProviders({
            stream: c.flatrate || [],
            rent:   c.rent     || [],
            buy:    c.buy      || []
          });
        }
      } catch {
        if (!cancelled) setProviders({ stream: [], rent: [], buy: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [id, type, region]);

  if (!details) {
    return <div className="text-white p-4">Loading…</div>;
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const runtime = type === 'movie'
    ? details.runtime
    : (details.episode_run_time?.[0] || 0);
  const hours = Math.floor(runtime/60), minutes = runtime%60;
  const runtimeStr = `${hours}h ${minutes}m`;
  const certFixed = (ageCert||'').replace('-', '-');

  const streamingIcons = [
    ...providers.stream,
    ...providers.rent,
    ...providers.buy,
  ].map(p => p.logo_path && (
    <img
      key={p.provider_id}
      src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
      alt={p.provider_name}
      className="w-6 h-6 object-contain"
    />
  ));

  const loadingBookmark = bookmarkLoadingStates.has(id);
  const isBook = isInWatchlist(id, type);

  const handleClick = e => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) return login();
    handleBookmarkToggle(id, type);
  };

  return (
    <div className="relative bg-[#141414] border border-gray-700 rounded-2xl p-4 flex gap-6">
      {/* Poster */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden w-[100px]">
        <Link to={`/${type}/${id}`}>
          <img
            src={details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : NoImageFound}
            alt={title}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-2 text-white">
        <h2 className="text-2xl font-bold">
          <Link to={`/${type}/${id}`}>{title}</Link>
        </h2>
        <div className="flex items-center space-x-1 text-gray-400 text-sm">
          {year && <span>{year}</span>}<span>•</span>
          <span>{certFixed}</span><span>•</span>
          <span>{runtimeStr}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <StarOutline className="w-5 h-5 text-yellow-400" fill="currentColor" stroke="none" />
            <span className="text-yellow-400 font-semibold">{details.vote_average.toFixed(1)}</span>
          </div>
          <button onClick={() => {/* rate if wanted */}} className="flex items-center gap-1 text-red-500 hover:text-red-300">
            <StarOutline className="w-5 h-5" /><span>Rate</span>
          </button>
          <button onClick={() => {/* favorite */}} className="flex items-center gap-1 text-red-500 hover:text-red-300">
            <Heart className="w-5 h-5" /><span>Favourite</span>
          </button>
          <button onClick={() => {/* add to list */}} className="flex items-center gap-1 text-red-500 hover:text-red-300">
            <Plus className="w-5 h-5" /><span>Add to list</span>
          </button>
        </div>

        {streamingIcons.length>0 && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm overflow-hidden">
            <span>Stream on:</span>
            {streamingIcons}
          </div>
        )}

        {/* Custom fields */}
        <div className="flex space-x-12 pt-2">
          <div>
            <div className="text-gray-400 text-sm">Years Featured</div>
            <div className="text-white font-semibold">{yearsValue}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Character</div>
            <div className="text-white font-semibold">{characterValue}</div>
          </div>
        </div>
      </div>

      {/* Bookmark Button */}
      <button
        onClick={handleClick}
        className={`absolute left-[28px] top-[15.5px] w-[28px] h-[37px] z-10 ${
          loadingBookmark ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
        } transform transition`}
      >
        {loadingBookmark
          ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto my-auto" />
          : <img src={isBook ? Bookmarked : AddToBookmark} alt="Bookmark" className="w-full h-full" />
        }
      </button>
    </div>
  );
}
