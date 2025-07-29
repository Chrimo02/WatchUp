"use client"
import ThisListIsEmpty from "../assets/ThisListIsEmpty.png"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Bookmark, Heart, Star, Plus, Loader2, ArrowLeft, Filter } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
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
  markAsFavorite,
  addToWatchlist,
  deleteMovieRating,
  deleteTVShowRating,
} from "../utils/api"
import CreateListModal from "../components/modals/CreateListModal"
import MovieCard from "../components/MovieCard"
import { useMovies } from "../contexts/MovieContext"
import { toast } from "sonner"

const MyListsPage = () => {
  const { isAuthenticated, user, sessionId, login } = useAuth()
  const { toggleWatchlist, getAccountStates, isInWatchlist } = useMovies()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const { state } = useLocation()
  const [error, setError] = useState(null)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const initial = state?.initialView ?? 'overview'
  // View state
  const [currentView, setCurrentView] = useState(initial) // 'overview', 'watchlist', 'favorites', 'rated'
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'movies', 'tv'

  // Loading states for individual lists
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [ratedLoading, setRatedLoading] = useState(false)

  // Delete loading states
  const [deleteLoading, setDeleteLoading] = useState({})

  // Main lists data
  const [watchlistData, setWatchlistData] = useState({
    movies: [],
    tvShows: [],
    totalCount: 0,
    moviesPage: 1,
    tvPage: 1,
    hasMoreMovies: true,
    hasMoreTV: true,
  })
  const [favoritesData, setFavoritesData] = useState({
    movies: [],
    tvShows: [],
    totalCount: 0,
    moviesPage: 1,
    tvPage: 1,
    hasMoreMovies: true,
    hasMoreTV: true,
  })
  const [ratedData, setRatedData] = useState({
    movies: [],
    tvShows: [],
    totalCount: 0,
    moviesPage: 1,
    tvPage: 1,
    hasMoreMovies: true,
    hasMoreTV: true,
  })

  // Custom lists data
  const [customLists, setCustomLists] = useState([])

  // Bookmark states
  const [bookmarkStates, setBookmarkStates] = useState({})
  const [bookmarkLoading, setBookmarkLoading] = useState({})

  useEffect(() => {
    if (isAuthenticated && user && sessionId) {
      fetchAllListsData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, sessionId])

  // Refresh custom lists when returning from list details
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && user && sessionId && currentView === "overview") {
        fetchCustomLists()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [isAuthenticated, user, sessionId, currentView])

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
        watchlistMoviesRes.status === "fulfilled"
          ? watchlistMoviesRes.value.data
          : { results: [], total_results: 0, total_pages: 0 }
      const watchlistTV =
        watchlistTVRes.status === "fulfilled"
          ? watchlistTVRes.value.data
          : { results: [], total_results: 0, total_pages: 0 }

      setWatchlistData({
        movies: watchlistMovies.results || [],
        tvShows: watchlistTV.results || [],
        totalCount: (watchlistMovies.total_results || 0) + (watchlistTV.total_results || 0),
        moviesPage: 1,
        tvPage: 1,
        hasMoreMovies: (watchlistMovies.total_pages || 0) > 1,
        hasMoreTV: (watchlistTV.total_pages || 0) > 1,
      })

      // Process favorites data
      const favoriteMovies =
        favoriteMoviesRes.status === "fulfilled"
          ? favoriteMoviesRes.value.data
          : { results: [], total_results: 0, total_pages: 0 }
      const favoriteTV =
        favoriteTVRes.status === "fulfilled"
          ? favoriteTVRes.value.data
          : { results: [], total_results: 0, total_pages: 0 }

      setFavoritesData({
        movies: favoriteMovies.results || [],
        tvShows: favoriteTV.results || [],
        totalCount: (favoriteMovies.total_results || 0) + (favoriteTV.total_results || 0),
        moviesPage: 1,
        tvPage: 1,
        hasMoreMovies: (favoriteMovies.total_pages || 0) > 1,
        hasMoreTV: (favoriteTV.total_pages || 0) > 1,
      })

      // Process rated data
      const ratedMovies =
        ratedMoviesRes.status === "fulfilled"
          ? ratedMoviesRes.value.data
          : { results: [], total_results: 0, total_pages: 0 }
      const ratedTV =
        ratedTVRes.status === "fulfilled" ? ratedTVRes.value.data : { results: [], total_results: 0, total_pages: 0 }

      setRatedData({
        movies: ratedMovies.results || [],
        tvShows: ratedTV.results || [],
        totalCount: (ratedMovies.total_results || 0) + (ratedTV.total_results || 0),
        moviesPage: 1,
        tvPage: 1,
        hasMoreMovies: (ratedMovies.total_pages || 0) > 1,
        hasMoreTV: (ratedTV.total_pages || 0) > 1,
      })

      // Process custom lists
      if (userListsRes.status === "fulfilled") {
        await processCustomLists(userListsRes.value.data.results || [])
      }

      // Initialize bookmark states
      await initializeBookmarkStates()
    } catch (err) {
      console.error("Failed to fetch lists data:", err)
      setError("Failed to load your lists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomLists = async () => {
    try {
      const response = await getUserLists(user.id, sessionId)
      await processCustomLists(response.data.results || [])
    } catch (error) {
      console.error("Failed to refresh custom lists:", error)
    }
  }

  const processCustomLists = async (listsData) => {
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
              listDetails.items && listDetails.items.length > 0 ? getPosterUrl(listDetails.items[0].poster_path) : null,
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

    const validLists = listsWithDetails.filter((result) => result.status === "fulfilled").map((result) => result.value)

    setCustomLists(validLists)
  }

  const initializeBookmarkStates = async () => {
    if (!sessionId) return

    const allItems = [
      ...watchlistData.movies.map((item) => ({ ...item, media_type: "movie" })),
      ...watchlistData.tvShows.map((item) => ({ ...item, media_type: "tv" })),
      ...favoritesData.movies.map((item) => ({ ...item, media_type: "movie" })),
      ...favoritesData.tvShows.map((item) => ({ ...item, media_type: "tv" })),
      ...ratedData.movies.map((item) => ({ ...item, media_type: "movie" })),
      ...ratedData.tvShows.map((item) => ({ ...item, media_type: "tv" })),
    ]

    const states = {}
    for (const item of allItems) {
      try {
        const accountStates = await getAccountStates(item.id, item.media_type, sessionId)
        states[`${item.media_type}_${item.id}`] = accountStates.watchlist
      } catch (error) {
        console.error(`Failed to get account states for ${item.media_type} ${item.id}:`, error)
        states[`${item.media_type}_${item.id}`] = false
      }
    }
    setBookmarkStates(states)
  }

  const loadMoreItems = async (listType, contentType) => {
    const setLoadingState =
      listType === "watchlist" ? setWatchlistLoading : listType === "favorites" ? setFavoritesLoading : setRatedLoading

    setLoadingState(true)

    try {
      const currentData =
        listType === "watchlist" ? watchlistData : listType === "favorites" ? favoritesData : ratedData

      const nextPage = contentType === "movies" ? currentData.moviesPage + 1 : currentData.tvPage + 1

      let response
      if (listType === "watchlist") {
        response =
          contentType === "movies"
            ? await getWatchlistMovies(user.id, sessionId, nextPage)
            : await getWatchlistTVShows(user.id, sessionId, nextPage)
      } else if (listType === "favorites") {
        response =
          contentType === "movies"
            ? await getFavoriteMovies(user.id, sessionId, nextPage)
            : await getFavoriteTVShows(user.id, sessionId, nextPage)
      } else {
        response =
          contentType === "movies"
            ? await getRatedMovies(user.id, sessionId, nextPage)
            : await getRatedTVShows(user.id, sessionId, nextPage)
      }

      const newItems = response.data.results || []
      const hasMore = nextPage < (response.data.total_pages || 0)

      const setDataState =
        listType === "watchlist" ? setWatchlistData : listType === "favorites" ? setFavoritesData : setRatedData

      setDataState((prev) => ({
        ...prev,
        [contentType === "movies" ? "movies" : "tvShows"]: [
          ...prev[contentType === "movies" ? "movies" : "tvShows"],
          ...newItems,
        ],
        [contentType === "movies" ? "moviesPage" : "tvPage"]: nextPage,
        [contentType === "movies" ? "hasMoreMovies" : "hasMoreTV"]: hasMore,
      }))

      // Update bookmark states for new items
      const states = { ...bookmarkStates }
      for (const item of newItems) {
        const mediaType = contentType === "movies" ? "movie" : "tv"
        try {
          const accountStates = await getAccountStates(item.id, mediaType, sessionId)
          states[`${mediaType}_${item.id}`] = accountStates.watchlist
        } catch (error) {
          states[`${mediaType}_${item.id}`] = false
        }
      }
      setBookmarkStates(states)
    } catch (error) {
      console.error(`Failed to load more ${contentType} for ${listType}:`, error)
    } finally {
      setLoadingState(false)
    }
  }

  const handleBookmarkToggle = async (mediaId, mediaType) => {
    if (!user || !sessionId) return

    const key = `${mediaType}_${mediaId}`
    const currentState = bookmarkStates[key] || false

    setBookmarkLoading((prev) => ({ ...prev, [key]: true }))

    try {
      await toggleWatchlist(user.id, sessionId, mediaId, mediaType, currentState)
      setBookmarkStates((prev) => ({ ...prev, [key]: !currentState }))
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleDeleteFromList = async (mediaId, mediaType) => {
    if (!user || !sessionId) return

    const key = `${mediaType}_${mediaId}`
    setDeleteLoading((prev) => ({ ...prev, [key]: true }))

    try {
      let success = false
      let actionName = ""

      if (currentView === "watchlist") {
        await addToWatchlist(user.id, sessionId, mediaId, mediaType, false)
        actionName = "watchlist"
        success = true
      } else if (currentView === "favorites") {
        await markAsFavorite(user.id, sessionId, mediaId, mediaType, false)
        actionName = "favorites"
        success = true
      } else if (currentView === "rated") {
        if (mediaType === "movie") {
          await deleteMovieRating(mediaId, sessionId)
        } else {
          await deleteTVShowRating(mediaId, sessionId)
        }
        actionName = "rated items"
        success = true
      }

      if (success) {
        // Remove item from the current list data
        const setDataState =
          currentView === "watchlist" ? setWatchlistData : currentView === "favorites" ? setFavoritesData : setRatedData

        setDataState((prev) => {
          const contentType = mediaType === "movie" ? "movies" : "tvShows"
          const updatedItems = prev[contentType].filter((item) => item.id !== mediaId)

          return {
            ...prev,
            [contentType]: updatedItems,
            totalCount: prev.totalCount - 1,
          }
        })

        // Update bookmark states if removing from watchlist
        if (currentView === "watchlist") {
          setBookmarkStates((prev) => ({ ...prev, [key]: false }))
        }

        toast.success(`Removed from ${actionName}`)
      }
    } catch (error) {
      console.error(`Failed to remove from ${currentView}:`, error)
      toast.error(`Failed to remove from ${currentView}`)
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [key]: false }))
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
    setCurrentView(listId)
    setActiveFilter("all")
  }

  const handleCustomListClick = (listId) => {
    navigate(`/list/${listId}`)
  }

  const handleBackToOverview = () => {
    setCurrentView("overview")
    setActiveFilter("all")
    // Refresh custom lists when returning to overview
    if (isAuthenticated && user && sessionId) {
      fetchCustomLists()
    }
  }

  const handleListCreated = (newList) => {
    setCustomLists((prev) => [...prev, newList])
    setShowCreateModal(false)
  }

  const getCurrentListData = () => {
    switch (currentView) {
      case "watchlist":
        return watchlistData
      case "favorites":
        return favoritesData
      case "rated":
        return ratedData
      default:
        return null
    }
  }

  const getCurrentListInfo = () => {
    return mainLists.find((list) => list.id === currentView)
  }

  const getFilteredItems = () => {
    const listData = getCurrentListData()
    if (!listData) return []

    switch (activeFilter) {
      case "movies":
        return listData.movies.map((item) => ({ ...item, media_type: "movie" }))
      case "tv":
        return listData.tvShows.map((item) => ({ ...item, media_type: "tv" }))
      default:
        return [
          ...listData.movies.map((item) => ({ ...item, media_type: "movie" })),
          ...listData.tvShows.map((item) => ({ ...item, media_type: "tv" })),
        ]
    }
  }

  const getFilterCounts = () => {
    const listData = getCurrentListData()
    if (!listData) return { all: 0, movies: 0, tv: 0 }

    return {
      all: listData.movies.length + listData.tvShows.length,
      movies: listData.movies.length,
      tv: listData.tvShows.length,
    }
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

  // Render specific list view
  if (currentView !== "overview") {
    const listInfo = getCurrentListInfo()
    const filteredItems = getFilteredItems()
    const filterCounts = getFilterCounts()
    const listData = getCurrentListData()
    const isLoadingMore =
      currentView === "watchlist" ? watchlistLoading : currentView === "favorites" ? favoritesLoading : ratedLoading

    return (
      <div className="min-h-screen bg-background">
        {/* Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('${listInfo?.posterUrl || "https://image.tmdb.org/t/p/w1280/5KJCG5co7YJSKCoWn3hCH6QGDhD.jpg"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToOverview}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-black/50">{listInfo?.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-white">{listInfo?.name}</h1>
                <p className="text-gray-400">
                  {listInfo?.count} {listInfo?.count === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-8">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex bg-black/30 rounded-lg p-1">
              {[
                { key: "all", label: "All", count: filterCounts.all },
                { key: "movies", label: "Movies", count: filterCounts.movies },
                { key: "tv", label: "TV Shows", count: filterCounts.tv },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {filteredItems.length > 0 ? (
            <>
              {/* Movies Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {filteredItems.map((item) => {
                  const key = `${item.media_type}_${item.id}`
                  return (
                    <div key={key} className="relative">
                      <MovieCard
                        mediaType={item.media_type}
                        mediaId={item.id}
                        bookmarked={bookmarkStates[key] || false}
                        isLoading={bookmarkLoading[key] || false}
                        onBookmarkToggle={handleBookmarkToggle}
                        onDelete={handleDeleteFromList}
                        className="h-full"
                        showBookmark={false}
                        showDeleteButton={true}
                        deleteLoading={deleteLoading[key] || false}
                      />
                      {/* Rating Badge for Rated list */}
                      {currentView === "rated" && item.rating && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold z-20">
                          {item.rating}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Load More Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(activeFilter === "all" || activeFilter === "movies") && listData?.hasMoreMovies && (
                  <button
                    onClick={() => loadMoreItems(currentView, "movies")}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                )}

                {(activeFilter === "all" || activeFilter === "tv") && listData?.hasMoreTV && (
                  <button
                    onClick={() => loadMoreItems(currentView, "tv")}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More TV Shows"
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mb-4 p-4 rounded-full bg-black/30 w-20 h-20 flex items-center justify-center mx-auto">
                {listInfo?.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No {activeFilter === "all" ? "items" : activeFilter} yet
              </h3>
              <p className="text-gray-400 mb-6">
                {activeFilter === "all"
                  ? `Start adding movies and shows to your ${listInfo?.name.toLowerCase()}`
                  : `No ${activeFilter} in your ${listInfo?.name.toLowerCase()} yet`}
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Discover Content
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render overview (main lists page)
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
                  src={list.posterUrl || ThisListIsEmpty}
                  alt={list.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = ThisListIsEmpty
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
              onClick={() => setShowCreateModal(true)}
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
                      src={list.posterUrl || ThisListIsEmpty}
                      alt={list.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = ThisListIsEmpty
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
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Create Your First List
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={handleListCreated}
      />
    </div>
  )
}

export default MyListsPage
