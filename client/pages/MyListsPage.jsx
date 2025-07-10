"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useMovies } from "../contexts/MovieContext"
import { Bookmark, Heart, Star, Plus } from "lucide-react"

const MyListsPage = () => {
  const { isAuthenticated, user, login } = useAuth()
  const { getWatchlistMovies, getFavoriteMovies, getRatedMovies } = useMovies()

  const [watchlistCount, setWatchlistCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [ratedCount, setRatedCount] = useState(0)

  // Sample custom lists data (you can replace this with real data later)
  const customLists = [
    {
      id: 1,
      name: "Johnny English",
      posterUrl: "https://image.tmdb.org/t/p/w500/qJTWvhbTyYNhJKKjdCJJPfWdJkF.jpg",
      count: 3,
    },
    {
      id: 2,
      name: "James Bond",
      posterUrl: "https://image.tmdb.org/t/p/w500/qmxVkdu22dcFBdtw6lzHdeJBjXv.jpg",
      count: 25,
    },
    {
      id: 3,
      name: "Star Wars",
      posterUrl: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      count: 12,
    },
    {
      id: 4,
      name: "Disney",
      posterUrl: "https://image.tmdb.org/t/p/w500/1f6jW0eebpeh7a1dANAOLdHUgPU.jpg",
      count: 8,
    },
  ]

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch list counts (you can implement these API calls)
      // For now, using placeholder numbers
      setWatchlistCount(12)
      setFavoritesCount(8)
      setRatedCount(15)
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your lists</h2>
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

  const mainLists = [
    {
      id: "watchlist",
      name: "Watchlist",
      icon: <Bookmark className="w-8 h-8" fill="white" />,
      count: watchlistCount,
      posterUrl: "https://image.tmdb.org/t/p/w500/5KJCG5co7YJSKCoWn3hCH6QGDhD.jpg", // Avatar
      bgColor: "bg-blue-600/20",
    },
    {
      id: "favorites",
      name: "Favorites",
      icon: <Heart className="w-8 h-8" fill="white" />,
      count: favoritesCount,
      posterUrl: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg", // Conjuring
      bgColor: "bg-red-600/20",
    },
    {
      id: "rated",
      name: "Rated",
      icon: <Star className="w-8 h-8" fill="white" />,
      count: ratedCount,
      posterUrl: "https://image.tmdb.org/t/p/w500/dux1AcLqbdoy8NaYL4jd6LDSd1y.jpg", // Mission Impossible
      bgColor: "bg-yellow-600/20",
    },
  ]

  const handleListClick = (listId) => {
    console.log(`Navigate to ${listId} page`)
    // You can implement navigation to specific list pages here
  }

  const handleCustomListClick = (listId) => {
    console.log(`Navigate to custom list ${listId}`)
    // You can implement navigation to custom list pages here
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background with movie posters blur effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('https://image.tmdb.org/t/p/w1280/5KJCG5co7YJSKCoWn3hCH6QGDhD.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Lists</h1>
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
                  src={list.posterUrl || "/placeholder.svg"}
                  alt={list.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 ${list.bgColor} group-hover:bg-black/60 transition-all duration-300`}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="mb-4 p-3 rounded-full bg-black/50">{list.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{list.name}</h3>
                  <p className="text-lg opacity-90">{list.count} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Lists Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Custom Lists:</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              Create List
            </button>
          </div>

          {/* Custom Lists Grid */}
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
                    src={list.posterUrl || "/placeholder.svg"}
                    alt={list.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="bg-black/70 rounded-lg p-3">
                      <h3 className="text-xl font-bold text-white mb-1">{list.name}</h3>
                      <p className="text-sm text-gray-300">{list.count} movies</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyListsPage
