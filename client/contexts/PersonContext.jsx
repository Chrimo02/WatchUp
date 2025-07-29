import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import {
  getPersonDetails,
  getPersonCombinedCredits,
  getPopularPeople,
} from '../utils/api'

const PersonContext = createContext({
  loading: false,
  error: null,
  person: null,
  credits: null,
  fetchPersonAndCredits: async () => {},
  clearPerson: () => {},
  popularPeople: [],
  totalResults: 0,
  fetchPopularPeople: async () => {},
  fetchPersonBio: async () => {},
})

export const usePerson = () => useContext(PersonContext)

export function PersonProvider({ children }) {
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState(null)
  const [person,  setPerson]    = useState(null)
  const [credits, setCredits]   = useState(null)
  const [popularPeople, setPopularPeople] = useState([])
  const [totalResults, setTotalResults]   = useState(0)

  const bioCacheRef = useRef({})

  const fetchPersonAndCredits = useCallback(async (personId) => {
    setLoading(true)
    setError(null)
    try {
      const [personRes, creditsRes] = await Promise.all([
        getPersonDetails(personId),
        getPersonCombinedCredits(personId),
      ])
      setPerson(personRes.data)
      setCredits(creditsRes.data)
    } catch (err) {
      console.error(err)
      setError('Could not load artist data.')
      setPerson(null)
      setCredits(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPerson = useCallback(() => {
    setPerson(null)
    setCredits(null)
    setError(null)
    setLoading(false)
  }, [])


  const fetchPopularPeople = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPopularPeople(page)
      setPopularPeople(res.data.results)
      setTotalResults(res.data.total_results)
    } catch (err) {
      console.error(err)
      setError('Failed to load popular people.')
      setPopularPeople([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPersonBio = useCallback(
    async (personId, language = 'en-US') => {
      const cacheKey = `${personId}_${language}`
      if (cacheKey in bioCacheRef.current) {
        return bioCacheRef.current[cacheKey]
      }

      try {
        const res  = await getPersonDetails(personId, language)
        const bio  = res.data?.biography || ''
        bioCacheRef.current[cacheKey] = bio
        return bio
      } catch {
        bioCacheRef.current[cacheKey] = ''
        return ''
      }
    },
    [] 
  )

  return (
    <PersonContext.Provider
      value={{
        loading,
        error,
        person,
        credits,
        fetchPersonAndCredits,
        clearPerson,

        popularPeople,
        totalResults,
        fetchPopularPeople,

        fetchPersonBio,
      }}
    >
      {children}
    </PersonContext.Provider>
  )
}
