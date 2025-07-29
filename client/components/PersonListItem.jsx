import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import profilePlaceholder from '../assets/placeholder-profile.png';
import { usePerson } from '../contexts/PersonContext';
import { useLanguage } from '../contexts/LanguageContext';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function PersonListItem({ person }) {
  const [bio, setBio] = useState('');
  const { fetchPersonBio } = usePerson();
  const { language } = useLanguage();

  useEffect(() => {
    let mounted = true;
    async function loadBio() {
      const b = await fetchPersonBio(person.id, language);
      if (mounted) setBio(b?.trim() ? b : 'Sorry, no bio available for this person.');
    }
    loadBio();
    return () => { mounted = false };
  }, [person.id, language, fetchPersonBio]);

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