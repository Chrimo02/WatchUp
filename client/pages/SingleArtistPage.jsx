// src/pages/SingleArtistPage.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import FilterTabs from '../components/Artists/FilterTabs';
import PersonalInfoCard from '../components/Artists/PersonalInfoCard';
import ArtistShowcase from '../components/Artists/ArtistShowcase';
import MovieSlider from '../components/MovieSlider';
import CreditsListGrid from '../components/Artists/CreditsListGrid';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';

const API_KEY    = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function SingleArtistPage() {
  const { id } = useParams();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useMovies();

  const [person, setPerson]   = useState(null);
  const [credits, setCredits] = useState({ cast: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [filter, setFilter]           = useState('movies');
  const [sortOption, setSortOption]   = useState('date_desc');
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioOverflow, setBioOverflow] = useState(false);
  const bioRef                        = useRef(null);

  // Fetch person + credits
  useEffect(() => {
    async function loadArtist() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}&language=en-US`)
        ]);
        if (!pRes.ok || !cRes.ok) throw new Error();
        setPerson(await pRes.json());
        setCredits(await cRes.json());
      } catch {
        setError('Could not load artist data.');
      } finally {
        setLoading(false);
      }
    }
    loadArtist();
  }, [id]);

  // Detect overflow in biography
  useEffect(() => {
    const el = bioRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
      setBioOverflow(true);
    }
  }, [person, showFullBio]);

  const handleBookmark = async (itemId, itemType) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    await toggleWatchlist(
      user.id,
      sessionId,
      itemId,
      itemType,
      isInWatchlist(itemId, itemType)
    );
  };

  // Prepare "Known For" lists
  const knownForMovies = credits.cast
    .filter(c => c.media_type === 'movie' && c.poster_path)
    .sort((a,b)=>b.popularity-a.popularity).slice(0,10)
    .map(item => ({
      id: item.id,
      title: item.title || item.name,
      poster: `${IMAGE_BASE}/w342${item.poster_path}`,
      score: item.vote_average?.toFixed(1) || '–',
      bookmarked: isInWatchlist(item.id, 'movie'),
      type: 'movie'
    }));
  const knownForTV = credits.cast
    .filter(c => c.media_type === 'tv' && c.poster_path)
    .sort((a,b)=>b.popularity-a.popularity).slice(0,10)
    .map(item => ({
      id: item.id,
      title: item.name,
      poster: `${IMAGE_BASE}/w342${item.poster_path}`,
      score: item.vote_average?.toFixed(1) || '–',
      bookmarked: isInWatchlist(item.id, 'tv'),
      type: 'tv'
    }));

  // Full filmography
  const moviesActors = credits.cast
    .filter(c => c.media_type === 'movie')
    .map(item => ({
      id: item.id,
      title: item.title,
      poster: item.poster_path
        ? `${IMAGE_BASE}/w185${item.poster_path}`
        : '/placeholder-poster.jpg',
      rating: item.vote_average?.toFixed(1) || '–',
      yearsValue: item.release_date?.slice(0,4) || '–',
      characterValue: item.character || '–',
      date: item.release_date?.slice(0,4) || '0',
      score: item.vote_average?.toFixed(1) || '–',
      bookmarked: isInWatchlist(item.id, 'movie'),
      type: 'movie'
    }));
  const tvActors = credits.cast
    .filter(c => c.media_type === 'tv')
    .map(item => ({
      id: item.id,
      title: item.name,
      poster: item.poster_path
        ? `${IMAGE_BASE}/w185${item.poster_path}`
        : '/placeholder-poster.jpg',
      rating: item.vote_average?.toFixed(1) || '–',
      yearsValue: item.first_air_date?.slice(0,4) || '–',
      characterValue: item.character || '–',
      date: item.first_air_date?.slice(0,4) || '0',
      score: item.vote_average?.toFixed(1) || '–',
      bookmarked: isInWatchlist(item.id, 'tv'),
      type: 'tv'
    }));
  const displayActors = filter === 'movies' ? moviesActors : tvActors;

  // Sort for grid
  const sortedActors = useMemo(() => {
    const [field,order] = sortOption.split('_');
    return [...displayActors].sort((a,b)=>{
      let aV,bV;
      if (field==='name') {
        aV = a.title.toLowerCase();
        bV = b.title.toLowerCase();
      } else if (field==='rating') {
        aV = parseFloat(a.rating) || 0;
        bV = parseFloat(b.rating) || 0;
      } else {
        aV = a.date;
        bV = b.date;
      }
      if (aV < bV) return order==='asc' ? -1 : 1;
      if (aV > bV) return order==='asc' ? 1 : -1;
      return 0;
    });
  }, [displayActors, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-16 w-16 border-t-4 border-red-500 rounded-full" />
      </div>
    );
  }
  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>{error || 'Artist not found.'}</p>
      </div>
    );
  }

  const personalInfo = {
    'Known For':      person.known_for_department,
    'Known Credits':  credits.cast.length,
    Gender:           person.gender === 1 ? 'Female' : 'Male',
    Birthday:         person.birthday,
    'Place of Birth': person.place_of_birth
  };

  return (
    <div className="bg-[#141414] text-white w-full">
      {/* Top section */}
      <div className="flex flex-col lg:flex-row gap-8 px-6 py-12">
        <div className="w-full lg:w-1/3 space-y-8">
          <ArtistShowcase
            portraitSrc={
              person.profile_path
                ? `${IMAGE_BASE}/w500${person.profile_path}`
                : '/assets/placeholder-profile.jpg'
            }
          />
          <PersonalInfoCard info={personalInfo} />
        </div>
        <div className="w-full lg:w-2/3 space-y-8">
          <h1 className="text-4xl font-extrabold">{person.name}</h1>
          <div>
            <h2 className="text-xl font-semibold mb-2">Biography</h2>
            <div
              ref={bioRef}
              className={`text-base leading-relaxed overflow-hidden transition-all ${
                showFullBio ? 'max-h-full' : 'max-h-64'
              }`}
            >
              {person.biography}
            </div>
            {bioOverflow && (
              <button
                onClick={() => setShowFullBio(f => !f)}
                className="mt-2 text-blue-400 hover:underline"
              >
                {showFullBio ? 'Weniger anzeigen' : 'Weiterlesen'}
              </button>
            )}
          </div>
          <MovieSlider
            key={filter}
            title="Known For"
            movieItems={knownForMovies}
            seriesItems={knownForTV}
            onBookmarkToggle={handleBookmark}
            showTabSwitcher={true}
            defaultTab="movies"
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-6">
            <FilterTabs selected={filter} onSelect={setFilter} />
            <div className="relative inline-block">
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="appearance-none bg-[#141414] border border-gray-700 text-white py-2 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="date_desc">Date ↓</option>
                <option value="date_asc">Date ↑</option>
                <option value="name_asc">Name A→Z</option>
                <option value="name_desc">Name Z→A</option>
                <option value="rating_desc">Rating ↓</option>
                <option value="rating_asc">Rating ↑</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>
          <CreditsListGrid actors={sortedActors} onBookmarkToggle={handleBookmark} />
        </div>
      </div>
    </div>
  );
}
