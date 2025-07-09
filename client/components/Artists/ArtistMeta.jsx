// client/components/ui/ArtistMeta.jsx
import React from 'react';
import KnownForCarousel from './KnownForCarousel';

export default function ArtistMeta({ name, bio, knownFor }) {
  return (
    <section className="px-6 pt-16 text-white max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold">{name}</h1>
      <p className="mt-4 text-lg leading-relaxed">{bio}</p>
      <KnownForCarousel items={knownFor} />
    </section>
  );
}