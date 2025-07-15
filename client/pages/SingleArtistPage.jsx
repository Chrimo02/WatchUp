import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import FilterTabs from '../components/Artists/FilterTabs';
import PersonalInfoCard from '../components/Artists/PersonalInfoCard';
import ArtistShowcase from '../components/Artists/ArtistShowcase';
import MovieSlider from '../components/MovieSlider';
import CreditsListGrid from '../components/Artists/CreditsListGrid';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import { usePerson } from '../contexts/PersonContext';
import profilePlaceholder from '../assets/placeholder-profile.png';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function SingleArtistPage() {
  const { id } = useParams();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { toggleWatchlist, isInWatchlist } = useMovies();
  const {
    loading,
    error,
    person,
    credits,
    fetchPersonAndCredits,
    clearPerson,
  } = usePerson();

  const [filter, setFilter] = useState('movies');
  const [sortOption, setSortOption] = useState('date_desc');
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioOverflow, setBioOverflow] = useState(false);
  const bioRef = useRef(null);

  useEffect(() => {
    fetchPersonAndCredits(id);
    return () => clearPerson();
  }, [id, fetchPersonAndCredits, clearPerson]);

  // **WICHTIG: Overflow immer an gekürzter Ansicht messen**
  useEffect(() => {
    const checkOverflow = () => {
      const el = bioRef.current;
      if (!el) return setBioOverflow(false);
      // Temporär max-h-64 für Overflow-Check, egal ob aufgeklappt!
      const prevMaxHeight = el.style.maxHeight;
      el.style.maxHeight = '16rem'; // 64*0.25rem = 16rem (max-h-64)
      const overflowed = el.scrollHeight > el.clientHeight + 1;
      el.style.maxHeight = prevMaxHeight;
      setBioOverflow(overflowed);
    };
    checkOverflow();
  }, [person]);

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

  // "Known For" Listen, deduped by id + type
  const knownForSet = new Set();
  const knownForMovies = useMemo(() =>
    (credits?.cast || [])
      .filter(c => c.media_type === 'movie' && c.poster_path)
      .filter(item => {
        const key = `movie-${item.id}`;
        if (knownForSet.has(key)) return false;
        knownForSet.add(key);
        return true;
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster: `${IMAGE_BASE}/w342${item.poster_path}`,
        score: item.vote_average?.toFixed(1) || '–',
        bookmarked: isInWatchlist(item.id, 'movie'),
        type: 'movie',
      }))
    , [credits, isInWatchlist]
  );

  const knownForTV = useMemo(() => {
    const set = new Set();
    return (credits?.cast || [])
      .filter(c => c.media_type === 'tv' && c.poster_path)
      .filter(item => {
        const key = `tv-${item.id}`;
        if (set.has(key)) return false;
        set.add(key);
        return true;
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.name,
        poster: `${IMAGE_BASE}/w342${item.poster_path}`,
        score: item.vote_average?.toFixed(1) || '–',
        bookmarked: isInWatchlist(item.id, 'tv'),
        type: 'tv',
      }));
  }, [credits, isInWatchlist]);

  // Vollständige Filmographie, deduped by id + type
  const dedupeActors = arr => {
    const set = new Set();
    return arr.filter(item => {
      const key = `${item.type}-${item.id}`;
      if (set.has(key)) return false;
      set.add(key);
      return true;
    });
  };
  const moviesActors = useMemo(() =>
    dedupeActors(
      (credits?.cast || [])
        .filter(c => c.media_type === 'movie')
        .map(item => ({
          id: item.id,
          title: item.title,
          poster: item.poster_path
            ? `${IMAGE_BASE}/w185${item.poster_path}`
            : '/placeholder-poster.jpg',
          rating: item.vote_average?.toFixed(1) || '–',
          yearsValue: item.release_date?.slice(0, 4) || '–',
          characterValue: item.character || '–',
          date: item.release_date?.slice(0, 4) || '0',
          score: item.vote_average?.toFixed(1) || '–',
          bookmarked: isInWatchlist(item.id, 'movie'),
          type: 'movie',
        }))
    )
    , [credits, isInWatchlist]
  );

  const tvActors = useMemo(() =>
    dedupeActors(
      (credits?.cast || [])
        .filter(c => c.media_type === 'tv')
        .map(item => ({
          id: item.id,
          title: item.name,
          poster: item.poster_path
            ? `${IMAGE_BASE}/w185${item.poster_path}`
            : '/placeholder-poster.jpg',
          rating: item.vote_average?.toFixed(1) || '–',
          yearsValue: item.first_air_date?.slice(0, 4) || '–',
          characterValue: item.character || '–',
          date: item.first_air_date?.slice(0, 4) || '0',
          score: item.vote_average?.toFixed(1) || '–',
          bookmarked: isInWatchlist(item.id, 'tv'),
          type: 'tv',
        }))
    )
    , [credits, isInWatchlist]
  );

  const displayActors = filter === 'movies' ? moviesActors : tvActors;

  const sortedActors = useMemo(() => {
    const [field, order] = sortOption.split('_');
    return [...displayActors].sort((a, b) => {
      let aV, bV;
      if (field === 'name') {
        aV = a.title?.toLowerCase() || '';
        bV = b.title?.toLowerCase() || '';
      } else if (field === 'rating') {
        aV = parseFloat(a.rating) || 0;
        bV = parseFloat(b.rating) || 0;
      } else {
        aV = a.date;
        bV = b.date;
      }
      if (aV < bV) return order === 'asc' ? -1 : 1;
      if (aV > bV) return order === 'asc' ? 1 : -1;
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
    'Known For': person.known_for_department,
    'Known Credits': credits?.cast?.length || 0,
    Gender: person.gender === 1 ? 'Female' : 'Male',
    Birthday: person.birthday,
    'Place of Birth': person.place_of_birth,
  };

  return (
    <div className="bg-[#141414] text-white w-full">
      <div className="flex flex-col lg:flex-row gap-8 px-6 py-12">
        <div className="w-full lg:w-1/3 space-y-8">
          <ArtistShowcase
            portraitSrc={
              person.profile_path
                ? `${IMAGE_BASE}/w500${person.profile_path}`
                : profilePlaceholder
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
              style={showFullBio ? { maxHeight: 'none' } : { maxHeight: '16rem' }} // Fallback für alle Browser
            >
              {person.biography ? person.biography : "Sorry, no bio available for this person."}
            </div>
            {/* BUTTON: Immer wenn Overflow ODER ausgeklappt */}
            {(bioOverflow || showFullBio) && (
              <button
                onClick={() => setShowFullBio(v => !v)}
                className="mt-2 text-blue-400 hover:underline block"
              >
                {showFullBio ? 'Show less' : 'Read more'}
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