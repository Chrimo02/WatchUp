import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  getPersonDetails, 
  getPersonCombinedCredits,
  getPopularPeople
} from '../utils/api';

const PersonContext = createContext({
  loading: false,
  error: null,
  person: null,
  credits: null,
  fetchPersonAndCredits: async () => {},
  clearPerson: () => {},
  // PopularPeople:
  popularPeople: [],
  totalResults: 0,
  fetchPopularPeople: async () => {},
  // Biography caching:
  fetchPersonBio: async () => {},
});

export const usePerson = () => useContext(PersonContext);

export function PersonProvider({ children }) {
  // Für einzelne Künstler-Details
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [person, setPerson]   = useState(null);
  const [credits, setCredits] = useState(null);

  // Für PopularPeople
  const [popularPeople, setPopularPeople]   = useState([]);
  const [totalResults, setTotalResults]     = useState(0);

  // Für Biography-Caching in Listen
  const [bioCache, setBioCache] = useState({});

  // Detail-Fetch für Artist
  const fetchPersonAndCredits = useCallback(async (personId) => {
    setLoading(true);
    setError(null);
    try {
      const [personRes, creditsRes] = await Promise.all([
        getPersonDetails(personId),
        getPersonCombinedCredits(personId),
      ]);
      setPerson(personRes.data);
      setCredits(creditsRes.data);
    } catch (err) {
      setError('Could not load artist data.');
      setPerson(null);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // PopularPeople-List
  const fetchPopularPeople = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPopularPeople(page);
      setPopularPeople(res.data.results);
      setTotalResults(res.data.total_results);
    } catch (err) {
      setError('Failed to load popular people.');
      setPopularPeople([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized Bio-Lader für Listenansicht, cacht Bio pro ID
  const fetchPersonBio = useCallback(async (personId) => {
    if (bioCache[personId]) {
      return bioCache[personId];
    }
    try {
      const res = await getPersonDetails(personId);
      const bio = res.data?.biography || '';
      setBioCache(prev => ({ ...prev, [personId]: bio }));
      return bio;
    } catch {
      setBioCache(prev => ({ ...prev, [personId]: '' }));
      return '';
    }
  }, [bioCache]);

  // useCallback für Referenzgleichheit!
  const clearPerson = useCallback(() => {
    setPerson(null);
    setCredits(null);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <PersonContext.Provider
      value={{
        loading,
        error,
        person,
        credits,
        fetchPersonAndCredits,
        clearPerson,
        // PopularPeople:
        popularPeople,
        totalResults,
        fetchPopularPeople,
        // Für PeopleListItem:
        fetchPersonBio,
      }}
    >
      {children}
    </PersonContext.Provider>
  );
}