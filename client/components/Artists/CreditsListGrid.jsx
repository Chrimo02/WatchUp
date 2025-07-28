import React from 'react';
import CreditsListItem from './CreditsListItem';

export default function CreditsListGrid({ actors, onBookmarkToggle }) {
  return (
    <div className="space-y-4">
      {actors.map(item => (
        <CreditsListItem
          key={`${item.type}-${item.id}`}
          id={item.id}
          type={item.type}
          poster={item.poster}
          title={item.title}
          rating={item.rating}
          yearsValue={item.date}      
          characterValue={item.characterValue}
          creditsValue={item.creditsValue}
          bookmarked={item.bookmarked}
          isLoading={false}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}