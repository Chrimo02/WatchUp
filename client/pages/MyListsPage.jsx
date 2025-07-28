"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Bookmark, Heart, Star, Plus, Loader2 } from "lucide-react"
import {
  getFavoriteMovies,
  getFavoriteTVShows,
  getWatchlistMovies,
  getWatchlistTVShows,
  getRatedMovies,
  getRatedTVShows,
  getUserLists,
  getListDetails,
  getPosterUrl,
} from "../utils/api"

const MyListsPage = () => {
  const { isAuthenticated, user, sessionId, login } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Main lists data
  const [watchlistData, setWatchlistData] = useState({ movies: [], tvShows: [], totalCount: 0 })
  const [favoritesData, setFavoritesData] = useState({ movies: [], tvShows: [], totalCount: 0 })
  const [ratedData, setRatedData] = useState({ movies: [], tvShows: [], totalCount: 0 })

  // Custom lists data
  const [customLists, setCustomLists] = useState([])

  useEffect(() => {
    if (isAuthenticated && user && sessionId) {
      fetchAllListsData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, sessionId])

  const fetchAllListsData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [
        watchlistMoviesRes,
        watchlistTVRes,
        favoriteMoviesRes,
        favoriteTVRes,
        ratedMoviesRes,
        ratedTVRes,
        userListsRes,
      ] = await Promise.allSettled([
        getWatchlistMovies(user.id, sessionId, 1),
        getWatchlistTVShows(user.id, sessionId, 1),
        getFavoriteMovies(user.id, sessionId, 1),
        getFavoriteTVShows(user.id, sessionId, 1),
        getRatedMovies(user.id, sessionId, 1),
        getRatedTVShows(user.id, sessionId, 1),
        getUserLists(user.id, sessionId),
      ])

      // Process watchlist data
      const watchlistMovies =
        watchlistMoviesRes.status === "fulfilled" ? watchlistMoviesRes.value.data : { results: [], total_results: 0 }
      const watchlistTV =
        watchlistTVRes.status === "fulfilled" ? watchlistTVRes.value.data : { results: [], total_results: 0 }

      setWatchlistData({
        movies: watchlistMovies.results || [],
        tvShows: watchlistTV.results || [],
        totalCount: (watchlistMovies.total_results || 0) + (watchlistTV.total_results || 0),
      })

      // Process favorites data
      const favoriteMovies =
        favoriteMoviesRes.status === "fulfilled" ? favoriteMoviesRes.value.data : { results: [], total_results: 0 }
      const favoriteTV =
        favoriteTVRes.status === "fulfilled" ? favoriteTVRes.value.data : { results: [], total_results: 0 }

      setFavoritesData({
        movies: favoriteMovies.results || [],
        tvShows: favoriteTV.results || [],
        totalCount: (favoriteMovies.total_results || 0) + (favoriteTV.total_results || 0),
      })

      // Process rated data
      const ratedMovies =
        ratedMoviesRes.status === "fulfilled" ? ratedMoviesRes.value.data : { results: [], total_results: 0 }
      const ratedTV = ratedTVRes.status === "fulfilled" ? ratedTVRes.value.data : { results: [], total_results: 0 }

      setRatedData({
        movies: ratedMovies.results || [],
        tvShows: ratedTV.results || [],
        totalCount: (ratedMovies.total_results || 0) + (ratedTV.total_results || 0),
      })

      // Process custom lists
      if (userListsRes.status === "fulfilled") {
        const listsData = userListsRes.value.data.results || []

        // Fetch details for each custom list to get poster images
        const listsWithDetails = await Promise.allSettled(
          listsData.map(async (list) => {
            try {
              const detailsRes = await getListDetails(list.id, sessionId)
              const listDetails = detailsRes.data

              return {
                id: list.id,
                name: list.name,
                description: list.description,
                itemCount: listDetails.item_count || 0,
                posterUrl:
                  listDetails.items && listDetails.items.length > 0
                    ? getPosterUrl(listDetails.items[0].poster_path)
                    : null,
              }
            } catch (error) {
              console.error(`Failed to fetch details for list ${list.id}:`, error)
              return {
                id: list.id,
                name: list.name,
                description: list.description,
                itemCount: 0,
                posterUrl: null,
              }
            }
          }),
        )

        const validLists = listsWithDetails
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)

        setCustomLists(validLists)
      }
    } catch (err) {
      console.error("Failed to fetch lists data:", err)
      setError("Failed to load your lists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getMainListPoster = (listData) => {
    // Get the first available poster from movies or TV shows
    const allItems = [...listData.movies, ...listData.tvShows]
    if (allItems.length > 0) {
      return getPosterUrl(allItems[0].poster_path)
    }
    return null
  }

  const mainLists = [
    {
      id: "watchlist",
      name: "Watchlist",
      icon: <Bookmark className="w-8 h-8" fill="white" />,
      count: watchlistData.totalCount,
      posterUrl: getMainListPoster(watchlistData),
      bgColor: "bg-blue-600/20",
      data: watchlistData,
    },
    {
      id: "favorites",
      name: "Favorites",
      icon: <Heart className="w-8 h-8" fill="white" />,
      count: favoritesData.totalCount,
      posterUrl: getMainListPoster(favoritesData),
      bgColor: "bg-red-600/20",
      data: favoritesData,
    },
    {
      id: "rated",
      name: "Rated",
      icon: <Star className="w-8 h-8" fill="white" />,
      count: ratedData.totalCount,
      posterUrl: getMainListPoster(ratedData),
      bgColor: "bg-yellow-600/20",
      data: ratedData,
    },
  ]

  const handleListClick = (listId) => {
    console.log(`Navigate to ${listId} page`)
    // Have to implement navigation to specific list pages here
    // For example: navigate(`/my-lists/${listId}`)
  }

  const handleCustomListClick = (listId) => {
    console.log(`Navigate to custom list ${listId}`)
    // Have to implement navigation to custom list pages here
    // For example: navigate(`/list/${listId}`)
  }

  const handleCreateList = () => {
    console.log("Create new list")
    // Have to implement a modal or navigate to create list page
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your lists</h2>
          <p className="text-gray-400 mb-6">Access your watchlist, favorites, and custom lists</p>
          <button
            onClick={login}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sign in with TMDB
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your lists...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchAllListsData}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background with movie posters blur effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('${getMainListPoster(watchlistData) || "https://image.tmdb.org/t/p/w1280/5KJCG5co7YJSKCoWn3hCH6QGDhD.jpg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Lists</h1>
          <p className="text-gray-400">Manage your watchlist, favorites, and custom collections</p>
        </div>

        {/* Main Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainLists.map((list) => (
            <div
              key={list.id}
              onClick={() => handleListClick(list.id)}
              className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative w-full h-80 rounded-lg overflow-hidden">
                {/* Background Image */}
                <img
                  src={list.posterUrl || "/placeholder.svg?height=480&width=320"}
                  alt={list.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=480&width=320"
                  }}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 ${list.bgColor} group-hover:bg-black/60 transition-all duration-300`}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="mb-4 p-3 rounded-full bg-black/50">{list.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{list.name}</h3>
                  <p className="text-lg opacity-90">
                    {list.count} {list.count === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Lists Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Custom Lists:</h2>
            <button
              onClick={handleCreateList}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create List
            </button>
          </div>

          {/* Custom Lists Grid */}
          {customLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {customLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => handleCustomListClick(list.id)}
                  className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    {/* Background Image */}
                    <img
                      src={list.posterUrl || "/placeholder.svg?height=384&width=256"}
                      alt={list.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=384&width=256"
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <div className="bg-black/70 rounded-lg p-3">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{list.name}</h3>
                        <p className="text-sm text-gray-300">
                          {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No custom lists yet</p>
              <p className="text-gray-500 mb-6">
                Create your first custom list to organize your favorite movies and shows
              </p>
              <button
                onClick={handleCreateList}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Create Your First List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyListsPage
