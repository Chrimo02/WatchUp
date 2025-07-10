import React from 'react';
import PersonGridItem from './PersonGridItem';

export default function PeopleGridView({ people = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {people.map(person => (
        <PersonGridItem key={person.id} person={person} />
      ))}
    </div>
  );
}
