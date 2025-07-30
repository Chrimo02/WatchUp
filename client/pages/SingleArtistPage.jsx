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
import { SortSelect } from '../components/ui/SortSelect';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useLanguage } from '../contexts/LanguageContext'; 
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function SingleArtistPage() {
  const { id } = useParams();
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const { language } = useLanguage();   
  const {
    toggleWatchlist,
    isInWatchlist,
    getBatchAccountStates
  } = useMovies();
  const {
    loading,
    error,
    person,
    credits,
    fetchPersonAndCredits,
    clearPerson
  } = usePerson();

  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle();

  const [filter, setFilter] = useState('movies');
  const [sortOption, setSortOption] = useState('date_desc');
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioOverflow, setBioOverflow] = useState(false);
  const bioRef = useRef(null);

  // Person & Credits laden
    useEffect(() => {
    fetchPersonAndCredits(id, language);                           
    return () => clearPerson();
  }, [id, language, fetchPersonAndCredits, clearPerson]);  

  // beim Erhalt der Credits: batch-load der AccountStates
  useEffect(() => {
    if (
      !isAuthenticated ||
      !sessionId ||
      !credits?.cast?.length
    ) return;

    const items = credits.cast.map(c => ({
      id: c.id,
      type: c.media_type
    }));
    getBatchAccountStates(items, sessionId);
  }, [credits, isAuthenticated, sessionId, getBatchAccountStates]);

  // Bio Overflow prüfen
  useEffect(() => {
    const el = bioRef.current;
    if (!el) {
      setBioOverflow(false);
      return;
    }
    const prevMax = el.style.maxHeight;
    el.style.maxHeight = '16rem';
    setBioOverflow(el.scrollHeight > el.clientHeight + 1);
    el.style.maxHeight = prevMax;
  }, [person]);

  const handleBookmark = async (mid, type) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    await toggleWatchlist(
      user.id,
      sessionId,
      mid,
      type,
      isInWatchlist(mid, type)
    );
  };

  // Known For
  const knownForMovies = useMemo(() => {
    const seen = new Set();
    return (credits?.cast || [])
      .filter(c => c.media_type === 'movie' && c.poster_path)
      .filter(item => {
        const key = `m-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster: `${IMAGE_BASE}/w342${item.poster_path}`,
        score: item.vote_average.toFixed(1),
        bookmarked: isInWatchlist(item.id, 'movie'),
        type: 'movie'
      }));
  }, [credits, isInWatchlist]);

  const knownForTV = useMemo(() => {
    const seen = new Set();
    return (credits?.cast || [])
      .filter(c => c.media_type === 'tv' && c.poster_path)
      .filter(item => {
        const key = `t-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.name,
        poster: `${IMAGE_BASE}/w342${item.poster_path}`,
        score: item.vote_average.toFixed(1),
        bookmarked: isInWatchlist(item.id, 'tv'),
        type: 'tv'
      }));
  }, [credits, isInWatchlist]);

  // Vollständige Credits deduplizieren
  const dedupe = arr => {
    const seen = new Set();
    return arr.filter(x => {
      const k = `${x.type}-${x.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // Film- und Serien-Credits
  const moviesActors = useMemo(
    () =>
      dedupe(
        (credits?.cast || [])
          .filter(c => c.media_type === 'movie')
          .map(item => ({
            id: item.id,
            type: 'movie',
            title: item.title,
            poster: item.poster_path
              ? `${IMAGE_BASE}/w185${item.poster_path}`
              : '/placeholder-poster.jpg',
            rating: item.vote_average.toFixed(1),
            yearsValue: item.release_date?.slice(0, 4) || '–',
            characterValue: item.character || '–',
            date: item.release_date?.slice(0, 4) || '0',
            popularity: item.popularity,
            bookmarked: isInWatchlist(item.id, 'movie')
          }))
      ),
    [credits, isInWatchlist]
  );

  const tvActors = useMemo(
    () =>
      dedupe(
        (credits?.cast || [])
          .filter(c => c.media_type === 'tv')
          .map(item => ({
            id: item.id,
            type: 'tv',
            title: item.name,
            poster: item.poster_path
              ? `${IMAGE_BASE}/w185${item.poster_path}`
              : '/placeholder-poster.jpg',
            rating: item.vote_average.toFixed(1),
            yearsValue: item.first_air_date?.slice(0, 4) || '–',
            characterValue: item.character || '–',
            date: item.first_air_date?.slice(0, 4) || '0',
            popularity: item.popularity,
            bookmarked: isInWatchlist(item.id, 'tv')
          }))
      ),
    [credits, isInWatchlist]
  );

  const displayActors = filter === 'movies' ? moviesActors : tvActors;

  const sortedActors = useMemo(() => {
    const [field, order] = sortOption.split('_');
    return [...displayActors].sort((a, b) => {
      let av = a[field],
        bv = b[field];
      if (field === 'name') {
        av = a.title.toLowerCase();
        bv = b.title.toLowerCase();
      }
      if (field === 'rating' || field === 'popularity') {
        av = parseFloat(av) || 0;
        bv = parseFloat(bv) || 0;
      }
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [displayActors, sortOption]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-16 w-16 border-t-4 border-red-500 rounded-full" />
      </div>
    );
  if (error || !person)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>{error || 'Artist not found.'}</p>
      </div>
    );

  const personalInfo = {
    'Known For': person.known_for_department,
    'Known Credits': credits?.cast?.length || 0,
    Gender: person.gender === 1 ? 'Female' : 'Male',
    Birthday: person.birthday,
    'Place of Birth': person.place_of_birth
  };

  return (
    <div className="bg-[#141414] text-white w-full">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 order-2 lg:order-1">
          <ArtistShowcase
            portraitSrc={
              person.profile_path
                ? `${IMAGE_BASE}/w500${person.profile_path}`
                : profilePlaceholder
            }
          />
          <PersonalInfoCard info={personalInfo} />
        </div>

        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            {person.name}
          </h1>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Biography
            </h2>
            <div
              ref={bioRef}
              className={`text-sm md:text-base lg:text-lg leading-relaxed overflow-hidden transition-all ${
                showFullBio ? 'max-h-full' : 'max-h-64'
              }`}
              style={showFullBio ? { maxHeight: 'none' } : { maxHeight: '16rem' }}
            >
              {person.biography || 'Sorry, no bio available.'}
            </div>
            {(bioOverflow || showFullBio) && (
              <button
                onClick={() => setShowFullBio((v) => !v)}
                className="mt-2 text-blue-400 hover:underline"
              >
                {showFullBio ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          <MovieSlider
            title="Known For"
            movieItems={knownForMovies}
            seriesItems={knownForTV}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkLoadingStates={bookmarkLoadingStates}
            showTabSwitcher
            defaultTab="movies"
          />
        </div>
      </div>

      {/* Filmografie */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <FilterTabs selected={filter} onSelect={setFilter} />
            <div className="relative inline-block">
              <SortSelect
                value={sortOption}
                onChange={(val) => {
                  setSortOption(val);
                }}
              />
            </div>
          </div>
          <CreditsListGrid actors={sortedActors} onBookmarkToggle={handleBookmark} />
        </div>
      </div>
    </div>
  );
}