import React from 'react';
import PersonListItem from './PersonListItem';

export default function PeopleListView({ people = [] }) {
  return (
    <div className="flex flex-col space-y-4">
      {people.map(person => (
        <PersonListItem key={person.id} person={person} />
      ))}
    </div>
  );
}
