import React from 'react';
import { Link } from 'react-router-dom';
import profilePlaceholder from '../assets/placeholder-profile.png';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function PersonGridItem({ person }) {
  return (
    <Link to={`/person/${person.id}`} className="block">
      <div className="text-center hover:scale-105 transition">
        <img
          className="w-full aspect-[2/3] object-cover rounded-lg"
          src={
            person.profile_path
              ? `${IMAGE_BASE}/w342${person.profile_path}`
              : profilePlaceholder
          }
          alt={person.name}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profilePlaceholder;
          }}
        />
        <div className="mt-2 text-white font-medium">{person.name}</div>
      </div>
    </Link>
  );
}
