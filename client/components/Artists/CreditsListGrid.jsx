import React from 'react';
import CreditsListItem from './CreditsListItem';

export default function CreditsListGrid({ actors = [], onBookmarkToggle }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-">
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {actors.map(actor => (
          <CreditsListItem
            key={actor.id}
            {...actor}
            onBookmarkToggle={onBookmarkToggle}
          />
        ))}
      </div>
    </div>
  );
}
