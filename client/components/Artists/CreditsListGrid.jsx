// src/components/Artists/CreditsListGrid.jsx
import React from 'react';
import CreditsListItem from './CreditsListItem';

export default function CreditsListGrid({ actors, onBookmarkToggle }) {
  return (
    <div className="space-y-6">
      {actors.map(a => (
        <CreditsListItem
          key={`${a.type}-${a.id}`}
          id={a.id}
          type={a.type}
          yearsValue={a.yearsValue}
          characterValue={a.characterValue}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}
