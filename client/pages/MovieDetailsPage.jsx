
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import PLACEHOLDER from '../assets/placeholder-profile.png';
import NoImageFound from '../assets/no-image-found.png';
import { useOmdb } from '../contexts/OmdbContext';
import { useMediaTransforms } from '../hooks/useMediaTransforms';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';
import { useLanguage } from '../contexts/LanguageContext';
import AddToListModal from "../components/AddToListModal";
import { 
  posterSizes, 
  backdropSizes, 
  markAsFavorite, 
  addToWatchlist, 
  rateMovie, 
  deleteMovieRating,
  getMovieDetailsWithLanguage,
  getMovieReleaseDates,
  getAgeRatingForRegion,
  getAgeRatingInfo,
  getMovieWatchProviders,
  getSimilarMovies,
  getRecommendedMovies,
  getMovieKeywords,
} from "../utils/api"
import MovieInfo from "../components/MovieSeriesPage/MovieInfo"
import MovieSlider from "../components/MovieSlider"
import WatchProviders from "../components/MovieSeriesPage/WatchProviders"
import CastSlider from "../components/MovieSeriesPage/CastSlider"
import { Sidebar } from "../components/MovieSeriesPage/Sidebar"

const MovieDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, sessionId, login } = useAuth()
  const { language, region } = useLanguage()
  const { getMovieDetails, selectedMovie } = useOmdb()
  const { loading, error, fetchMovieCredits, fetchMovieVideos, getAccountStates } = useMovies()

  const [movie, setMovie] = useState(null)
  const [credits, setCredits] = useState(null)
  const [videos, setVideos] = useState([])
  const [officialTrailer, setOfficialTrailer] = useState(null)
  const [certification, setCertification] = useState(null)
  const [accountStates, setAccountStates] = useState({
    watchlist: false,
    favorite: false,
    rated: false,
  })
  const { transformMovieData, transformTVShowData } = useMediaTransforms()

  const { handleBookmarkToggle, bookmarkLoadingStates } = useBookmarkToggle()
  const [similarMovies, setSimilarMovies] = useState([])
  const [recommendedMovies, setRecommendedMovies] = useState([])
  const [keywords, setKeywords] = useState([])
  const [showAddToListModal, setShowAddToListModal] = useState(false)

  // Add toast notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // Helper function to show notifications
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000)
  }

  const handleClearRating = async () => {
    if (!isAuthenticated || !sessionId) {
      showNotification("Please sign in with your TMDB account to clear ratings", "error")
      return
    }

    try {
      await deleteMovieRating(movie.id, sessionId)
      setAccountStates((prev) => ({ ...prev, rated: false }))
      showNotification(`Rating cleared for "${movie.title}"`)
    } catch (error) {
      console.error("Failed to clear rating:", error)
      showNotification("Failed to clear rating. Please try again.", "error")
    }
  }

  const [omdbRatings, setOmdbRatings] = useState({
    imdbRating: "N/A",
    rottenTomatoesRating: "N/A",
    metacriticRating: "N/A",
  })

  const [watchProviders, setWatchProviders] = useState({
    stream: [],
    rent: [],
    buy: [],
  })

  const extractOmdbRatings = (omdbData) => {
    const ratings = {
      imdbRating: omdbData.imdbRating || "N/A",
      rottenTomatoesRating: "N/A",
      metacriticRating: "N/A",
    }

    if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
      omdbData.Ratings.forEach((rating) => {
        switch (rating.Source) {
          case "Rotten Tomatoes":
            ratings.rottenTomatoesRating = rating.Value
            break
          case "Metacritic":
            ratings.metacriticRating = rating.Value
            break
          default:
            break
        }
      })
    }

    return ratings
  }

  const fetchOmdbRatings = async (movieData) => {
    if (movieData.imdb_id) {
      try {
        await getMovieDetails(movieData.imdb_id)
      } catch (error) {
        console.error("Failed to fetch OMDB ratings:", error)
      }
    }
  };

  const formattedCast = credits?.cast
  .map(member => ({
    id: member.id,
    name: member.name,
    role: member.character,
    img: member.profile_path
      ? `${posterSizes.medium}${member.profile_path}`
      : PLACEHOLDER
  })) || []


  // Helper function to find the best trailer
  const findOfficialTrailer = (videoResults) => {
    if (!videoResults || videoResults.length === 0) return null

    // Filter for YouTube videos only
    const youtubeVideos = videoResults.filter((video) => video.site === "YouTube")

    if (youtubeVideos.length === 0) return null

    // Priority order for trailer types
    const trailerPriority = [
      "Official Trailer",
      "Final Trailer",
      "Main Trailer",
      "Trailer",
      "Official Teaser",
      "Teaser",
      "Clip",
    ]

    // Try to find trailer by priority
    for (const priority of trailerPriority) {
      const trailer = youtubeVideos.find(
        (video) =>
          video.type === "Trailer" &&
          (video.name.toLowerCase().includes(priority.toLowerCase()) || video.name.toLowerCase().includes("official")),
      )
      if (trailer) return trailer
    }

    // If no official trailer found, look for any trailer
    const anyTrailer = youtubeVideos.find((video) => video.type === "Trailer" || video.type === "Teaser")

    return anyTrailer || youtubeVideos[0]
  }

  // Function to fetch age certification
  const fetchCertification = async (movieId) => {
    try {
      const response = await getMovieReleaseDates(movieId)
      const ageRating = getAgeRatingForRegion(response.data, region)
      setCertification(ageRating)
    } catch (error) {
      console.error("Failed to fetch certifications:", error)
      setCertification(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        // Fetch movie details with current language
        const movieData = await getMovieDetailsWithLanguage(Number.parseInt(id), language)
        setMovie(movieData.data)

        // Fetch certification based on current region
        await fetchCertification(Number.parseInt(id))

        await fetchOmdbRatings(movieData.data)

        const creditsData = await fetchMovieCredits(Number.parseInt(id))
        setCredits(creditsData)

        const videosData = await fetchMovieVideos(Number.parseInt(id))
        if (videosData && videosData.results) {
          setVideos(videosData.results)

          // Find the official trailer
          const trailer = findOfficialTrailer(videosData.results)
          setOfficialTrailer(trailer)
        }

        if (isAuthenticated && sessionId) {
          try {
            const states = await getAccountStates(Number.parseInt(id), "movie", sessionId)
            setAccountStates(states)
          } catch (error) {
            console.error("Failed to fetch account states:", error)
          }
        }

        const { data: providerData } = await getMovieWatchProviders(movieData.data.id)
        const country = providerData.results[region] || {}
        setWatchProviders({
          stream: country.flatrate || [],
          rent: country.rent || [],
          buy: country.buy || [],
        })

        const { data: similarData } = await getSimilarMovies(movieData.data.id)
        setSimilarMovies(similarData.results)

        const { data: recData } = await getRecommendedMovies(movieData.data.id)
        setRecommendedMovies(recData.results)

        const { data: keywordData } = await getMovieKeywords(movieData.data.id)
        setKeywords(keywordData.keywords || [])
      } catch (err) {
        console.error("Error fetching movie details:", err)
        // Set movie to an empty object to break the loading state
        setMovie({})
      }
    }

    fetchData()
    window.scrollTo(0, 0)
  }, [id, isAuthenticated, sessionId, language, region])

  // Refetch certification when region changes
  useEffect(() => {
    if (movie?.id) {
      fetchCertification(movie.id)
    }
  }, [region, movie?.id])

  useEffect(() => {
    if (selectedMovie) {
      const ratings = extractOmdbRatings(selectedMovie)
      setOmdbRatings(ratings)
    }
  }, [selectedMovie])

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !user || !sessionId) {
      return login()
    }

    try {
      await markAsFavorite(user.id, sessionId, movie.id, "movie", !accountStates.favorite)
      setAccountStates((prev) => ({ ...prev, favorite: !prev.favorite }))
      showNotification(
        accountStates.favorite ? `Removed "${movie.title}" from favorites` : `Added "${movie.title}" to favorites`,
      )
    } catch (error) {
      console.error("Failed to update favorites:", error)
      showNotification("Failed to update favorites. Please try again.", "error")
    }
  }

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated || !user || !sessionId) {
      return login()
      return
    }

    try {
      await addToWatchlist(user.id, sessionId, movie.id, "movie", !accountStates.watchlist)
      setAccountStates((prev) => ({ ...prev, watchlist: !prev.watchlist }))
      showNotification(
        accountStates.watchlist ? `Removed "${movie.title}" from watchlist` : `Added "${movie.title}" to watchlist`,
      )
    } catch (error) {
      console.error("Failed to update watchlist:", error)
      showNotification("Failed to update watchlist. Please try again.", "error")
    }
  }

  const handleRateMovie = async (rating) => {
    if (!isAuthenticated || !sessionId) {
      return login()
    }

    try {
      await rateMovie(movie.id, sessionId, rating)
      setAccountStates((prev) => ({ ...prev, rated: { value: rating } }))
      showNotification(`You rated "${movie.title}" ${rating}/10!`)
    } catch (error) {
      console.error("Failed to rate movie:", error)
      showNotification("Failed to submit rating. Please try again.", "error")
    }
  }

  const handleAddToList = () => {
    if (!isAuthenticated || !sessionId) {
      showNotification("Please sign in with your TMDB account to add to lists", "error")
      return
    }
    setShowAddToListModal(true)
  }

  
  const getMovieInfoData = () => {
    if (!movie) return null

    const backdropUrl = movie.backdrop_path ? `${backdropSizes.original}${movie.backdrop_path}` : null

    const posterUrl = movie.poster_path
      ? `${posterSizes.large}${movie.poster_path}`
      : NoImageFound;


    const keyCrewRoles = ["Director", "Writer", "Screenplay", "Story"]

    const crewMembers = credits?.crew?.filter((person) => keyCrewRoles.includes(person.job)) || []

    const uniqueCrewMembers = crewMembers.reduce((acc, person) => {
      const existingPerson = acc.find((p) => p.name === person.name)
      if (existingPerson) {
        if (!existingPerson.role.includes(person.job)) {
          existingPerson.role += `, ${person.job}`
        }
      } else {
        acc.push({ name: person.name, role: person.job })
      }
      return acc
    }, [])

    const sortedCrewMembers = uniqueCrewMembers.sort((a, b) => {
      if (a.role.includes("Director")) return -1
      if (b.role.includes("Director")) return 1
      return 0
    })

    const formatRuntime = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }

    // Get age rating info with proper formatting
    const ageRatingInfo = getAgeRatingInfo(certification, region)

    return {
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A",
      rating: certification || "Not Rated",
      ageRatingInfo: ageRatingInfo,
      releaseDate: movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "N/A",
      genre: movie.genres?.map((g) => g.name).join(", ") || "N/A",
      duration: movie.runtime ? formatRuntime(movie.runtime) : "N/A",
      userScore: movie.vote_average ? movie.vote_average.toFixed(1) : "0.0",
      userRatings: movie.vote_count ? `${movie.vote_count.toLocaleString()} ratings` : "No ratings",
      yourRating: accountStates.rated ? accountStates.rated.value?.toFixed(1) : "0.0",
      imdbScore: omdbRatings.imdbRating,
      rottenTomatoesScore: omdbRatings.rottenTomatoesRating,
      metacriticScore: omdbRatings.metacriticRating,
      tagline: movie.tagline || "An amazing cinematic experience",
      overview: movie.overview || "No overview available.",
      backgroundUrl: backdropUrl,
      posterUrl: posterUrl,
      crew: sortedCrewMembers,
      // Pass the official trailer data instead of just a URL
      trailer: officialTrailer
        ? {
            youtubeId: officialTrailer.key,
            name: officialTrailer.name,
            type: officialTrailer.type,
          }
        : null,
      trailerUrl: officialTrailer ? `https://www.youtube.com/watch?v=${officialTrailer.key}` : null,
      isFavorite: accountStates.favorite,
      isInWatchlist: accountStates.watchlist,
      onFavoriteToggle: handleFavoriteToggle,
      onWatchlistToggle: handleWatchlistToggle,
      onRateMovie: handleRateMovie,
      onAddToList: handleAddToList,
      isAuthenticated: isAuthenticated,
      onClearRating: handleClearRating,
      mediaType: "movie"
    }
  }

  if (loading && !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    )
  }

  // Show error if movie is empty object (failed to load) or context error
  if (movie === null) {
    // Still loading
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    )
  }

  if (Object.keys(movie).length === 0 || error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Movie Not Found</h2>
          <p className="text-gray-600 mb-4">The movie you are looking for does not exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const movieInfoData = getMovieInfoData()

  return (
    <div className="relative">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {movieInfoData && <MovieInfo movieData={movieInfoData} />}

      <div className="max-w-[1176px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-5">
          <div className="lg:col-span-3 space-y-8">
            <WatchProviders providers={watchProviders} region={region} />
            <CastSlider cast={formattedCast} />
          </div>
          <Sidebar
            status={movie.status}
            originalLanguage={movie.original_language}
            budget={movie.budget}
            revenue={movie.revenue}
            keywords={keywords.map((k) => k.name)}
          />
        </div>
        <section className="mt-7">
          <MovieSlider
            title="Similar Movies"
            movieItems={transformMovieData(similarMovies)}
            onBookmarkToggle={handleBookmarkToggle}
            showViewAll={false}
            showTabSwitcher={false}
            defaultTab="movies"
            bookmarkLoadingStates={bookmarkLoadingStates}
          />
          <MovieSlider
            title="Recommended"
            movieItems={transformMovieData(recommendedMovies)}
            onBookmarkToggle={handleBookmarkToggle}
            showViewAll={false}
            showTabSwitcher={false}
            defaultTab="movies"
            bookmarkLoadingStates={bookmarkLoadingStates}
          />
        </section>
      </div>

      <AddToListModal
        isOpen={showAddToListModal}
        onClose={() => setShowAddToListModal(false)}
        mediaId={movie.id}
        mediaType="movie"
        onAdded={(listId) => {
          // optional: refetch lists or update local state
          showNotification("Added to your list!");
          setShowAddToListModal(false);
        }}
      />

    </div>
  )
}

export default MovieDetailsPage
