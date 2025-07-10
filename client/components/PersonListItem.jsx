import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import profilePlaceholder from '../assets/placeholder-profile.png';

const API_KEY    = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function PersonListItem({ person }) {
  const [bio, setBio] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadBio() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/person/${person.id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        if (mounted) setBio(data.biography || 'Sorry, no bio available for this person.');
      } catch {
        if (mounted) setBio('Sorry, no bio available for this person.');
      }
    }
    loadBio();
    return () => { mounted = false };
  }, [person.id]);

  return (
    <Link to={`/person/${person.id}`} className="block">
      <div className="flex gap-6 p-6 border border-gray-700 rounded-lg hover:bg-gray-800 transition">
        <img
          className="w-32 h-40 object-cover rounded-lg flex-shrink-0"
          src={
            person.profile_path
              ? `${IMAGE_BASE}/w185${person.profile_path}`
              : profilePlaceholder
          }
          alt={person.name}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profilePlaceholder;
          }}
        />
        <div>
          <h2 className="text-2xl font-semibold">{person.name}</h2>
          <p className="mt-2 text-gray-300">
            {bio.length > 300 ? bio.slice(0, 300) + '…' : bio}
          </p>
        </div>
      </div>
    </Link>
  );
}
